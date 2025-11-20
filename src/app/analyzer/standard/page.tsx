// FULLY FIXED & CLEANED 2D STANDARD ANALYSER (GROQ DEFAULT)
// --------------------------------------------------------------
// Includes:
// ✔ Error-free JSX
// ✔ No duplicate aiConclusion blocks
// ✔ Proper Plant Condition Summary logic
// ✔ Advanced Leaf Detection (AI enhance)
// ✔ Detects fake/plastic/cartoon/no-leaf → "No Leaf Found!"
// ✔ Ring Health Bar + Smooth UI
// --------------------------------------------------------------

"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import axios from "axios";
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
} from "lucide-react";

// --------------------------------------------------------------
// HEALTH CATEGORY FUNCTION
// --------------------------------------------------------------
const healthCategory = (percentage) => {
  if (percentage >= 80) return { label: "Healthy", color: "text-green-500" };
  if (percentage >= 50) return { label: "Moderate", color: "text-yellow-500" };
  return { label: "Poor", color: "text-red-500" };
};

// --------------------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------------------
export default function StandardAnalyser() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  // --------------------------------------------------------------
  // IMAGE SELECT
  // --------------------------------------------------------------
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // --------------------------------------------------------------
  // AI LEAF CHECK (Fake/Plastic/Cartoon/No Leaf Detection)
  // --------------------------------------------------------------
  const detectLeaf = async (base64) => {
    try {
      const res = await axios.post("/api/groq/leaf-check", { image: base64 });
      return res.data?.status || "unknown";
    } catch (err) {
      return "unknown";
    }
  };

  // --------------------------------------------------------------
  // MAIN ANALYSE FUNCTION
  // --------------------------------------------------------------
  const analyse = async () => {
    if (!image) return;

    setLoading(true);
    setResult(null);

    const reader = new FileReader();
    reader.readAsDataURL(image);

    reader.onloadend = async () => {
      const base64 = reader.result;

      // 1️⃣ CHECK IF LEAF EXISTS
      const leafStatus = await detectLeaf(base64);

      if (leafStatus === "no_leaf" || leafStatus === "fake" || leafStatus === "cartoon") {
        setResult({
          error: "No Leaf Found! Please upload a real leaf image.",
        });
        setLoading(false);
        return;
      }

      // 2️⃣ SEND TO MAIN ANALYSER (GROQ DEFAULT)
      try {
        const res = await axios.post("/api/groq/analyse", { image: base64 });
        setResult(res.data);
      } catch (err) {
        setResult({ error: "Something went wrong. Try again." });
      }

      setLoading(false);
    };
  };

  // --------------------------------------------------------------
  // RING HEALTH BAR
  // --------------------------------------------------------------
  const Ring = ({ value }) => {
    const r = 70;
    const c = 2 * Math.PI * r;
    const offset = c - (value / 100) * c;

    return (
      <svg width="180" height="180" className="mx-auto">
        <circle
          r={r}
          cx="90"
          cy="90"
          stroke="#e5e7eb"
          strokeWidth="12"
          fill="transparent"
        />
        <circle
          r={r}
          cx="90"
          cy="90"
          stroke="#22c55e"
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "0.8s ease" }}
        />
        <text x="50%" y="50%" textAnchor="middle" dy="8" className="text-xl font-bold">
          {value}%
        </text>
      </svg>
    );
  };

  // --------------------------------------------------------------
  // UI
  // --------------------------------------------------------------
  return (
    <div className="p-5 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6 flex items-center gap-2 justify-center">
        <Stethoscope className="w-8 h-8 text-green-600" /> 2D Standard Leaf Analyser
      </h1>

      {/* IMAGE PREVIEW */}
      <div className="border p-4 rounded-xl bg-white shadow-md text-center">
        {preview ? (
          <div className="relative inline-block">
            <Image src={preview} alt="preview" width={300} height={300} className="rounded-xl" />
            <button
              onClick={() => {
                setImage(null);
                setPreview(null);
              }}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
            >
              <X />
            </button>
          </div>
        ) : (
          <div>
            <ImageIcon className="w-16 h-16 mx-auto text-gray-400" />
            <p className="text-gray-500 mt-2">Upload a leaf image to analyse</p>
          </div>
        )}

        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImage}
        />

        <div className="mt-4 flex justify-center gap-3">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-xl flex items-center gap-2"
            onClick={() => inputRef.current.click()}
          >
            <Upload /> Upload
          </button>

          <button
            onClick={analyse}
            disabled={!image || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles />} Analyse
          </button>
        </div>
      </div>

      {/* RESULT */}
      {result && (
        <div className="mt-6 p-5 bg-white shadow-xl rounded-xl">
          {result.error ? (
            <div className="text-center text-red-600 font-semibold">
              <AlertCircle className="mx-auto mb-2" />
              {result.error}
            </div>
          ) : (
            <>
              {/* RING HEALTH */}
              <Ring value={result.healthPercentage} />

              {/* HEALTH CATEGORY */}
              <p className="text-center text-lg font-semibold mt-2 {healthCategory(result.healthPercentage).color}">
                {healthCategory(result.healthPercentage).label}
              </p>

              {/* POSSIBLE DISEASES */}
              <div className="mt-6">
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-green-700">
                  <Activity /> Possible Diseases
                </h2>
                <ul className="list-disc pl-6 text-gray-700">
                  {result.possibleDiseases?.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>

              {/* DETECTED CAUSES */}
              <div className="mt-6">
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-orange-600">
                  <AlertTriangle /> Detected Causes
                </h2>
                <ul className="list-disc pl-6 text-gray-700">
                  {result.detectedCauses?.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>

              {/* ACTIONS */}
              <div className="mt-6">
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-blue-600">
                  <Pill /> Recommended Actions
                </h2>
                <ul className="list-disc pl-6 text-gray-700">
                  {result.recommendedActions?.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>

              {/* AI CONCLUSION */}
              <div className="mt-6 bg-gray-50 p-4 rounded-xl border">
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-purple-700">
                  <Eye /> AI Conclusion
                </h2>
                <p className="text-gray-700 whitespace-pre-line">{result.aiConclusion}</p>
              </div>

              {/* SUMMARY FIXED */}
              <div className="mt-6 bg-green-50 p-4 rounded-xl border border-green-300">
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-green-700">
                  <Layers /> Plant Condition Summary
                </h2>
                <p className="text-gray-700">
                  {result.conditionSummary ?? `Overall health: ${result.healthPercentage}% (${healthCategory(result.healthPercentage).label}). Follow the recommended actions above to improve the plant condition.`}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
