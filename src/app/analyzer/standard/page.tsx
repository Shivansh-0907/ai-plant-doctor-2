"use client";

import { useState, useRef } from "react";
import {
  Upload,
  X,
  Loader2,
  CheckCircle,
  Sparkles,
  Zap,
  Camera,
  Image as ImageIcon,
  Stethoscope,
  AlertCircle,
  Pill,
  BookOpen,
  Heart,
  TrendingUp,
  Shield,
  RefreshCw,
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { toast } from "sonner";

type AnalysisResult = {
  noLeafDetected?: boolean;
  stage: number;
  damageType: string;
  healthPercentage: number;
  category: string;
  possibleDiseases:
    | Array<{ name: string; description: string; likelihood: number }>
    | string[];
  primaryDisease: string;
  confidence: number;
  severity: "none" | "low" | "medium" | "high";
  description: string;
  causes?: Array<{ disease: string; cause: string; explanation: string }>;
  careTips: string[];
  symptoms: string[];
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
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    provider: string;
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const providerInfo = {
    gemini: {
      name: "Gemini 2.0 Flash",
      badge: "FREE - Recommended",
      color:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
      description: "15 img/min • Most generous free tier",
      logo: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/12b00f93-5c00-4001-bf0f-c3e600a62334/generated_images/google-gemini-ai-logo-professional-vecto-db2a7dc9-20251104230847.jpg",
      features: "Advanced vision AI with high accuracy",
    },
    groq: {
      name: "Groq Llama 4 Scout",
      badge: "Ultra-Fast",
      color:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
      description: "500 tokens/sec • Free trial",
      logo: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/12b00f93-5c00-4001-bf0f-c3e600a62334/generated_images/groq-ai-logo-professional-vector-illustr-f61341ee-20251104230846.jpg",
      features: "Lightning-fast inference engine",
    },
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
        body: JSON.stringify({ image: selectedImage }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || "Analysis failed";
        const isRateLimit = data.isRateLimit || false;
        const suggestedProviders = data.suggestedProviders || [];

        if (isRateLimit) {
          setRateLimitInfo({ provider: providerName, message: errorMessage });
          toast.dismiss(loadingToast);
          toast.error("⏱️ Rate Limit Reached", {
            description: `${providerName} limit exceeded. Try ${suggestedProviders.join(" or ")}!`,
            duration: 8000,
          });
        } else {
          setError(errorMessage);
          toast.dismiss(loadingToast);
          toast.error(`${providerName} Error`, { description: errorMessage });
        }
        return;
      }

      setResult(data);
      toast.dismiss(loadingToast);
      toast.success(`✅ ${providerName} analysis complete!`, {
        description: `${data.primaryDisease} detected with ${data.confidence.toFixed(1)}% confidence`,
      });
    } catch (err) {
      console.error("Analysis error:", err);
      const msg = `Failed to connect to ${providerName}. Check console for details.`;
      setError(msg);
      toast.dismiss(loadingToast);
      toast.error(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
    fileInputRef.current && (fileInputRef.current.value = "");
    cameraInputRef.current && (cameraInputRef.current.value = "");
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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 border border-green-200/50 dark:border-green-700/50 mb-4">
            <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400 animate-pulse" />
            <span className="text-sm font-semibold text-green-700 dark:text-green-300">
              Standard Plant Analyzer
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold">
            Plant Disease{" "}
            <span className="text-green-600 dark:text-green-400">Analyzer</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose your AI model • Multi-stage disease detection • All stages
            specialist
          </p>
        </div>

        {/* AI Provider Selection */}
        <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Select AI model
            </CardTitle>
            <CardDescription>
              Choose the AI model that best fits your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={aiProvider}
              onValueChange={(value) => setAiProvider(value as AIProvider)}
            >
              <SelectTrigger className="w-full border-2 hover:border-blue-400 transition-all">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(providerInfo).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    {info.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Upload Section */}
        {!selectedImage ? (
          <Card className="border-2 border-dashed border-green-200 dark:border-green-800 hover:border-green-400 transition-colors">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-4 py-12">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg">
                  <Upload className="h-10 w-10 text-white" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">Upload Plant Image</h3>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG or JPEG (max. 10MB)
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="file-upload"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraCapture}
                  className="hidden"
                  id="camera-capture"
                />

                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                  <label htmlFor="file-upload" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                      <ImageIcon className="mr-2 h-5 w-5" />
                      Choose File
                    </Button>
                  </label>
                  <label htmlFor="camera-capture" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                      <Camera className="mr-2 h-5 w-5" />
                      Take Photo
                    </Button>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Selected Image</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  Using:
                  <Badge className={providerInfo[aiProvider].color}>
                    {providerInfo[aiProvider].name}
                  </Badge>
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={handleReset}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                <Image
                  src={selectedImage}
                  alt="Selected plant"
                  fill
                  className="object-contain"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analyze Button */}
        {selectedImage && !result && !error && (
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
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

        {/* Results Section */}
        {result && (
          <div className="space-y-6 pt-4 animate-fadeIn">
            <Card
              className={`border-2 ${getSeverityBg(
                result.severity
              )} transition-all duration-300`}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Stethoscope className="h-6 w-6 text-green-600 dark:text-green-400" />
                  {result.primaryDisease}
                </CardTitle>
                <CardDescription>{result.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge
                    variant="outline"
                    className={`text-sm ${getSeverityColor(result.severity)}`}
                  >
                    Severity: {result.severity.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    Confidence: {result.confidence.toFixed(1)}%
                  </Badge>
                </div>

                <div>
                  <p className="font-medium mb-2">
                    Health Status: {getHealthStatusMessage(result.healthPercentage)}
                  </p>
                  <Progress value={result.healthPercentage} className="h-3" />
                </div>
              </CardContent>
            </Card>

            <div className="grid sm:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    Symptoms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {result.symptoms.map((symptom, i) => (
                      <li key={i}>{symptom}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-emerald-500" />
                    Care Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {result.careTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {result.causes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    Detected Causes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.causes.map((cause, i) => (
                    <div key={i} className="mb-3">
                      <p className="font-semibold">{cause.disease}</p>
                      <p className="text-sm text-muted-foreground">
                        {cause.explanation}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Footer */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1 border-2 border-gray-300 hover:border-gray-400"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reanalyze Another Image
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
