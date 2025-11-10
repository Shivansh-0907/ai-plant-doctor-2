"use client";

import { useState, useRef } from "react";
import {
  Upload,
  X,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Image as ImageIcon,
  Activity,
  Droplets,
  Eye,
  Sparkles,
  Zap,
  RefreshCw,
  Clock,
  Heart,
  TrendingUp,
  Shield,
  Info,
  AlertCircle,
  Stethoscope,
  Pill,
  BookOpen,
  Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { toast } from "sonner";

type PossibleDisease = { name?: string; description?: string; likelihood?: number } | string;

type AnalysisResult = {
  noLeafDetected?: boolean;
  stage: number;
  damageType?: string;
  healthPercentage: number;
  category?: string;
  possibleDiseases?: PossibleDisease[];
  primaryDisease?: string;
  confidence?: number;
  severity: "none" | "low" | "medium" | "high";
  description?: string;
  causes?: Array<{ disease: string; cause: string; explanation: string }>;
  careTips?: string[];
  symptoms?: string[];
  detectedPatterns?: string[];
  provider?: string;
  cost?: string;
};

type AIProvider = "gemini" | "groq";

export default function StandardAnalyzerPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiProvider, setAiProvider] = useState<AIProvider>("gemini");
  const [rateLimitInfo, setRateLimitInfo] = useState<{ provider: string; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const providerInfo = {
    gemini: {
      name: "Gemini 2.0 Flash",
      badge: "FREE - Recommended",
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
      description: "15 img/min • Most generous free tier",
      logo:
        "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/12b00f93-5c00-4001-bf0f-c3e600a62334/generated_images/google-gemini-ai-logo-professional-vecto-db2a7dc9-20251104230847.jpg",
      features: "Advanced vision AI with high accuracy"
    },
    groq: {
      name: "Groq Llama 4 Scout",
      badge: "Ultra-Fast",
      color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
      description: "500 tokens/sec • Free trial",
      logo:
        "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/12b00f93-5c00-4001-bf0f-c3e600a62334/generated_images/groq-ai-logo-professional-vector-illustr-f61341ee-20251104230846.jpg",
      features: "Lightning-fast inference engine"
    }
  };

  // Helpers
  const isHealthyPlant = (r: AnalysisResult | null) => {
    if (!r) return false;
    // stage 0 or severity none or very high health %
    if (r.noLeafDetected) return false;
    return r.severity === "none" || r.healthPercentage >= 90 || (r.primaryDisease || "").toLowerCase().includes("healthy");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "none":
      case "low":
        return "text-green-600 dark:text-green-400";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400";
      case "high":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600";
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case "none":
      case "low":
        return "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800";
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800";
      case "high":
        return "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800";
      default:
        return "bg-gray-100 border-gray-200";
    }
  };

  const getHealthStatusMessage = (health: number) => {
    if (health >= 90) return "✨ EXCELLENT - Super healthy, perfect condition!";
    if (health >= 70) return "🌿 Good - Early stage detection successful!";
    if (health >= 45) return "⚠️ Moderate - Treatment recommended soon";
    return "🚨 CRITICAL - Immediate intervention required!";
  };

  const getHealthCondition = (health: number) => {
    if (health >= 90) {
      return { label: "Super Healthy", color: "text-emerald-700 dark:text-emerald-300", bgColor: "bg-gradient-to-r from-emerald-500 to-green-500", icon: Heart };
    }
    if (health >= 70) {
      return { label: "Good", color: "text-green-700 dark:text-green-300", bgColor: "bg-gradient-to-r from-green-500 to-lime-500", icon: TrendingUp };
    }
    if (health >= 45) {
      return { label: "Bad", color: "text-orange-700 dark:text-orange-300", bgColor: "bg-gradient-to-r from-orange-500 to-amber-500", icon: AlertTriangle };
    }
    return { label: "Critical", color: "text-red-700 dark:text-red-300", bgColor: "bg-gradient-to-r from-red-600 to-rose-600", icon: Shield };
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
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setError(null);
    setRateLimitInfo(null);
    const providerName = providerInfo[aiProvider].name;
    const loadingToast = toast.loading(`Analyzing with ${providerName}...`);
    try {
      const apiEndpoint = `/api/analyze-${aiProvider}`;
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: selectedImage })
      });
      const data = await response.json();
      if (!response.ok) {
        const errorMessage = data.error || "Analysis failed";
        const isRateLimit = data.isRateLimit || false;
        const suggestedProviders = data.suggestedProviders || [];
        if (isRateLimit) {
          setRateLimitInfo({ provider: providerName, message: errorMessage });
          toast.dismiss(loadingToast);
          toast.error(`⏱️ Rate Limit Reached: ${providerName}`, {
            description: suggestedProviders.length > 0 ? `Try ${suggestedProviders.join(" or ")}` : undefined,
            duration: 8000
          });
        } else {
          setError(errorMessage);
          toast.dismiss(loadingToast);
          toast.error(`${providerName} Error: ${errorMessage}`, { duration: 8000 });
        }
        return;
      }
      // Ensure returned shape fits AnalysisResult type; otherwise map defaults
      const mapped: AnalysisResult = {
        noLeafDetected: data.noLeafDetected ?? false,
        stage: data.stage ?? 0,
        damageType: data.damageType ?? "",
        healthPercentage: typeof data.healthPercentage === "number" ? data.healthPercentage : (data.health ?? 100),
        category: data.category ?? data.primaryCategory ?? "General",
        possibleDiseases: data.possibleDiseases ?? data.diseases ?? [],
        primaryDisease: data.primaryDisease ?? data.primary ?? (Array.isArray(data.possibleDiseases) && data.possibleDiseases[0]?.name) ?? "Healthy",
        confidence: data.confidence ?? data.confidenceScore ?? 100,
        severity: data.severity ?? "none",
        description: data.description ?? "No additional details.",
        causes: data.causes ?? [],
        careTips: data.careTips ?? data.recommendations ?? [],
        symptoms: data.symptoms ?? [],
        detectedPatterns: data.detectedPatterns ?? []
      };
      setResult(mapped);
      setRateLimitInfo(null);
      toast.dismiss(loadingToast);
      toast.success(`✅ ${providerName} analysis complete!`, {
        description: mapped.primaryDisease ? `${mapped.primaryDisease} • ${mapped.healthPercentage}%` : `${mapped.healthPercentage}% healthy`
      });
    } catch (err) {
      console.error("Analysis error:", err);
      setError(`Failed to connect to ${providerInfo[aiProvider].name}.`);
      toast.error(`Connection failed to ${providerInfo[aiProvider].name}`);
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

  const getAlternativeProviders = () => {
    const alternatives: AIProvider[] = [];
    if (aiProvider !== "gemini") alternatives.push("gemini");
    if (aiProvider !== "groq") alternatives.push("groq");
    return alternatives;}
  };

  // Render
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 border border-green-200/50 dark:border-green-700/50 mb-4">
            <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400 animate-pulse" />
            <span className="text-sm font-semibold text-green-700 dark:text-green-300">Standard Plant Analyzer</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold">
            Plant Disease <span className="text-green-600 dark:text-green-400">Analyzer</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose your AI model • Multi-stage disease detection • all stages specialist
          </p>
        </div>

        {/* AI Provider Selection */}
        <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Select AI model
            </CardTitle>
            <CardDescription>Choose the AI model that best fits your needs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={aiProvider} onValueChange={(value) => setAiProvider(value as AIProvider)}>
              <SelectTrigger className="w-full h-auto text-base border-2 hover:border-blue-400 dark:hover:border-blue-600 transition-all shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-full">
                {Object.entries(providerInfo).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    {info.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Rate Limit Warning */}
        {rateLimitInfo && (
          <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="space-y-3">
              <div className="text-amber-900 dark:text-amber-100">
                <strong>⏱️ {rateLimitInfo.provider} Rate Limit Reached</strong>
                <p className="mt-1 text-sm">{rateLimitInfo.message}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">🔄 Try this alternative instead:</p>
                <div className="flex flex-wrap gap-2">
                  {getAlternativeProviders().map((provider) => (
                    <Button
                      key={provider}
                      onClick={() => {
                        setAiProvider(provider);
                        setRateLimitInfo(null);
                        toast.success(`Switched to ${providerInfo[provider].name}`);
                      }}
                      variant="outline"
                      size="sm"
                      className="border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                    >
                      <RefreshCw className="mr-2 h-3 w-3" />
                      Switch to {providerInfo[provider].name}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">💡 Tip: Each provider has independent rate limits. You can freely switch between them!</p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Section */}
        {!selectedImage ? (
          <Card className="border-2 border-dashed border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 transition-colors">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-4 py-12">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                  <Upload className="h-10 w-10 text-white" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">Upload Plant Image</h3>
                  <p className="text-sm text-muted-foreground">PNG, JPG or JPEG (max. 10MB)</p>
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">📸 Best results: Clear leaf photos with good lighting</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" id="file-upload" />
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleCameraCapture} className="hidden" id="camera-capture" />
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                  <label htmlFor="file-upload" className="flex-1">
                    <Button asChild className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 cursor-pointer shadow-lg">
                      <span>
                        <ImageIcon className="mr-2 h-5 w-5" />
                        Choose File
                      </span>
                    </Button>
                  </label>
                  <label htmlFor="camera-capture" className="flex-1">
                    <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 cursor-pointer shadow-lg">
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                  <CardTitle>Selected Image</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    Using: <Badge className={providerInfo[aiProvider].color}>{providerInfo[aiProvider].name}</Badge>
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={handleReset} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                  <Image src={selectedImage!} alt="Selected plant" fill className="object-contain" />
                </div>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive" className="border-red-200 dark:border-red-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="whitespace-pre-line space-y-3">
                  {error}
                  {getAlternativeProviders().length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const altProvider = getAlternativeProviders()[0];
                          setAiProvider(altProvider);
                          setError(null);
                          toast.info(`Switched to ${providerInfo[altProvider].name}`);
                        }}
                        className="text-xs"
                      >
                        <RefreshCw className="mr-1 h-3 w-3" />
                        Try {providerInfo[getAlternativeProviders()[0]]?.name}
                      </Button>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Analyze Button */}
            {!result && !error && (
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-12 text-base shadow-lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing with {providerInfo[aiProvider].name}...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Analyze with {providerInfo[aiProvider].name}
                  </>
                )}
              </Button>
            )}

            {/* COMPLETE RESULTS SECTION */}
            {result && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* NO LEAF FOUND ALERT */}
                {result.noLeafDetected ? (
                  <div className="space-y-6">
                    <Alert className="border-2 border-red-400/50 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <AlertDescription>
                        <strong className="text-lg text-red-700 dark:text-red-300">⚠️ No Leaf Found!</strong>
                        <p className="mt-1 text-red-600 dark:text-red-400">{result.description}</p>
                      </AlertDescription>
                    </Alert>

                    <Card className="border-2 border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="text-2xl text-red-700 dark:text-red-300">No Leaf Detected</CardTitle>
                        <CardDescription>The uploaded image does not contain a plant leaf</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                          <h4 className="font-semibold text-red-700 dark:text-red-300 mb-3">📋 What to do:</h4>
                          <ul className="space-y-2">
                            {(result.careTips || []).map((tip, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                                <span>•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>

                    <Button onClick={handleReset} className="w-full h-12 text-base bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                      <RefreshCw className="mr-2 h-5 w-5" />
                      Upload Plant Leaf Image
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Success Banner */}
                    <Alert className={`border-2 ${getSeverityBg(result.severity)}`}>
                      <CheckCircle className={`h-5 w-5 ${getSeverityColor(result.severity)}`} />
                      <AlertDescription>
                        <strong className="text-lg">Analysis Complete!</strong>
                        <p className="mt-1">{getHealthStatusMessage(result.healthPercentage)}</p>
                      </AlertDescription>
                    </Alert>

                    {/* Health Overview Card */}
                    <Card className="border-2 border-green-200 dark:border-green-800 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-2xl">{result.primaryDisease || (isHealthyPlant(result) ? "Healthy Plant" : "Analysis")}</CardTitle>
                        <CardDescription className="text-base">{result.category ?? "General"}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Health Progress */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Health Status</span>
                            <Badge className={getSeverityBg(result.severity)}>{result.healthPercentage}% Healthy</Badge>
                          </div>
                          <Progress value={result.healthPercentage} className="h-3" />
                          <p className="text-sm text-muted-foreground">{result.description ?? (isHealthyPlant(result) ? "The leaf looks healthy and well-formed." : "No extra description.")}</p>
                        </div>

                        {/* Detected Symptoms (or positive message) */}
                        <div className="space-y-3">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            Detected Symptoms
                          </h4>
                          <div className="grid gap-2">
                            {result.symptoms && result.symptoms.length > 0 ? (
                              result.symptoms.map((symptom, index) => (
                                <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                                  <span className="text-sm">{symptom}</span>
                                </div>
                              ))
                            ) : (
                              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                                <p className="text-sm text-green-700 dark:text-green-300">🌿 No visible symptoms detected — leaf appears healthy.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* SECTION 1: POSSIBLE DISEASES (always visible) */}
                    <Card className="border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20">
                      <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Stethoscope className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                          Section 1: Possible Diseases
                        </CardTitle>
                        <CardDescription>Detected diseases with likelihood percentages (or confirmation that none were found)</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {isHealthyPlant(result) ? (
                          <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-green-200 dark:border-green-800 shadow-sm">
                            <p className="text-green-700 dark:text-green-300 text-sm">🌿 No diseases detected — your plant is in excellent condition.</p>
                          </div>
                        ) : (result.possibleDiseases && result.possibleDiseases.length > 0 ? (
                          result.possibleDiseases.map((disease: any, index: number) => (
                            <div key={index} className="p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-orange-200 dark:border-orange-800 shadow-sm">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <h5 className="font-bold text-lg text-orange-700 dark:text-orange-300">{typeof disease === "string" ? disease : disease.name}</h5>
                                {typeof disease === "object" && disease.likelihood && (
                                  <Badge className="bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-sm px-3 py-1">{disease.likelihood}% Likely</Badge>
                                )}
                              </div>
                              {typeof disease === "object" && disease.description && (
                                <p className="text-sm text-muted-foreground leading-relaxed">{disease.description}</p>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-800 shadow-sm">
                            <p className="text-sm text-muted-foreground">No likely diseases were identified. Keep monitoring as usual.</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* SECTION 2: CAUSES (always visible) */}
                    <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-950/20 dark:to-violet-950/20">
                      <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <AlertCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                          Section 2: Causes
                        </CardTitle>
                        <CardDescription>Understanding what causes diseases or confirming no harmful causes</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {isHealthyPlant(result) ? (
                          <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-green-200 dark:border-green-800 shadow-sm">
                            <p className="text-green-700 dark:text-green-300 text-sm">No harmful causes detected — environment and care look balanced.</p>
                          </div>
                        ) : (result.causes && result.causes.length > 0 ? (
                          result.causes.map((causeInfo, index) => (
                            <div key={index} className="p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-purple-200 dark:border-purple-800 shadow-sm">
                              <div className="space-y-3">
                                <div>
                                  <h5 className="font-bold text-base text-purple-700 dark:text-purple-300 mb-1">Disease: {causeInfo.disease}</h5>
                                  <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">Cause: {causeInfo.cause}</p>
                                </div>
                                <div className="pl-4 border-l-4 border-purple-300 dark:border-purple-700">
                                  <p className="text-sm text-muted-foreground leading-relaxed"><strong className="text-purple-600 dark:text-purple-400">Why:</strong> {causeInfo.explanation}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-800 shadow-sm">
                            <p className="text-sm text-muted-foreground">No specific causes were identified.</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* SECTION 3: RECOMMENDED ACTIONS (always visible) */}
                    <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
                      <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Pill className="h-6 w-6 text-green-600 dark:text-green-400" />
                          Section 3: Recommended Actions
                        </CardTitle>
                        <CardDescription>Treatment steps, prevention measures or maintenance tips</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {isHealthyPlant(result) ? (
                          <>
                            <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-green-200 dark:border-green-800 shadow-sm">
                              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold flex items-center justify-center shadow-md">1</span>
                              <span className="text-sm leading-relaxed pt-1">Continue consistent watering and moderate sunlight to maintain health.</span>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-green-200 dark:border-green-800 shadow-sm">
                              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold flex items-center justify-center shadow-md">2</span>
                              <span className="text-sm leading-relaxed pt-1">Use light organic feeding every 2–4 weeks to sustain nutrient balance.</span>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-green-200 dark:border-green-800 shadow-sm">
                              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold flex items-center justify-center shadow-md">3</span>
                              <span className="text-sm leading-relaxed pt-1">Inspect leaves weekly and remove debris — prevents future issues.</span>
                            </div>
                          </>
                        ) : (result.careTips && result.careTips.length > 0 ? (
                          result.careTips.map((tip, index) => (
                            <div key={index} className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-green-200 dark:border-green-800 shadow-sm hover:shadow-md transition-shadow">
                              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold flex items-center justify-center shadow-md">{index + 1}</span>
                              <span className="text-sm leading-relaxed pt-1">{tip}</span>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-800 shadow-sm">
                            <p className="text-sm text-muted-foreground">No specific recommendations; continue regular care.</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button onClick={handleReset} variant="outline" className="flex-1 h-12 text-base">
                        <RefreshCw className="mr-2 h-5 w-5" />
                        Analyze Another Image
                      </Button>

                      <Button
                        onClick={() => {
                          const diseasesList = Array.isArray(result.possibleDiseases)
                            ? result.possibleDiseases.map((d: any, i: number) =>
                                typeof d === "string"
                                  ? `${i + 1}. ${d}`
                                  : `${i + 1}. ${d.name}${d.likelihood ? ` (${d.likelihood}% likely)` : ""}${d.description ? ` - ${d.description}` : ""}`
                              ).join("\n")
                            : "N/A";

                          const causesList = result.causes
                            ? result.causes.map((c, i) => `${i + 1}. Disease: ${c.disease}\n   Cause: ${c.cause}\n   Why: ${c.explanation}`).join("\n\n")
                            : "N/A";

                          const careList = result.careTips && result.careTips.length > 0 ? result.careTips.map((c, i) => `${i + 1}. ${c}`).join("\n") : "N/A";

                          const resultText = `
═══════════════════════════════════════════════════════════════════
PLANT DISEASE ANALYSIS REPORT
═══════════════════════════════════════════════════════════════════

Primary Disease: ${result.primaryDisease ?? "N/A"}
Health Status: ${result.healthPercentage}% Healthy
Severity: ${result.severity?.toUpperCase() ?? "N/A"}
Category: ${result.category ?? "N/A"}

Description:
${result.description ?? "N/A"}

Detected Symptoms:
${result.symptoms && result.symptoms.length > 0 ? result.symptoms.map((s, i) => `${i + 1}. ${s}`).join("\n") : "None"}

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
${careList}

═══════════════════════════════════════════════════════════════════
Analyzed with: ${providerInfo[aiProvider].name}
                          `;
                          navigator.clipboard.writeText(resultText);
                          toast.success("Complete analysis report copied to clipboard!");
                        }}
                        className="flex-1 h-12 text-base bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
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
  );
}
