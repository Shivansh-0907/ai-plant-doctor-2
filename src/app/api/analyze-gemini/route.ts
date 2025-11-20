import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "No image provided." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_GENERATIVE_AI_API_KEY missing." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // 🧠 Same analysis logic as Groq
    const prompt = `
You are an expert plant pathologist.
Analyze the leaf image and return STRICT JSON ONLY in the following format:

{
  "leafFound": boolean,
  "health": number,
  "diseases": [string],
  "causes": [string],
  "tips": [string]
}

RULES:
- If no real leaf is found (plastic, cartoon, fake, background, object) → leafFound = false
- Health must be between 0 and 100
- Return diseases only if real disease is visible
- Do NOT include extra text. Only JSON.
`;

    let resultText = "";

    try {
      const result = await model.generateContent([
        { text: prompt },
        {
          inlineData: {
            data: image.replace(/^data:image\/\w+;base64,/, ""),
            mimeType: "image/png",
          },
        },
      ]);

      resultText = result.response.text().trim();
    } catch (apiError: any) {
      console.error("❌ Gemini API error:", apiError);

      // Gemini quota fail → fallback output
      return NextResponse.json({
        provider: "gemini",
        result: {
          leafFound: false,
          health: 0,
          diseases: [],
          causes: [],
          tips: [],
        },
        error: apiError.message,
      });
    }

    // Clean markdown formatting
    resultText = resultText.replace(/```json|```/g, "").trim();

    let jsonData;
    try {
      jsonData = JSON.parse(resultText);
    } catch (e) {
      console.error("❌ Gemini JSON parse error → Raw Output:", resultText);
      jsonData = {
        leafFound: false,
        health: 0,
        diseases: [],
        causes: [],
        tips: [],
      };
    }

    return NextResponse.json({
      provider: "gemini",
      result: jsonData,
      cost: "FREE",
    });

  } catch (error: any) {
    console.error("💥 Internal error (Gemini route):", error);

    return NextResponse.json(
      {
        provider: "gemini",
        result: {
          leafFound: false,
          health: 0,
          diseases: [],
          causes: [],
          tips: [],
        },
        error: error.message,
      },
      { status: 500 }
    );
  }
}
