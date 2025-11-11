Gmail	Shiva Jain <shivagrafix0907@gmail.com>
(no subject)
Shashank Chakradhari <shashankchakradhari01@gmail.com>	Tue, Nov 11, 2025 at 4:51 PM
To: shivagrafix0907@gmail.com
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Upload,
  Camera,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Eye,
  Stethoscope,
  Pill,
  BookOpen,
  Heart,
  Leaf,
  Sparkles,
  Activity,
  Zap,
  X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

/**
 * Full Standard 2D Analyzer Page
 *
 * - Upload / camera capture
 * - Provider selector (Gemini / Groq) (keeps compatibility with your existing providerInfo)
 * - Realistic progress bar (simulated) — wire to real API events easily
 * - Result display: Health Overview, Plant Condition Summary, General Care Tips,
 * Possible Diseases, Causes, Recommended Actions, Copy/Reset
 *
 * Replace your existing page file with this. Adjust provider API endpoints (analyze) as required.
 */

/* ----------------------------- Types ------------------------------ */
type PossibleDisease = { name?: string; description?: string; likelihood?: number } | string;

type CauseInfo = {
  disease: string;
  cause: string;
  explanation: string;
};

type AnalysisResult = {
  noLeafDetected?: boolean;
  stage?: number;
  damageType?: string;
  healthPercentage: number;
  category?: string;
  possibleDiseases?: PossibleDisease[];
  primaryDisease?: string;
  confidence?: number; // 0..1
  severity: "none" | "low" | "medium" | "high";
  description?: string;
  causes?: CauseInfo[];
  careTips?: string[];
  symptoms?: string[];
  detectedPatterns?: string[];
  provider?: string;
  cost?: string;
  plantName?: string | null;
};

/* -------------------------- Provider Info ------------------------- */
type AIProvider = "gemini" | "groq";

const providerInfo: Record<
  AIProvider,
  {
    name: string;
    badge: string;
    description: string;
  }
> = {
  gemini: {
    name: "Gemini 2.0 Flash",
    badge: "FREE",
    description: "High-accuracy vision model"
  },
  groq: {
    name: "Groq Llama 4 Scout",
    badge: "FAST",
    description: "Low-latency inference"
  }
};

/* --------------------------- Helpers ------------------------------- */
const clamp = (v: number, a = 0, b = 100) => Math.max(a, Math.min(b, v));

const getSeverityColor = (severity: AnalysisResult["severity"]) => {
  switch (severity) {
    case "none":
    case "low":
      return "text-green-600 dark:text-green-300";
    case "medium":
      return "text-yellow-600 dark:text-yellow-300";
    case "high":
      return "text-red-600 dark:text-red-300";
    default:
      return "text-gray-600";
  }
};

const getSeverityLabel = (severity: AnalysisResult["severity"]) => {
  switch (severity) {
    case "none":
      return "None";
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    default:
      return "Unknown";
  }
};

