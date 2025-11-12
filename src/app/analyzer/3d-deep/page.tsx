"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import {
  Upload,
  X,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Image as ImageIcon,
  Sparkles,
  Camera,
  Eye,
  Layers,
  Activity,
  Stethoscope,
  AlertCircle,
  Pill,
  BookOpen,
  RefreshCw
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import LeafDeepAnalyzer3D from "@/components/LeafDeepAnalyzer3D";

/* ----------------------- Types ------------------------ */
type AIProvider = "groq" | "gemini";

const providerInfo: Record<AIProvider, { name: string; badge: string; description: string }> = {
  groq: { name: "Groq Llama 4 Scout", badge: "FAST", description: "Low-latency inference (default)" },
  gemini: { name: "Gemini 2.0 Flash", badge: "ACCURATE", description: "High-accuracy vision model (fallback)" }
};

type PossibleDisease = { name?: string; description?: string; likelihood?: number } | string;
type CauseInfo = { disease: string; cause: string; explanation: string };

type AnalysisResult = {
  noLeafDetected?: boolean;
  stage?: number;
  damageType?: string;
  healthPercentage: number;
  ringHealth?: number; // additional metric specific to 3D
  category?: string;
  possibleDiseases?: PossibleDisease[];
  primaryDisease?: string;
  confidence?: number; // 0..1
  severity?: "none" | "low" | "medium" | "high";
  description?: string;
  causes?: CauseInfo[];
  careTips?: string[];
  symptoms?: string[];
  detectedPatterns?: string[];
  provider?: string;
  cost?: string;
  plantName?: string | null;
};

/* --------------------- Helpers ----------------------- */
const clamp = (v: number, a = 0, b = 100) => Math.max(a, Math.min(b, v));

