import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Send to Groq Vision
    const groqResponse = await groq.chat.completions.create({
      model: "llama-3.2-90b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "input_text", text: "Analyze this plant leaf." },
            { type: "input_image", image_url: image },
          ]
        }
      ],
      temperature: 0.3,
    });

    const text = groqResponse.choices?.[0]?.message?.content || "No response";

    return NextResponse.json({
      provider: "groq",
      result: text,
    });
  } catch (err) {
    console.error("Groq API Error:", err);
    return NextResponse.json(
      { error: "Groq analysis failed" },
      { status: 500 }
    );
  }
}
