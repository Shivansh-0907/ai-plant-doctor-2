"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import {
  Upload,
  Camera,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Stethoscope,
  Heart,
  Leaf,
  Zap,
  X,
  Sun,
} from "lucide-react";
import { motion } from "framer-motion";

export default function StandardAnalyzer() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);

    try {
      await new Promise((res) => setTimeout(res, 2000));
      const fakeResult = {
        healthStatus: "Healthy",
        possibleDiseases: [],
        tips: [
          "Water moderately and avoid soggy soil.",
          "Provide indirect sunlight for 6–8 hours daily.",
          "Ensure good air circulation near the plant.",
        ],
      };
      setResult(fakeResult);
    } catch {
      setError("Failed to analyze image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-green-600">
            🌿 Standard Analyzer (2D)
          </h1>
          <p className="text-gray-600">
            Upload or capture a leaf image to detect health and possible diseases.
          </p>
        </div>

        {!image && (
          <div className="flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-green-300 rounded-xl p-8">
            <Upload className="w-10 h-10 text-green-500" />
            <p className="text-gray-500">Upload an image of a leaf to start</p>
            <div className="flex space-x-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                Upload Image
              </button>
              <button
                onClick={() => alert("Camera feature coming soon!")}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                <Camera className="inline-block w-5 h-5 mr-2" />
                Use Camera
              </button>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
            />
          </div>
        )}

        {image && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full flex justify-center"
          >
            <Image
              src={image}
              alt="Uploaded Leaf"
              width={400}
              height={400}
              className="rounded-xl shadow-lg border border-green-200"
            />
            <button
              onClick={handleReset}
              className="absolute top-2 right-2 bg-white/70 hover:bg-white p-2 rounded-full"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </motion.div>
        )}

        {image && !result && !loading && (
          <div className="flex justify-center">
            <button
              onClick={handleAnalyze}
              className="flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
            >
              <Stethoscope className="mr-2 w-5 h-5" /> Analyze Leaf
            </button>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center space-x-2 text-green-600">
            <Loader2 className="animate-spin w-6 h-6" />
            <p>Analyzing your leaf...</p>
          </div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 mt-8"
          >
            <section className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h2 className="flex items-center text-xl font-semibold text-green-700 mb-3">
                <Heart className="mr-2 text-green-600" /> Health Overview
              </h2>
              <p className="text-gray-700">
                {result.healthStatus === "Healthy"
                  ? "✅ Your plant looks healthy and vibrant. No visible diseases detected."
                  : `⚠️ Health Status: ${result.healthStatus}`}
              </p>
            </section>

            <section className="bg-white border rounded-xl p-6">
              <h2 className="flex items-center text-xl font-semibold text-red-600 mb-3">
                <AlertTriangle className="mr-2 text-red-500" /> Possible Diseases
              </h2>
              {result.possibleDiseases.length > 0 ? (
                <ul className="list-disc pl-6 text-gray-700">
                  {result.possibleDiseases.map((d: string, i: number) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">
                  🌿 No diseases detected — your plant is thriving!
                </p>
              )}
            </section>

            <section className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h2 className="flex items-center text-xl font-semibold text-green-700 mb-3">
                <Sun className="mr-2 text-yellow-500" /> General Plant Care Tips
              </h2>
              <ul className="list-disc pl-6 text-gray-700">
                {result.tips.map((tip: string, i: number) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </section>

            <section className="bg-white border rounded-xl p-6">
              <h2 className="flex items-center text-xl font-semibold text-green-700 mb-3">
                <Leaf className="mr-2 text-green-600" /> Growth Insights
              </h2>
              <p className="text-gray-700">
                Your plant’s leaf structure shows healthy chlorophyll levels and optimal growth.
              </p>
            </section>

            <section className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h2 className="flex items-center text-xl font-semibold text-green-700 mb-3">
                <Zap className="mr-2 text-green-600" /> Soil & Water Balance
              </h2>
              <p className="text-gray-700">
                Soil moisture and light appear balanced. Continue regular watering and check for
                proper drainage.
              </p>
            </section>

            <div className="flex justify-center gap-4 pt-6">
              <button
                onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Copy Results
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                <RefreshCw className="inline-block w-5 h-5 mr-2" />
                Reset
              </button>
            </div>
          </motion.div>
        )}

        {error && <div className="text-center text-red-600 mt-4">⚠️ {error}</div>}
      </div>
    </div>
  );
}
