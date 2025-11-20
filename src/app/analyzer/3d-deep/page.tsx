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
  RefreshCw,
  Zap,
  Brain,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { toast } from "sonner";
import LeafDeepAnalyzer3D from "@/components/LeafDeepAnalyzer3D";

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
  confidence: number;
  severity: "none" | "low" | "medium" | "high";
  description: string;
  causes?: Cause[];
  careTips: string[];
  generalTips?: string[];
  symptoms: string[];
  detectedPatterns?: string[];
  providers?: string[];
};

const getPlantCondition = (stage: number, health: number): string => {
  if (stage === -1) return "Invalid Image";
  
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
      if (health >= 90) return "Healthy Condition";
      if (health >= 70) return "Mild Condition";
      if (health >= 45) return "Moderate Condition";
      return "Severe / Critical Condition";
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

export default function DeepAnalyzer3DPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

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

  const simulateProgress = (onTick?: (p: number) => void) => {
    let p = 5;
    const id = setInterval(() => {
      p = Math.min(95, p + Math.floor(Math.random() * 12) + 4);
      onTick && onTick(p);
    }, 500);
    return id;
  };

  const runAnalysis = async () => {
    if (!selectedImage) {
      toast.error("Please upload or capture an image first.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisProgress(2);
    setResult(null);

    const loadingToast = toast.loading("🧠 Analyzing with Groq AI...");
    const progressInterval = simulateProgress((p) => setAnalysisProgress(p));

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

      clearInterval(progressInterval);

      if (groqFailed && geminiFailed) {
        setAnalysisProgress(0);
        setResult(null);
        setError("❌ Both AI Failed to Analyse. Please check your API keys or try again later.");
        toast.error("Both AI Failed to Analyse!");
        toast.dismiss(loadingToast);
        return;
      }

      if (!finalResult) {
        setAnalysisProgress(0);
        setResult(null);
        setError("❌ No Leaf Found! Please upload a clear image of a real plant leaf.");
        toast.error("No Leaf Found! Try with a real plant image.");
        toast.dismiss(loadingToast);
        return;
      }

      const health = finalResult.healthPercentage || 72;
      const diseases = Array.isArray(finalResult.possibleDiseases) 
        ? finalResult.possibleDiseases 
        : [];
      
      const primaryDisease = diseases.length > 0 
        ? (typeof diseases[0] === 'string' ? diseases[0] : diseases[0].name)
        : finalResult.primaryDisease || "Healthy";

      let severity: "none" | "low" | "medium" | "high" = "none";
      if (health < 30) severity = "high";
      else if (health < 60) severity = "medium";
      else if (health < 85) severity = "low";

      const analysisResult: AnalysisResult = {
        noLeafDetected: false,
        stage: finalResult.stage || 0,
        damageType: finalResult.damageType || "General",
        healthPercentage: health,
        category: finalResult.category || "General",
        possibleDiseases: diseases,
        primaryDisease,
        confidence: finalResult.confidence || 0.85,
        severity,
        description: finalResult.aiConclusion || finalResult.description || "Analysis complete.",
        causes: finalResult.causes || [],
        careTips: finalResult.careTips || [],
        // Ensure generalTips always has meaningful content
        generalTips: finalResult.generalTips && finalResult.generalTips.length > 0 
          ? finalResult.generalTips 
          : DEFAULT_GENERAL_TIPS,
        symptoms: finalResult.symptoms || [],
        detectedPatterns: finalResult.detectedPatterns || [],
        providers: usedProviders,
      };

      setAnalysisProgress(100);
      setResult(analysisResult);
      toast.success(`✅ 3D Analysis complete with ${usedProviders[0]}!`);
      toast.dismiss(loadingToast);
      
      setTimeout(() => setAnalysisProgress(0), 1800);

    } catch (err: any) {
      console.error("Analysis error:", err);
      clearInterval(progressInterval);
      setAnalysisProgress(0);
      setError("❌ Both AI Failed to Analyse. Please try again.");
      toast.error("Both AI Failed to Analyse!");
      toast.dismiss(loadingToast);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-cyan-400 dark:from-black dark:via-cyan-950 dark:to-cyan-900 -mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/50 shadow-lg shadow-cyan-500/20">
              <Brain className="h-4 w-4 text-cyan-400 animate-pulse flex-shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-cyan-200">
                Dual AI: Groq + Gemini • 3D Deep Analysis
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                3D Deep Analyzer
              </span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-cyan-200 max-w-2xl mx-auto">
              Interactive 360° leaf visualization • Dual AI analysis • Zone-by-zone damage detection
            </p>
          </div>

          {/* Upload Section */}
          {!selectedImage ? (
            <Card className="border-2 border-cyan-500/50 bg-gradient-to-br from-cyan-950/80 to-blue-950/80 backdrop-blur-sm shadow-2xl shadow-cyan-500/20">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center space-y-6 py-16">
                  <div className="relative">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/50 animate-pulse">
                      <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 blur-2xl opacity-30 -z-10"></div>
                  </div>
                  <div className="text-center space-y-3">
                    <h3 className="text-xl sm:text-2xl font-bold text-cyan-100">Upload Plant Image</h3>
                    <p className="text-xs sm:text-sm text-cyan-200/70">
                      PNG, JPG or JPEG (max. 10MB)
                    </p>
                    <p className="text-xs text-cyan-400 font-medium flex items-center gap-2 justify-center">
                      <Eye className="h-4 w-4 flex-shrink-0" />
                      <span className="break-words">Dual AI will analyze every zone in 3D detail</span>
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
                      <Button asChild className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 cursor-pointer shadow-lg shadow-cyan-500/30 h-12 text-sm sm:text-base">
                        <span>
                          <ImageIcon className="mr-2 h-5 w-5 flex-shrink-0" />
                          <span className="truncate">Choose File</span>
                        </span>
                      </Button>
                    </label>
                    <label htmlFor="camera-capture-3d" className="flex-1">
                      <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 cursor-pointer shadow-lg shadow-blue-500/30 h-12 text-sm sm:text-base">
                        <span>
                          <Camera className="mr-2 h-5 w-5 flex-shrink-0" />
                          <span className="truncate">Take Photo</span>
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
                  <div className="space-y-1 flex-1 min-w-0">
                    <CardTitle className="text-cyan-100 text-base sm:text-lg truncate">Selected Image</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-cyan-300/70 text-xs sm:text-sm">
                      <Layers className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Ready for deep 3D analysis</span>
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={resetAll} className="h-8 w-8 text-cyan-300 hover:text-cyan-100 hover:bg-cyan-500/20 flex-shrink-0">
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
                  <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                  <AlertDescription className="text-red-200 break-words">
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
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 h-12 sm:h-14 text-base sm:text-lg shadow-2xl shadow-cyan-500/30 border border-cyan-400/30"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 sm:h-6 sm:w-6 animate-spin flex-shrink-0" />
                        <span className="truncate">Analyzing with Groq + Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Activity className="mr-3 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                        <span className="truncate">Start 3D Deep Analysis</span>
                      </>
                    )}
                  </Button>

                  {analysisProgress > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-xs text-cyan-300">Analysis Progress</div>
                        <div className="text-xs text-cyan-300">{analysisProgress}%</div>
                      </div>
                      <Progress value={analysisProgress} className="h-2" />
                    </div>
                  )}
                </>
              )}

              {/* 3D Results */}
              {result && (
                <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Success Banner with AI Providers */}
                  <Alert className="border-2 border-cyan-400/50 bg-gradient-to-r from-cyan-950/80 to-blue-950/80 backdrop-blur-sm shadow-xl shadow-cyan-500/20">
                    <CheckCircle className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                    <AlertDescription className="text-cyan-100">
                      <strong className="text-base sm:text-lg block">3D Deep Analysis Complete!</strong>
                      <p className="mt-1 text-xs sm:text-sm break-words">
                        Detected: <span className="font-semibold">{result.primaryDisease}</span> — {getPlantCondition(result.stage, result.healthPercentage)}
                      </p>
                      {result.providers && result.providers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {result.providers.map((provider, i) => (
                            <Badge key={i} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs">
                              <Zap className="mr-1 h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{provider}</span>
                            </Badge>
                          ))}
                        </div>
                      )}
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
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Card className="border-2 border-cyan-500/50 bg-gradient-to-br from-cyan-950/80 to-blue-950/80 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xs sm:text-sm text-cyan-300 truncate">Health Score</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl sm:text-4xl font-black text-cyan-400">
                          {result.healthPercentage}%
                        </div>
                        <div className="text-xs sm:text-sm text-cyan-300 mt-1 break-words">
                          {getPlantCondition(result.stage, result.healthPercentage)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-cyan-500/50 bg-gradient-to-br from-cyan-950/80 to-blue-950/80 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xs sm:text-sm text-cyan-300 truncate">Probable Disease</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl sm:text-2xl font-black text-cyan-400 leading-tight break-words">
                          {result.primaryDisease}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Health Overview Card */}
                  <Card className="border-2 border-cyan-500/50 bg-gradient-to-br from-cyan-950/80 to-blue-950/80 backdrop-blur-sm overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-xl sm:text-2xl text-cyan-100 break-words">{result.primaryDisease}</CardTitle>
                      <CardDescription className="text-cyan-300/70 text-xs sm:text-sm break-words">
                        {result.category} • {result.damageType} • {getPlantCondition(result.stage, result.healthPercentage)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <span className="text-xs sm:text-sm font-medium text-cyan-200">Health Status</span>
                          <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs whitespace-nowrap self-start sm:self-auto">
                            {result.healthPercentage}% Healthy
                          </Badge>
                        </div>
                        <Progress value={result.healthPercentage} className="h-3" />
                        <p className="text-cyan-100/80 text-xs sm:text-sm leading-relaxed break-words">{result.description}</p>
                      </div>

                      {result.symptoms && result.symptoms.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-cyan-200 flex items-center gap-2 text-sm sm:text-base">
                            <Eye className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                            <span className="truncate">Detected Symptoms</span>
                          </h4>
                          <div className="grid gap-2">
                            {result.symptoms.map((symptom, index) => (
                              <div key={index} className="flex items-start gap-2 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                                <span className="text-cyan-400 flex-shrink-0">•</span>
                                <span className="text-cyan-100/80 text-xs sm:text-sm break-words flex-1">{symptom}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* SECTION 1: POSSIBLE DISEASES */}
                  {result.possibleDiseases && Array.isArray(result.possibleDiseases) && result.possibleDiseases.length > 0 && (
                    <Card className="border-2 border-orange-400/50 bg-gradient-to-br from-orange-950/40 to-amber-950/40 backdrop-blur-sm overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-lg sm:text-xl flex items-center gap-2 text-orange-300">
                          <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400 flex-shrink-0" />
                          <span className="truncate">Section 1: Possible Diseases</span>
                        </CardTitle>
                        <CardDescription className="text-orange-200/70 text-xs sm:text-sm">
                          Detected diseases with likelihood percentages
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {result.possibleDiseases.map((disease: any, index: number) => (
                          <div key={index} className="p-3 sm:p-4 bg-black/40 rounded-lg border-2 border-orange-400/30 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-2">
                              <h5 className="font-bold text-base sm:text-lg text-orange-300 break-words flex-1">
                                {typeof disease === 'string' ? disease : disease.name}
                              </h5>
                              {typeof disease === 'object' && disease.likelihood && (
                                <Badge className="bg-orange-500/20 text-orange-300 border border-orange-400/30 text-xs px-3 py-1 whitespace-nowrap self-start sm:self-auto">
                                  {disease.likelihood}% Likely
                                </Badge>
                              )}
                            </div>
                            {typeof disease === 'object' && disease.description && (
                              <p className="text-xs sm:text-sm text-orange-100/70 leading-relaxed break-words">
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
                    <Card className="border-2 border-purple-400/50 bg-gradient-to-br from-purple-950/40 to-violet-950/40 backdrop-blur-sm overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-lg sm:text-xl flex items-center gap-2 text-purple-300">
                          <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 flex-shrink-0" />
                          <span className="truncate">Section 2: Causes</span>
                        </CardTitle>
                        <CardDescription className="text-purple-200/70 text-xs sm:text-sm">
                          Understanding what causes these diseases and why
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {result.causes.map((causeInfo, index) => (
                          <div key={index} className="p-3 sm:p-4 bg-black/40 rounded-lg border-2 border-purple-400/30 shadow-sm">
                            <div className="space-y-3">
                              <div>
                                <h5 className="font-bold text-sm sm:text-base text-purple-300 mb-1 break-words">
                                  Disease: {causeInfo.disease}
                                </h5>
                                <p className="text-xs sm:text-sm font-semibold text-purple-400 break-words">
                                  Cause: {causeInfo.cause}
                                </p>
                              </div>
                              <div className="pl-3 sm:pl-4 border-l-4 border-purple-400/50">
                                <p className="text-xs sm:text-sm text-purple-100/70 leading-relaxed break-words">
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
                    <Card className="border-2 border-green-400/50 bg-gradient-to-br from-green-950/40 to-emerald-950/40 backdrop-blur-sm overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-lg sm:text-xl flex items-center gap-2 text-green-300">
                          <Pill className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 flex-shrink-0" />
                          <span className="truncate">Section 3: Recommended Actions</span>
                        </CardTitle>
                        <CardDescription className="text-green-200/70 text-xs sm:text-sm">
                          Treatment steps and prevention measures
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {result.careTips.map((tip, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 sm:p-4 bg-black/40 rounded-lg border-2 border-green-400/30 shadow-sm hover:shadow-md hover:border-green-400/50 transition-all">
                            <span className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center shadow-md">
                              {index + 1}
                            </span>
                            <span className="text-xs sm:text-sm text-green-100/80 leading-relaxed pt-1 break-words flex-1">{tip}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* SECTION 4: GENERAL PLANT CARE TIPS - ALWAYS SHOWS */}
                  {result.generalTips && result.generalTips.length > 0 && (
                    <Card className="border-2 border-emerald-400/50 bg-gradient-to-br from-emerald-950/40 to-green-950/40 backdrop-blur-sm overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-lg sm:text-xl flex items-center gap-2 text-emerald-300">
                          <Sun className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400 flex-shrink-0" />
                          <span className="truncate">General Plant Care Tips 🌞</span>
                        </CardTitle>
                        <CardDescription className="text-emerald-200/70 text-xs sm:text-sm">
                          Essential care guidelines for optimal plant health
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {result.generalTips.map((t, i) => (
                            <li key={i} className="flex items-start gap-3 text-emerald-100/80 text-xs sm:text-sm leading-relaxed">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-600/20 flex items-center justify-center text-emerald-400 text-xs font-bold mt-0.5">
                                {i + 1}
                              </span>
                              <span className="flex-1 break-words">{t}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      onClick={resetAll}
                      variant="outline"
                      className="flex-1 h-12 text-sm sm:text-base border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-100"
                    >
                      <RefreshCw className="mr-2 h-5 w-5 flex-shrink-0" />
                      <span className="truncate">Analyze Another Image</span>
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
                              `${i + 1}. Disease: ${c.disease}\n   Cause: ${c.cause}\n   Why: ${c.explanation}`
                            ).join('\n\n')
                          : 'N/A';

                        const generalTipsList = result.generalTips 
                          ? result.generalTips.map((t, i) => `${i + 1}. ${t}`).join('\n')
                          : 'N/A';

                        const resultText = `
═══════════════════════════════════════════════════════════════════
3D DEEP PLANT ANALYSIS REPORT
═══════════════════════════════════════════════════════════════════
Analyzed by: ${result.providers?.join(" + ") || "Dual AI"}

Primary Disease: ${result.primaryDisease}
Plant Condition: ${getPlantCondition(result.stage, result.healthPercentage)}
Health Status: ${result.healthPercentage}% Healthy
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
SECTION 4: GENERAL PLANT CARE TIPS
═══════════════════════════════════════════════════════════════════
${generalTipsList}

═══════════════════════════════════════════════════════════════════
Powered by: Groq LLaVA v1.5 7B + Google Gemini 2.5 Flash
                        `;
                        navigator.clipboard.writeText(resultText);
                        toast.success("Complete 3D analysis report copied to clipboard!");
                      }}
                      className="flex-1 h-12 text-sm sm:text-base bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                    >
                      <BookOpen className="mr-2 h-5 w-5 flex-shrink-0" />
                      <span className="truncate">Copy Full Report</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}