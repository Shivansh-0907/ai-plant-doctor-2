"use client";

import Link from "next/link";
import { Leaf, Github, Mail, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/50 backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 p-2">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                <span className="text-green-700 dark:text-green-400 font-black">AI</span>{" "}
                <span className="text-foreground font-semibold">Plant Doctor</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered plant disease detection for a healthier tomorrow.
            </p>
            <p className="text-xs text-muted-foreground">
              By <span className="font-semibold text-green-600 dark:text-green-400">EcoTech Squad</span>
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/analyzer" className="text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  Analyzer
                </Link>
              </li>
              <li>
                <Link href="/team" className="text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  Team
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="mailto:ecotechsquad@gmail.com"
                className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-border/40">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} <span className="text-green-700 dark:text-green-400 font-black">AI</span>{" "}
              <span className="font-semibold">Plant Doctor</span>. All rights reserved.
            </p>
            <div className="flex flex-col items-center sm:items-end space-y-1">
              <p className="text-xs text-muted-foreground flex items-center">
                Made with <Heart className="h-3 w-3 mx-1 text-red-500 fill-red-500" /> for the planet
              </p>
              <p className="text-xs text-muted-foreground/70">
                Results may occasionally be inaccurate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}