const getSeverityColor = (severity?: AnalysisResult["severity"]) => {
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

const getSeverityLabel = (s?: AnalysisResult["severity"]) => {
  switch (s) {
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

const healthCondition = (hp: number) => {
  if (hp >= 90) return { label: "Super Healthy", tone: "excellent" as const };
  if (hp >= 70) return { label: "Good", tone: "good" as const };
  if (hp >= 45) return { label: "At Risk", tone: "warning" as const };
  return { label: "Critical", tone: "critical" as const };
};

/* -------------------- Component ---------------------- */
export default function DeepAnalyzer3DPage(): JSX.Element {
  // UI state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [provider, setProvider] = useState<AIProvider>("groq"); // default Groq
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const cameraRef = useRef<HTMLInputElement | null>(null);

  /* ----------------- Upload handlers ------------------ */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }
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
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }
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

  /* --------------- Analysis (Groq first, Gemini fallback) --------------- */
  const attemptAnalyze = async (endpoint: string) => {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: selectedImage })
    });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, json, status: res.status };
  };

  const startAnalysis = async () => {
    if (!selectedImage) {
      toast.error("Please upload or capture a leaf image first.");
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setResult(null);
    setProgress(2);

    // progress simulation
    let simulatedProgress = 2;
    const progressInterval = setInterval(() => {
      simulatedProgress += Math.random() * 12 + 6; // 6-18%
      setProgress(clamp(Math.round(simulatedProgress)));
    }, 500);

    const loadingToast = toast.loading(`Analyzing with ${providerInfo[provider].name}...`);

    try {
      // Try chosen provider first (Groq default). If fails, try other.
      const primaryEndpoint = provider === "groq" ? "/api/analyze-groq" : "/api/analyze-gemini";
      const fallbackEndpoint = provider === "groq" ? "/api/analyze-gemini" : "/api/analyze-groq";
      const primaryName = providerInfo[provider].name;
      const fallbackName = provider === "groq" ? providerInfo.gemini.name : providerInfo.groq.name;

      const primary = await attemptAnalyze(primaryEndpoint);

      if (primary.ok && primary.json) {
        // map response -> AnalysisResult (best-effort)
        const mapped = mapToResult(primary.json, primaryName);
        clearInterval(progressInterval);
        setProgress(100);
        await new Promise((r) => setTimeout(r, 300));
        setResult(mapped);
        toast.dismiss(loadingToast);
        toast.success(`Analysis complete (${primaryName})`);
        return;
      }

      // primary failed -> try fallback
      toast.dismiss(loadingToast);
      const tryFallbackToast = toast.loading(`${primaryName} failed, retrying with ${fallbackName}...`);
      const fallback = await attemptAnalyze(fallbackEndpoint);
      if (fallback.ok && fallback.json) {
        const mapped = mapToResult(fallback.json, fallbackName);
        clearInterval(progressInterval);
        setProgress(100);
        await new Promise((r) => setTimeout(r, 300));
        setResult(mapped);
        toast.dismiss(tryFallbackToast);
        toast.success(`Analysis complete (${fallbackName})`);
        return;
      }

      // Both failed
      clearInterval(progressInterval);
      setProgress(0);
      const errMsg = primary.json?.error || fallback.json?.error || "Analysis failed for both providers.";
      setError(errMsg);
      toast.dismiss();
      toast.error(errMsg);
    } catch (err: any) {
      clearInterval(progressInterval);
      setProgress(0);
      setError((err && err.message) || "Unexpected error during analysis");
      toast.dismiss();
      toast.error("Unexpected error during analysis");
    } finally {
      setIsAnalyzing(false);
      // small fade back to idle after a few seconds
      setTimeout(() => setProgress(0), 3500);
    }
  };

  function mapToResult(data: any, providerName: string): AnalysisResult {
    // Map incoming API shape to our AnalysisResult. This is forgiving.
    const health = typeof data.healthPercentage === "number" ? data.healthPercentage : (data.health ?? 100);
    const ring = typeof data.ringHealth === "number" ? data.ringHealth : Math.round(Math.max(0, Math.min(100, (health + (data.innerZoneHealth ?? health)) / 2)));

    return {
      noLeafDetected: data.noLeafDetected ?? false,
      stage: data.stage ?? data.analysisStage ?? 0,
      damageType: data.damageType ?? data.damage ?? "Unknown",
      healthPercentage: clamp(Math.round(health)),
      ringHealth: clamp(Math.round(ring)),
      category: data.category ?? data.primaryCategory ?? "General",
      possibleDiseases: data.possibleDiseases ?? data.diseases ?? [],
      primaryDisease: data.primaryDisease ?? data.primary ?? (Array.isArray(data.possibleDiseases) && data.possibleDiseases[0]?.name) ?? "Unknown",
      confidence: typeof data.confidence === "number" ? data.confidence : (data.confidenceScore ?? 1),
      severity: data.severity ?? data.risk ?? "none",
      description: data.description ?? data.summary ?? "No additional details available.",
      causes: data.causes ?? data.rootCauses ?? [],
      careTips: data.careTips ?? data.recommendations ?? ["Maintain good airflow", "Avoid overhead watering"],
      symptoms: data.symptoms ?? data.detectedSymptoms ?? [],
      detectedPatterns: data.detectedPatterns ?? [],
      provider: providerName,
      cost: data.cost ?? "Free",
      plantName: data.plantName ?? null
    };
  }

  /* ------------------ Copy report ------------------ */
  const copyFullReport = async () => {
    if (!result) return;

    const diseases = Array.isArray(result.possibleDiseases) ? result.possibleDiseases
      .map((d: any, i: number) =>
        typeof d === "string"
          ? `${i + 1}. ${d}`
          : `${i + 1}. ${d.name}${d.likelihood ? ` (${d.likelihood}% likely)` : ""}${d.description ? ` - ${d.description}` : ""}`
      ).join("\n") : "N/A";

    const causes = result.causes && result.causes.length > 0 ? result.causes
      .map((c, i) => `${i + 1}. ${c.disease}\n   Cause: ${c.cause}\n   Why: ${c.explanation}`)
      .join("\n\n") : "N/A";

    const care = result.careTips && result.careTips.length ? result.careTips.map((c, i) => `${i + 1}. ${c}`).join("\n") : "N/A";

    const symptoms = result.symptoms && result.symptoms.length ? result.symptoms.map((s, i) => `${i + 1}. ${s}`).join("\n") : "None";

    const textReport = [
      "PLANT DISEASE ANALYSIS REPORT (3D)",
      "---------------------------------------",
      `Primary Disease: ${result.primaryDisease ?? "N/A"}`,
      `Health Status: ${result.healthPercentage}% Healthy`,
      `Ring Health: ${result.ringHealth ?? "N/A"}%`,
      `Severity: ${result.severity?.toUpperCase() ?? "N/A"}`,
      `Category: ${result.category ?? "N/A"}`,
      "",
      "Description:",
      result.description ?? "N/A",
      "",
      "Detected Symptoms:",
      symptoms,
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
      `Analyzed with: ${result.provider ?? "N/A"}`,
      `Detected patterns: ${result.detectedPatterns?.join(", ") ?? "N/A"}`,
      "---------------------------------------"
    ].join("\n");

    try {
      await navigator.clipboard.writeText(textReport);
      toast.success("Full report copied to clipboard");
    } catch {
      toast.error("Unable to copy report (clipboard permission denied)");
    }
  };

  /* -------------------- Render --------------------- */
  return (
    <div className="min-h-screen py-10 px-4 bg-gradient-to-b from-cyan-50 to-white dark:from-zinc-900 dark:to-black">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 border border-cyan-200/50 mx-auto">
            <Sparkles className="w-4 h-4 text-cyan-600" />
            <span className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">3D Deep Analyzer</span>
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-50">AI Plant 3D Analyzer</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl mx-auto">Upload a leaf image and get 3D zone analysis, health metrics, and step-by-step remediation.</p>
        </header>

        {/* Controls Card */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-cyan-600" /> Upload & Analyze (3D)
            </CardTitle>
            <CardDescription>Clear photo (single leaf preferred). Groq tried first, Gemini fallback.</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Upload & preview */}
              <div className="col-span-1 md:col-span-2 space-y-4">
                {!selectedImage ? (
                  <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3">
                    <Upload className="w-10 h-10 text-cyan-500" />
                    <p className="text-sm text-muted-foreground">Drag & drop or click to upload a leaf image</p>
                    <div className="flex gap-2">
                      <input ref={fileRef} onChange={handleFileChange} id="file-3d" type="file" accept="image/*" className="hidden" />
                      <label htmlFor="file-3d">
                        <Button onClick={() => fileRef.current?.click()} className="bg-gradient-to-r from-cyan-600 to-blue-600">Choose File</Button>
                      </label>

                      <input ref={cameraRef} onChange={handleCameraCapture} id="cam-3d" type="file" accept="image/*" capture="environment" className="hidden" />
                      <label htmlFor="cam-3d">
                        <Button onClick={() => cameraRef.current?.click()} variant="outline">Take Photo</Button>
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">Tip: Good light, neutral background, single leaf visible.</p>
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
                          <div className="text-xs text-muted-foreground mt-1">Provider: <strong>{result?.provider ?? providerInfo[provider].name}</strong></div>
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
                              <div className="text-sm font-medium">Last analysis</div>
                              <div className="text-xs text-muted-foreground">{result.primaryDisease} • {Math.round(result.healthPercentage)}% healthy</div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Ready to analyze this image.</div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button onClick={startAnalysis} disabled={isAnalyzing || !selectedImage} className="bg-gradient-to-r from-cyan-600 to-blue-600">
                          {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Analyzing...</> : <>Analyze Image</>}
                        </Button>
                        <Button onClick={resetAll} variant="outline">Reset</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right column: provider + progress + tips */}
              <div className="col-span-1 flex flex-col gap-4">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground">AI Model</div>
                  <Select value={provider} onValueChange={(v) => setProvider(v as AIProvider)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="groq">{providerInfo.groq.name} — {providerInfo.groq.badge}</SelectItem>
                      <SelectItem value="gemini">{providerInfo.gemini.name} — {providerInfo.gemini.badge}</SelectItem>
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

                <div className="p-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800">
                  <div className="text-sm font-semibold">Quick tips for better results</div>
                  <ul className="mt-2 text-xs space-y-1 text-muted-foreground">
                    <li>• Use a single leaf on a neutral background</li>
                    <li>• Avoid strong backlight or heavy shadows</li>
                    <li>• Ensure image is in focus and high resolution</li>
                    <li>• Capture multiple angles for better 3D mapping</li>
                  </ul>
                </div>

                <div className="text-xs text-muted-foreground">
                  <div>Provider info</div>
                  <div className="mt-1 text-sm">{providerInfo[provider].description}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RESULTS / Overview */}
        <div className="space-y-6">
          {/* Health Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-500" />
                Health Overview
              </CardTitle>
              <CardDescription>Quick snapshot of the detected plant health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-100 to-blue-100">
                    <div className="text-center">
                      <div className="text-lg font-bold">{result ? Math.round(result.healthPercentage) : "--"}%</div>
                      <div className="text-xs text-muted-foreground">Estimated health</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold">{result ? healthCondition(result.healthPercentage).label : "No data yet"}</div>
                    <div className="text-xs text-muted-foreground mt-1">{result ? result.description ?? "" : "Upload and analyze an image to get a detailed health overview."}</div>
                  </div>
                </div>

                <div className="min-w-[220px]">
                  <div className="text-xs text-muted-foreground mb-2">Overall severity</div>
                  <div className={`rounded-lg p-3 border ${result ? (result.severity === "high" ? "border-red-200" : result.severity === "medium" ? "border-yellow-200" : "border-green-200") : "border-gray-200" }`}>
                    <div className={`text-sm font-semibold ${result ? getSeverityColor(result.severity) : "text-gray-600"}`}>
                      {result ? `${getSeverityLabel(result.severity)}` : "—"}
                    </div>
                    <div className="text-xs mt-1 text-muted-foreground">{result ? `Model confidence ${(result.confidence ?? 0) * 100}%` : "Model will show confidence after analyzing"}</div>

                    {/* Additional 3D-specific metric: ring health */}
                    <div className="mt-3">
                      <div className="text-xs text-muted-foreground mb-1">Ring health</div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Progress value={result ? (result.ringHealth ?? result.healthPercentage) : 0} className="h-2" />
                        </div>
                        <div className="text-xs w-12 text-right">{result ? `${result.ringHealth ?? result.healthPercentage}%` : "--"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plant Condition Summary */}
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

          {/* General Plant Care Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                General Plant Care Tips
              </CardTitle>
              <CardDescription>Practical tips to keep your plant healthy</CardDescription>
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

          {/* 3D-specific + detailed result area */}
          {result && (
            <>
              {/* 3D VISUALIZATION + summary area */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-cyan-600" /> 3D Visualization & Zone Summary
                  </CardTitle>
                  <CardDescription>Interactive 360° view and zone-by-zone health mapping</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <LeafDeepAnalyzer3D
                      analysis={{
                        healthPercentage: result.healthPercentage,
                        stage: result.stage ?? 0,
                        primaryDisease: result.primaryDisease,
                        category: result.category,
                        severity: result.severity
                      }}
                    />

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-3 rounded-lg border border-cyan-100 bg-cyan-50">
                        <div className="text-xs text-muted-foreground">Overall Health</div>
                        <div className="text-2xl font-bold">{result.healthPercentage}%</div>
                        <div className="text-xs mt-1 text-muted-foreground">{healthCondition(result.healthPercentage).label}</div>
                      </div>

                      <div className="p-3 rounded-lg border border-cyan-100 bg-cyan-50">
                        <div className="text-xs text-muted-foreground">Ring Health (3D)</div>
                        <div className="text-2xl font-bold">{result.ringHealth ?? result.healthPercentage}%</div>
                        <div className="text-xs mt-1 text-muted-foreground">Inner/outer zone average</div>
                      </div>

                      <div className="p-3 rounded-lg border border-cyan-100 bg-cyan-50">
                        <div className="text-xs text-muted-foreground">Detected Patterns</div>
                        <div className="text-sm mt-1 text-muted-foreground">{result.detectedPatterns?.join(", ") ?? "N/A"}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                        <div key={idx} className="p-3 rounded-lg border border-orange-100 bg-orange-50">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold text-orange-700">{name}</div>
                              {typeof d === "object" && d.description && <div className="text-sm text-muted-foreground mt-1">{d.description}</div>}
                            </div>
                            {likelihood && <Badge className="bg-orange-100 text-orange-700">{likelihood}</Badge>}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 rounded-lg border border-gray-200">
                      <div className="text-sm text-muted-foreground">No likely diseases identified. Continue routine monitoring.</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Causes */}
              <Card className="transition-transform hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-purple-600" />
                    Causes
                  </CardTitle>
                  <CardDescription>Root causes and explanations</CardDescription>
                </CardHeader>
                <CardContent>
                  {result.causes && result.causes.length > 0 ? (
                    result.causes.map((c, i) => (
                      <div key={i} className="p-3 rounded-lg border border-purple-100 mb-3">
                        <div className="font-semibold text-purple-700">{c.disease}</div>
                        <div className="text-sm text-muted-foreground mt-1"><strong>Cause:</strong> {c.cause}</div>
                        <div className="text-sm text-muted-foreground mt-2">{c.explanation}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-lg border border-gray-200">
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
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-green-100 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 text-white flex items-center justify-center font-semibold">{idx + 1}</div>
                        <div className="text-sm">{tip}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-lg border border-gray-200">
                      <div className="text-sm text-muted-foreground">No specific actionable recommendations available.</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-2">
                <Button onClick={copyFullReport} className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600">
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
