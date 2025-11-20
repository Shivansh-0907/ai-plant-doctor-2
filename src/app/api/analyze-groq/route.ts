import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 🔍 Utility: Extract clean text 
function clean(text: string) {
  return text.replace(/```json|```/g, "").trim();
}

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // 🧠 PROMPT FOR ACCURATE STRUCTURED ANALYSIS
    const prompt = `
You are an expert plant pathologist. Analyze the leaf image and return STRICT JSON ONLY.

Detect:
- Whether a real leaf exists (not plastic, cartoon, fake, or object)
- Whether the leaf is healthy or diseased
- Disease name if present
- Causes
- Recommended actions
- Overall health percentage (0–100)

### VERY IMPORTANT:
If NO REAL LEAF is detected → return:
{
  "leafFound": false,
  "health": 0,
  "diseases": [],
  "causes": [],
  "tips": []
}

### Otherwise:
Return:
{
  "leafFound": true,
  "health": number,
  "diseases": [".."],
  "causes": [".."],
  "tips": [".."]
}

ONLY return JSON. No explanation.
`;

    // 🟢 GROQ VISION REQUEST (correct format!)
    const groqResponse = await groq.chat.completions.create({
      model: "llama-3.2-90b-vision-preview",
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: image }
          ]
        }
      ],
    });

    const raw = groqResponse.choices?.[0]?.message?.content || "{}";
    const text = clean(raw);

    let jsonResult;
    try {
      jsonResult = JSON.parse(text);
    } catch (e) {
      console.log("JSON Parse Error → raw output:", raw);
      return NextResponse.json({
        provider: "groq",
        result: {
          leafFound: false,
          health: 0,
          diseases: [],
          causes: [],
          tips: []
        }
      });
    }

    return NextResponse.json({
      provider: "groq",
      result: jsonResult,
    });

  } catch (error) {
    console.error("GROQ ERROR:", error);

    return NextResponse.json(
      {
        provider: "groq",
        error: "Groq analysis failed",
        result: {
          leafFound: false,
          health: 0,
          diseases: [],
          causes: [],
          tips: []
        }
      },
      { status: 500 }
    );
  }
}
