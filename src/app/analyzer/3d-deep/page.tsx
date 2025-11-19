"use client";

import { useState, useRef } from "react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { toast } from "sonner";
import LeafDeepAnalyzer3D from "@/components/LeafDeepAnalyzer3D";

/**
 * Rewritten 3D Deep Analyzer Page
 * - Groq is used as the default analyzer via /api/analyze-groq
 * - Gemini fallback via /api/analyze-gemini when Groq fails
 * - Maintains UI and behavior from the original file with improved error handling
 *
 * Replace your original file with this file.
 */

type Cause = { disease: string; cause: string; explanation: string };

type PossibleDiseaseItem = { name?: string; description?: string; likelihood?: number } | string;

type AnalysisResult = {
  noLeafDetected?: boolean;
  stage: number;
  damageType: string;
  healthPercentage: number;
  category: string;
  possibleDiseases: PossibleDiseaseItem[] | string[];
  primaryDisease: string;
  confidence: number; // 0..1
  severity: "none" | "low" | "medium" | "high";
  description: string;
  causes?: Cause[];
  careTips: string[];
  symptoms: string[];
  detectedPatterns?: string[];
  provider?: string;
  cost?: string;
};

export default function DeepAnalyzer3DPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Default provider is Groq (per your request)
  const DEFAULT_PROVIDER = "groq";
  const FALLBACK_PROVIDER = "gemini";

  // Helpers
  const resetAll = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
    setAnalysisProgress(0);
    setIsAnalyzing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setResult(null);
      setError(null);
      setAnalysisProgress(0);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setResult(null);
      setError(null);
      setAnalysisProgress(0);
    };
    reader.readAsDataURL(file);
  };

  // Progress simulator helper for UI feedback; will be cleared on completion
  const simulateProgress = (onTick?: (p: number) => void) => {
    let p = 5;
    const id = setInterval(() => {
      p = Math.min(95, p + Math.floor(Math.random() * 12) + 4); // random increments
      onTick && onTick(p);
    }, 500);
    return id;
  };

  /**
   * runAnalysis: Tries Groq first, then Gemini fallback on failure
   * - groqEndpoint: /api/analyze-groq
   * - geminiEndpoint: /api/analyze-gemini
   */
  const runAnalysis = async () => {
    if (!selectedImage) {
      toast.error("Please upload or capture an image first.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisProgress(2);
    setResult(null);

    const loadingToast = toast.loading("Starting deep analysis (Groq primary)...");

    // Start progress simulation
    const progressInterval = simulateProgress((p) => setAnalysisProgress(p));

    // Helper to send request to a provider endpoint
    const callProvider = async (endpoint: string, providerName: string) => {
      try {
        // send request
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: selectedImage }),
        });

        // try to parse JSON even on non-OK to extract error message
        let data: any = null;
        try {
          data = await res.json();
        } catch (e) {
          // non-json response
          data = null;
        }

        if (!res.ok) {
          const msg = data?.error || data?.message || `Provider ${providerName} returned status ${res.status}`;
          throw new Error(msg);
        }

        // Map / validate returned shape minimally before returning
        const mapped: AnalysisResult = {
          noLeafDetected: data.noLeafDetected ?? false,
          stage: typeof data.stage === "number" ? data.stage : data.stage ? Number(data.stage) : 0,
          damageType: data.damageType ?? data.damage_type ?? "",
          healthPercentage: typeof data.healthPercentage === "number" ? data.healthPercentage : (typeof data.health === "number" ? data.health : 100),
          category: data.category ?? data.primaryCategory ?? "General",
          possibleDiseases: data.possibleDiseases ?? data.diseases ?? [],
          primaryDisease: data.primaryDisease ?? data.primary ?? (Array.isArray(data.possibleDiseases) && data.possibleDiseases[0]?.name) ?? "Unknown",
          confidence: typeof data.confidence === "number" ? data.confidence : (typeof data.confidenceScore === "number" ? data.confidenceScore : 1),
          severity: (data.severity ?? "none") as AnalysisResult["severity"],
          description: data.description ?? data.summary ?? "No description provided.",
          causes: data.causes ?? [],
          careTips: data.careTips ?? data.recommendations ?? [],
          symptoms: data.symptoms ?? [],
          detectedPatterns: data.detectedPatterns ?? [],
          provider: providerName,
          cost: data.cost ?? data.price ?? "Unknown",
        };

        return mapped;
      } catch (err) {
        throw err;
      }
    };

    // Try Groq first
    try {
      setAnalysisProgress(6);
      const groqResult = await callProvider("/api/analyze-groq", "Groq Llama 4 Scout");
      // succeeded with Groq
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      setResult(groqResult);
      toast.dismiss(loadingToast);
      toast.success("✅ Groq analysis complete!", { description: `${groqResult.primaryDisease} • ${Math.round(groqResult.healthPercentage)}%` });
      setIsAnalyzing(false);
      // small delay and reset progress UI
      setTimeout(() => setAnalysisProgress(0), 1800);
      return;
    } catch (groqErr: any) {
      // Groq failed — show toast and attempt Gemini fallback
      console.warn("Groq failed:", groqErr);
      toast.dismiss(loadingToast);
      toast.error("Groq analysis failed — attempting Gemini fallback...", { duration: 4000 });
      // Keep progress simulation running and continue to fallback
    }

    // Attempt Gemini fallback
    try {
      setAnalysisProgress(20);
      const geminiResult = await callProvider("/api/analyze-gemini", "Gemini 2.0 Flash");
      // succeeded with Gemini
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      setResult(geminiResult);
      toast.success("✅ Gemini fallback analysis complete!", { description: `${geminiResult.primaryDisease} • ${Math.round(geminiResult.healthPercentage)}%` });
    } catch (gemErr: any) {
      // Both providers failed
      console.error("Gemini fallback also failed:", gemErr);
      clearInterval(progressInterval);
      setAnalysisProgress(0);
      const finalMessage = gemErr?.message || groqErr?.message || "Both analyzers failed. Try again later.";
      setError(finalMessage);
      toast.error("Analysis failed: " + finalMessage, { duration: 10000 });
    } finally {
      toast.dismiss(loadingToast);
      setIsAnalyzing(false);
      // ensure a small UI finish state
      setTimeout(() => setAnalysisProgress(0), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-cyan-400 dark:from-black dark:via-cyan-950 dark:to-cyan-900 -mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/50 shadow-lg shadow-cyan-500/20">
              <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
              <span className="text-sm font-semibold text-cyan-200">
                Advanced 3D Deep Analysis Mode
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                3D Deep Analyzer
              </span>
            </h1>
            <p className="text-lg text-cyan-100/80 max-w-2xl mx-auto">
              Interactive 360° leaf visualization • Zone-by-zone damage analysis • Enhanced accuracy
            </p>
          </div>

          {/* Upload Section */}
          {!selectedImage ? (
            <Card className="border-2 border-cyan-500/50 bg-gradient-to-br from-cyan-950/80 to-blue-950/80 backdrop-blur-sm shadow-2xl shadow-cyan-500/20">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center space-y-6 py-16">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/50 animate-pulse">
                      <Upload className="h-12 w-12 text-white" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 blur-2xl opacity-30 -z-10"></div>
                  </div>
                  <div className="text-center space-y-3">
                    <h3 className="text-2xl font-bold text-cyan-100">Upload Plant Image</h3>
                    <p className="text-sm text-cyan-200/70">
                      PNG, JPG or JPEG (max. 10MB)
                    </p>
                    <p className="text-xs text-cyan-400 font-medium flex items-center gap-2 justify-center">
                      <Eye className="h-4 w-4" />
                      Deep AI will analyze every zone in 3D detail
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="file-upload-3d"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleCameraCapture}
                    className="hidden"
                    id="camera-capture-3d"
                  />
                  <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                    <label htmlFor="file-upload-3d" className="flex-1">
                      <Button asChild className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 cursor-pointer shadow-lg shadow-cyan-500/30 h-12 text-base">
                        <span>
                          <ImageIcon className="mr-2 h-5 w-5" />
                          Choose File
                        </span>
                      </Button>
                    </label>
                    <label htmlFor="camera-capture-3d" className="flex-1">
                      <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 cursor-pointer shadow-lg shadow-blue-500/30 h-12 text-base">
                        <span>
                          <Camera className="mr-2 h-5 w-5" />
                          Take Photo
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Image Preview */}
              <Card className="border-2 border-cyan-500/50 bg-gradient-to-br from-cyan-950/80 to-blue-950/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div className="space-y-1">
                    <CardTitle className="text-cyan-100">Selected Image</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-cyan-300/70">
                      <Layers className="h-4 w-4" />
                      Ready for deep 3D analysis
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={resetAll} className="h-8 w-8 text-cyan-300 hover:text-cyan-100 hover:bg-cyan-500/20">
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/50 border border-cyan-500/30">
                    <Image
                      src={selectedImage}
                      alt="Selected plant"
                      fill
                      className="object-contain"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Error Display */}
              {error && (
                <Alert className="border-red-400/50 bg-red-950/50 backdrop-blur-sm">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Analyze Button & Progress */}
              {!result && !error && (
                <>
                  <Button
                    onClick={runAnalysis}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 h-14 text-lg shadow-2xl shadow-cyan-500/30 border border-cyan-400/30"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                        Deep analyzing with Groq...
                      </>
                    ) : (
                      <>
                        <Activity className="mr-3 h-6 w-6" />
                        Start 3D Deep Analysis (Groq default)
                      </>
                    )}
                  </Button>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-muted-foreground">Analysis Progress</div>
                      <div className="text-xs text-muted-foreground">{analysisProgress}%</div>
                    </div>
                    <Progress value={analysisProgress} className="h-2" />
                  </div>
                </>
              )}

              {/* 3D Results */}
              {result && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* NO LEAF FOUND ALERT */}
                  {result.noLeafDetected ? (
                    <div className="space-y-6">
                      <Alert className="border-2 border-red-400/50 bg-gradient-to-r from-red-950/50 to-orange-950/50 backdrop-blur-sm">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        <AlertDescription>
                          <strong className="text-lg text-red-300">⚠️ No Leaf Found!</strong>
                          <p className="mt-1 text-red-200">{result.description}</p>
                        </AlertDescription>
                      </Alert>

                      <Card className="border-2 border-red-400/50 bg-gradient-to-br from-red-950/40 to-orange-950/40 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="text-2xl text-red-300">No Leaf Detected</CardTitle>
                          <CardDescription className="text-red-200/70">The uploaded image does not contain a plant leaf</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="p-4 bg-black/40 rounded-lg border-2 border-red-400/30">
                            <h4 className="font-semibold text-red-300 mb-3">📋 What to do:</h4>
                            <ul className="space-y-2">
                              {result.careTips.map((tip, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-red-200/80">
                                  <span>•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>

                      <Button
                        onClick={resetAll}
                        className="w-full h-12 text-base bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                      >
                        <RefreshCw className="mr-2 h-5 w-5" />
                        Upload Plant Leaf Image
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Success Banner */}
                      <Alert className="border-2 border-cyan-400/50 bg-gradient-to-r from-cyan-950/80 to-blue-950/80 backdrop-blur-sm shadow-xl shadow-cyan-500/20">
                        <CheckCircle className="h-5 w-5 text-cyan-400" />
                        <AlertDescription className="text-cyan-100">
                          <strong className="text-lg">3D Deep Analysis Complete!</strong>
                          <p className="mt-1">Detected: {result.primaryDisease}</p>
                        </AlertDescription>
                      </Alert>

                      {/* 3D VISUALIZATION */}
                      <LeafDeepAnalyzer3D
                        analysis={{
                          healthPercentage: result.healthPercentage,
                          stage: result.stage,
                          primaryDisease: result.primaryDisease,
                          category: result.category,
                          severity: result.severity
                        }}
                      />

                      {/* Summary Stats */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <Card className="border-2 border-cyan-500/50 bg-gradient-to-br from-cyan-950/80 to-blue-950/80 backdrop-blur-sm">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-cyan-300">Health Score</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-4xl font-black text-cyan-400">
                              {result.healthPercentage}%
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-cyan-500/50 bg-gradient-to-br from-cyan-950/80 to-blue-950/80 backdrop-blur-sm">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-cyan-300">Probable Disease</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-black text-cyan-400 leading-tight">
                              {result.primaryDisease}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Health Overview Card */}
                      <Card className="border-2 border-cyan-500/50 bg-gradient-to-br from-cyan-950/80 to-blue-950/80 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="text-2xl text-cyan-100">{result.primaryDisease}</CardTitle>
                          <CardDescription className="text-cyan-300/70 text-base">
                            {result.category} • {result.damageType}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Description & Health Progress */}
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-cyan-200">Health Status</span>
                              <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                                {result.healthPercentage}% Healthy
                              </Badge>
                            </div>
                            <Progress value={result.healthPercentage} className="h-3" />
                            <p className="text-cyan-100/80 leading-relaxed">{result.description}</p>
                          </div>

                          {/* Detected Symptoms */}
                          {result.symptoms && result.symptoms.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="font-semibold text-cyan-200 flex items-center gap-2">
                                <Eye className="h-5 w-5 text-cyan-400" />
                                Detected Symptoms
                              </h4>
                              <div className="grid gap-2">
                                {result.symptoms.map((symptom, index) => (
                                  <div key={index} className="flex items-start gap-2 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                                    <span className="text-cyan-400">•</span>
                                    <span className="text-cyan-100/80 text-sm">{symptom}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* SECTION 1: POSSIBLE DISEASES */}
                      {result.possibleDiseases && Array.isArray(result.possibleDiseases) && result.possibleDiseases.length > 0 && (
                        <Card className="border-2 border-orange-400/50 bg-gradient-to-br from-orange-950/40 to-amber-950/40 backdrop-blur-sm">
                          <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2 text-orange-300">
                              <Stethoscope className="h-6 w-6 text-orange-400" />
                              Section 1: Possible Diseases
                            </CardTitle>
                            <CardDescription className="text-orange-200/70">
                              Detected diseases with likelihood percentages
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {result.possibleDiseases.map((disease: any, index: number) => (
                              <div key={index} className="p-4 bg-black/40 rounded-lg border-2 border-orange-400/30 shadow-sm">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                  <h5 className="font-bold text-lg text-orange-300">
                                    {typeof disease === 'string' ? disease : disease.name}
                                  </h5>
                                  {typeof disease === 'object' && disease.likelihood && (
                                    <Badge className="bg-orange-500/20 text-orange-300 border border-orange-400/30 text-sm px-3 py-1">
                                      {disease.likelihood}% Likely
                                    </Badge>
                                  )}
                                </div>
                                {typeof disease === 'object' && disease.description && (
                                  <p className="text-sm text-orange-100/70 leading-relaxed">
                                    {disease.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}

                      {/* SECTION 2: CAUSES */}
                      {result.causes && result.causes.length > 0 && (
                        <Card className="border-2 border-purple-400/50 bg-gradient-to-br from-purple-950/40 to-violet-950/40 backdrop-blur-sm">
                          <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2 text-purple-300">
                              <AlertCircle className="h-6 w-6 text-purple-400" />
                              Section 2: Causes
                            </CardTitle>
                            <CardDescription className="text-purple-200/70">
                              Understanding what causes these diseases and why
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {result.causes.map((causeInfo, index) => (
                              <div key={index} className="p-4 bg-black/40 rounded-lg border-2 border-purple-400/30 shadow-sm">
                                <div className="space-y-3">
                                  <div>
                                    <h5 className="font-bold text-base text-purple-300 mb-1">
                                      Disease: {causeInfo.disease}
                                    </h5>
                                    <p className="text-sm font-semibold text-purple-400">
                                      Cause: {causeInfo.cause}
                                    </p>
                                  </div>
                                  <div className="pl-4 border-l-4 border-purple-400/50">
                                    <p className="text-sm text-purple-100/70 leading-relaxed">
                                      <strong className="text-purple-400">Why:</strong> {causeInfo.explanation}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}

                      {/* SECTION 3: RECOMMENDED ACTIONS */}
                      {result.careTips && result.careTips.length > 0 && (
                        <Card className="border-2 border-green-400/50 bg-gradient-to-br from-green-950/40 to-emerald-950/40 backdrop-blur-sm">
                          <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2 text-green-300">
                              <Pill className="h-6 w-6 text-green-400" />
                              Section 3: Recommended Actions
                            </CardTitle>
                            <CardDescription className="text-green-200/70">
                              Treatment steps and prevention measures
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {result.careTips.map((tip, index) => (
                              <div key={index} className="flex items-start gap-3 p-4 bg-black/40 rounded-lg border-2 border-green-400/30 shadow-sm hover:shadow-md hover:border-green-400/50 transition-all">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold flex items-center justify-center shadow-md">
                                  {index + 1}
                                </span>
                                <span className="text-sm text-green-100/80 leading-relaxed pt-1">{tip}</span>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                          onClick={resetAll}
                          variant="outline"
                          className="flex-1 h-12 text-base border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-100"
                        >
                          <RefreshCw className="mr-2 h-5 w-5" />
                          Analyze Another Image
                        </Button>
                        <Button
                          onClick={() => {
                            const diseasesList = Array.isArray(result.possibleDiseases) 
                              ? result.possibleDiseases.map((d: any, i: number) => 
                                  `${i + 1}. ${typeof d === 'string' ? d : `${d.name} (${d.likelihood}% likely) - ${d.description}`}`
                                ).join('\n')
                              : 'N/A';
                            
                            const causesList = result.causes 
                              ? result.causes.map((c, i) => 
                                  `${i + 1}. Disease: ${c.disease}\n Cause: ${c.cause}\n Why: ${c.explanation}`
                                ).join('\n\n')
                              : 'N/A';

                            const resultText = `
═══════════════════════════════════════════════════════════════════
3D DEEP PLANT ANALYSIS REPORT
═══════════════════════════════════════════════════════════════════

Primary Disease: ${result.primaryDisease}
Health Status: ${result.healthPercentage}% Healthy
Severity: ${result.severity.toUpperCase()}
Category: ${result.category}

Description:
${result.description}

Detected Symptoms:
${result.symptoms?.map((s, i) => `${i + 1}. ${s}`).join('\n') || 'N/A'}

═══════════════════════════════════════════════════════════════════
SECTION 1: POSSIBLE DISEASES
═══════════════════════════════════════════════════════════════════
${diseasesList}

═══════════════════════════════════════════════════════════════════
SECTION 2: CAUSES
═══════════════════════════════════════════════════════════════════
${causesList}

═══════════════════════════════════════════════════════════════════
SECTION 3: RECOMMENDED ACTIONS
═══════════════════════════════════════════════════════════════════
${result.careTips.map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

═══════════════════════════════════════════════════════════════════
Analyzed with: Groq (primary) / Gemini (fallback)
                            `;
                            navigator.clipboard.writeText(resultText);
                            toast.success("Complete 3D analysis report copied to clipboard!");
                          }}
                          className="flex-1 h-12 text-base bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                        >
                          <BookOpen className="mr-2 h-5 w-5" />
                          Copy Full Report
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
