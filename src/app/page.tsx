"use client";

import Link from "next/link";
import { ArrowRight, Leaf, Scan, Shield, Zap, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Home() {
  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50 via-emerald-50/30 to-white dark:from-green-950/20 dark:via-emerald-950/10 dark:to-background min-h-[90vh] flex items-center">
        {/* Enhanced Background Pattern with glow */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-green-500/10 dark:bg-green-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-400/5 rounded-full blur-3xl"></div>
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20">
          <div className="flex flex-col items-center text-center space-y-10">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 border border-green-200/50 dark:border-green-700/50 shadow-lg shadow-green-500/10">

              <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400 animate-pulse" />
              <span className="text-xs font-semibold bg-gradient-to-r from-green-700 to-emerald-700 dark:from-green-300 dark:to-emerald-300 bg-clip-text text-transparent">
                AI-Powered Plant Disease Detection
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-5xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">

              Detect Plant Diseases with
              <br className="sm:hidden" />{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-500 bg-clip-text text-transparent dark:from-green-400 dark:via-emerald-400 dark:to-green-300">
                  AI Precision
                </span>
                <span className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-2xl -z-10"></span>
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-2xl text-lg sm:text-xl text-muted-foreground/90 font-light leading-relaxed sm:!text-center">

              Upload a photo of your plant and let our advanced AI analyze it instantly. 
              Get accurate disease detection and treatment recommendations in seconds.
            </motion.p>

            {/* Centered CTA Button with Glow Effect */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="relative group pt-4">

              <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 rounded-lg blur-xl opacity-40 group-hover:opacity-70 transition duration-500"></div>
              <Link href="/analyzer">
                <Button
                  size="lg"
                  className="relative px-10 py-7 text-base font-semibold bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-500 hover:via-emerald-500 hover:to-green-500 text-white shadow-2xl shadow-green-500/30 border border-green-400/20 transition-all duration-500 hover:scale-105 hover:shadow-green-500/50 group">

                  <Scan className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                  Analyze Plant
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                </Button>
              </Link>
            </motion.div>

            {/* Premium Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 pt-12 w-full max-w-4xl">

              <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-white/50 to-green-50/30 dark:from-white/5 dark:to-green-950/20 backdrop-blur-sm border border-green-200/20 dark:border-green-700/20 hover:border-green-300/40 dark:hover:border-green-600/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent mb-2">
                  99.9%
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground font-medium">Accuracy Rate</div>
              </div>
              
              <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-white/50 to-emerald-50/30 dark:from-white/5 dark:to-emerald-950/20 backdrop-blur-sm border border-emerald-200/20 dark:border-emerald-700/20 hover:border-emerald-300/40 dark:hover:border-emerald-600/40 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">
                    &lt; 2s
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground font-medium">Ultra-fast Analysis</div>
              </div>
              
              <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-white/50 to-green-50/30 dark:from-white/5 dark:to-green-950/20 backdrop-blur-sm border border-green-200/20 dark:border-green-700/20 hover:border-green-300/40 dark:hover:border-green-600/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent mb-2">
                  50K+
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground font-medium">Plant Diseases Covered</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white dark:bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16">

            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Choose{" "}
              <span className="text-green-700 dark:text-green-400 font-black">AI</span>{" "}
              <span className="text-foreground font-semibold">Plant Doctor</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
              Cutting-edge technology meets environmental care
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <Feature icon={Zap} title="Lightning Fast" description="Get instant results in under 2 seconds with our optimized AI models" />
            <Feature icon={Shield} title="Highly Accurate" description="99.9% accuracy rate powered by advanced deep learning algorithms" />
            <Feature icon={Leaf} title="Eco-Friendly" description="Helping farmers and gardeners reduce chemical usage and protect the environment" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-b from-green-50/50 via-emerald-50/30 to-white dark:from-green-950/10 dark:via-emerald-950/5 dark:to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-bold mb-4">

            How It Works
          </motion.h2>
          <p className="text-lg text-muted-foreground font-light mb-16">Simple, fast, and accurate</p>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <Step number="1" title="Upload Photo" description="Take or upload a clear photo of the affected plant" />
            <Step number="2" title="AI Analysis" description="Our AI processes the image and identifies diseases" />
            <Step number="3" title="Get Results" description="Receive detailed diagnosis and treatment recommendations" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16">

            <Link href="/analyzer">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-xl shadow-green-500/20 hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-300 px-8 py-6 text-base">
                Try It Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Learn More Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-16 bg-gradient-to-b from-white to-green-50/30 dark:from-background dark:to-green-950/10">

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link href="/about">
            <Button
              variant="ghost"
              size="lg"
              className="group text-base font-medium text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors">

              Learn More About{" "}
              <span className="text-green-700 dark:text-green-400 font-black ml-1">AI</span>{" "}
              <span className="text-foreground font-semibold">Plant Doctor</span>
              <ChevronDown className="ml-2 h-5 w-5 group-hover:translate-y-1 transition-transform duration-300 animate-bounce" />
            </Button>
          </Link>
        </div>
      </motion.section>
    </div>);

}

/* Helper Components */
function Feature({ icon: Icon, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}>

      <Card className="h-full border-2 hover:border-green-300/50 dark:hover:border-green-700/50 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10 group bg-gradient-to-br from-white to-green-50/30 dark:from-card dark:to-green-950/10">
        <CardHeader>
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-500/30">
            <Icon className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
        </CardHeader>
      </Card>
    </motion.div>);

}

function Step({ number, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-4">

      <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-green-500/30">
        {number}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 blur-xl opacity-40"></div>
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </motion.div>);

}