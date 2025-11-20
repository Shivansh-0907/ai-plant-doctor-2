"use client";

import { useEffect, useRef, useState } from "react";
import {
  Upload,
  X,
  Loader2,
  CheckCircle,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Stethoscope,
  AlertCircle,
  BookOpen,
  RefreshCw,
  Activity,
  Clipboard,
  Sun,
  FileText,
  Lightbulb,
  Zap,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

type Disease = {
  name: string;
  description: string;
  likelihood: number;
};

type Cause = {
  disease: string;
  explanation: string;
};

type AnalysisResult = {
  healthPercentage: number;
  possibleDiseases: Disease[];
  causes: Cause[];
  careTips: string[];
  generalTips: string[];
  symptoms: string[];
  aiConclusion: string;
  providers?: string[];
  stage?: number;
  severity?: string;
};

const getPlantCondition = (stage: number | undefined, health: number): string => {
  if (stage === undefined) {
    if (health >= 90) return "Healthy Condition";
    if (health >= 70) return "Mild Condition";
    if (health >= 45) return "Moderate Condition";
    return "Severe / Critical Condition";
  }
  
  switch (stage) {
    case 0:
      return "Healthy Condition";
    case 1:
      return "Mild Condition";
    case 2:
      return "Moderate Condition";
    case 3:
      return "Severe / Critical Condition";
    default:
      return "Unknown Condition";
  }
};

// Default meaningful plant care tips if API returns empty
const DEFAULT_GENERAL_TIPS = [
  "💧 Watering: Check soil moisture regularly. Water when the top 2-3 inches feel dry. Avoid overwatering to prevent root rot.",
  "☀️ Sunlight: Ensure your plant receives adequate light based on its species. Most plants need 6-8 hours of indirect sunlight daily.",
  "🌱 Fertilization: Apply balanced fertilizer during growing season (spring/summer). Reduce feeding in fall/winter when growth slows.",
  "💨 Humidity: Maintain 40-60% humidity for most plants. Use a humidifier or pebble tray if air is too dry.",
  "✂️ Pruning: Remove dead or yellowing leaves promptly. Prune regularly to encourage bushier growth and prevent disease spread.",
  "🐛 Pest Control: Inspect leaves weekly for pests. Use neem oil or insecticidal soap for organic pest management.",
];

export default function StandardAnalyzerPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast.error("Please upload or capture a plant image first.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    
    const loadingToast = toast.loading("🧠 Analyzing with Groq AI...");

    try {
      console.log("🔥 Step 1: Trying Groq...");
      let groqFailed = false;
      let groqResponse;
      
      try {
        groqResponse = await fetch("/api/analyze-groq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: selectedImage }),
        });
      } catch (err) {
        console.error("Groq API network error:", err);
        groqFailed = true;
      }

      let finalResult = null;
      let usedProviders: string[] = [];

      if (!groqFailed && groqResponse && groqResponse.ok) {
        const groqData = await groqResponse.json();
        if (groqData.success && groqData.leafFound) {
          console.log("✅ Groq analysis successful!");
          usedProviders.push("Groq LLaVA v1.5 7B");
          finalResult = groqData;
          toast.dismiss(loadingToast);
          toast.success("✅ Analysis complete with Groq AI!");
        } else if (groqData.leafFound === false) {
          console.log("⚠️ Groq: No leaf detected");
        } else {
          console.log("⚠️ Groq analysis failed");
          groqFailed = true;
        }
      } else {
        groqFailed = true;
      }

      let geminiFailed = false;
      if (!finalResult) {
        console.log("⚠️ Groq failed, switching to Gemini fallback...");
        toast.dismiss(loadingToast);
        const geminiToast = toast.loading("🔄 Switching to Gemini AI...");

        try {
          const geminiResponse = await fetch("/api/analyze-gemini", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: selectedImage }),
          });

          if (geminiResponse.ok) {
            const geminiData = await geminiResponse.json();
            if (geminiData.success && geminiData.leafFound) {
              console.log("✅ Gemini analysis successful!");
              usedProviders.push("Google Gemini 2.5 Flash");
              finalResult = geminiData;
              toast.dismiss(geminiToast);
              toast.success("✅ Analysis complete with Gemini AI!");
            } else if (geminiData.leafFound === false) {
              console.log("⚠️ Gemini: No leaf detected");
            } else {
              geminiFailed = true;
            }
          } else {
            geminiFailed = true;
          }
        } catch (err) {
          console.error("Gemini API network error:", err);
          geminiFailed = true;
        }
        
        toast.dismiss(geminiToast);
      }

      if (groqFailed && geminiFailed) {
        setResult(null);
        setError("❌ Both AI Failed to Analyse. Please check your API keys or try again later.");
        toast.error("Both AI Failed to Analyse!");
        toast.dismiss(loadingToast);
        return;
      }

      if (!finalResult) {
        setResult(null);
        setError("❌ No Leaf Found! Please upload a clear image of a real plant leaf.");
        toast.error("No Leaf Found! Try with a real plant image.");
        toast.dismiss(loadingToast);
        return;
      }

      const analysisResult: AnalysisResult = {
        healthPercentage: finalResult.healthPercentage || 72,
        possibleDiseases: finalResult.possibleDiseases || [],
        causes: finalResult.causes || [],
        careTips: finalResult.careTips || [],
        // Ensure generalTips always has meaningful content
        generalTips: finalResult.generalTips && finalResult.generalTips.length > 0 
          ? finalResult.generalTips 
          : DEFAULT_GENERAL_TIPS,
        symptoms: finalResult.symptoms || [],
        aiConclusion: finalResult.aiConclusion || finalResult.description || "Analysis complete.",
        providers: usedProviders,
        stage: finalResult.stage,
        severity: finalResult.severity,
      };

      setResult(analysisResult);

    } catch (err: any) {
      console.error("Analysis error:", err);
      setError("❌ Both AI Failed to Analyse. Please try again.");
      toast.error("Both AI Failed to Analyse!");
      toast.dismiss(loadingToast);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleCopy = () => {
    if (!result) return;
    const report = [
      "🧠 AI Plant Health Report",
      `Analyzed by: ${result.providers?.join(" + ") || "AI"}`,
      `Health: ${result.healthPercentage}%`,
      `Possible Diseases: ${result.possibleDiseases
        .map((d) => `${d.name} (${d.likelihood}%)`)
        .join(", ") || "N/A"}`,
      `Causes: ${result.causes
        .map((c) => `${c.disease} — ${c.explanation}`)
        .join("; ") || "N/A"}`,
      `Recommended Actions: ${result.careTips.join("; ") || "N/A"}`,
      `General Tips: ${result.generalTips.join("; ") || "N/A"}`,
      `AI Conclusion: ${result.aiConclusion || "N/A"}`,
    ].join("\n\n");
    navigator.clipboard.writeText(report);
    toast.success("Report copied to clipboard");
  };

  const healthCategory = (v: number) => {
    if (v < 30) {
      return {
        label: "Very Critical",
        color: "#7f1d1d",
        accent: "#ff4d4f",
        remark: "Severe damage detected — immediate action required.",
      };
    }
    if (v < 45) {
      return {
        label: "Critical",
        color: "#9f1239",
        accent: "#ff6b6b",
        remark: "Critical indicators present; treat urgently.",
      };
    }
    if (v < 60) {
      return {
        label: "Bad",
        color: "#c2410c",
        accent: "#ff914d",
        remark: "Unhealthy — signs of infection or nutrient issues.",
      };
    }
    if (v < 75) {
      return {
        label: "Okay",
        color: "#b45309",
        accent: "#ffd27a",
        remark: "Moderate health — monitor and apply recommended actions.",
      };
    }
    if (v < 90) {
      return {
        label: "Good",
        color: "#16a34a",
        accent: "#6ee7b7",
        remark: "Healthy — minor care will keep it in good condition.",
      };
    }
    return {
      label: "Perfect",
      color: "#047857",
      accent: "#34d399",
      remark: "Excellent health — no immediate action needed.",
    };
  };

  const R = 48;
  const CIRCUMFERENCE = 2 * Math.PI * R;

  const [animatedValue, setAnimatedValue] = useState(0);
  useEffect(() => {
    if (!result) {
      setAnimatedValue(0);
      return;
    }
    let start = 0;
    const target = Math.max(0, Math.min(100, result.healthPercentage));
    const duration = 800;
    const startTime = performance.now();
    let raf = 0;

    const step = (now: number) => {
      const elapsed = Math.min(duration, now - startTime);
      const progress = elapsed / duration;
      const value = start + (target - start) * easeOutCubic(progress);
      setAnimatedValue(value);
      if (elapsed < duration) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [result]);

  function easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700">
            <Brain className="h-4 w-4 text-green-600 animate-pulse" />
            <span className="font-medium text-green-700 dark:text-green-300 text-sm">
              Dual AI Analysis: Groq + Gemini
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold">
            Expert <span className="text-green-600">Plant Analyzer</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            Professional-level diagnosis powered by Groq LLaVA v1.5 7B + Google Gemini 2.5 Flash for maximum accuracy.
          </p>
        </div>

        {/* UPLOAD CARD */}
        {!selectedImage ? (
          <Card className="border-2 border-dashed border-green-300 dark:border-green-800">
            <CardContent className="flex flex-col items-center py-12 space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-md">
                <Upload className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Upload Plant Image</h3>
              <p className="text-sm text-muted-foreground">JPG / PNG — under 10MB</p>

              <div className="flex gap-3">
                <Button onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon className="mr-2 h-5 w-5" />
                  Choose File
                </Button>
                <Button onClick={() => cameraInputRef.current?.click()}>
                  <Camera className="mr-2 h-5 w-5" />
                  Take Photo
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden border-2 border-green-300 dark:border-green-800">
            <CardContent className="flex flex-col items-center p-4 space-y-4">
              <div className="relative w-full max-w-md aspect-video">
                <Image
                  src={selectedImage}
                  alt="Selected Leaf"
                  fill
                  className="object-cover rounded-xl"
                />
              </div>
              <div className="flex gap-3 w-full justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedImage(null);
                    setResult(null);
                    setError(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    if (cameraInputRef.current) cameraInputRef.current.value = "";
                  }}
                >
                  <X className="mr-2 h-4 w-4" /> Remove Image
                </Button>
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" /> Analyze with Dual AI
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* When a result is not yet present but we have image, show a single analyze if not done above */}
        {selectedImage && !result && !isAnalyzing && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Ready to analyze your image.</p>
          </div>
        )}

        {/* RESULTS */}
        {result && (
          <div className="space-y-6 animate-fadeIn">
            {/* AI Providers Badge */}
            {result.providers && result.providers.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {result.providers.map((provider, i) => (
                  <Badge key={i} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 text-xs sm:text-sm">
                    <Zap className="mr-1 h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{provider}</span>
                  </Badge>
                ))}
              </div>
            )}

            {/* Health card: improved responsive layout */}
            <div className="w-full">
              <Card className="bg-gradient-to-br from-[#070707] to-[#0b0b0b] border rounded-2xl overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row gap-6 items-center">
                    {/* Left: ring gauge */}
                    <div className="flex-shrink-0">
                      <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                        {/* SVG ring */}
                        {(() => {
                          const val = Math.max(0, Math.min(100, animatedValue));
                          const pct = val / 100;
                          const offset = CIRCUMFERENCE * (1 - pct);
                          const cat = healthCategory(result.healthPercentage);
                          return (
                            <svg viewBox="0 0 120 120" className="w-full h-full">
                              <defs>
                                <linearGradient id="g1" x1="0" x2="1">
                                  <stop offset="0%" stopColor={cat.accent} stopOpacity="0.95" />
                                  <stop offset="100%" stopColor={cat.color} stopOpacity="0.9" />
                                </linearGradient>
                              </defs>

                              {/* background circle */}
                              <circle
                                cx="60"
                                cy="60"
                                r={R}
                                stroke="#111827"
                                strokeWidth="12"
                                fill="none"
                                className="opacity-60"
                              />
                              {/* progress circle */}
                              <circle
                                cx="60"
                                cy="60"
                                r={R}
                                stroke="url(#g1)"
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeDasharray={CIRCUMFERENCE}
                                strokeDashoffset={offset}
                                transform="rotate(-90 60 60)"
                                fill="none"
                                style={{ transition: "stroke-dashoffset 300ms ease-out" }}
                              />
                              {/* center text - responsive sizing */}
                              <text
                                x="60"
                                y="56"
                                textAnchor="middle"
                                fill="#f8fafc"
                                fontSize="20"
                                fontWeight={700}
                              >
                                {Math.round(val)}%
                              </text>
                              <text
                                x="60"
                                y="78"
                                textAnchor="middle"
                                fill="#e6edf0"
                                fontSize="10"
                                className="max-w-[90px]"
                              >
                                {getPlantCondition(result.stage, result.healthPercentage)}
                              </text>
                            </svg>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Center: condition details */}
                    <div className="flex-1 flex flex-col gap-3 text-center lg:text-left">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-100">Plant Health</h3>
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-prose">
                        {healthCategory(result.healthPercentage).remark}
                      </p>

                      <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                        <Badge className="bg-white/5 text-white/90 px-3 py-1 rounded-full text-xs whitespace-nowrap">
                          Health: {result.healthPercentage}%
                        </Badge>
                        <Badge
                          className="px-3 py-1 rounded-full text-xs truncate max-w-[200px]"
                          style={{
                            background: healthCategory(result.healthPercentage).accent + "22",
                            color: healthCategory(result.healthPercentage).accent,
                            border: `1px solid ${healthCategory(result.healthPercentage).accent}33`,
                          }}
                          title={getPlantCondition(result.stage, result.healthPercentage)}
                        >
                          {getPlantCondition(result.stage, result.healthPercentage)}
                        </Badge>
                      </div>
                    </div>

                    {/* Right: quick stats */}
                    <div className="flex-shrink-0 text-center lg:text-right space-y-3 w-full lg:w-auto">
                      <div className="text-xs sm:text-sm text-gray-400">Quick Summary</div>
                      <div>
                        <div className="text-xl sm:text-2xl font-bold text-gray-100">
                          {result.possibleDiseases.length}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-300">Possible Disease{result.possibleDiseases.length !== 1 ? "s" : ""}</div>
                      </div>
                      <div>
                        <div className="text-lg sm:text-xl font-bold text-gray-100">
                          {result.symptoms.length}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-300">Symptom{result.symptoms.length !== 1 ? "s" : ""}</div>
                      </div>
                      <Button onClick={handleCopy} variant="outline" size="sm" className="w-full lg:w-auto mt-2">
                        <Clipboard className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">Copy Report</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Possible Diseases block - improved overflow handling */}
            {result.possibleDiseases.length > 0 && (
              <Card className="bg-[#0c0c0c] border border-yellow-700/40 rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-400 text-lg sm:text-xl">
                    <Stethoscope className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate">Possible Diseases</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.possibleDiseases.map((d, i) => (
                    <div
                      key={i}
                      className="border border-yellow-800/50 bg-[#121212] rounded-xl p-3 sm:p-4 hover:border-yellow-500/60 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-yellow-300 text-sm sm:text-base break-words">{d.name}</p>
                          <p className="text-gray-400 text-xs sm:text-sm mt-1 leading-relaxed break-words">{d.description}</p>
                        </div>
                        <Badge className="bg-yellow-900/40 text-yellow-300 px-3 py-1 rounded-full text-xs whitespace-nowrap self-start sm:self-auto">
                          {d.likelihood}% Likely
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Detected Causes - improved overflow */}
            {result.causes.length > 0 && (
              <Card className="bg-[#0c0c0c] border border-blue-700/40 rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-400 text-lg sm:text-xl">
                    <BookOpen className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate">Detected Causes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.causes.map((c, i) => (
                    <div
                      key={i}
                      className="border border-blue-800/50 bg-[#121212] rounded-xl p-3 sm:p-4 hover:border-blue-500/60 transition"
                    >
                      <p className="font-semibold text-blue-300 text-sm sm:text-base break-words">{c.disease}</p>
                      <p className="text-gray-400 text-xs sm:text-sm mt-2 leading-relaxed break-words">{c.explanation}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Recommended Actions - improved overflow */}
            {result.careTips.length > 0 && (
              <Card className="bg-[#0c0c0c] border border-purple-700/40 rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-400 text-lg sm:text-xl">
                    <Lightbulb className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate">Recommended Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {result.careTips.map((tip, i) => (
                    <div
                      key={i}
                      className="border border-purple-800/40 bg-[#121212] rounded-xl p-3 text-gray-300 text-xs sm:text-sm hover:border-purple-500/60 transition leading-relaxed break-words"
                    >
                      {tip}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* General Plant Care Tips - ALWAYS SHOWS with meaningful content */}
            <Card className="bg-[#0c0c0c] border border-green-700/40 rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-400 text-lg sm:text-xl">
                  <Sun className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">General Plant Care Tips 🌞</span>
                </CardTitle>
                <CardDescription className="text-green-300/70 text-xs sm:text-sm">
                  Essential care guidelines for optimal plant health
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {result.generalTips.map((t, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300 text-xs sm:text-sm leading-relaxed">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-600/20 flex items-center justify-center text-green-400 text-xs font-bold mt-0.5">
                        {i + 1}
                      </span>
                      <span className="flex-1 break-words">{t}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* AI Conclusion - improved overflow */}
            <Card className="bg-[#0c0c0c] border border-teal-700/40 rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-teal-400 text-lg sm:text-xl">
                  <FileText className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">AI Conclusion</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 text-xs sm:text-sm leading-relaxed break-words">
                {result.aiConclusion}
              </CardContent>
            </Card>

            {/* Plant Condition Summary - improved overflow */}
            <Card className="bg-[#0c0c0c] border border-amber-700/40 rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-400 text-lg sm:text-xl">
                  <Stethoscope className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">Plant Condition Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 text-xs sm:text-sm leading-relaxed break-words">
                Health {result.healthPercentage}% — {getPlantCondition(result.stage, result.healthPercentage)}. 
                {result.healthPercentage >= 85 
                  ? " Your plant is in excellent condition. Continue with regular care."
                  : result.healthPercentage >= 60
                  ? " Follow the recommended actions above to improve plant health."
                  : " Immediate action required. Follow treatment recommendations carefully."}
              </CardContent>
            </Card>

            {/* Copy / Reset Buttons - improved responsive */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleCopy}
                variant="outline"
                className="flex-1 border-2 border-gray-500 hover:border-gray-600 h-12"
              >
                <Clipboard className="mr-2 h-4 w-4 flex-shrink-0" /> 
                <span className="truncate">Copy Report</span>
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1 border-2 border-gray-500 hover:border-gray-600 h-12"
              >
                <RefreshCw className="mr-2 h-4 w-4 flex-shrink-0" /> 
                <span className="truncate">Reset</span>
              </Button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription className="break-words">{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}