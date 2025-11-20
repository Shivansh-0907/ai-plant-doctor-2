import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

// System prompt for strict JSON output
const SYSTEM_PROMPT = `
You are an expert AI botanist specializing in leaf disease analysis.
Analyze the leaf image and ALWAYS return STRICT JSON.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IF NO LEAF IS DETECTED:
Return EXACTLY THIS:

{
  "leafDetected": false,
  "stage": -1,
  "damageType": "No Leaf Detected",
  "healthPercentage": 0,
  "category": "Invalid Image",
  "possibleDiseases": [],
  "primaryDisease": "No Leaf Detected",
  "confidence": 0,
  "severity": "none",
  "description": "No plant leaf detected. Upload a clear leaf photo.",
  "causes": [],
  "careTips": [
    "Upload a clear plant leaf",
    "Avoid dark or blurry photos",
    "Ensure the leaf occupies most of the frame"
  ],
  "symptoms": ["No leaf detected"],
  "detectedPatterns": []
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IF LEAF IS DETECTED:
Return JSON with the following structure:

{
  "leafDetected": true,
  "stage": number,
  "damageType": string,
  "healthPercentage": number,
  "category": string,
  "possibleDiseases": [
    {
      "name": string,
      "description": string,
      "likelihood": number
    }
  ],
  "primaryDisease": string,
  "confidence": number,
  "severity": string,
  "description": string,
  "causes": [
    {
      "disease": string,
      "cause": string,
      "explanation": string
    }
  ],
  "careTips": [string],
  "symptoms": [string],
  "detectedPatterns": [string]
}

RULES:
- DO NOT return markdown
- DO NOT return text explanations
- DO NOT add comments
- Return ONLY JSON (pure JSON)
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const image = body?.image;

    if (!image) {
      return NextResponse.json(
        { error: "Image is required." },
        { status: 400 }
      );
    }

    // API key check
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("❌ Missing GROQ_API_KEY environment variable");
      return NextResponse.json(
        { error: "GROQ_API_KEY missing in environment" },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });

    // Send to Groq Vision
    const response = await groq.chat.completions.create({
      model: "llama-3.2-90b-vision-preview",
      temperature: 0.2,
      max_tokens: 2000,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this leaf and return ONLY JSON." },
            {
              type: "input_image",
              image_url: image,
            },
          ],
        },
      ],
    });

    const aiRaw = response.choices?.[0]?.message?.content || "{}";

    // Extract pure JSON from AI output
    let cleanJson = {};
    try {
      const match = aiRaw.match(/\{[\s\S]*\}/);
      cleanJson = match ? JSON.parse(match[0]) : JSON.parse(aiRaw);
    } catch (jsonErr) {
      console.error("❌ JSON parse error:", jsonErr);
      return NextResponse.json(
        {
          error: "Invalid JSON returned from Groq.",
          raw: aiRaw,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(cleanJson);
  } catch (err: any) {
    console.error("🔥 API Route Error:", err);
    return NextResponse.json(
      { error: "Server error: " + err.message },
      { status: 500 }
    );
  }
}
