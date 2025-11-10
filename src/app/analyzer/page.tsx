"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Scan, Eye, Sparkles, Zap, Activity, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyzerSelectionPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 border border-green-200/50 dark:border-green-700/50 shadow-lg shadow-green-500/10"
          >
            <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400 animate-pulse" />
            <span className="text-xs font-semibold text-green-700 dark:text-green-300">
              Choose Your Analysis Method
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl font-bold"
          >
            Select <span className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">Analyzer Mode</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Choose between standard analysis or advanced 3D deep analysis for comprehensive insights
          </motion.p>
        </div>

        {/* Analyzer Options */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Standard Plant Analyzer */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link href="/analyzer/standard">
              <Card className="h-full border-2 border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20 cursor-pointer group bg-gradient-to-br from-white to-green-50/50 dark:from-card dark:to-green-950/20">
                <CardHeader className="space-y-4 pb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-500/30">
                    <Scan className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      Plant Analyzer
                      <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </CardTitle>
                    <CardDescription className="text-base">
                      Fast and accurate disease detection
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-green-700 dark:text-green-300 uppercase tracking-wide">
                      Features:
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400 mt-1.5" />
                        <span>Instant AI-powered disease detection</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400 mt-1.5" />
                        <span>Multi-stage damage assessment (0-3)</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400 mt-1.5" />
                        <span>Detailed symptoms and care recommendations</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400 mt-1.5" />
                        <span>Health percentage scoring</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400 mt-1.5" />
                        <span>Choose between Gemini or Groq AI</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Best for:</span>
                      <span className="font-semibold text-green-700 dark:text-green-300">Quick diagnosis</span>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg group-hover:shadow-xl transition-all">
                    Start Standard Analysis
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          {/* 3D Deep Analyzer */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Link href="/analyzer/3d-deep">
              <Card className="h-full border-2 border-cyan-200 dark:border-cyan-800 hover:border-cyan-400 dark:hover:border-cyan-600 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20 cursor-pointer group bg-gradient-to-br from-white to-cyan-50/50 dark:from-card dark:to-cyan-950/20 relative overflow-hidden">
                {/* Premium Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold rounded-full shadow-lg z-10">
                  ADVANCED
                </div>

                <CardHeader className="space-y-4 pb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/30">
                    <Eye className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      3D Deep Analyzer
                      <Layers className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    </CardTitle>
                    <CardDescription className="text-base">
                      Comprehensive zone-by-zone 3D visualization
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-cyan-700 dark:text-cyan-300 uppercase tracking-wide">
                      Features:
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400 mt-1.5" />
                        <span>Interactive 3D leaf visualization with 360° rotation</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400 mt-1.5" />
                        <span>Zone-by-zone damage mapping (9 leaf zones)</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400 mt-1.5" />
                        <span>Color-coded severity indicators (red/orange/yellow/green)</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400 mt-1.5" />
                        <span>Detailed per-zone treatment recommendations</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400 mt-1.5" />
                        <span>Deep AI analysis with enhanced accuracy</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400 mt-1.5" />
                        <span>Interactive hover and click zone exploration</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-cyan-200 dark:border-cyan-800">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Best for:</span>
                      <span className="font-semibold text-cyan-700 dark:text-cyan-300">Detailed insights</span>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg group-hover:shadow-xl transition-all">
                    Start 3D Deep Analysis
                    <Activity className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-xl">Quick Comparison</CardTitle>
              <CardDescription>Choose the analyzer that fits your needs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-sm">Feature</th>
                      <th className="text-center py-3 px-4 font-semibold text-sm text-green-700 dark:text-green-300">Plant Analyzer</th>
                      <th className="text-center py-3 px-4 font-semibold text-sm text-cyan-700 dark:text-cyan-300">3D Deep Analyzer</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b">
                      <td className="py-3 px-4">Disease Detection</td>
                      <td className="text-center py-3 px-4">✅</td>
                      <td className="text-center py-3 px-4">✅</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Health Percentage</td>
                      <td className="text-center py-3 px-4">✅</td>
                      <td className="text-center py-3 px-4">✅</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Care Recommendations</td>
                      <td className="text-center py-3 px-4">✅</td>
                      <td className="text-center py-3 px-4">✅ Enhanced</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">3D Visualization</td>
                      <td className="text-center py-3 px-4">❌</td>
                      <td className="text-center py-3 px-4">✅</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Zone-by-Zone Analysis</td>
                      <td className="text-center py-3 px-4">❌</td>
                      <td className="text-center py-3 px-4">✅ 9 Zones</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Interactive Exploration</td>
                      <td className="text-center py-3 px-4">❌</td>
                      <td className="text-center py-3 px-4">✅ 360° Rotation</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Analysis Time</td>
                      <td className="text-center py-3 px-4">&lt; 2s</td>
                      <td className="text-center py-3 px-4">&lt; 3s</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}