import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `🧠 Orchid Plant Disease Detection System

You are an expert AI plant pathologist specializing in orchid leaf disease analysis.

═══════════════════════════════════════════════════════════════════
🚨 CRITICAL FIRST STEP: LEAF DETECTION VALIDATION
═══════════════════════════════════════════════════════════════════

BEFORE analyzing, you MUST verify the image contains a plant leaf:

❌ IF NO LEAF DETECTED (image shows non-plant objects, random items, people, animals, blank images, etc.):
Return EXACTLY this JSON:
{
  "noLeafDetected": true,
  "stage": -1,
  "damageType": "No Leaf Found",
  "healthPercentage": 0,
  "category": "Invalid Image",
  "possibleDiseases": [],
  "primaryDisease": "No Leaf Found",
  "confidence": 0,
  "severity": "none",
  "description": "No plant leaf detected in the uploaded image. Please upload a clear photo of a plant leaf for disease analysis.",
  "causes": [],
  "careTips": ["Please upload an image containing a plant leaf", "Ensure the leaf is clearly visible in the photo", "Use good lighting for better analysis"],
  "symptoms": ["No leaf detected in image"],
  "detectedPatterns": ["Image does not contain plant leaf material"]
}

✅ IF LEAF IS DETECTED: Proceed with full analysis below

ANALYSIS INSTRUCTIONS:
1. Carefully examine the orchid leaf image for disease symptoms
2. Identify possible diseases with descriptions and likelihood
3. List causes for each disease and explain WHY these causes lead to the disease
4. Suggest care and preventive actions to help recovery

FORMAT RESPONSE WITH THREE CLEAR SECTIONS:

═══════════════════════════════════════════════════════════════════
SECTION 1: POSSIBLE DISEASES
═══════════════════════════════════════════════════════════════════
List all possible diseases detected with:
- Disease name
- Brief description of symptoms
- Likelihood/confidence percentage

═══════════════════════════════════════════════════════════════════
SECTION 2: CAUSES
═══════════════════════════════════════════════════════════════════
For each disease identified, explain:
- What causes this disease
- WHY these causes lead to the disease
- Environmental or care factors involved

═══════════════════════════════════════════════════════════════════
SECTION 3: RECOMMENDED ACTIONS
═══════════════════════════════════════════════════════════════════
Provide care and preventive actions:
- Treatment steps for recovery
- Prevention measures
- Environmental adjustments needed

HEALTH STAGE CLASSIFICATION:
- Stage 0: 90-100% healthy (SUPER HEALTHY - no disease)
- Stage 1: 70-89% healthy (mild, early stage)
- Stage 2: 45-69% healthy (moderate damage)
- Stage 3: <45% healthy (CRITICAL - severe damage)

SUPER HEALTHY LEAF INDICATORS (90-98%):
✨ Vibrant, uniform green color throughout
✨ Smooth, glossy surface with natural sheen
✨ No discoloration, spots, or blemishes
✨ Clear, well-defined vein patterns
✨ Intact leaf edges with no damage
✨ No pest damage or feeding marks
✨ Strong chlorophyll presence

CRITICAL DAMAGE INDICATORS (<45%):
🚨 Widespread necrosis (dead tissue >50%)
🚨 Extensive holes/tears (>30% surface)
🚨 Complete discoloration (no green remaining)
🚨 Dried, brittle, crumbling texture
🚨 Severe wilting or collapse
🚨 Visible fungal growth or rot

Return ONLY valid JSON format:

FOR HEALTHY LEAVES (90-98%):
{
  "stage": 0,
  "damageType": "No Disease Detected",
  "healthPercentage": 95,
  "category": "Excellent Health - No Issues",
  "possibleDiseases": [],
  "primaryDisease": "Healthy Orchid - No Disease",
  "confidence": 98,
  "severity": "none",
  "description": "This orchid leaf exhibits excellent health with vibrant uniform green coloration, smooth glossy surface, intact structure, and no visible signs of disease, pest damage, or stress.",
  "causes": [],
  "careTips": ["Continue current care routine - it's working perfectly!", "Maintain consistent watering schedule", "Ensure adequate indirect sunlight", "Monitor for any changes in appearance", "Provide balanced orchid fertilization monthly", "Keep good air circulation around plant"],
  "symptoms": ["Vibrant uniform green color throughout", "Smooth intact surface with natural sheen", "Strong healthy appearance with no stress indicators"],
  "detectedPatterns": ["Perfect chlorophyll distribution", "No disease or pest indicators detected", "Optimal plant health condition"]
}

FOR DISEASED LEAVES:
{
  "stage": 2,
  "damageType": "Moderate Fungal Infection",
  "healthPercentage": 55,
  "category": "Moderate Damage",
  "possibleDiseases": [
    {
      "name": "Leaf Spot Disease (Cercospora)",
      "description": "Fungal infection causing circular brown spots with yellow halos on leaf surface",
      "likelihood": 85
    },
    {
      "name": "Bacterial Soft Rot",
      "description": "Bacterial infection causing water-soaked lesions and tissue decay",
      "likelihood": 60
    }
  ],
  "primaryDisease": "Fungal Leaf Spot (Cercospora)",
  "confidence": 85,
  "severity": "medium",
  "description": "The orchid leaf displays visible brown circular spots with yellow halos spreading across approximately 45% of the leaf surface, indicating moderate fungal infection requiring immediate attention.",
  "causes": [
    {
      "disease": "Fungal Leaf Spot",
      "cause": "High humidity and poor air circulation",
      "explanation": "Fungal spores thrive in humid environments (>70% humidity) with stagnant air, allowing them to germinate on wet leaf surfaces and penetrate plant tissue through stomata or wounds"
    },
    {
      "disease": "Fungal Leaf Spot",
      "cause": "Overwatering and water on leaves",
      "explanation": "Excess moisture creates ideal conditions for fungal growth. Water sitting on leaves for extended periods allows fungal spores to germinate and infect the tissue"
    },
    {
      "disease": "Bacterial Soft Rot",
      "cause": "Mechanical damage or wounds",
      "explanation": "Bacteria enter through cuts, tears, or damaged areas in the leaf tissue, then multiply rapidly in the moist environment inside the plant cells"
    }
  ],
  "careTips": [
    "Remove affected leaf areas with sterilized scissors to prevent spread",
    "Apply copper-based fungicide or neem oil spray twice weekly for 2-3 weeks",
    "Improve air circulation around the plant - use a small fan if needed",
    "Reduce watering frequency - allow potting medium to dry between waterings",
    "Avoid getting water on leaves - water only the potting medium",
    "Isolate infected orchid from other plants to prevent disease transmission",
    "Increase indirect sunlight exposure to help plant recover"
  ],
  "symptoms": ["Circular brown spots with yellow halos", "Tissue discoloration and decay", "Water-soaked lesions on leaf surface"],
  "detectedPatterns": ["Fungal infection patterns", "Progressive tissue damage", "Moisture-related stress indicators"]
}

CRITICAL: Analyze the entire orchid leaf carefully and provide accurate disease identification with causes and actionable recommendations.`;

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // 🔹 Load API Key (from .env file)
    const apiKey = process.env.OPENAI_API_KEY;
    // ✅ Uncomment below only for local testing (optional)
    // const apiKey = "sk-proj-XXXXXXXXXXXX";

    if (!apiKey) {
      console.error("❌ OpenAI API key not found in environment variables");
      return NextResponse.json(
        { error: "OpenAI API key not configured. Add OPENAI_API_KEY in your .env file." },
        { status: 500 }
      );
    }

    console.log("🔍 Sending request to OpenAI GPT-4o-mini...");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this orchid leaf image for disease detection across Stages 1–3. Focus on Stage 2 details: brown/yellow patches, spots >5mm, rough texture, partial decay. Return JSON with disease stage, health %, confidence, and care tips."
              },
              {
                type: "image_url",
                image_url: {
                  url: image,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.2
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ OpenAI API Error:", JSON.stringify(errorData, null, 2));

      let userMessage = "Failed to analyze image with AI.";
      const code = errorData?.error?.code;

      if (code === "invalid_api_key") {
        userMessage = "❌ Invalid OpenAI API key. Update your .env file.";
      } else if (code === "insufficient_quota") {
        userMessage = "⚠️ API quota exceeded. Please add credits or use a different key.";
      }

      return NextResponse.json(
        { error: userMessage, details: errorData?.error?.message || "Unknown error" },
        { status: response.status || 500 }
      );
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content || "";

    let analysisResult;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      analysisResult = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(analysisText);
    } catch (parseError) {
      console.error("❌ JSON Parse Error:", parseError);
      analysisResult = {
        stage: "Unknown",
        damageType: "Parsing Error",
        healthPercentage: "N/A",
        possibleDiseases: ["Unable to determine"],
        careTips: ["Try again with a clearer image"],
        description: "The AI response could not be parsed. Please retry.",
      };
    }

    return NextResponse.json(analysisResult);
  } catch (error: any) {
    console.error("💥 Internal Server Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error: " + error.message },
      { status: 500 }
    );
  }
}