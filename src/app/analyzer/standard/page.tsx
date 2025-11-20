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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

/**
 * Final ready-to-paste page.tsx
 *
 * Notes:
 * - Uses /api/analyze-groq first, then /api/analyze-gemini fallback.
 * - Ring gauge implemented using SVG, animates from 0 -> health.
 * - All result blocks match the box style with border, dark background and accent color.
 */

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
  // optional extras from backend:
  conditionSummary?: string;
};

export default function StandardAnalyzerPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // ---------- Upload handlers ----------
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

  // ---------- Analysis (Groq default -> Gemini fallback + AI Enhance) ----------
const handleAnalyze = async () => {
  if (!selectedImage) {
    toast.error("Please upload or capture a plant image first.");
    return;
  }

  setIsAnalyzing(true);
  setError(null);
  toast.loading("Analyzing with Groq...");

  try {
    let response = await fetch("/api/analyze-groq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: selectedImage }),
    });

    // fallback to Gemini if Groq fails
    if (!response.ok) {
      toast.message("Groq failed, switching to Gemini...");
      response = await fetch("/api/analyze-gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: selectedImage }),
      });
    }

    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || "Analysis failed");

    // ---------- AI ENHANCEMENT CHECK ----------
    // If AI says it's not a leaf, or looks artificial/cartoon-like, show a "No Leaf Found" message
    const lowerText = JSON.stringify(data).toLowerCase();
    const invalidPatterns = [
      "no leaf found",
      "not a leaf",
      "artificial",
      "plastic",
      "cartoon",
      "toy",
      "drawing",
      "fake",
    ];

    if (invalidPatterns.some((p) => lowerText.includes(p))) {
      setResult(null);
      setError("❌ No Leaf Found! Please upload a clear, natural leaf image.");
      toast.error("No Leaf Found! Try with a real plant image.");
      return;
    }

    // ---------- Normalize backend response ----------
    const normalized: AnalysisResult = {
      healthPercentage:
        typeof data.healthPercentage === "number"
          ? Math.max(0, Math.min(100, data.healthPercentage))
          : 72,
      possibleDiseases: Array.isArray(data.possibleDiseases)
        ? data.possibleDiseases
        : [],
      causes: Array.isArray(data.causes)
        ? data.causes
        : [
            {
              disease: "Nutrient Imbalance",
              explanation:
                "Likely nutrient imbalance (nitrogen/magnesium) causing discoloration.",
            },
          ],
      careTips: Array.isArray(data.careTips)
        ? data.careTips
        : [
            "Prune affected leaves to slow spread.",
            "Apply mild organic treatments if fungal disease is suspected.",
            "Adjust watering frequency; check soil moisture.",
          ],
      generalTips: Array.isArray(data.generalTips)
        ? data.generalTips
        : [
            "4–6 hours of indirect sunlight daily.",
            "Avoid overhead watering during hot hours.",
            "Sanitize tools before pruning.",
          ],
      symptoms: Array.isArray(data.symptoms)
        ? data.symptoms
        : ["Discoloration", "Spots", "Wilting"],
      aiConclusion:
        typeof data.aiConclusion === "string"
          ? data.aiConclusion
          : "Analysis suggests early-stage stress; follow recommended actions for recovery.",
    };

    setResult(normalized);
    toast.success("✅ Analysis complete!");
  } catch (err: any) {
    console.error("Analysis error:", err);
    setError("Both AI models failed or returned an error. Try again later.");
    toast.error("Analysis failed. Try again later.");
  } finally {
    toast.dismiss();
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

  // ---------- Health category helpers ----------
  const healthCategory = (v: number) => {
    // user-specified mapping
    // Very Critical, Critical, Bad, Okay, Good, Perfect
    if (v < 30) {
      return {
        label: "Very Critical",
        color: "#7f1d1d", // dark red
        accent: "#ff4d4f",
        remark: "Severe damage detected — immediate action required.",
      };
    }
    if (v < 45) {
      return {
        label: "Critical",
        color: "#9f1239", // light red-ish
        accent: "#ff6b6b",
        remark: "Critical indicators present; treat urgently.",
      };
    }
    if (v < 60) {
      return {
        label: "Bad",
        color: "#c2410c", // orange
        accent: "#ff914d",
        remark: "Unhealthy — signs of infection or nutrient issues.",
      };
    }
    if (v < 75) {
      return {
        label: "Okay",
        color: "#b45309", // amber
        accent: "#ffd27a",
        remark: "Moderate health — monitor and apply recommended actions.",
      };
    }
    if (v < 90) {
      return {
        label: "Good",
        color: "#16a34a", // light green
        accent: "#6ee7b7",
        remark: "Healthy — minor care will keep it in good condition.",
      };
    }
    return {
      label: "Perfect",
      color: "#047857", // green
      accent: "#34d399",
      remark: "Excellent health — no immediate action needed.",
    };
  };

  // ---------- Ring gauge animation ----------
  // SVG ring constants
  const R = 48; // radius
  const CIRCUMFERENCE = 2 * Math.PI * R;

  // animated progress state
  const [animatedValue, setAnimatedValue] = useState(0);
  useEffect(() => {
    if (!result) {
      setAnimatedValue(0);
      return;
    }
    // animate from 0 -> healthPercentage
    let start = 0;
    const target = Math.max(0, Math.min(100, result.healthPercentage));
    const duration = 800; // ms
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

  // ---------- UI render ----------
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700">
            <Sparkles className="h-4 w-4 text-green-600 animate-pulse" />
            <span className="font-medium text-green-700 dark:text-green-300">
              AI Plant Specialist Mode
            </span>
          </div>

          <h1 className="text-4xl font-bold">
            Expert <span className="text-green-600">Plant Analyzer</span>
          </h1>
          <p className="text-muted-foreground">
            Professional-level diagnosis, clear recommended actions and a
            specialist-style summary.
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
                      <CheckCircle className="mr-2 h-5 w-5" /> Analyze
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
            {/* Health card: left ring + right details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <Card className="col-span-2 bg-gradient-to-br from-[#070707] to-[#0b0b0b] border rounded-2xl">
                <CardContent className="flex gap-6 items-center">
                  {/* Left: ring gauge */}
                  <div className="flex items-center gap-6">
                    <div className="relative w-40 h-40">
                      {/* SVG ring */}
                      {(() => {
                        const val = Math.max(0, Math.min(100, animatedValue));
                        const pct = val / 100;
                        const offset = CIRCUMFERENCE * (1 - pct);
                        const cat = healthCategory(result.healthPercentage);
                        const stroke = cat.accent;
                        return (
                          <svg viewBox="0 0 120 120" className="w-40 h-40">
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
                            {/* center text */}
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
                              fontSize="11"
                            >
                              {healthCategory(result.healthPercentage).label}
                            </text>
                          </svg>
                        );
                      })()}
                    </div>

                    {/* Right: condition details */}
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-semibold text-gray-100">Plant Health</h3>
                      <p className="text-sm text-gray-300 max-w-prose leading-relaxed">
                        {healthCategory(result.healthPercentage).remark}
                      </p>

                      <div className="mt-3 flex gap-3 items-center">
                        <Badge className="bg-white/5 text-white/90 px-3 py-1 rounded-full">
                          Health: {result.healthPercentage}%
                        </Badge>
                        <Badge
                          className="px-3 py-1 rounded-full"
                          style={{
                            background:
                              healthCategory(result.healthPercentage).accent + "22",
                            color: healthCategory(result.healthPercentage).accent,
                            border: `1px solid ${healthCategory(result.healthPercentage).accent}33`,
                          }}
                        >
                          {healthCategory(result.healthPercentage).label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Right side: quick stats / actions */}
                  <div className="ml-auto text-right space-y-2">
                    <div className="text-sm text-gray-400">Quick Summary</div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-100">
                        {result.possibleDiseases.length} Possible Disease{result.possibleDiseases.length !== 1 ? "s" : ""}
                      </div>
                      <div className="text-sm text-gray-300"> {result.symptoms.length} Symptom{result.symptoms.length !== 1 ? "s" : ""} detected</div>
                    </div>
                    <div className="mt-4">
                      <Button onClick={handleCopy} variant="outline">
                        <Clipboard className="mr-2 h-4 w-4" />
                        Copy Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* small placeholder column (visual balance) */}
              <div className="hidden md:block" />
            </div>

            {/* Possible Diseases block */}
            {result.possibleDiseases.length > 0 && (
              <Card className="bg-[#0c0c0c] border border-yellow-700/40 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <Stethoscope className="h-5 w-5" />
                    Possible Diseases
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.possibleDiseases.map((d, i) => (
                    <div
                      key={i}
                      className="border border-yellow-800/50 bg-[#121212] rounded-xl px-4 py-3 flex justify-between hover:border-yellow-500/60 transition"
                    >
                      <div>
                        <p className="font-semibold text-yellow-300">{d.name}</p>
                        <p className="text-gray-400 text-sm">{d.description}</p>
                      </div>
                      <Badge className="bg-yellow-900/40 text-yellow-300 px-3 py-1 rounded-full">
                        {d.likelihood}% Likely
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Detected Causes (same style) */}
            {result.causes.length > 0 && (
              <Card className="bg-[#0c0c0c] border border-blue-700/40 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-400">
                    <BookOpen className="h-5 w-5" />
                    Detected Causes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.causes.map((c, i) => (
                    <div
                      key={i}
                      className="border border-blue-800/50 bg-[#121212] rounded-xl px-4 py-3 hover:border-blue-500/60 transition"
                    >
                      <p className="font-semibold text-blue-300">{c.disease}</p>
                      <p className="text-gray-400 text-sm mt-1">{c.explanation}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Recommended Actions (same boxed style) */}
            <Card className="bg-[#0c0c0c] border border-purple-700/40 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-400">
                  <Lightbulb className="h-5 w-5" />
                  Recommended Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.careTips.map((tip, i) => (
                  <div
                    key={i}
                    className="border border-purple-800/40 bg-[#121212] rounded-xl px-4 py-2 text-gray-300 text-sm hover:border-purple-500/60 transition"
                  >
                    {tip}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* General Plant Care Tips */}
            <Card className="bg-[#0c0c0c] border border-green-700/40 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-400">
                  <Sun className="h-5 w-5" />
                  General Plant Care Tips 🌞
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1 text-gray-300 text-sm">
                  {result.generalTips.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* AI Conclusion */}
            <Card className="bg-[#0c0c0c] border border-teal-700/40 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-teal-400">
                  <FileText className="h-5 w-5" />
                  AI Conclusion
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 text-sm leading-relaxed">
                {result.aiConclusion}
              </CardContent>
            </Card>

            {/* Plant Condition Summary (just above copy/reset) */}
            <Card className="bg-[#0c0c0c] border border-amber-700/40 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-400">
                  <Stethoscope className="h-5 w-5" />
                  Plant Condition Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 text-sm leading-relaxed">
                {/* If backend provides a specific summary, show it; otherwise, compose a short one */}
                {result.aiConclusion ||
                  `Health ${result.healthPercentage}% — ${healthCategory(
                    result.healthPercentage
                  ).label}. Recommended actions above will help recover the plant.`}
              </CardContent>
            </Card>

            {/* Copy / Reset Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleCopy}
                variant="outline"
                className="flex-1 border-2 border-gray-500 hover:border-gray-600"
              >
                <Clipboard className="mr-2 h-4 w-4" /> Copy Report
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1 border-2 border-gray-500 hover:border-gray-600"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Reset
              </Button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}

