import { NextRequest, NextResponse } from "next/server";
import { analyzeImageGemini } from "@/lib/vision-gemini";

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    console.log("🔍 Analyzing with Google Gemini 2.0 Flash...");

    const result = await analyzeImageGemini(image);

    console.log("✅ Gemini analysis complete:", result.primaryDisease);

    return NextResponse.json({
      ...result,
      provider: "gemini-2.0-flash",
      cost: "FREE (15 img/min)"
    });
  } catch (error: any) {
    console.error("❌ Gemini API Error:", error);
    
    const isRateLimit = error.message?.includes("quota") || 
                        error.message?.includes("rate") || 
                        error.message?.includes("RESOURCE_EXHAUSTED");
    
    let userMessage = "Gemini analysis failed.";
    if (error.message.includes("API_KEY")) {
      userMessage = "❌ Google Gemini API key not configured. Get free key at https://aistudio.google.com/apikey";
    } else if (isRateLimit) {
      userMessage = "⏱️ Gemini rate limit exceeded (15 images/min on free tier). Please wait a moment or try another provider.";
    }

    return NextResponse.json(
      { 
        error: userMessage, 
        details: error.message,
        setupGuide: "Add GOOGLE_GENERATIVE_AI_API_KEY to .env file",
        isRateLimit: isRateLimit,
        suggestedProviders: isRateLimit ? ["Together AI", "Groq"] : []
      },
      { status: isRateLimit ? 429 : 500 }
    );
  }
}