"use client";

import { Leaf, Target, Users, Lightbulb, Award, Heart, TreePine, Sprout } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
            <Leaf className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              About <span className="font-black">AI</span> <span className="font-semibold">Plant Doctor</span>
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold">
            Protecting Plants with{" "}
            <span className="text-green-600 dark:text-green-400">AI Technology</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our mission is to leverage artificial intelligence to help farmers, gardeners, and plant enthusiasts 
            identify and treat plant diseases early, promoting sustainable agriculture and healthier ecosystems.
          </p>
        </div>

        {/* Project Goal */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-3xl font-bold">Project Goal</h2>
          </div>
          <Card className="border-2 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <p className="text-muted-foreground leading-relaxed">
                The <span className="text-green-700 dark:text-green-400 font-black">AI</span>{" "}
                <span className="font-semibold">Plant Doctor</span> was created to address one of agriculture's biggest challenges: 
                early disease detection. By the time visible symptoms appear, significant damage may have already occurred. 
                Our AI-powered solution analyzes plant images in real-time, identifying diseases with 98% accuracy and 
                providing immediate treatment recommendations. This enables farmers to act quickly, reduce crop loss, 
                minimize pesticide use, and ultimately contribute to more sustainable farming practices.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Key Features */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-3xl font-bold">Key Features</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Sprout className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-xl">Advanced AI Model</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Built with state-of-the-art deep learning algorithms trained on thousands of plant disease images 
                  to ensure accurate and reliable detection.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-xl">Treatment Guidance</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Not just detection—receive detailed treatment recommendations and best practices 
                  to restore your plants to health.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <TreePine className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-xl">Eco-Conscious Design</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Designed with sustainability in mind, helping reduce unnecessary pesticide use 
                  and promoting organic treatment methods.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-xl">User-Friendly Interface</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Intuitive and accessible design ensures that anyone—from professional farmers 
                  to home gardeners—can use the tool effectively.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-center">Technology Stack</h2>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">Next.js 15</div>
                  <div className="text-sm text-muted-foreground">Framework</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">TypeScript</div>
                  <div className="text-sm text-muted-foreground">Language</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">TensorFlow</div>
                  <div className="text-sm text-muted-foreground">AI Model</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">TailwindCSS</div>
                  <div className="text-sm text-muted-foreground">Styling</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Acknowledgments */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-3xl font-bold">Acknowledgments</h2>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                We would like to express our gratitude to the open-source community for providing invaluable 
                tools and resources that made this project possible. Special thanks to:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 font-bold mt-1">•</span>
                  <span>The research community for providing publicly available plant disease datasets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 font-bold mt-1">•</span>
                  <span>Vercel and Next.js team for their excellent development platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 font-bold mt-1">•</span>
                  <span>The TensorFlow team for their powerful machine learning framework</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 font-bold mt-1">•</span>
                  <span>Agricultural experts who provided guidance on disease treatments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 font-bold mt-1">•</span>
                  <span>Our beta testers and early users for their valuable feedback</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-6 py-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Ready to Protect Your Plants?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of farmers and gardeners using <span className="text-green-700 dark:text-green-400 font-black">AI</span>{" "}
              <span className="font-semibold">Plant Doctor</span> to keep their plants healthy.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/analyzer">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                <Leaf className="mr-2 h-5 w-5" />
                Start Analyzing
              </Button>
            </Link>
            <Link href="/team">
              <Button size="lg" variant="outline" className="border-2">
                Meet the Team
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer Note */}
        <div className="text-center py-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Built with <Heart className="inline h-4 w-4 text-red-500 fill-red-500" /> by{" "}
            <span className="font-semibold text-green-600 dark:text-green-400">EcoTech Squad</span>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            © {new Date().getFullYear()} <span className="text-green-700 dark:text-green-400 font-black">AI</span>{" "}
            <span className="font-semibold">Plant Doctor</span>. Empowering sustainable agriculture through technology.
          </p>
        </div>
      </div>
    </div>
  );
}