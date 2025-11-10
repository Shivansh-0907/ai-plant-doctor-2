import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";

// ✅ Metadata must remain in a server component (no "use client" above)
export const metadata: Metadata = {
  title: "AI Plant Doctor - Detect Plant Diseases with AI",
  description:
    "AI-powered plant disease detection using image analysis. By EcoTech Squad.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* ✅ Add Google Search Console meta tag here */}
      <head>
        <meta
          name="google-site-verification"
          content="GgQlj3DUvwkwb4iZLngw8AyuSm2HmVMxgflI-L2Vnts"
        />
      </head>

      <body className="antialiased">
        <ThemeProvider defaultTheme="light" storageKey="ai-plant-doctor-theme">
          {/* 🧩 Error and Visual Debugging Tools */}
          <ErrorReporter />

          {/* 🧭 Route Messenger Script */}
          <Script
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/route-messenger.js"
            strategy="afterInteractive"
            data-target-origin="*"
            data-message-type="ROUTE_CHANGE"
            data-include-search-params="true"
            data-only-in-iframe="true"
            data-debug="true"
            data-custom-data='{"appName": "AI Plant Doctor", "version": "1.0.0"}'
          />

          {/* 🧱 App Layout */}
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>

          {/* 🔔 Notifications */}
          <Toaster richColors position="top-center" />

          {/* 🧩 Visual Editor Messenger */}
          <VisualEditsMessenger />

          {/* 💬 Chatbase Chatbot Integration */}
          <Script id="chatbase-init" strategy="afterInteractive">
            {`
              window.chatbaseConfig = {
                chatbotId: "tjTsIK4-b_sv4cNQBnJ9c",
                domain: "www.chatbase.co",
                position: "bottom-right",
                customColors: {
                  button: "#22c55e",
                  chatBackground: "#f0fdf4"
                },
                welcomeMessage: "🌱 Hi! I'm Dr. Leafy — your AI Plant Doctor assistant!"
              };

              (function() {
                var script = document.createElement('script');
                script.src = "https://www.chatbase.co/embed.min.js";
                script.defer = true;
                script.onload = () => console.log("✅ Chatbase loaded successfully");
                document.head.appendChild(script);
              })();
            `}
          </Script>

          {/* 🌿 Breathing Glow Effect for Chatbase Icon */}
          <Script id="chatbase-breathing-effect" strategy="afterInteractive">
            {`
              const style = document.createElement('style');
              style.innerHTML = \`
                @keyframes breatheGlow {
                  0%, 100% {
                    transform: scale(1);
                    filter: drop-shadow(0 0 6px rgba(52, 211, 153, 0.5));
                  }
                  50% {
                    transform: scale(1.12);
                    filter: drop-shadow(0 0 16px rgba(34, 197, 94, 0.9));
                  }
                }
              \`;
              document.head.appendChild(style);

              function applyBreathingToChatIcon() {
                const chatIcon = document.querySelector('img[alt][src*="chatbase.co/storage"]');
                if (chatIcon) {
                  chatIcon.style.animation = "breatheGlow 3s ease-in-out infinite";
                  chatIcon.style.transition = "all 0.3s ease-in-out";
                  chatIcon.style.borderRadius = "50%";
                  console.log("💚 Dr. Leafy chatbot breathing glow applied!");
                } else {
                  setTimeout(applyBreathingToChatIcon, 1000);
                }
              }

              // keep retrying until icon appears
              let tries = 0;
              const interval = setInterval(() => {
                applyBreathingToChatIcon();
                if (++tries > 20) clearInterval(interval);
              }, 1000);
            `}
          </Script>
        </ThemeProvider>
      </body>
    </html>
  );
}
