import Groq from "groq-sdk";

const PLANT_ANALYSIS_PROMPT = `🧠 Advanced Orchid Plant Disease Detection System - Multi-Stage Analysis

You are an expert AI plant pathologist specializing in orchid leaf disease analysis with stage-specific diagnosis.

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

CRITICAL: Provide DIFFERENT content for each stage - DO NOT repeat same information across stages!

═══════════════════════════════════════════════════════════════════
HEALTH STAGE CLASSIFICATION SYSTEM
═══════════════════════════════════════════════════════════════════

🌟 STAGE 0 - PERFECT (90-100% healthy)
- Vibrant, uniform green coloration throughout
- Smooth, glossy surface with natural sheen
- No spots, discoloration, holes, or pest damage
- Clear, well-defined vein patterns
- Intact structure with strong chlorophyll presence

✅ STAGE 1 - MILD DAMAGE (70-89% healthy)
- Small spots or slight discoloration (minor issues)
- Early-stage fungal infection or pest attack
- Minor nutrient imbalance or overwatering signs
- 10-30% of leaf area affected

⚠️ STAGE 2 - BAD (45-69% healthy)
- Significant spots, yellowing, wilting
- Advanced fungal/bacterial infection
- Severe nutrient deficiency or pest infestation
- 31-55% of leaf area affected

🚨 STAGE 3 - CRITICAL (<45% healthy)
- Large spots, rot, severe wilting, nearly dead tissue
- Advanced infections, heavy pest damage
- Environmental stress, possible root damage
- More than 55% of leaf area affected

═══════════════════════════════════════════════════════════════════
STAGE-SPECIFIC OUTPUT REQUIREMENTS
═══════════════════════════════════════════════════════════════════

FOR EACH STAGE, PROVIDE UNIQUE CONTENT IN 5 SECTIONS:

1️⃣ SYMPTOMS HIGHLIGHT
   - Describe visible symptoms and abnormalities
   - Highlight affected areas
   - Estimate percentage of damage
   
2️⃣ CAUSES & RISKS
   - Identify possible causes (fungal, bacterial, pests, environmental)
   - Explain environmental risk factors
   - Detail WHY these causes lead to the problem
   
3️⃣ TREATMENT SUGGESTIONS
   - Provide immediate treatment steps
   - Suggest corrective actions
   - Recommend specific products/solutions if needed
   
4️⃣ CARE RECOMMENDATIONS
   - Watering schedule and techniques
   - Fertilization requirements
   - Light and temperature needs
   - Humidity management
   
5️⃣ EDUCATIONAL INFO
   - Quick tips relevant to the stage
   - Disease prevention strategies
   - Interesting facts about orchid health

═══════════════════════════════════════════════════════════════════
JSON RESPONSE FORMAT
═══════════════════════════════════════════════════════════════════

STAGE 0 (PERFECT) EXAMPLE:
{
  "stage": 0,
  "damageType": "No Disease Detected",
  "healthPercentage": 95,
  "category": "Perfect Health",
  "possibleDiseases": [],
  "primaryDisease": "Healthy Orchid - Stage 0 Perfect",
  "confidence": 98,
  "severity": "none",
  "description": "This orchid leaf exhibits PERFECT health with vibrant uniform green coloration, glossy surface, and zero disease indicators. The plant is thriving in ideal conditions.",
  "causes": [],
  "careTips": [
    "💧 Maintain current watering schedule (once weekly or when medium is dry)",
    "🌞 Continue providing bright indirect light (12-14 hours daily)",
    "🌡️ Keep temperature stable (65-80°F day, 60-70°F night)",
    "💨 Ensure good air circulation with gentle airflow",
    "🥄 Continue monthly balanced fertilizer (20-20-20 diluted to 1/4 strength)",
    "👁️ Monitor weekly for any early signs of stress",
    "🧼 Sterilize tools before pruning to prevent disease introduction",
    "🛡️ Maintain 40-70% humidity for optimal growth",
    "📅 Schedule annual repotting to refresh growing medium",
    "✨ This plant is in the top 5% health range - excellent care!"
  ],
  "symptoms": [
    "✨ Vibrant, uniform deep green coloration across entire leaf surface",
    "✨ Smooth, glossy texture with natural waxy sheen indicating strong cuticle",
    "✨ No spots, discoloration, holes, tears, or blemishes detected",
    "✨ Well-defined vein patterns showing excellent nutrient transport",
    "✨ Firm, turgid tissue with optimal water pressure",
    "✨ Zero pest damage or feeding marks - completely clean",
    "✨ Intact leaf margins with no browning or curling"
  ],
  "detectedPatterns": [
    "Perfect chlorophyll distribution throughout leaf",
    "Strong photosynthesis indicators - peak plant performance",
    "Optimal cell turgor pressure - excellent hydration",
    "No pathogen presence detected",
    "Thriving in ideal environmental conditions"
  ]
}

STAGE 1 (MILD DAMAGE) EXAMPLE:
{
  "stage": 1,
  "damageType": "Early Fungal Spotting",
  "healthPercentage": 78,
  "category": "Mild Damage - Early Detection",
  "possibleDiseases": [
    {
      "name": "Early Leaf Spot (Cercospora)",
      "description": "Beginning fungal infection with 1-3mm brown spots appearing on leaf surface",
      "likelihood": 75
    },
    {
      "name": "Minor Nutrient Deficiency",
      "description": "Slight yellowing suggesting early nitrogen or magnesium deficiency",
      "likelihood": 40
    }
  ],
  "primaryDisease": "Early Stage Fungal Leaf Spot",
  "confidence": 75,
  "severity": "low",
  "description": "The leaf shows MILD early-stage symptoms with 3-5 small brown spots (2-3mm each) affecting approximately 22% of leaf area. This is the BEST time to intervene - disease is highly treatable at this stage!",
  "causes": [
    {
      "disease": "Early Fungal Infection",
      "cause": "Excessive humidity with poor air circulation",
      "explanation": "Fungal spores germinate when humidity exceeds 75% for extended periods. Stagnant air prevents leaf surfaces from drying, creating ideal conditions for spore germination and initial infection through stomata."
    },
    {
      "disease": "Early Fungal Infection",
      "cause": "Water droplets remaining on leaves overnight",
      "explanation": "Evening watering or misting leaves water on leaf surfaces overnight when temperatures drop. This extended moisture period (8+ hours) allows fungal spores to germinate and penetrate the leaf cuticle."
    }
  ],
  "careTips": [
    "✂️ Remove ONLY the affected spots with sterilized scissors - don't remove entire leaf yet",
    "🧴 Apply diluted neem oil spray (1 tsp per quart water) every 3-4 days for 2 weeks",
    "💨 Increase air circulation - position a small fan nearby on low setting",
    "💧 Adjust watering: Water in early morning only, ensure leaves dry by noon",
    "🚫 STOP misting leaves - water only the growing medium, not foliage",
    "🌞 Increase light exposure slightly to strengthen plant defenses",
    "🧼 Sterilize pruning tools with 70% alcohol between each cut",
    "📏 Space orchids 6-8 inches apart if growing multiple plants",
    "🔍 Inspect daily for new spots - early detection prevents spreading",
    "🌡️ Maintain temperature 65-75°F with good day/night differential"
  ],
  "symptoms": [
    "🔍 3-5 small circular brown spots (2-3mm diameter) on leaf surface",
    "🟡 Slight yellowing around 1-2 spots indicating tissue stress",
    "📏 Approximately 15-25% of leaf area showing early symptoms",
    "💧 Minor water-soaked appearance at spot edges",
    "🌿 Remaining 75% of leaf still vibrant and healthy"
  ],
  "detectedPatterns": [
    "Early-stage fungal colonization pattern",
    "Localized tissue damage - not yet spreading rapidly",
    "Moisture-related stress indicators",
    "Good chance of full recovery with prompt treatment"
  ]
}

STAGE 2 (BAD) EXAMPLE:
{
  "stage": 2,
  "damageType": "Moderate Fungal/Bacterial Infection",
  "healthPercentage": 58,
  "category": "Moderate Damage - Action Required",
  "possibleDiseases": [
    {
      "name": "Advanced Leaf Spot (Cercospora/Phyllosticta)",
      "description": "Fungal infection with multiple large brown/black spots with yellow halos spreading across leaf",
      "likelihood": 85
    },
    {
      "name": "Bacterial Brown Spot",
      "description": "Bacterial infection causing water-soaked lesions and tissue softening",
      "likelihood": 60
    }
  ],
  "primaryDisease": "Advanced Fungal Leaf Spot with Secondary Bacterial Infection",
  "confidence": 85,
  "severity": "medium",
  "description": "The leaf exhibits MODERATE damage with 10-15 large brown spots (5-10mm) with yellow halos affecting 42% of leaf surface. Multiple infection points indicate disease has progressed beyond early stage and requires aggressive treatment to prevent plant loss.",
  "causes": [
    {
      "disease": "Advanced Fungal Infection",
      "cause": "Prolonged high humidity (>80%) with poor ventilation",
      "explanation": "Extended periods of excessive humidity allow fungal mycelia to spread rapidly through plant tissue. Without air circulation, spores multiply exponentially and create multiple infection sites across the leaf surface."
    },
    {
      "disease": "Advanced Fungal Infection",
      "cause": "Overwatering saturating growing medium",
      "explanation": "Constantly wet roots cannot absorb oxygen, weakening the plant's immune system. This systemic stress makes the orchid highly susceptible to fungal and bacterial pathogens that exploit the weakened tissue."
    },
    {
      "disease": "Bacterial Brown Spot",
      "cause": "Existing fungal damage creating entry points",
      "explanation": "Fungal lesions break down the protective leaf cuticle, creating wounds. Bacteria enter through these damaged areas and cause secondary infections, accelerating tissue decay and spread."
    }
  ],
  "careTips": [
    "✂️ IMMEDIATELY remove all heavily infected leaves - cut at base with sterile blade",
    "🧴 Apply copper-based fungicide (Copper sulfate 0.5%) weekly for 3-4 weeks",
    "💊 Alternate with systemic fungicide (Physan 20 at 1 tsp/gallon) every 5 days",
    "🚨 Isolate this orchid from all other plants to prevent disease transmission",
    "💧 DRASTICALLY reduce watering - let medium dry completely between waterings",
    "🌬️ Use oscillating fan to maintain constant gentle air movement",
    "🌞 Increase bright indirect light to boost plant immunity",
    "🧹 Remove all dead/dying tissue and debris from pot surface",
    "🏺 Consider repotting in fresh sterile medium if root rot suspected",
    "📊 Monitor remaining leaves twice daily for spread - act fast on new symptoms",
    "🧪 Test fungicide on small area first to ensure no phytotoxicity",
    "⏰ Treatment timeline: 3-4 weeks of intensive care for recovery"
  ],
  "symptoms": [
    "🔴 10-15 large brown/black spots (5-10mm) with distinct yellow halos",
    "💦 Water-soaked lesions with soft, mushy texture indicating bacterial component",
    "📏 Approximately 35-45% of leaf area damaged or discolored",
    "🟡 Extensive yellowing between spots showing systemic stress",
    "🍂 Some leaf edges beginning to dry and curl from tissue death",
    "🦠 Visible fungal spores or bacterial ooze at infection sites",
    "⚠️ Multiple infection points indicating rapid disease progression"
  ],
  "detectedPatterns": [
    "Aggressive fungal colonization with secondary bacterial infection",
    "Multiple infection foci - disease spreading rapidly",
    "Systemic plant stress affecting overall health",
    "Environmental conditions highly favorable for pathogen growth",
    "Moderate recovery chance with intensive treatment"
  ]
}

STAGE 3 (CRITICAL) EXAMPLE:
{
  "stage": 3,
  "damageType": "Severe Necrosis & Rot",
  "healthPercentage": 28,
  "category": "Critical - Emergency Intervention",
  "possibleDiseases": [
    {
      "name": "Severe Fungal Necrosis (Botrytis/Fusarium)",
      "description": "Advanced fungal infection causing extensive tissue death, rot, and complete leaf collapse",
      "likelihood": 90
    },
    {
      "name": "Bacterial Soft Rot (Erwinia)",
      "description": "Aggressive bacterial infection with foul-smelling tissue liquefaction",
      "likelihood": 75
    },
    {
      "name": "Root Rot (Pythium/Phytophthora)",
      "description": "Systemic root infection causing plant-wide collapse and death",
      "likelihood": 65
    }
  ],
  "primaryDisease": "Critical Fungal Necrosis with Systemic Collapse",
  "confidence": 90,
  "severity": "high",
  "description": "CRITICAL EMERGENCY: The leaf shows SEVERE damage with 72% tissue death, extensive black rot, and complete structural collapse. This represents systemic plant failure requiring IMMEDIATE emergency intervention. Plant survival is at risk - act within 24 hours!",
  "causes": [
    {
      "disease": "Severe Fungal Necrosis",
      "cause": "Chronic overwatering with waterlogged growing medium",
      "explanation": "Roots submerged in water for weeks develop root rot (Pythium/Phytophthora), cutting off nutrient/water transport to leaves. Anaerobic conditions kill root tissue, and fungal pathogens spread systemically through vascular tissue, causing plant-wide collapse."
    },
    {
      "disease": "Severe Fungal Necrosis",
      "cause": "Complete lack of air circulation in humid environment",
      "explanation": "Stagnant air with 80%+ humidity creates perfect conditions for explosive fungal growth. Spores germinate on all surfaces, mycelia penetrate deep into plant tissue, and infection spreads to stem and roots, threatening entire plant."
    },
    {
      "disease": "Bacterial Soft Rot",
      "cause": "Advanced tissue damage providing massive bacterial entry",
      "explanation": "Extensive fungal damage destroys the plant's protective barriers. Opportunistic bacteria (Erwinia, Pseudomonas) colonize dead tissue, produce enzymes that liquefy cells, and rapidly spread through vascular system causing systemic rot."
    },
    {
      "disease": "Systemic Collapse",
      "cause": "Severe environmental stress and neglect",
      "explanation": "Prolonged exposure to extreme temperatures, zero fertilization for months, or complete watering neglect cause systemic plant failure. The orchid's immune system shuts down, making it defenseless against any pathogen."
    }
  ],
  "careTips": [
    "🚨 EMERGENCY ACTION: Remove plant from pot IMMEDIATELY - inspect roots NOW",
    "✂️ Cut away ALL dead, brown, mushy roots with sterile surgical scissors",
    "🔪 Remove ALL severely damaged leaves - only keep tissue with some green",
    "🧴 Soak remaining roots in fungicide solution (Physan 20 at double strength) for 20 minutes",
    "💊 Apply systemic fungicide powder (Daconil) directly to all cut surfaces",
    "🏺 Repot in COMPLETELY NEW sterile medium (fresh bark mix) in clean sterilized pot",
    "🚫 DO NOT water for 5-7 days - let cuts callus and heal",
    "🌡️ Move to warm location (75-80°F) with bright indirect light and excellent air flow",
    "💨 Use fan on low 24/7 to keep air moving constantly around plant",
    "🔬 Apply hydrogen peroxide solution (3% diluted 1:4) to remaining tissue to kill bacteria",
    "⚕️ Consider professional plant pathologist consultation if >70% of plant affected",
    "💉 Use rooting hormone on any viable stems to encourage new growth",
    "🏥 Isolate plant in quarantine area - at least 10 feet from other plants",
    "📅 Expect 6-12 weeks recovery minimum IF plant survives - daily monitoring essential",
    "⚰️ Be prepared: At this stage, plant may not be salvageable - assess honestly"
  ],
  "symptoms": [
    "☠️ 60-80% of leaf area completely dead (black/brown necrotic tissue)",
    "🦠 Extensive black rot with visible fungal mycelium or bacterial slime",
    "💀 Complete leaf collapse - tissue paper-thin and disintegrating",
    "🤢 Foul odor indicating bacterial rot and tissue decomposition",
    "🕳️ Large holes where tissue has completely rotted away",
    "🍂 Dried, crispy areas mixed with wet, mushy rot zones",
    "⚫ Black vascular streaking visible on stems (systemic infection)",
    "🥀 Complete loss of turgor - leaf cannot support own weight"
  ],
  "detectedPatterns": [
    "Catastrophic multi-pathogen infection (fungal + bacterial)",
    "Systemic vascular collapse affecting entire plant",
    "Advanced necrosis with massive tissue death",
    "Root system likely severely compromised or dead",
    "Plant survival chance: 10-30% even with aggressive treatment",
    "Immediate emergency intervention required within 24 hours"
  ]
}

CRITICAL INSTRUCTIONS:
✅ Provide UNIQUE, DETAILED content for each stage
✅ Make symptoms, causes, treatments, and care SPECIFIC to the damage level
✅ Include REALISTIC percentages and measurements
✅ Give ACTIONABLE, stage-appropriate advice
✅ Educational info should match the severity level

Return ONLY valid JSON following the stage-appropriate format above!`;

export async function analyzeImageGroq(imageDataUrl: string) {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error("GROQ_API_KEY not configured");
  }

  const groq = new Groq({ apiKey });

  const response = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: imageDataUrl,
            },
          },
          {
            type: "text",
            text: PLANT_ANALYSIS_PROMPT,
          },
        ],
      },
    ],
    max_tokens: 1500,
    temperature: 0.2,
  });

  const text = response.choices[0]?.message?.content || "";
  
  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse JSON response from Groq");
  }

  const analysis = JSON.parse(jsonMatch[0]);
  
  // Health condition enforcement
  if (analysis.healthPercentage >= 90) {
    analysis.stage = 0;
    analysis.severity = "none";
  } else if (analysis.healthPercentage < 45 || analysis.stage === 3) {
    analysis.stage = 3;
    analysis.severity = "high";
  }
  
  return analysis;
}