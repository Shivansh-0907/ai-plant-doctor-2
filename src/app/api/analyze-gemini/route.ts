// src/app/api/analyze-gemini/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  console.log("🚀 Gemini API called");

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
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2000,
      }
    });

    const EXPERT_PROMPT = `You are an expert plant pathologist with 20+ years of experience.

CRITICAL INSTRUCTIONS:
1. Output ONLY a single valid JSON object
2. NO markdown formatting (no \`\`\`json or \`\`\`)
3. NO explanatory text before or after JSON
4. NO comments or code fences
5. NO multiple JSON objects
6. ALL keys must be present (no missing keys)
7. NO trailing commas
8. Use correct data types

STEP 1: LEAF DETECTION
Before analyzing, check if a CLEAR, REAL plant leaf is visible in the image.
- Set "noLeafDetected": true ONLY if: no plant, fake/plastic plant, drawing, illustration, toy, or non-plant object
- Set "noLeafDetected": false if: ANY real plant leaf is visible (healthy, diseased, damaged, or wilted)

If noLeafDetected is TRUE, return this EXACT JSON structure:
{
  "stage": -1,
  "damageType": "Invalid Image",
  "healthPercentage": 0,
  "category": "Invalid Image",
  "possibleDiseases": [{"name": "No leaf detected", "description": "No plant leaf found in image", "likelihood": 0}],
  "primaryDisease": "No leaf detected",
  "confidence": 0,
  "severity": "none",
  "description": "No plant leaf detected in the uploaded image",
  "causes": [{"disease": "Invalid Input", "cause": "No leaf present", "explanation": "Please upload a clear image of a real plant leaf"}],
  "careTips": ["Please upload an image containing a plant leaf", "Make sure the leaf is clearly visible", "Use good lighting", "Ensure the entire leaf is in frame"],
  "symptoms": ["No leaf detected in image"],
  "detectedPatterns": ["No plant material visible"],
  "noLeafDetected": true
}

If a REAL LEAF is detected, proceed with analysis using this EXACT JSON structure:
{
  "stage": <number 0-3>,
  "damageType": "<string>",
  "healthPercentage": <number 0-100>,
  "category": "<string>",
  "possibleDiseases": [{"name": "<string>", "description": "<string>", "likelihood": <number 0-100>}],
  "primaryDisease": "<string>",
  "confidence": <number 0-1>,
  "severity": "<none|low|medium|high>",
  "description": "<string>",
  "causes": [{"disease": "<string>", "cause": "<string>", "explanation": "<string>"}],
  "careTips": ["<string>", "<string>", "<string>"],
  "symptoms": ["<string>", "<string>", "<string>"],
  "detectedPatterns": ["<string>", "<string>", "<string>"],
  "noLeafDetected": false
}

STAGE SYSTEM (must match healthPercentage):
- Stage 0 (Healthy): 90-100% health → Perfect condition, vibrant green, no visible issues
- Stage 1 (Mild): 70-89% health → Minor spots, slight yellowing, early symptoms
- Stage 2 (Moderate): 45-69% health → Significant discoloration, clear disease signs
- Stage 3 (Critical): 0-44% health → Severe damage, dying tissue, major infection

EACH STAGE MUST HAVE UNIQUE CONTENT:
- Stage 0: symptoms = ["Vibrant green color", "No visible damage"], careTips = ["Maintain current care", "Monitor regularly"]
- Stage 1: symptoms = ["Minor discoloration", "Small spots"], careTips = ["Increase air circulation", "Check watering schedule"]
- Stage 2: symptoms = ["Significant yellowing", "Spreading lesions"], careTips = ["Apply fungicide", "Isolate plant", "Improve drainage"]
- Stage 3: symptoms = ["Severe wilting", "Large necrotic areas"], careTips = ["Emergency treatment needed", "Remove dead tissue", "Consider professional help"]

ONLY USE REAL DISEASE NAMES:
- Fungal Leaf Spot
- Bacterial Soft Rot
- Nutrient Deficiency (Iron, Nitrogen, Magnesium)
- Sunburn / Sun Scorch
- Pest Damage (Spider Mites, Thrips, Mealybugs, Scale)
- Overwatering Stress
- Underwatering Stress
- Root Rot
- Powdery Mildew
- Anthracnose
- Healthy (if 90-100% health)

NEVER invent fantasy disease names or experimental conditions.

CONSISTENCY RULES:
- If healthPercentage is 90-100, severity MUST be "none", stage MUST be 0
- If healthPercentage is 70-89, severity MUST be "low", stage MUST be 1
- If healthPercentage is 45-69, severity MUST be "medium", stage MUST be 2
- If healthPercentage is 0-44, severity MUST be "high", stage MUST be 3
- confidence should be 0.75-0.95 for clear images, 0.50-0.74 for unclear

Output ONLY the JSON object. No additional text.`;

    console.log("📤 Sending to Gemini 2.5 Flash...");

    const result = await model.generateContent([
      { text: EXPERT_PROMPT },
      {
        inlineData: {
          data: image.replace(/^data:image\/\w+;base64,/, ""),
          mimeType: "image/png",
        },
      },
    ]);

    const aiText = result.response.text().trim();
    console.log("📥 Gemini response received");

    // Remove ALL markdown formatting aggressively
    let cleanText = aiText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .replace(/^[^{]*/, "") // Remove everything before first {
      .replace(/[^}]*$/, "") // Remove everything after last }
      .trim();

    let parsed;
    try {
      // Extract ONLY the first JSON object
      const jsonMatch = cleanText.match(/\{[\s\S]*?\}(?=\s*$)/);
      const cleanJson = jsonMatch ? jsonMatch[0] : cleanText;
      parsed = JSON.parse(cleanJson);

      // Strict validation - ensure ALL required keys exist
      const requiredKeys = [
        "stage", "damageType", "healthPercentage", "category",
        "possibleDiseases", "primaryDisease", "confidence", "severity",
        "description", "causes", "careTips", "symptoms", "detectedPatterns"
      ];

      const missingKeys = requiredKeys.filter(key => !(key in parsed));
      if (missingKeys.length > 0) {
        console.error("❌ Missing required keys:", missingKeys);
        throw new Error(`Missing required keys: ${missingKeys.join(", ")}`);
      }

      // Normalize and validate each field with strict type checking
      const normalized = {
        noLeafDetected: parsed.noLeafDetected === true,
        stage: Number(parsed.stage) || 0,
        damageType: String(parsed.damageType || "General"),
        healthPercentage: Math.max(0, Math.min(100, Number(parsed.healthPercentage) || 0)),
        category: String(parsed.category || "General"),
        possibleDiseases: Array.isArray(parsed.possibleDiseases) 
          ? parsed.possibleDiseases.map((d: any) => ({
              name: String(d.name || "Unknown"),
              description: String(d.description || ""),
              likelihood: Math.max(0, Math.min(100, Number(d.likelihood) || 50))
            }))
          : [],
        primaryDisease: String(parsed.primaryDisease || "Unknown"),
        confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.75)),
        severity: ["none", "low", "medium", "high"].includes(parsed.severity) 
          ? parsed.severity 
          : "none",
        description: String(parsed.description || "Analysis complete."),
        causes: Array.isArray(parsed.causes)
          ? parsed.causes.map((c: any) => ({
              disease: String(c.disease || "Unknown"),
              cause: String(c.cause || "Unknown"),
              explanation: String(c.explanation || "")
            }))
          : [],
        careTips: Array.isArray(parsed.careTips) ? parsed.careTips.map(String) : [],
        symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms.map(String) : [],
        detectedPatterns: Array.isArray(parsed.detectedPatterns) 
          ? parsed.detectedPatterns.map(String) 
          : [],
        leafFound: parsed.noLeafDetected !== true
      };

      // Additional consistency validation
      const health = normalized.healthPercentage;
      if (health >= 90 && normalized.stage !== 0) {
        normalized.stage = 0;
        normalized.severity = "none";
      } else if (health >= 70 && health < 90 && normalized.stage !== 1) {
        normalized.stage = 1;
        normalized.severity = "low";
      } else if (health >= 45 && health < 70 && normalized.stage !== 2) {
        normalized.stage = 2;
        normalized.severity = "medium";
      } else if (health < 45 && normalized.stage !== 3) {
        normalized.stage = 3;
        normalized.severity = "high";
      }

      return NextResponse.json({
        success: true,
        provider: "gemini",
        model: "gemini-2.5-flash",
        ...normalized
      });

    } catch (parseError: any) {
      console.error("❌ JSON Parse Error:", parseError.message);
      console.log("Raw AI response:", aiText.substring(0, 1000));

      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse AI response - invalid JSON format",
          details: parseError.message
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("💥 Gemini API Error:", error.message);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Gemini API request failed"
      },
      { status: 500 }
    );
  }
}