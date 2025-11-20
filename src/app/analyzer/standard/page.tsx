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
  BookOpen,
  RefreshCw,
  Clipboard,
  Sun,
  FileText,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { toast } from "sonner";

/**
 * StandardAnalyzerPage (2D)
 * - Default provider: Groq (POST /api/analyze-groq)
 * - Fallback: Gemini (POST /api/analyze-gemini)
 * - Detects "no leaf" / artificial images by scanning backend text + flags
 * - Ring health gauge animation
 * - Clean error handling and toasts (sonner)
 */

type Disease = {
  name: string;
  description?: string;
  likelihood?: number;
};

type Cause = {
  disease: string;
  explanation?: string;
};

type AnalysisResult = {
  healthPercentage: number;
  possibleDiseases: Disease[];
  causes: Cause[];
  careTips: string[];
  generalTips: string[];
  symptoms: string[];
  aiConclusion: string;
  // optional:
  noLeafDetected?: boolean;
  noLeafReason?: string;
};

export default function StandardAnalyzerPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // SVG ring constants
  const R = 48;
  const CIRCUMFERENCE = 2 * Math.PI * R;

  // animated progress
  const [animatedValue, setAnimatedValue] = useState(0);

  // ----------------- Upload handler -----------------
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

  // ----------------- Helper: call provider endpoints -----------------
  async function callEndpoint(url: string, imageBase64: string) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageBase64 }),
    });
    // try parse JSON safely
    let json: any = null;
    try {
      json = await res.json();
    } catch {
      json = null;
    }
    return { ok: res.ok, status: res.status, json };
  }

  // ----------------- Analyze (Groq -> Gemini fallback, detect fake leaf) -----------------
  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast.error("Please upload or capture a plant image first.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    const loadingId = toast.loading("Analyzing with Groq...");

    try {
      // 1) Try Groq
      let resp = await callEndpoint("/api/analyze-groq", selectedImage);

      // 2) If Groq failed, fallback to Gemini automatically
      if (!resp.ok) {
        toast.dismiss(loadingId);
        toast.loading("Groq failed — switching to Gemini...");
        resp = await callEndpoint("/api/analyze-gemini", selectedImage);
      }

      // If still no JSON or not ok => throw
      if (!resp.ok || !resp.json) {
        const msg =
          (resp.json && (resp.json.error || resp.json.message)) ||
          `Analysis failed (status ${resp.status}).`;
        throw new Error(msg);
      }

      const data = resp.json;

      // ---------- No-leaf / artificial detection ----------
      // We look for explicit flags from backend first (preferred), then fallback to scanning text.
      const backendNoLeafFlag =
        typeof data.noLeafDetected === "boolean" ? data.noLeafDetected : false;
      const backendNoLeafReason =
        typeof data.noLeafReason === "string" ? data.noLeafReason : "";

      const textToScan = JSON.stringify(data).toLowerCase();
      const invalidPatterns = [
        "no leaf found",
        "not a leaf",
        "artificial",
        "plastic",
        "cartoon",
        "toy",
        "drawing",
        "fake",
        "clipart",
      ];
      const foundPattern = invalidPatterns.find((p) =>
        textToScan.includes(p)
      );

      if (backendNoLeafFlag || foundPattern) {
        const reason = backendNoLeafReason || (foundPattern ? `Detected "${foundPattern}" in analysis.` : "No real leaf detected.");
        const noLeafResult: AnalysisResult = {
          healthPercentage: 0,
          possibleDiseases: [],
          causes: [],
          careTips: [
            "Take a new photo showing a real plant leaf (not a plastic, toy, or drawing).",
            "Make sure the leaf fills most of the frame and lighting is natural.",
            "Avoid heavy filters, illustrations, or screenshots.",
          ],
          generalTips: [],
          symptoms: [],
          aiConclusion: "No leaf detected.",
          noLeafDetected: true,
          noLeafReason: reason,
        };
        setResult(noLeafResult);
        toast.dismiss();
        toast.error("No Leaf Found — upload a clear photo of a real leaf.");
        return;
      }

      // ---------- Normalize response safely ----------
      const normalized: AnalysisResult = {
        healthPercentage:
          typeof data.healthPercentage === "number"
            ? Math.max(0, Math.min(100, data.healthPercentage))
            : 72,
        possibleDiseases: Array.isArray(data.possibleDiseases)
          ? data.possibleDiseases.map((d: any) => ({
              name: d.name || d,
              description: d.description || "",
              likelihood: typeof d.likelihood === "number" ? d.likelihood : 0,
            }))
          : [],
        causes: Array.isArray(data.causes)
          ? data.causes.map((c: any) => ({
              disease: c.disease || "Unknown",
              explanation: c.explanation || "",
            }))
          : [],
        careTips: Array.isArray(data.careTips) ? data.careTips : [],
        generalTips: Array.isArray(data.generalTips) ? data.generalTips : [],
        symptoms: Array.isArray(data.symptoms) ? data.symptoms : [],
        aiConclusion:
          typeof data.aiConclusion === "string"
            ? data.aiConclusion
            : data.conditionSummary ||
              "AI analysis complete. See recommendations above.",
      };

      setResult(normalized);
      toast.dismiss();
      toast.success("✅ Analysis complete!");
    } catch (err: any) {
      console.error("Analysis error:", err);
      const msg =
        (err && err.message) || "Both AI providers failed or returned an error. Try again later.";
      setError(msg);
      toast.dismiss();
      toast.error("Analysis failed. " + (err?.message || ""));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ----------------- Reset / Copy -----------------
  const handleReset = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    setAnimatedValue(0);
  };

  const handleCopy = () => {
    if (!result) return;
    const report = [
      "🧠 AI Plant Health Report",
      `Health: ${result.healthPercentage}%`,
      `Possible Diseases: ${result.possibleDiseases.length ? result.possibleDiseases.map(d => `${d.name} (${d.likelihood ?? "N/A"}%)`).join("; ") : "N/A"}`,
      `Causes: ${result.causes.length ? result.causes.map(c => `${c.disease} — ${c.explanation}`).join("; ") : "N/A"}`,
      `Recommended Actions: ${result.careTips.join("; ") || "N/A"}`,
      `General Tips: ${result.generalTips.join("; ") || "N/A"}`,
      `AI Conclusion: ${result.aiConclusion || "N/A"}`,
    ].join("\n\n");
    navigator.clipboard.writeText(report);
    toast.success("Report copied to clipboard");
  };

  // ----------------- Health category helper -----------------
  const healthCategory = (v: number) => {
    if (v < 30) {
      return { label: "Very Critical", color: "#7f1d1d", accent: "#ff4d4f", remark: "Severe damage — immediate action required." };
    }
    if (v < 45) {
      return { label: "Critical", color: "#9f1239", accent: "#ff6b6b", remark: "Critical indicators — treat quickly." };
    }
    if (v < 60) {
      return { label: "Bad", color: "#c2410c", accent: "#ff914d", remark: "Unhealthy — consider treatment." };
    }
    if (v < 75) {
      return { label: "Okay", color: "#b45309", accent: "#ffd27a", remark: "Moderate health — monitor and care." };
    }
    if (v < 90) {
      return { label: "Good", color: "#16a34a", accent: "#6ee7b7", remark: "Healthy — minimal intervention needed." };
    }
    return { label: "Perfect", color: "#047857", accent: "#34d399", remark: "Excellent health." };
  };

  // ----------------- Animate ring when result changes -----------------
  useEffect(() => {
    if (!result) {
      setAnimatedValue(0);
      return;
    }
    const target = Math.max(0, Math.min(100, result.healthPercentage || 0));
    const duration = 800;
    const start = 0;
    const startTime = performance.now();
    let raf = 0;

    const step = (now: number) => {
      const elapsed = Math.min(duration, now - startTime);
      const t = elapsed / duration;
      const eased = 1 - Math.pow(1 - t, 3);
      const val = start + (target - start) * eased;
      setAnimatedValue(val);
      if (elapsed < duration) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [result]);

  // ----------------- Render UI -----------------
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700">
            <Sparkles className="h-4 w-4 text-green-600 animate-pulse" />
            <span className="font-medium text-green-700 dark:text-green-300">AI Plant Specialist Mode</span>
          </div>

          <h1 className="text-4xl font-bold">Expert <span className="text-green-600">Plant Analyzer</span></h1>
          <p className="text-muted-foreground">Professional diagnosis, clear recommended actions and a concise summary.</p>
        </div>

        {/* Upload card */}
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
                  <ImageIcon className="mr-2 h-5 w-5" /> Choose File
                </Button>
                <Button onClick={() => cameraInputRef.current?.click()}>
                  <Camera className="mr-2 h-5 w-5" /> Take Photo
                </Button>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageSelect} className="hidden" />
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden border-2 border-green-300 dark:border-green-800">
            <CardContent className="flex flex-col items-center p-4 space-y-4">
              <div className="relative w-full max-w-md aspect-video">
                <Image src={selectedImage} alt="Selected Leaf" fill className="object-cover rounded-xl" />
              </div>

              <div className="flex gap-3 w-full justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    handleReset();
                  }}
                >
                  <X className="mr-2 h-4 w-4" /> Remove Image
                </Button>

                <Button onClick={handleAnalyze} disabled={isAnalyzing} className="bg-green-600 hover:bg-green-700">
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

        {/* Ready prompt */}
        {selectedImage && !result && !isAnalyzing && (
          <div className="text-center"><p className="text-sm text-muted-foreground">Ready to analyze your image.</p></div>
        )}

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* If backend says no leaf, show explicit UI */}
            {result.noLeafDetected ? (
              <Card className="border-2 border-red-400/60 bg-red-950/5">
                <CardHeader>
                  <CardTitle className="text-red-300">⚠️ No Leaf Found</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-red-200 mb-3">{result.noLeafReason || "We couldn't detect a real leaf in the image."}</p>
                  <div className="space-y-2">
                    {result.careTips.length > 0 ? (
                      <>
                        <h4 className="font-semibold text-red-300">What to do</h4>
                        <ul className="list-disc pl-5 text-red-200">
                          {result.careTips.map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                      </>
                    ) : null}
                    <div className="mt-3 flex gap-3">
                      <Button onClick={handleReset} className="bg-cyan-600 hover:bg-cyan-700">Try another image</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Health + ring */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <Card className="col-span-2 bg-gradient-to-br from-[#070707] to-[#0b0b0b] border rounded-2xl">
                    <CardContent className="flex gap-6 items-center">
                      <div className="flex items-center gap-6">
                        {/* ring */}
                        <div className="relative w-40 h-40">
                          {(() => {
                            const val = Math.max(0, Math.min(100, animatedValue));
                            const pct = val / 100;
                            const offset = CIRCUMFERENCE * (1 - pct);
                            const cat = healthCategory(result.healthPercentage);
                            return (
                              <svg viewBox="0 0 120 120" className="w-40 h-40">
                                <defs>
                                  <linearGradient id="g1" x1="0" x2="1">
                                    <stop offset="0%" stopColor={cat.accent} stopOpacity="0.95" />
                                    <stop offset="100%" stopColor={cat.color} stopOpacity="0.9" />
                                  </linearGradient>
                                </defs>
                                <circle cx="60" cy="60" r={R} stroke="#111827" strokeWidth="12" fill="none" className="opacity-60" />
                                <circle cx="60" cy="60" r={R} stroke="url(#g1)" strokeWidth="12" strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset} transform="rotate(-90 60 60)" fill="none" style={{ transition: "stroke-dashoffset 300ms ease-out" }} />
                                <text x="60" y="56" textAnchor="middle" fill="#f8fafc" fontSize="20" fontWeight={700}>{Math.round(val)}%</text>
                                <text x="60" y="78" textAnchor="middle" fill="#e6edf0" fontSize="11">{healthCategory(result.healthPercentage).label}</text>
                              </svg>
                            );
                          })()}
                        </div>

                        <div className="flex flex-col gap-2">
                          <h3 className="text-lg font-semibold text-gray-100">Plant Health</h3>
                          <p className="text-sm text-gray-300 max-w-prose leading-relaxed">{healthCategory(result.healthPercentage).remark}</p>

                          <div className="mt-3 flex gap-3 items-center">
                            <Badge className="bg-white/5 text-white/90 px-3 py-1 rounded-full">Health: {result.healthPercentage}%</Badge>
                            <Badge className="px-3 py-1 rounded-full" style={{ background: healthCategory(result.healthPercentage).accent + "22", color: healthCategory(result.healthPercentage).accent, border: `1px solid ${healthCategory(result.healthPercentage).accent}33` }}>{healthCategory(result.healthPercentage).label}</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="ml-auto text-right space-y-2">
                        <div className="text-sm text-gray-400">Quick Summary</div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-100">{result.possibleDiseases.length} Possible Disease{result.possibleDiseases.length !== 1 ? "s" : ""}</div>
                          <div className="text-sm text-gray-300">{result.symptoms.length} Symptom{result.symptoms.length !== 1 ? "s" : ""} detected</div>
                        </div>

                        <div className="mt-4">
                          <Button onClick={handleCopy} variant="outline"><Clipboard className="mr-2 h-4 w-4" /> Copy Report</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="hidden md:block" />
                </div>

                {/* Possible Diseases */}
                {result.possibleDiseases.length > 0 && (
                  <Card className="bg-[#0c0c0c] border border-yellow-700/40 rounded-2xl">
                    <CardHeader><CardTitle className="flex items-center gap-2 text-yellow-400"><Stethoscope className="h-5 w-5" /> Possible Diseases</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {result.possibleDiseases.map((d, i) => (
                        <div key={i} className="border border-yellow-800/50 bg-[#121212] rounded-xl px-4 py-3 flex justify-between hover:border-yellow-500/60 transition">
                          <div>
                            <p className="font-semibold text-yellow-300">{d.name}</p>
                            <p className="text-gray-400 text-sm">{d.description}</p>
                          </div>
                          <Badge className="bg-yellow-900/40 text-yellow-300 px-3 py-1 rounded-full">{d.likelihood ?? 0}% Likely</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Causes */}
                {result.causes.length > 0 && (
                  <Card className="bg-[#0c0c0c] border border-blue-700/40 rounded-2xl">
                    <CardHeader><CardTitle className="flex items-center gap-2 text-blue-400"><BookOpen className="h-5 w-5" /> Detected Causes</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {result.causes.map((c, i) => (
                        <div key={i} className="border border-blue-800/50 bg-[#121212] rounded-xl px-4 py-3 hover:border-blue-500/60 transition">
                          <p className="font-semibold text-blue-300">{c.disease}</p>
                          <p className="text-gray-400 text-sm mt-1">{c.explanation}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                <Card className="bg-[#0c0c0c] border border-purple-700/40 rounded-2xl">
                  <CardHeader><CardTitle className="flex items-center gap-2 text-purple-400"><Lightbulb className="h-5 w-5" /> Recommended Actions</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {result.careTips.length ? result.careTips.map((tip, i) => (
                      <div key={i} className="border border-purple-800/40 bg-[#121212] rounded-xl px-4 py-2 text-gray-300 text-sm hover:border-purple-500/60 transition">{tip}</div>
                    )) : <div className="text-gray-400">No specific actions provided.</div>}
                  </CardContent>
                </Card>

                {/* General Tips */}
                <Card className="bg-[#0c0c0c] border border-green-700/40 rounded-2xl">
                  <CardHeader><CardTitle className="flex items-center gap-2 text-green-400"><Sun className="h-5 w-5" /> General Plant Care Tips</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-1 text-gray-300 text-sm">
                      {result.generalTips.length ? result.generalTips.map((t, i) => <li key={i}>{t}</li>) : <li>No general tips provided.</li>}
                    </ul>
                  </CardContent>
                </Card>

                {/* AI Conclusion */}
                <Card className="bg-[#0c0c0c] border border-teal-700/40 rounded-2xl">
                  <CardHeader><CardTitle className="flex items-center gap-2 text-teal-400"><FileText className="h-5 w-5" /> AI Conclusion</CardTitle></CardHeader>
                  <CardContent className="text-gray-300 text-sm leading-relaxed">{result.aiConclusion}</CardContent>
                </Card>

                {/* Copy / Reset */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleCopy} variant="outline" className="flex-1 border-2 border-gray-500 hover:border-gray-600"><Clipboard className="mr-2 h-4 w-4" /> Copy Report</Button>
                  <Button onClick={handleReset} variant="outline" className="flex-1 border-2 border-gray-500 hover:border-gray-600"><RefreshCw className="mr-2 h-4 w-4" /> Reset</Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
