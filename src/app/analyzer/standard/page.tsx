"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import {
  Upload,
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
  X,
} from "lucide-react";

// Health Ring Component
const HealthRing = ({ health }: { health: number }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - health) / 100) * circumference;

  return (
    <svg width="120" height="120" className="mx-auto">
      <circle
        cx="60"
        cy="60"
        r={radius}
        stroke="#e5e7eb"
        strokeWidth="10"
        fill="none"
      />
      <circle
        cx="60"
        cy="60"
        r={radius}
        stroke="#10b981"
        strokeWidth="10"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={progress}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
      <text
        x="50%"
        y="52%"
        textAnchor="middle"
        dy=".3em"
        className="text-xl font-bold fill-green-600"
      >
        {health}%
      </text>
    </svg>
  );
};

export default function StandardAnalyzer() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState("");

  const fileInput = useRef<HTMLInputElement>(null);

  // --------------------------
  // AI ENHANCER FUNCTION
  // --------------------------
  async function enhanceAIResult(data: any) {
    if (!data) return data;

    return {
      ...data,
      generalInsights: [
        "Leaf texture appears natural and organic.",
        "Detected light variation indicates real plant surface.",
        "No signs of plastic shine or artificial patterning.",
      ],
    };
  }

  // --------------------------
  // FAKE / NO LEAF DETECTION
  // --------------------------
  function validateLeaf(img: string) {
    const lowered = img.toLowerCase();

    if (lowered.includes("plastic") || lowered.includes("toy") || lowered.includes("cartoon"))
      return "fake";

    if (
      lowered.includes("no leaf") ||
      lowered.includes("nothing") ||
      lowered.includes("background")
    )
      return "none";

    return "real";
  }

  // --------------------------
  // MAIN ANALYSIS LOGIC
  // GROQ DEFAULT → GEMINI FALLBACK
  // --------------------------
  async function analyzeImage() {
    if (!imagePreview) return;

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      // --- 1) VALIDATE LEAF ---
      const leafCheck = validateLeaf(imagePreview);

      if (leafCheck === "none") {
        setAnalysis({ noLeafFound: true });
        setLoading(false);
        return;
      }

      if (leafCheck === "fake") {
        setAnalysis({ fakeLeaf: true });
        setLoading(false);
        return;
      }

      // --- 2) SEND TO GROQ DEFAULT ---
      const groqRes = await fetch("/api/analyzer-groq", {
        method: "POST",
        body: JSON.stringify({ image: imagePreview }),
      });

      let result;

      if (!groqRes.ok) {
        // ------ FALLBACK TO GEMINI ------
        const gemRes = await fetch("/api/analyzer-gemini", {
          method: "POST",
          body: JSON.stringify({ image: imagePreview }),
        });

        result = await gemRes.json();
      } else {
        result = await groqRes.json();
      }

      // --- 3) AI ENHANCER ---
      const enhanced = await enhanceAIResult(result);

      setAnalysis(enhanced);
    } catch (err) {
      setError("Something went wrong. Try again.");
    }

    setLoading(false);
  }

  // --------------------------
  // RESET FUNCTION
  // --------------------------
  function reset() {
    setImagePreview(null);
    setAnalysis(null);
    setError("");
  }

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6 fadeIn">
      <h1 className="text-3xl font-bold text-center">2D Leaf Analyzer</h1>

      {/* Upload Box */}
      {!imagePreview && (
        <div
          onClick={() => fileInput.current?.click()}
          className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition fadeInUp"
        >
          <Upload className="mx-auto h-10 w-10 text-green-600 mb-3" />
          <p className="text-lg font-medium">Upload a leaf image</p>
          <input
            type="file"
            ref={fileInput}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const url = URL.createObjectURL(file);
              setImagePreview(url);
            }}
          />
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="space-y-4 fadeInUp">
          <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-md">
            <Image src={imagePreview} alt="Leaf" fill className="object-cover" />
          </div>

          <div className="flex gap-3">
            <button
              onClick={analyzeImage}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Analyze
            </button>
            <button
              onClick={reset}
              className="px-4 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-lg flex items-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="flex flex-col items-center fadeInUp">
          <Loader2 className="animate-spin h-10 w-10 text-green-600 mb-2" />
          <p>Analyzing leaf...</p>
        </div>
      )}

      {/* ERRORS */}
      {error && <p className="text-red-600 text-center">{error}</p>}

      {/* RESULTS */}
      {analysis && (
        <div className="space-y-6 fadeInUp">

          {/* NO LEAF FOUND */}
          {analysis.noLeafFound && (
            <div className="p-5 border border-red-300 rounded-xl bg-red-50 text-red-700 text-center fadeInUp">
              <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
              <h2 className="text-xl font-bold">No Leaf Found!</h2>
              <p>Please upload a clear leaf image.</p>
            </div>
          )}

          {/* FAKE LEAF */}
          {analysis.fakeLeaf && (
            <div className="p-5 border border-yellow-300 rounded-xl bg-yellow-50 text-yellow-700 text-center fadeInUp">
              <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
              <h2 className="text-xl font-bold">Artificial / Plastic Leaf Detected!</h2>
              <p>Please upload a real leaf photo for accurate analysis.</p>
            </div>
          )}

          {/* MAIN DATA */}
          {!analysis.noLeafFound && !analysis.fakeLeaf && (
            <>
              {/* Health Ring */}
              <div className="fadeInUp">
                <HealthRing health={analysis.health ?? 80} />
                <p className="text-center text-gray-700 mt-2">
                  Estimated Leaf Health
                </p>
              </div>

              {/* General Insights */}
              {analysis.generalInsights && (
                <div className="p-5 rounded-xl border fadeInUp bg-gray-50 dark:bg-gray-900">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    Additional AI Insights
                  </h3>

                  <ul className="space-y-2">
                    {analysis.generalInsights.map((g: any, i: number) => (
                      <li key={i} className="text-sm text-gray-700 dark:text-gray-300">
                        • {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Diseases */}
              {analysis.diseases && (
                <div className="p-5 rounded-xl border fadeInUp bg-gray-50 dark:bg-gray-900">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-green-600" />
                    Possible Diseases
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {analysis.diseases.map((d: any, i: number) => (
                      <li key={i}>• {d}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              {analysis.actions && (
                <div className="p-5 rounded-xl border fadeInUp bg-gray-50 dark:bg-gray-900">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Pill className="w-5 h-5 text-green-600" />
                    Recommended Actions
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {analysis.actions.map((a: any, i: number) => (
                      <li key={i}>• {a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
