import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: NextRequest) {
  console.log("🚀 API HIT: analyze-groq");

  try {
    const { image } = await req.json();

    console.log("📸 Image received?", !!image);

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    console.log("🔑 Loaded GROQ_API_KEY:", process.env.GROQ_API_KEY ? "YES" : "NO");

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Missing GROQ_API_KEY in environment variables" },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const SYSTEM_PROMPT = `
Return ONLY JSON.

If no leaf:
{
  "leafFound": false,
  "health": 0,
  "diseases": [],
  "causes": [],
  "tips": []
}

If leaf:
{
  "leafFound": true,
  "health": number,
  "diseases": [string],
  "causes": [string],
  "tips": [string]
}
`;

    console.log("📤 Sending request to Groq...");

    const groqResponse = await groq.chat.completions.create({
      model: "llama-3.2-90b-vision-preview",
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this plant leaf and return JSON." },
            {
              type: "input_image",
              image_url: image,
            },
          ],
        },
      ],
    });

    console.log("📥 Raw Groq Response:", JSON.stringify(groqResponse, null, 2));

    const aiText = groqResponse.choices?.[0]?.message?.content || "{}";

    let json;
    try {
      const match = aiText.match(/\{[\s\S]*\}/);
      json = match ? JSON.parse(match[0]) : JSON.parse(aiText);
    } catch (err) {
      console.log("❌ JSON Parse Error → RAW AI Text:", aiText);
      return NextResponse.json({
        provider: "groq",
        result: {
          leafFound: false,
          health: 0,
          diseases: [],
          causes: [],
          tips: [],
        },
      });
    }

    return NextResponse.json({ provider: "groq", result: json });

  } catch (error: any) {
    console.error("🔥 FULL GROQ ERROR:", error);

    return NextResponse.json(
      {
        provider: "groq",
        error: error.message || "Unknown server error",
        stack: error.stack || null,
      },
      { status: 500 }
    );
  }
}
