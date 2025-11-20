import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Missing GROQ_API_KEY in environment variables" },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const SYSTEM_PROMPT = `
You are an expert plant disease analysis system.
Return ONLY JSON, no markdown.

If no real leaf is detected, return:
{
  "leafFound": false,
  "health": 0,
  "diseases": [],
  "causes": [],
  "tips": []
}

If a real leaf exists, return:
{
  "leafFound": true,
  "health": number,
  "diseases": [string],
  "causes": [string],
  "tips": [string]
}
`;

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
              type: "input_image",       // ✅ CORRECT
              image_url: image,          // ✅ MUST be base64 or public URL
            }
          ],
        },
      ],
    });

    const aiText = groqResponse.choices?.[0]?.message?.content || "{}";

    let json;
    try {
      const match = aiText.match(/\{[\s\S]*\}/);
      json = match ? JSON.parse(match[0]) : JSON.parse(aiText);
    } catch (err) {
      console.error("JSON parse error: ", aiText);
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
  } catch (error) {
    console.error("🔥 Server error:", error);
    return NextResponse.json(
      {
        provider: "groq",
        result: {
          leafFound: false,
          health: 0,
          diseases: [],
          causes: [],
          tips: [],
        },
      },
      { status: 500 }
    );
  }
}
