import { NextRequest, NextResponse } from "next/server";
import { analyzeImageGroq } from "@/lib/vision-groq";

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    console.log("🔍 Analyzing with Groq (Llama 4 Scout 17B Vision)...");

    const result = await analyzeImageGroq(image);

    console.log("✅ Groq analysis complete:", result.primaryDisease);

    return NextResponse.json({
      ...result,
      provider: "groq-llama-4-scout-17b",
      cost: "FREE trial + ultra-fast inference"
    });
  } catch (error: any) {
    console.error("❌ Groq API Error:", error);
    
    const isRateLimit = error.message?.includes("rate_limit") || 
                        error.message?.includes("quota") ||
                        error.message?.includes("429") ||
                        error.message?.includes("RESOURCE_EXHAUSTED");
    
    let userMessage = "Groq analysis failed.";
    if (error.message.includes("API_KEY") || error.message.includes("401")) {
      userMessage = "❌ Groq API key not configured. Get free trial at https://console.groq.com/keys";
    } else if (isRateLimit) {
      userMessage = "⏱️ Groq rate limit exceeded (500K tokens/min on free tier). Please wait a moment or try another provider.";
    }

    return NextResponse.json(
      { 
        error: userMessage, 
        details: error.message,
        setupGuide: "Add GROQ_API_KEY to .env file",
        isRateLimit: isRateLimit,
        suggestedProviders: isRateLimit ? ["Google Gemini", "Together AI"] : []
      },
      { status: isRateLimit ? 429 : 500 }
    );
  }
}