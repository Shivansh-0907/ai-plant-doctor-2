"use client";

import Link from "next/link";
import { useState } from "react";
import { Moon, Sun, Menu, X, Leaf } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";
import ProfileDropdown from "./ProfileDropdown";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const navLinks = [
  { href: "/", label: "Home" },
  { href: "/analyzer", label: "Analyzer" },
  { href: "/team", label: "Team" },
  { href: "/about", label: "About" }];


  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex h-16 items-center justify-between">
          {/* 🌿 Left Section: Logo + Title */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 p-2 shadow-sm transition-transform duration-300 group-hover:scale-110">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              <span className="text-green-700 dark:text-green-400 font-black">
                AI
              </span>{" "}
              <span className="text-foreground font-semibold">Plant Doctor</span>
            </span>
          </Link>

          {/* 🌐 Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-center min-w-[90px] px-5 py-2 text-sm font-semibold text-foreground/80 hover:text-green-600 dark:hover:text-green-400 hover:bg-accent rounded-lg transition-all duration-200">

                {link.label}
              </Link>
            )}
          </div>

          {/* 🧭 Right Section: Profile + Theme Toggle + Mobile Button */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-full hover:bg-accent transition-colors">

              {theme === "dark" ?
              <Sun className="h-5 w-5 text-yellow-400" /> :

              <Moon className="h-5 w-5 text-slate-700" />
              }
            </Button>

            {/* Profile Dropdown (Desktop) */}
            <div className="hidden md:block">
              <ProfileDropdown />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-md text-foreground hover:bg-accent"
              aria-label="Toggle menu">

              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* 📱 Mobile Menu */}
        {isOpen &&
        <div className="md:hidden py-3 space-y-2 animate-in slide-in-from-top-2">
            {navLinks.map((link) =>
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm font-medium text-foreground/80 hover:text-green-600 dark:hover:text-green-400 hover:bg-accent rounded-md transition-colors">

                {link.label}
              </Link>
          )}

            {/* Profile Dropdown for Mobile */}
            <div className="pt-3 border-t border-border/50">
              <ProfileDropdown />
            </div>
          </div>
        }
      </div>
    </nav>);

}