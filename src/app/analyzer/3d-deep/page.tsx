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
import Image from "next/image";
import { toast } from "sonner";
import LeafDeepAnalyzer3D from "@/components/LeafDeepAnalyzer3D";

type AnalysisResult = {
  noLeafDetected?: boolean;
  stage: number;
  damageType: string;
  healthPercentage: number;
  category: string;
  possibleDiseases: Array<{
    name: string;
    description: string;
    likelihood: number;
  }> | string[];
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

export default function DeepAnalyzer3DPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    }
  };

  const analyzeWithGroq = async (image: string) => {
    const response = await fetch("/api/analyze-groq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image }),
    });
    if (!response.ok) throw new Error("Groq analysis failed");
    return response.json();
  };

  const analyzeWithGemini = async (image: string) => {
    const response = await fetch("/api/analyze-gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image }),
    });
    if (!response.ok) throw new Error("Gemini analysis failed");
    return response.json();
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);
    const loadingToast = toast.loading("Analyzing with Groq AI...");

    try {
      let data: AnalysisResult;

      // Try Groq first
      try {
        data = await analyzeWithGroq(selectedImage);
        data.provider = "Groq";
      } catch (groqError) {
        console.warn("Groq failed, switching to Gemini...");
        toast.message("Groq unavailable, switching to Gemini...", {
          description: "Retrying analysis using Gemini AI",
        });

        // Fallback to Gemini
        data = await analyzeWithGemini(selectedImage);
        data.provider = "Gemini";
      }

      setResult(data);
      toast.dismiss(loadingToast);
      toast.success("✅ Deep analysis complete!", {
        description: `${data.primaryDisease} detected — ${data.healthPercentage}% healthy`,
      });
    } catch (error: any) {
      console.error("Analysis error:", error);
      setError("Failed to connect to AI service. Try again later.");
      toast.dismiss(loadingToast);
      toast.error("Analysis failed", {
        description: error.message || "Unknown error occurred",
      });
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
              Interactive 360° visualization • Zone-by-zone leaf damage analysis
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
                  </div>
                  <div className="text-center space-y-3">
                    <h3 className="text-2xl font-bold text-cyan-100">
                      Upload Plant Image
                    </h3>
                    <p className="text-sm text-cyan-200/70">
                      PNG, JPG or JPEG (max. 10MB)
                    </p>
                    <p className="text-xs text-cyan-400 font-medium flex items-center gap-2 justify-center">
                      <Eye className="h-4 w-4" />
                      Deep AI will analyze in 3D precision
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
                      <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 h-12 text-base">
                        <ImageIcon className="mr-2 h-5 w-5" />
                        Choose File
                      </Button>
                    </label>
                    <label htmlFor="camera-capture-3d" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 h-12 text-base">
                        <Camera className="mr-2 h-5 w-5" />
                        Take Photo
                      </Button>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Preview */}
              <Card className="border-2 border-cyan-500/50 bg-gradient-to-br from-cyan-950/80 to-blue-950/80">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-cyan-100">
                      Selected Image
                    </CardTitle>
                    <CardDescription className="text-cyan-300/70">
                      Ready for deep analysis
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleReset}
                    className="h-8 w-8 text-cyan-300 hover:bg-cyan-500/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-cyan-500/30 bg-black/50">
                    <Image
                      src={selectedImage}
                      alt="Selected leaf"
                      fill
                      className="object-contain"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Error */}
              {error && (
                <Alert className="border-red-400/50 bg-red-950/50">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Analyze Button */}
              {!result && !error && (
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full h-14 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-lg shadow-lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Activity className="mr-3 h-6 w-6" />
                      Start Deep Analysis
                    </>
                  )}
                </Button>
              )}

              {/* Display Results */}
              {result && (
                <div className="space-y-6">
                  <Alert className="border-cyan-400/50 bg-cyan-950/60">
                    <CheckCircle className="h-5 w-5 text-cyan-400" />
                    <AlertDescription>
                      <strong>{result.primaryDisease}</strong> detected —{" "}
                      {result.healthPercentage}% healthy ({result.provider} AI)
                    </AlertDescription>
                  </Alert>

                  <LeafDeepAnalyzer3D
                    analysis={{
                      healthPercentage: result.healthPercentage,
                      stage: result.stage,
                      primaryDisease: result.primaryDisease,
                      category: result.category,
                      severity: result.severity,
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
