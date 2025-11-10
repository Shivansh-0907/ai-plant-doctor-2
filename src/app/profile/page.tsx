"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Calendar, Shield, Loader2, ArrowLeft } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const getInitial = (name: string) => {
    return name?.charAt(0).toUpperCase() || "U";
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-green-50 via-emerald-50/30 to-white dark:from-green-950/20 dark:via-emerald-950/10 dark:to-background pt-8">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 right-20 w-96 h-96 bg-green-500/10 dark:bg-green-400/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-400/5 rounded-full blur-3xl"></div>

      <div className="container relative z-10 mx-auto px-4 py-16">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/">
            <Button variant="ghost" className="group">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl"
        >
          {/* Page Title */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">
              Profile <span className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">Overview</span>
            </h1>
            <p className="text-muted-foreground">Manage your account information</p>
          </div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl border-2 border-green-200/50 dark:border-green-700/50 bg-white/70 dark:bg-card/70 backdrop-blur-xl shadow-2xl shadow-green-500/10"
          >
            {/* Header with Avatar */}
            <div className="relative h-32 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 dark:from-green-700 dark:via-emerald-700 dark:to-green-700">
              <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
              <div className="absolute -bottom-16 left-8">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="h-32 w-32 rounded-full border-4 border-background shadow-xl"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full border-4 border-background bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-4xl shadow-xl">
                    {getInitial(session.user.name || "")}
                  </div>
                )}
                <div className="absolute bottom-2 right-2 h-6 w-6 bg-green-500 rounded-full border-4 border-background"></div>
              </div>
            </div>

            {/* User Info */}
            <div className="pt-20 px-8 pb-8">
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-1">{session.user.name}</h2>
                <p className="text-muted-foreground">{session.user.email}</p>
              </div>

              {/* Info Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Email Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10 border border-blue-200/50 dark:border-blue-800/50"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Email Address</p>
                      <p className="text-base font-semibold break-all">{session.user.email}</p>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-xs font-medium text-green-700 dark:text-green-400">
                        <Shield className="h-3 w-3" />
                        {session.user.emailVerified ? "Verified" : "Unverified"}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Account Created Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-purple-50/50 to-purple-100/30 dark:from-purple-950/20 dark:to-purple-900/10 border border-purple-200/50 dark:border-purple-800/50"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Member Since</p>
                      <p className="text-base font-semibold">
                        {session.user.createdAt ? formatDate(session.user.createdAt) : "Recently"}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* User ID Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 dark:from-emerald-950/20 dark:to-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/50"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground mb-1">User ID</p>
                      <p className="text-base font-mono font-semibold text-xs break-all">{session.user.id}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Account Type Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-green-50/50 to-green-100/30 dark:from-green-950/20 dark:to-green-900/10 border border-green-200/50 dark:border-green-800/50"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Account Type</p>
                      <p className="text-base font-semibold">Standard User</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Full access to <span className="text-green-700 dark:text-green-400 font-black">AI</span>{" "}
                        <span className="font-semibold">Plant Doctor</span> features
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Bottom Glow */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500"></div>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-8 p-6 rounded-xl bg-gradient-to-br from-white/50 to-green-50/30 dark:from-card/50 dark:to-green-950/20 backdrop-blur-sm border border-green-200/30 dark:border-green-700/30"
          >
            <h3 className="text-lg font-semibold mb-2">About Your Account</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your <span className="text-green-700 dark:text-green-400 font-black">AI</span>{" "}
              <span className="font-semibold">Plant Doctor</span> account gives you access to our AI-powered plant disease detection system. 
              You can upload plant images, receive instant analysis, and get treatment recommendations. 
              Your data is secure and your privacy is protected.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}