/* ------------------------ Main Component -------------------------- */
export default function StandardAnalyzerPage(): JSX.Element {
  // UI state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [aiProvider, setAiProvider] = useState<AIProvider>("gemini");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // refs
  const fileRef = useRef<HTMLInputElement | null>(null);
  const cameraRef = useRef<HTMLInputElement | null>(null);

  /* --------------------- Upload & Camera Handlers --------------------- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSelectedImage(ev.target?.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSelectedImage(ev.target?.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const resetAll = () => {
    setSelectedImage(null);
    setFileName(null);
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
    setProgress(0);
    if (fileRef.current) fileRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
  };

  /* -------------------- Analysis (Simulated) --------------------- */
  // This function simulates progress and returns a demo result.
  // Replace the inner fetch block with a real API call to your /api/analyze endpoint.
  const startAnalysis = async () => {
    if (!selectedImage) {
      toast.error("Please upload or capture a leaf image first.");
      return;
    }
    setError(null);
    setIsAnalyzing(true);
    setProgress(2);
    setResult(null);

    // Simulate progressive scanning (for UI feedback)
    let simulatedProgress = 2;
    const progressInterval = setInterval(() => {
      simulatedProgress += Math.random() * 12 + 6; // 6-18%
      setProgress(clamp(Math.round(simulatedProgress)));
    }, 550);

    try {
      // ---- Replace this block with a real API call ----
      // Example:
      // const response = await fetch(`/api/analyze-${aiProvider}`, {
      // method: "POST",
      // headers: {"Content-Type": "application/json"},
      // body: JSON.stringify({ image: selectedImage })
      // });
      // const json = await response.json();
      // map json -> AnalysisResult and setResult(mapped)
      //
      // For demo we return a simulated result after a delay
      await new Promise((res) => setTimeout(res, 1800 + Math.random() * 1200));
      // -------------------------------------------------

      // simulated mapped result
      const simulated: AnalysisResult = {
        stage: 2,
        damageType: "Spot lesions",
        healthPercentage: 72,
        category: "Fungal infection (likely)",
        possibleDiseases: [
          { name: "Alternaria Leaf Spot", description: "Concentric brown rings", likelihood: 67 },
          { name: "Septoria Leaf Spot", description: "Small tan spots with dark borders", likelihood: 21 }
        ],
        primaryDisease: "Alternaria Leaf Spot",
        confidence: 0.88,
        severity: "medium",
        description:
          "The model detected circular brown lesions with yellow halos consistent with a fungal pathogen. Early intervention recommended.",
        causes: [
          {
            disease: "Alternaria Leaf Spot",
            cause: "Warm, humid conditions and leaf wetness",
            explanation: "Fungal spores thrive in damp conditions; overhead watering and poor ventilation accelerate spread."
          }
        ],
        careTips: [
          "Remove infected leaves and dispose of them (do not compost).",
          "Avoid overhead watering; water at soil level only.",
          "Improve air circulation (fan or move to a less crowded area).",
          "Consider copper or neem-based fungicide as an organic option."
        ],
        symptoms: ["Brown circular lesions", "Yellow haloes", "Slight leaf curling"],
        detectedPatterns: ["Circular lesions", "Yellow halos"],
        provider: providerInfo[aiProvider].name,
        cost: "Free",
        plantName: null
      };

      // finalize
      clearInterval(progressInterval);
      setProgress(100);
      await new Promise((r) => setTimeout(r, 300)); // small pause for UI
      setResult(simulated);
      toast.success("Analysis complete");
    } catch (err: any) {
      clearInterval(progressInterval);
      setError("Failed to analyze image. Try again or switch provider.");
      setResult(null);
    } finally {
      setIsAnalyzing(false);
      setProgress(100);
      // small fade back to idle after a few seconds (optional)
      setTimeout(() => setProgress(0), 4000);
    }
  };

  /* ------------------------ Report Copy ------------------------ */
  const copyFullReport = async () => {
    if (!result) return;
    // Build report text
    const diseases = Array.isArray(result.possibleDiseases)
      ? result.possibleDiseases
          .map((d: any, i) =>
            typeof d === "string"
              ? `${i + 1}. ${d}`
              : `${i + 1}. ${d.name}${d.likelihood ? ` (${d.likelihood}% likely)` : ""}${d.description ? ` - ${d.description}` : ""}`
          )
          .join("\n")
      : "N/A";

    const causes = result.causes && result.causes.length > 0 ? result.causes
      .map((c, i) => `${i + 1}. ${c.disease}\n Cause: ${c.cause}\n Why: ${c.explanation}`)
      .join("\n\n") : "N/A";

    const care = result.careTips && result.careTips.length ? result.careTips.map((c, i) => `${i + 1}. ${c}`).join("\n") : "N/A";

    const textReport = [
      "PLANT DISEASE ANALYSIS REPORT",
      "---------------------------------------",
      `Primary Disease: ${result.primaryDisease ?? "N/A"}`,
      `Health Status: ${result.healthPercentage}% Healthy`,
      `Severity: ${result.severity.toUpperCase()}`,
      `Category: ${result.category ?? "N/A"}`,
      "",
      "Description:",
      result.description ?? "N/A",
      "",
      "Detected Symptoms:",
      result.symptoms && result.symptoms.length ? result.symptoms.map((s, i) => `${i + 1}. ${s}`).join("\n") : "None",
      "",
      "POSSIBLE DISEASES:",
      diseases,
      "",
      "CAUSES:",
      causes,
      "",
      "RECOMMENDED ACTIONS:",
      care,
      "",
      `Analyzed with: ${result.provider ?? "Orchid AI"}`,
      `Detected patterns: ${result.detectedPatterns?.join(", ") ?? "N/A"}`,
      "---------------------------------------"
    ].join("\n");

    try {
      await navigator.clipboard.writeText(textReport);
      toast.success("Full report copied to clipboard");
    } catch (err) {
      toast.error("Unable to copy report (clipboard permission denied)");
    }
  };

  /* ------------------------ Small UI helpers ------------------------ */
  const healthCondition = (hp: number) => {
    if (hp >= 90) return { label: "Super Healthy", tone: "excellent" as const };
    if (hp >= 70) return { label: "Good", tone: "good" as const };
    if (hp >= 45) return { label: "At Risk", tone: "warning" as const };
    return { label: "Critical", tone: "critical" as const };
  };

  /* ----------------------------- Render ----------------------------- */
  return (
    <div className="min-h-screen py-10 px-4 bg-gradient-to-b from-green-50 to-white dark:from-zinc-900 dark:to-black">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <header className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200/50 mx-auto">
            <Sparkles className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-700 dark:text-green-300">Standard Plant Analyzer</span>
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-50">AI Plant 2D Analyzer</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl mx-auto">Upload a leaf image and get an instant diagnosis, treatment plan, and prevention tips.</p>
        </header>

        {/* Controls Card */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-600" /> Upload & Analyze
            </CardTitle>
            <CardDescription>Use a clear photo for best results — good lighting, single leaf preferred.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Upload / Preview column */}
              <div className="col-span-1 md:col-span-2 space-y-4">
                {!selectedImage ? (
                  <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3">
                    <Upload className="w-10 h-10 text-green-500" />
                    <p className="text-sm text-muted-foreground">Drag & drop or click to upload a leaf image</p>
                    <div className="flex gap-2">
                      <input ref={fileRef} onChange={handleFileChange} id="file" type="file" accept="image/*" className="hidden" />
                      <label htmlFor="file">
                        <Button onClick={() => fileRef.current?.click()} className="bg-gradient-to-r from-green-600 to-emerald-600">Choose File</Button>
                      </label>

                      <input ref={cameraRef} onChange={handleCameraCapture} id="camera" type="file" accept="image/*" capture="environment" className="hidden" />
                      <label htmlFor="camera">
                        <Button onClick={() => cameraRef.current?.click()} variant="outline">Take Photo</Button>
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">Tip: Crop to a single leaf, avoid blur and shadows for best detection.</p>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="w-full sm:w-72 h-56 relative rounded-xl overflow-hidden border shadow-sm">
                      <Image src={selectedImage} alt="selected" fill className="object-cover" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-semibold">{fileName ?? "Uploaded image"}</div>
                          <div className="text-xs text-muted-foreground mt-1">Provider: <strong>{providerInfo[aiProvider].name}</strong></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedImage(null); setFileName(null); if (fileRef.current) fileRef.current.value = ""; if (cameraRef.current) cameraRef.current.value = ""; }}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        {result ? (
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div>
                              <div className="text-sm font-medium">Last analysis:</div>
                              <div className="text-xs text-muted-foreground">{result.primaryDisease} • {Math.round(result.healthPercentage)}% healthy</div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Ready to analyze this image.</div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button onClick={startAnalysis} disabled={isAnalyzing || !selectedImage} className="bg-gradient-to-r from-green-600 to-emerald-600">
                          {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin mr-2"/>Analyzing...</> : <>Analyze Image</>}
                        </Button>
                        <Button onClick={resetAll} variant="outline">Reset</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right column: Provider + progress + tips */}
              <div className="col-span-1 flex flex-col gap-4">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground">AI Model</div>
                  <Select value={aiProvider} onValueChange={(v) => setAiProvider(v as AIProvider)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini">{providerInfo.gemini.name} — {providerInfo.gemini.badge}</SelectItem>
                      <SelectItem value="groq">{providerInfo.groq.name} — {providerInfo.groq.badge}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground">Analysis Progress</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Progress value={progress} className="h-3 rounded-full" />
                    </div>
                    <div className="text-xs w-12 text-right">{progress}%</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                  <div className="text-sm font-semibold">Quick tips for better results</div>
                  <ul className="mt-2 text-xs space-y-1 text-muted-foreground">
                    <li>• Use a single leaf on a neutral background</li>
                    <li>• Avoid strong backlight or heavy shadows</li>
                    <li>• Ensure image is in focus and high resolution</li>
                  </ul>
                </div>

                <div className="text-xs text-muted-foreground">
                  <div>Provider info</div>
                  <div className="mt-1 text-sm">{providerInfo[aiProvider].description}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RESULTS (always show summary & general care if result present OR always show summary + care even without result) */}
        <div className="space-y-6">
          {/* Health Overview — Always show if we have result OR placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                Health Overview
              </CardTitle>
              <CardDescription>Quick snapshot of the detected plant health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-200">
                    <div className="text-center">
                      <div className="text-lg font-bold">{result ? Math.round(result.healthPercentage) : "--"}%</div>
                      <div className="text-xs text-muted-foreground">Estimated health</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold">{result ? (healthCondition(result.healthPercentage).label) : "No data yet"}</div>
                    <div className="text-xs text-muted-foreground mt-1">{result ? (result.description ?? "") : "Upload and analyze an image to get a detailed health overview."}</div>
                  </div>
                </div>

                <div className="min-w-[220px]">
                  <div className="text-xs text-muted-foreground mb-2">Overall severity</div>
                  <div className={`rounded-lg p-3 border ${result ? (result.severity === "high" ? "border-red-200" : result.severity === "medium" ? "border-yellow-200" : "border-green-200") : "border-gray-200" }`}>
                    <div className={`text-sm font-semibold ${result ? getSeverityColor(result.severity) : "text-gray-600"}`}>
                      {result ? `${getSeverityLabel(result.severity)}` : "—"}
                    </div>
                    <div className="text-xs mt-1 text-muted-foreground">{result ? `Model confidence ${(result.confidence ?? 0) * 100}%` : "Model will show confidence after analyzing"}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plant Condition Summary (Always visible) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Plant Condition Summary
              </CardTitle>
              <CardDescription>Readable one-line statement summarizing the leaf status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {result ? (
                  <p>
                    {result.healthPercentage >= 90 && "Leaf looks vibrant and healthy."}
                    {result.healthPercentage >= 70 && result.healthPercentage < 90 && "Leaf shows minor stress — early-stage issues detected."}
                    {result.healthPercentage >= 45 && result.healthPercentage < 70 && "Leaf shows noticeable symptoms — treatment recommended."}
                    {result.healthPercentage < 45 && "Leaf condition is critical — immediate action required."}
                    {" "} Primary diagnosis: <strong>{result.primaryDisease ?? "N/A"}</strong>.
                  </p>
                ) : (
                  <p>No analysis yet — upload a clear photo and click Analyze to get a summary.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* General Plant Care Tips — Always visible */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-yellow-500" />
                General Plant Care Tips
              </CardTitle>
              <CardDescription>Practical tips to keep your plant healthy (always visible)</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-decimal ml-6 text-sm space-y-2 text-gray-700 dark:text-gray-300">
                <li>Provide consistent watering—allow the top 1–2 inches of soil to dry before the next water.</li>
                <li>Ensure indirect bright light—avoid prolonged harsh direct sunlight for sensitive species.</li>
                <li>Improve airflow—good circulation reduces fungal risk.</li>
                <li>Use well-draining soil and proper pot drainage to prevent root rot.</li>
                <li>Feed lightly with balanced fertilizer during growing season (follow product instructions).</li>
              </ul>
            </CardContent>
          </Card>

          {/* If a result exists, show the detailed sections in order */}
          {result && (
            <>
              {/* Possible Diseases */}
              <Card className="transition-transform hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-orange-600" />
                    Possible Diseases
                  </CardTitle>
                  <CardDescription>Detected candidates and their likelihood</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Array.isArray(result.possibleDiseases) && result.possibleDiseases.length > 0 ? (
                    result.possibleDiseases.map((d: any, idx: number) => {
                      const name = typeof d === "string" ? d : d.name ?? "Unknown";
                      const likelihood = typeof d === "object" && d.likelihood ? `${d.likelihood}% likely` : null;
                      return (
                        <div key={idx} className="p-3 rounded-lg border border-orange-100 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold text-orange-700 dark:text-orange-300">{name}</div>
                              {typeof d === "object" && d.description && <div className="text-sm text-muted-foreground mt-1">{d.description}</div>}
                            </div>
                            {likelihood && <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-700">{likelihood}</Badge>}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                      <div className="text-sm text-muted-foreground">No likely diseases identified. Continue routine monitoring.</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Causes */}
              <Card className="transition-transform hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-purple-600" />
                    Causes
                  </CardTitle>
                  <CardDescription>Root causes and explanations</CardDescription>
                </CardHeader>
                <CardContent>
                  {result.causes && result.causes.length > 0 ? (
                    result.causes.map((c, i) => (
                      <div key={i} className="p-3 rounded-lg border border-purple-100 dark:border-purple-800 mb-3">
                        <div className="font-semibold text-purple-700 dark:text-purple-300">{c.disease}</div>
                        <div className="text-sm text-muted-foreground mt-1"><strong>Cause:</strong> {c.cause}</div>
                        <div className="text-sm text-muted-foreground mt-2">{c.explanation}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                      <div className="text-sm text-muted-foreground">No specific causes identified by the model.</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recommended Actions */}
              <Card className="transition-transform hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="w-5 h-5 text-green-600" />
                    Recommended Actions
                  </CardTitle>
                  <CardDescription>Treatment steps, ordering of priorities, and care tips</CardDescription>
                </CardHeader>
                <CardContent>
                  {result.careTips && result.careTips.length > 0 ? (
                    result.careTips.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-green-100 dark:border-green-800 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 text-white flex items-center justify-center font-semibold">{idx + 1}</div>
                        <div className="text-sm">{tip}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                      <div className="text-sm text-muted-foreground">No specific actionable recommendations available.</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons: Copy Report & Reset */}
              <div className="flex gap-3 mt-2">
                <Button onClick={copyFullReport} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600">
                  <BookOpen className="w-4 h-4 mr-2" /> Copy Full Report
                </Button>

                <Button onClick={resetAll} variant="outline" className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" /> Reset
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Upload,
  Camera,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Eye,
  Stethoscope,
  Pill,
  BookOpen,
  Heart,
  Leaf,
  Sparkles,
  Activity,
  Zap,
  X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

/**
 * Full Standard 2D Analyzer Page
 *
 * - Upload / camera capture
 * - Provider selector (Gemini / Groq) (keeps compatibility with your existing providerInfo)
 * - Realistic progress bar (simulated) — wire to real API events easily
 * - Result display: Health Overview, Plant Condition Summary, General Care Tips,
 * Possible Diseases, Causes, Recommended Actions, Copy/Reset
 *
 * Replace your existing page file with this. Adjust provider API endpoints (analyze) as required.
 */

/* ----------------------------- Types ------------------------------ */
type PossibleDisease = { name?: string; description?: string; likelihood?: number } | string;

type CauseInfo = {
  disease: string;
  cause: string;
  explanation: string;
};

type AnalysisResult = {
  noLeafDetected?: boolean;
  stage?: number;
  damageType?: string;
  healthPercentage: number;
  category?: string;
  possibleDiseases?: PossibleDisease[];
  primaryDisease?: string;
  confidence?: number; // 0..1
  severity: "none" | "low" | "medium" | "high";
  description?: string;
  causes?: CauseInfo[];
  careTips?: string[];
  symptoms?: string[];
  detectedPatterns?: string[];
  provider?: string;
  cost?: string;
  plantName?: string | null;
};

/* -------------------------- Provider Info ------------------------- */
type AIProvider = "gemini" | "groq";

const providerInfo: Record<
  AIProvider,
  {
    name: string;
    badge: string;
    description: string;
  }
> = {
  gemini: {
    name: "Gemini 2.0 Flash",
    badge: "FREE",
    description: "High-accuracy vision model"
  },
  groq: {
    name: "Groq Llama 4 Scout",
    badge: "FAST",
    description: "Low-latency inference"
  }
};

/* --------------------------- Helpers ------------------------------- */
const clamp = (v: number, a = 0, b = 100) => Math.max(a, Math.min(b, v));

const getSeverityColor = (severity: AnalysisResult["severity"]) => {
  switch (severity) {
    case "none":
    case "low":
      return "text-green-600 dark:text-green-300";
    case "medium":
      return "text-yellow-600 dark:text-yellow-300";
    case "high":
      return "text-red-600 dark:text-red-300";
    default:
      return "text-gray-600";
  }
};

const getSeverityLabel = (severity: AnalysisResult["severity"]) => {
  switch (severity) {
    case "none":
      return "None";
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    default:
      return "Unknown";
  }
};

/* ------------------------ Main Component -------------------------- */
export default function StandardAnalyzerPage(): JSX.Element {
  // UI state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [aiProvider, setAiProvider] = useState<AIProvider>("gemini");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // refs
  const fileRef = useRef<HTMLInputElement | null>(null);
  const cameraRef = useRef<HTMLInputElement | null>(null);

  /* --------------------- Upload & Camera Handlers --------------------- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSelectedImage(ev.target?.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSelectedImage(ev.target?.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const resetAll = () => {
    setSelectedImage(null);
    setFileName(null);
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
    setProgress(0);
    if (fileRef.current) fileRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
  };

  /* -------------------- Analysis (Simulated) --------------------- */
  // This function simulates progress and returns a demo result.
  // Replace the inner fetch block with a real API call to your /api/analyze endpoint.
  const startAnalysis = async () => {
    if (!selectedImage) {
      toast.error("Please upload or capture a leaf image first.");
      return;
    }
    setError(null);
    setIsAnalyzing(true);
    setProgress(2);
    setResult(null);

    // Simulate progressive scanning (for UI feedback)
    let simulatedProgress = 2;
    const progressInterval = setInterval(() => {
      simulatedProgress += Math.random() * 12 + 6; // 6-18%
      setProgress(clamp(Math.round(simulatedProgress)));
    }, 550);

    try {
      // ---- Replace this block with a real API call ----
      // Example:
      // const response = await fetch(`/api/analyze-${aiProvider}`, {
      // method: "POST",
      // headers: {"Content-Type": "application/json"},
      // body: JSON.stringify({ image: selectedImage })
      // });
      // const json = await response.json();
      // map json -> AnalysisResult and setResult(mapped)
      //
      // For demo we return a simulated result after a delay
      await new Promise((res) => setTimeout(res, 1800 + Math.random() * 1200));
      // -------------------------------------------------

      // simulated mapped result
      const simulated: AnalysisResult = {
        stage: 2,
        damageType: "Spot lesions",
        healthPercentage: 72,
        category: "Fungal infection (likely)",
        possibleDiseases: [
          { name: "Alternaria Leaf Spot", description: "Concentric brown rings", likelihood: 67 },
          { name: "Septoria Leaf Spot", description: "Small tan spots with dark borders", likelihood: 21 }
        ],
        primaryDisease: "Alternaria Leaf Spot",
        confidence: 0.88,
        severity: "medium",
        description:
          "The model detected circular brown lesions with yellow halos consistent with a fungal pathogen. Early intervention recommended.",
        causes: [
          {
            disease: "Alternaria Leaf Spot",
            cause: "Warm, humid conditions and leaf wetness",
            explanation: "Fungal spores thrive in damp conditions; overhead watering and poor ventilation accelerate spread."
          }
        ],
        careTips: [
          "Remove infected leaves and dispose of them (do not compost).",
          "Avoid overhead watering; water at soil level only.",
          "Improve air circulation (fan or move to a less crowded area).",
          "Consider copper or neem-based fungicide as an organic option."
        ],
        symptoms: ["Brown circular lesions", "Yellow haloes", "Slight leaf curling"],
        detectedPatterns: ["Circular lesions", "Yellow halos"],
        provider: providerInfo[aiProvider].name,
        cost: "Free",
        plantName: null
      };

      // finalize
      clearInterval(progressInterval);
      setProgress(100);
      await new Promise((r) => setTimeout(r, 300)); // small pause for UI
      setResult(simulated);
      toast.success("Analysis complete");
    } catch (err: any) {
      clearInterval(progressInterval);
      setError("Failed to analyze image. Try again or switch provider.");
      setResult(null);
    } finally {
      setIsAnalyzing(false);
      setProgress(100);
      // small fade back to idle after a few seconds (optional)
      setTimeout(() => setProgress(0), 4000);
    }
  };

  /* ------------------------ Report Copy ------------------------ */
  const copyFullReport = async () => {
    if (!result) return;
    // Build report text
    const diseases = Array.isArray(result.possibleDiseases)
      ? result.possibleDiseases
          .map((d: any, i) =>
            typeof d === "string"
              ? `${i + 1}. ${d}`
              : `${i + 1}. ${d.name}${d.likelihood ? ` (${d.likelihood}% likely)` : ""}${d.description ? ` - ${d.description}` : ""}`
          )
          .join("\n")
      : "N/A";

    const causes = result.causes && result.causes.length > 0 ? result.causes
      .map((c, i) => `${i + 1}. ${c.disease}\n Cause: ${c.cause}\n Why: ${c.explanation}`)
      .join("\n\n") : "N/A";

    const care = result.careTips && result.careTips.length ? result.careTips.map((c, i) => `${i + 1}. ${c}`).join("\n") : "N/A";

    const textReport = [
      "PLANT DISEASE ANALYSIS REPORT",
      "---------------------------------------",
      `Primary Disease: ${result.primaryDisease ?? "N/A"}`,
      `Health Status: ${result.healthPercentage}% Healthy`,
      `Severity: ${result.severity.toUpperCase()}`,
      `Category: ${result.category ?? "N/A"}`,
      "",
      "Description:",
      result.description ?? "N/A",
      "",
      "Detected Symptoms:",
      result.symptoms && result.symptoms.length ? result.symptoms.map((s, i) => `${i + 1}. ${s}`).join("\n") : "None",
      "",
      "POSSIBLE DISEASES:",
      diseases,
      "",
      "CAUSES:",
      causes,
      "",
      "RECOMMENDED ACTIONS:",
      care,
      "",
      `Analyzed with: ${result.provider ?? "Orchid AI"}`,
      `Detected patterns: ${result.detectedPatterns?.join(", ") ?? "N/A"}`,
      "---------------------------------------"
    ].join("\n");

    try {
      await navigator.clipboard.writeText(textReport);
      toast.success("Full report copied to clipboard");
    } catch (err) {
      toast.error("Unable to copy report (clipboard permission denied)");
    }
  };

  /* ------------------------ Small UI helpers ------------------------ */
  const healthCondition = (hp: number) => {
    if (hp >= 90) return { label: "Super Healthy", tone: "excellent" as const };
    if (hp >= 70) return { label: "Good", tone: "good" as const };
    if (hp >= 45) return { label: "At Risk", tone: "warning" as const };
    return { label: "Critical", tone: "critical" as const };
  };

  /* ----------------------------- Render ----------------------------- */
  return (
    <div className="min-h-screen py-10 px-4 bg-gradient-to-b from-green-50 to-white dark:from-zinc-900 dark:to-black">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <header className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200/50 mx-auto">
            <Sparkles className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-700 dark:text-green-300">Standard Plant Analyzer</span>
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-50">AI Plant 2D Analyzer</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl mx-auto">Upload a leaf image and get an instant diagnosis, treatment plan, and prevention tips.</p>
        </header>

        {/* Controls Card */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-600" /> Upload & Analyze
            </CardTitle>
            <CardDescription>Use a clear photo for best results — good lighting, single leaf preferred.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Upload / Preview column */}
              <div className="col-span-1 md:col-span-2 space-y-4">
                {!selectedImage ? (
                  <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3">
                    <Upload className="w-10 h-10 text-green-500" />
                    <p className="text-sm text-muted-foreground">Drag & drop or click to upload a leaf image</p>
                    <div className="flex gap-2">
                      <input ref={fileRef} onChange={handleFileChange} id="file" type="file" accept="image/*" className="hidden" />
                      <label htmlFor="file">
                        <Button onClick={() => fileRef.current?.click()} className="bg-gradient-to-r from-green-600 to-emerald-600">Choose File</Button>
                      </label>

                      <input ref={cameraRef} onChange={handleCameraCapture} id="camera" type="file" accept="image/*" capture="environment" className="hidden" />
                      <label htmlFor="camera">
                        <Button onClick={() => cameraRef.current?.click()} variant="outline">Take Photo</Button>
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">Tip: Crop to a single leaf, avoid blur and shadows for best detection.</p>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="w-full sm:w-72 h-56 relative rounded-xl overflow-hidden border shadow-sm">
                      <Image src={selectedImage} alt="selected" fill className="object-cover" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-semibold">{fileName ?? "Uploaded image"}</div>
                          <div className="text-xs text-muted-foreground mt-1">Provider: <strong>{providerInfo[aiProvider].name}</strong></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedImage(null); setFileName(null); if (fileRef.current) fileRef.current.value = ""; if (cameraRef.current) cameraRef.current.value = ""; }}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        {result ? (
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div>
                              <div className="text-sm font-medium">Last analysis:</div>
                              <div className="text-xs text-muted-foreground">{result.primaryDisease} • {Math.round(result.healthPercentage)}% healthy</div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Ready to analyze this image.</div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button onClick={startAnalysis} disabled={isAnalyzing || !selectedImage} className="bg-gradient-to-r from-green-600 to-emerald-600">
                          {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin mr-2"/>Analyzing...</> : <>Analyze Image</>}
                        </Button>
                        <Button onClick={resetAll} variant="outline">Reset</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right column: Provider + progress + tips */}
              <div className="col-span-1 flex flex-col gap-4">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground">AI Model</div>
                  <Select value={aiProvider} onValueChange={(v) => setAiProvider(v as AIProvider)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini">{providerInfo.gemini.name} — {providerInfo.gemini.badge}</SelectItem>
                      <SelectItem value="groq">{providerInfo.groq.name} — {providerInfo.groq.badge}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground">Analysis Progress</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Progress value={progress} className="h-3 rounded-full" />
                    </div>
                    <div className="text-xs w-12 text-right">{progress}%</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                  <div className="text-sm font-semibold">Quick tips for better results</div>
                  <ul className="mt-2 text-xs space-y-1 text-muted-foreground">
                    <li>• Use a single leaf on a neutral background</li>
                    <li>• Avoid strong backlight or heavy shadows</li>
                    <li>• Ensure image is in focus and high resolution</li>
                  </ul>
                </div>

                <div className="text-xs text-muted-foreground">
                  <div>Provider info</div>
                  <div className="mt-1 text-sm">{providerInfo[aiProvider].description}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RESULTS (always show summary & general care if result present OR always show summary + care even without result) */}
        <div className="space-y-6">
          {/* Health Overview — Always show if we have result OR placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                Health Overview
              </CardTitle>
              <CardDescription>Quick snapshot of the detected plant health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-200">
                    <div className="text-center">
                      <div className="text-lg font-bold">{result ? Math.round(result.healthPercentage) : "--"}%</div>
                      <div className="text-xs text-muted-foreground">Estimated health</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold">{result ? (healthCondition(result.healthPercentage).label) : "No data yet"}</div>
                    <div className="text-xs text-muted-foreground mt-1">{result ? (result.description ?? "") : "Upload and analyze an image to get a detailed health overview."}</div>
                  </div>
                </div>

                <div className="min-w-[220px]">
                  <div className="text-xs text-muted-foreground mb-2">Overall severity</div>
                  <div className={`rounded-lg p-3 border ${result ? (result.severity === "high" ? "border-red-200" : result.severity === "medium" ? "border-yellow-200" : "border-green-200") : "border-gray-200" }`}>
                    <div className={`text-sm font-semibold ${result ? getSeverityColor(result.severity) : "text-gray-600"}`}>
                      {result ? `${getSeverityLabel(result.severity)}` : "—"}
                    </div>
                    <div className="text-xs mt-1 text-muted-foreground">{result ? `Model confidence ${(result.confidence ?? 0) * 100}%` : "Model will show confidence after analyzing"}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plant Condition Summary (Always visible) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Plant Condition Summary
              </CardTitle>
              <CardDescription>Readable one-line statement summarizing the leaf status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {result ? (
                  <p>
                    {result.healthPercentage >= 90 && "Leaf looks vibrant and healthy."}
                    {result.healthPercentage >= 70 && result.healthPercentage < 90 && "Leaf shows minor stress — early-stage issues detected."}
                    {result.healthPercentage >= 45 && result.healthPercentage < 70 && "Leaf shows noticeable symptoms — treatment recommended."}
                    {result.healthPercentage < 45 && "Leaf condition is critical — immediate action required."}
                    {" "} Primary diagnosis: <strong>{result.primaryDisease ?? "N/A"}</strong>.
                  </p>
                ) : (
                  <p>No analysis yet — upload a clear photo and click Analyze to get a summary.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* General Plant Care Tips — Always visible */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-yellow-500" />
                General Plant Care Tips
              </CardTitle>
              <CardDescription>Practical tips to keep your plant healthy (always visible)</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-decimal ml-6 text-sm space-y-2 text-gray-700 dark:text-gray-300">
                <li>Provide consistent watering—allow the top 1–2 inches of soil to dry before the next water.</li>
                <li>Ensure indirect bright light—avoid prolonged harsh direct sunlight for sensitive species.</li>
                <li>Improve airflow—good circulation reduces fungal risk.</li>
                <li>Use well-draining soil and proper pot drainage to prevent root rot.</li>
                <li>Feed lightly with balanced fertilizer during growing season (follow product instructions).</li>
              </ul>
            </CardContent>
          </Card>

          {/* If a result exists, show the detailed sections in order */}
          {result && (
            <>
              {/* Possible Diseases */}
              <Card className="transition-transform hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-orange-600" />
                    Possible Diseases
                  </CardTitle>
                  <CardDescription>Detected candidates and their likelihood</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Array.isArray(result.possibleDiseases) && result.possibleDiseases.length > 0 ? (
                    result.possibleDiseases.map((d: any, idx: number) => {
                      const name = typeof d === "string" ? d : d.name ?? "Unknown";
                      const likelihood = typeof d === "object" && d.likelihood ? `${d.likelihood}% likely` : null;
                      return (
                        <div key={idx} className="p-3 rounded-lg border border-orange-100 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold text-orange-700 dark:text-orange-300">{name}</div>
                              {typeof d === "object" && d.description && <div className="text-sm text-muted-foreground mt-1">{d.description}</div>}
                            </div>
                            {likelihood && <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-700">{likelihood}</Badge>}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                      <div className="text-sm text-muted-foreground">No likely diseases identified. Continue routine monitoring.</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Causes */}
              <Card className="transition-transform hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-purple-600" />
                    Causes
                  </CardTitle>
                  <CardDescription>Root causes and explanations</CardDescription>
                </CardHeader>
                <CardContent>
                  {result.causes && result.causes.length > 0 ? (
                    result.causes.map((c, i) => (
                      <div key={i} className="p-3 rounded-lg border border-purple-100 dark:border-purple-800 mb-3">
                        <div className="font-semibold text-purple-700 dark:text-purple-300">{c.disease}</div>
                        <div className="text-sm text-muted-foreground mt-1"><strong>Cause:</strong> {c.cause}</div>
                        <div className="text-sm text-muted-foreground mt-2">{c.explanation}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                      <div className="text-sm text-muted-foreground">No specific causes identified by the model.</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recommended Actions */}
              <Card className="transition-transform hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="w-5 h-5 text-green-600" />
                    Recommended Actions
                  </CardTitle>
                  <CardDescription>Treatment steps, ordering of priorities, and care tips</CardDescription>
                </CardHeader>
                <CardContent>
                  {result.careTips && result.careTips.length > 0 ? (
                    result.careTips.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-green-100 dark:border-green-800 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 text-white flex items-center justify-center font-semibold">{idx + 1}</div>
                        <div className="text-sm">{tip}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                      <div className="text-sm text-muted-foreground">No specific actionable recommendations available.</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons: Copy Report & Reset */}
              <div className="flex gap-3 mt-2">
                <Button onClick={copyFullReport} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600">
                  <BookOpen className="w-4 h-4 mr-2" /> Copy Full Report
                </Button>

                <Button onClick={resetAll} variant="outline" className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" /> Reset
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Upload,
  Camera,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Eye,
  Stethoscope,
  Pill,
  BookOpen,
  Heart,
  Leaf,
  Sparkles,
  Activity,
  Zap,
  X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

/**
 * Full Standard 2D Analyzer Page
 *
 * - Upload / camera capture
 * - Provider selector (Gemini / Groq) (keeps compatibility with your existing providerInfo)
 * - Realistic progress bar (simulated) — wire to real API events easily
 * - Result display: Health Overview, Plant Condition Summary, General Care Tips,
 * Possible Diseases, Causes, Recommended Actions, Copy/Reset
 *
 * Replace your existing page file with this. Adjust provider API endpoints (analyze) as required.
 */

/* ----------------------------- Types ------------------------------ */
type PossibleDisease = { name?: string; description?: string; likelihood?: number } | string;

type CauseInfo = {
  disease: string;
  cause: string;
  explanation: string;
};

type AnalysisResult = {
  noLeafDetected?: boolean;
  stage?: number;
  damageType?: string;
  healthPercentage: number;
  category?: string;
  possibleDiseases?: PossibleDisease[];
  primaryDisease?: string;
  confidence?: number; // 0..1
  severity: "none" | "low" | "medium" | "high";
  description?: string;
  causes?: CauseInfo[];
  careTips?: string[];
  symptoms?: string[];
  detectedPatterns?: string[];
  provider?: string;
  cost?: string;
  plantName?: string | null;
};

/* -------------------------- Provider Info ------------------------- */
type AIProvider = "gemini" | "groq";

const providerInfo: Record<
  AIProvider,
  {
    name: string;
    badge: string;
    description: string;
  }
> = {
  gemini: {
    name: "Gemini 2.0 Flash",
    badge: "FREE",
    description: "High-accuracy vision model"
  },
  groq: {
    name: "Groq Llama 4 Scout",
    badge: "FAST",
    description: "Low-latency inference"
  }
};

/* --------------------------- Helpers ------------------------------- */
const clamp = (v: number, a = 0, b = 100) => Math.max(a, Math.min(b, v));

const getSeverityColor = (severity: AnalysisResult["severity"]) => {
  switch (severity) {
    case "none":
    case "low":
      return "text-green-600 dark:text-green-300";
    case "medium":
      return "text-yellow-600 dark:text-yellow-300";
    case "high":
      return "text-red-600 dark:text-red-300";
    default:
      return "text-gray-600";
  }
};

const getSeverityLabel = (severity: AnalysisResult["severity"]) => {
  switch (severity) {
    case "none":
      return "None";
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    default:
      return "Unknown";
  }
};

/* ------------------------ Main Component -------------------------- */
export default function StandardAnalyzerPage(): JSX.Element {
  // UI state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [aiProvider, setAiProvider] = useState<AIProvider>("gemini");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // refs
  const fileRef = useRef<HTMLInputElement | null>(null);
  const cameraRef = useRef<HTMLInputElement | null>(null);

  /* --------------------- Upload & Camera Handlers --------------------- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSelectedImage(ev.target?.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSelectedImage(ev.target?.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const resetAll = () => {
    setSelectedImage(null);
    setFileName(null);
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
    setProgress(0);
    if (fileRef.current) fileRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
  };

  /* -------------------- Analysis (Simulated) --------------------- */
  // This function simulates progress and returns a demo result.
  // Replace the inner fetch block with a real API call to your /api/analyze endpoint.
  const startAnalysis = async () => {
    if (!selectedImage) {
      toast.error("Please upload or capture a leaf image first.");
      return;
    }
    setError(null);
    setIsAnalyzing(true);
    setProgress(2);
    setResult(null);

    // Simulate progressive scanning (for UI feedback)
    let simulatedProgress = 2;
    const progressInterval = setInterval(() => {
      simulatedProgress += Math.random() * 12 + 6; // 6-18%
      setProgress(clamp(Math.round(simulatedProgress)));
    }, 550);

    try {
      // ---- Replace this block with a real API call ----
      // Example:
      // const response = await fetch(`/api/analyze-${aiProvider}`, {
      // method: "POST",
      // headers: {"Content-Type": "application/json"},
      // body: JSON.stringify({ image: selectedImage })
      // });
      // const json = await response.json();
      // map json -> AnalysisResult and setResult(mapped)
      //
      // For demo we return a simulated result after a delay
      await new Promise((res) => setTimeout(res, 1800 + Math.random() * 1200));
      // -------------------------------------------------

      // simulated mapped result
      const simulated: AnalysisResult = {
        stage: 2,
        damageType: "Spot lesions",
        healthPercentage: 72,
        category: "Fungal infection (likely)",
        possibleDiseases: [
          { name: "Alternaria Leaf Spot", description: "Concentric brown rings", likelihood: 67 },
          { name: "Septoria Leaf Spot", description: "Small tan spots with dark borders", likelihood: 21 }
        ],
        primaryDisease: "Alternaria Leaf Spot",
        confidence: 0.88,
        severity: "medium",
        description:
          "The model detected circular brown lesions with yellow halos consistent with a fungal pathogen. Early intervention recommended.",
        causes: [
          {
            disease: "Alternaria Leaf Spot",
            cause: "Warm, humid conditions and leaf wetness",
            explanation: "Fungal spores thrive in damp conditions; overhead watering and poor ventilation accelerate spread."
          }
        ],
        careTips: [
          "Remove infected leaves and dispose of them (do not compost).",
          "Avoid overhead watering; water at soil level only.",
          "Improve air circulation (fan or move to a less crowded area).",
          "Consider copper or neem-based fungicide as an organic option."
        ],
        symptoms: ["Brown circular lesions", "Yellow haloes", "Slight leaf curling"],
        detectedPatterns: ["Circular lesions", "Yellow halos"],
        provider: providerInfo[aiProvider].name,
        cost: "Free",
        plantName: null
      };

      // finalize
      clearInterval(progressInterval);
      setProgress(100);
      await new Promise((r) => setTimeout(r, 300)); // small pause for UI
      setResult(simulated);
      toast.success("Analysis complete");
    } catch (err: any) {
      clearInterval(progressInterval);
      setError("Failed to analyze image. Try again or switch provider.");
      setResult(null);
    } finally {
      setIsAnalyzing(false);
      setProgress(100);
      // small fade back to idle after a few seconds (optional)
      setTimeout(() => setProgress(0), 4000);
    }
  };

  /* ------------------------ Report Copy ------------------------ */
  const copyFullReport = async () => {
    if (!result) return;
    // Build report text
    const diseases = Array.isArray(result.possibleDiseases)
      ? result.possibleDiseases
          .map((d: any, i) =>
            typeof d === "string"
              ? `${i + 1}. ${d}`
              : `${i + 1}. ${d.name}${d.likelihood ? ` (${d.likelihood}% likely)` : ""}${d.description ? ` - ${d.description}` : ""}`
          )
          .join("\n")
      : "N/A";

    const causes = result.causes && result.causes.length > 0 ? result.causes
      .map((c, i) => `${i + 1}. ${c.disease}\n Cause: ${c.cause}\n Why: ${c.explanation}`)
      .join("\n\n") : "N/A";

    const care = result.careTips && result.careTips.length ? result.careTips.map((c, i) => `${i + 1}. ${c}`).join("\n") : "N/A";

    const textReport = [
      "PLANT DISEASE ANALYSIS REPORT",
      "---------------------------------------",
      `Primary Disease: ${result.primaryDisease ?? "N/A"}`,
      `Health Status: ${result.healthPercentage}% Healthy`,
      `Severity: ${result.severity.toUpperCase()}`,
      `Category: ${result.category ?? "N/A"}`,
      "",
      "Description:",
      result.description ?? "N/A",
      "",
      "Detected Symptoms:",
      result.symptoms && result.symptoms.length ? result.symptoms.map((s, i) => `${i + 1}. ${s}`).join("\n") : "None",
      "",
      "POSSIBLE DISEASES:",
      diseases,
      "",
      "CAUSES:",
      causes,
      "",
      "RECOMMENDED ACTIONS:",
      care,
      "",
      `Analyzed with: ${result.provider ?? "Orchid AI"}`,
      `Detected patterns: ${result.detectedPatterns?.join(", ") ?? "N/A"}`,
      "---------------------------------------"
    ].join("\n");

    try {
      await navigator.clipboard.writeText(textReport);
      toast.success("Full report copied to clipboard");
    } catch (err) {
      toast.error("Unable to copy report (clipboard permission denied)");
    }
  };

  /* ------------------------ Small UI helpers ------------------------ */
  const healthCondition = (hp: number) => {
    if (hp >= 90) return { label: "Super Healthy", tone: "excellent" as const };
    if (hp >= 70) return { label: "Good", tone: "good" as const };
    if (hp >= 45) return { label: "At Risk", tone: "warning" as const };
    return { label: "Critical", tone: "critical" as const };
  };

  /* ----------------------------- Render ----------------------------- */
  return (
    <div className="min-h-screen py-10 px-4 bg-gradient-to-b from-green-50 to-white dark:from-zinc-900 dark:to-black">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <header className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200/50 mx-auto">
            <Sparkles className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-700 dark:text-green-300">Standard Plant Analyzer</span>
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-50">AI Plant 2D Analyzer</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl mx-auto">Upload a leaf image and get an instant diagnosis, treatment plan, and prevention tips.</p>
        </header>

        {/* Controls Card */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-600" /> Upload & Analyze
            </CardTitle>
            <CardDescription>Use a clear photo for best results — good lighting, single leaf preferred.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Upload / Preview column */}
              <div className="col-span-1 md:col-span-2 space-y-4">
                {!selectedImage ? (
                  <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3">
                    <Upload className="w-10 h-10 text-green-500" />
                    <p className="text-sm text-muted-foreground">Drag & drop or click to upload a leaf image</p>
                    <div className="flex gap-2">
                      <input ref={fileRef} onChange={handleFileChange} id="file" type="file" accept="image/*" className="hidden" />
                      <label htmlFor="file">
                        <Button onClick={() => fileRef.current?.click()} className="bg-gradient-to-r from-green-600 to-emerald-600">Choose File</Button>
                      </label>

                      <input ref={cameraRef} onChange={handleCameraCapture} id="camera" type="file" accept="image/*" capture="environment" className="hidden" />
                      <label htmlFor="camera">
                        <Button onClick={() => cameraRef.current?.click()} variant="outline">Take Photo</Button>
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">Tip: Crop to a single leaf, avoid blur and shadows for best detection.</p>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="w-full sm:w-72 h-56 relative rounded-xl overflow-hidden border shadow-sm">
                      <Image src={selectedImage} alt="selected" fill className="object-cover" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-semibold">{fileName ?? "Uploaded image"}</div>
                          <div className="text-xs text-muted-foreground mt-1">Provider: <strong>{providerInfo[aiProvider].name}</strong></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedImage(null); setFileName(null); if (fileRef.current) fileRef.current.value = ""; if (cameraRef.current) cameraRef.current.value = ""; }}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        {result ? (
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div>
                              <div className="text-sm font-medium">Last analysis:</div>
                              <div className="text-xs text-muted-foreground">{result.primaryDisease} • {Math.round(result.healthPercentage)}% healthy</div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Ready to analyze this image.</div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button onClick={startAnalysis} disabled={isAnalyzing || !selectedImage} className="bg-gradient-to-r from-green-600 to-emerald-600">
                          {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin mr-2"/>Analyzing...</> : <>Analyze Image</>}
                        </Button>
                        <Button onClick={resetAll} variant="outline">Reset</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right column: Provider + progress + tips */}
              <div className="col-span-1 flex flex-col gap-4">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground">AI Model</div>
                  <Select value={aiProvider} onValueChange={(v) => setAiProvider(v as AIProvider)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini">{providerInfo.gemini.name} — {providerInfo.gemini.badge}</SelectItem>
                      <SelectItem value="groq">{providerInfo.groq.name} — {providerInfo.groq.badge}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground">Analysis Progress</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Progress value={progress} className="h-3 rounded-full" />
                    </div>
                    <div className="text-xs w-12 text-right">{progress}%</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                  <div className="text-sm font-semibold">Quick tips for better results</div>
                  <ul className="mt-2 text-xs space-y-1 text-muted-foreground">
                    <li>• Use a single leaf on a neutral background</li>
                    <li>• Avoid strong backlight or heavy shadows</li>
                    <li>• Ensure image is in focus and high resolution</li>
                  </ul>
                </div>

                <div className="text-xs text-muted-foreground">
                  <div>Provider info</div>
                  <div className="mt-1 text-sm">{providerInfo[aiProvider].description}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RESULTS (always show summary & general care if result present OR always show summary + care even without result) */}
        <div className="space-y-6">
          {/* Health Overview — Always show if we have result OR placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                Health Overview
              </CardTitle>
              <CardDescription>Quick snapshot of the detected plant health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-200">
                    <div className="text-center">
                      <div className="text-lg font-bold">{result ? Math.round(result.healthPercentage) : "--"}%</div>
                      <div className="text-xs text-muted-foreground">Estimated health</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold">{result ? (healthCondition(result.healthPercentage).label) : "No data yet"}</div>
                    <div className="text-xs text-muted-foreground mt-1">{result ? (result.description ?? "") : "Upload and analyze an image to get a detailed health overview."}</div>
                  </div>
                </div>

                <div className="min-w-[220px]">
                  <div className="text-xs text-muted-foreground mb-2">Overall severity</div>
                  <div className={`rounded-lg p-3 border ${result ? (result.severity === "high" ? "border-red-200" : result.severity === "medium" ? "border-yellow-200" : "border-green-200") : "border-gray-200" }`}>
                    <div className={`text-sm font-semibold ${result ? getSeverityColor(result.severity) : "text-gray-600"}`}>
                      {result ? `${getSeverityLabel(result.severity)}` : "—"}
                    </div>
                    <div className="text-xs mt-1 text-muted-foreground">{result ? `Model confidence ${(result.confidence ?? 0) * 100}%` : "Model will show confidence after analyzing"}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plant Condition Summary (Always visible) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Plant Condition Summary
              </CardTitle>
              <CardDescription>Readable one-line statement summarizing the leaf status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {result ? (
                  <p>
                    {result.healthPercentage >= 90 && "Leaf looks vibrant and healthy."}
                    {result.healthPercentage >= 70 && result.healthPercentage < 90 && "Leaf shows minor stress — early-stage issues detected."}
                    {result.healthPercentage >= 45 && result.healthPercentage < 70 && "Leaf shows noticeable symptoms — treatment recommended."}
                    {result.healthPercentage < 45 && "Leaf condition is critical — immediate action required."}
                    {" "} Primary diagnosis: <strong>{result.primaryDisease ?? "N/A"}</strong>.
                  </p>
                ) : (
                  <p>No analysis yet — upload a clear photo and click Analyze to get a summary.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* General Plant Care Tips — Always visible */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-yellow-500" />
                General Plant Care Tips
              </CardTitle>
              <CardDescription>Practical tips to keep your plant healthy (always visible)</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-decimal ml-6 text-sm space-y-2 text-gray-700 dark:text-gray-300">
                <li>Provide consistent watering—allow the top 1–2 inches of soil to dry before the next water.</li>
                <li>Ensure indirect bright light—avoid prolonged harsh direct sunlight for sensitive species.</li>
                <li>Improve airflow—good circulation reduces fungal risk.</li>
                <li>Use well-draining soil and proper pot drainage to prevent root rot.</li>
                <li>Feed lightly with balanced fertilizer during growing season (follow product instructions).</li>
              </ul>
            </CardContent>
          </Card>

          {/* If a result exists, show the detailed sections in order */}
          {result && (
            <>
              {/* Possible Diseases */}
              <Card className="transition-transform hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-orange-600" />
                    Possible Diseases
                  </CardTitle>
                  <CardDescription>Detected candidates and their likelihood</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Array.isArray(result.possibleDiseases) && result.possibleDiseases.length > 0 ? (
                    result.possibleDiseases.map((d: any, idx: number) => {
                      const name = typeof d === "string" ? d : d.name ?? "Unknown";
                      const likelihood = typeof d === "object" && d.likelihood ? `${d.likelihood}% likely` : null;
                      return (
                        <div key={idx} className="p-3 rounded-lg border border-orange-100 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold text-orange-700 dark:text-orange-300">{name}</div>
                              {typeof d === "object" && d.description && <div className="text-sm text-muted-foreground mt-1">{d.description}</div>}
                            </div>
                            {likelihood && <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-700">{likelihood}</Badge>}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                      <div className="text-sm text-muted-foreground">No likely diseases identified. Continue routine monitoring.</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Causes */}
              <Card className="transition-transform hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-purple-600" />
                    Causes
                  </CardTitle>
                  <CardDescription>Root causes and explanations</CardDescription>
                </CardHeader>
                <CardContent>
                  {result.causes && result.causes.length > 0 ? (
                    result.causes.map((c, i) => (
                      <div key={i} className="p-3 rounded-lg border border-purple-100 dark:border-purple-800 mb-3">
                        <div className="font-semibold text-purple-700 dark:text-purple-300">{c.disease}</div>
                        <div className="text-sm text-muted-foreground mt-1"><strong>Cause:</strong> {c.cause}</div>
                        <div className="text-sm text-muted-foreground mt-2">{c.explanation}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                      <div className="text-sm text-muted-foreground">No specific causes identified by the model.</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recommended Actions */}
              <Card className="transition-transform hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="w-5 h-5 text-green-600" />
                    Recommended Actions
                  </CardTitle>
                  <CardDescription>Treatment steps, ordering of priorities, and care tips</CardDescription>
                </CardHeader>
                <CardContent>
                  {result.careTips && result.careTips.length > 0 ? (
                    result.careTips.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-green-100 dark:border-green-800 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 text-white flex items-center justify-center font-semibold">{idx + 1}</div>
                        <div className="text-sm">{tip}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                      <div className="text-sm text-muted-foreground">No specific actionable recommendations available.</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons: Copy Report & Reset */}
              <div className="flex gap-3 mt-2">
                <Button onClick={copyFullReport} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600">
                  <BookOpen className="w-4 h-4 mr-2" /> Copy Full Report
                </Button>

                <Button onClick={resetAll} variant="outline" className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" /> Reset
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}