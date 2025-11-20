import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Missing GROQ_API_KEY in .env" },
        { status: 500 }
      );
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const SYSTEM_PROMPT = `
You are an expert plant disease analysis system.
Return ONLY JSON. No markdown. No explanation.

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

    // ✅ CORRECT GROQ VISION FORMAT
    const groqResponse = await groq.chat.completions.create({
      model: "llama-3.2-90b-vision-preview",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this plant leaf and return JSON." },
            {
              type: "input_image", // IMPORTANT!!!
              image_url: image,    // this is correct for Groq vision
            },
          ],
        },
      ],
    });

    const aiText = groqResponse.choices?.[0]?.message?.content || "{}";

    // Extract JSON safely
    let json;
    try {
      const match = aiText.match(/\{[\s\S]*\}/);
      json = match ? JSON.parse(match[0]) : JSON.parse(aiText);
    } catch (err) {
      console.error("JSON Parse Error → Raw:", aiText);

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

    return NextResponse.json({
      provider: "groq",
      result: json,
    });

  } catch (error) {
    console.error("🔥 Groq API Error:", error);

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
