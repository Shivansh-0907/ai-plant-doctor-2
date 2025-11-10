"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  LogOut, 
  Users, 
  UserCheck, 
  ChevronDown,
  Loader2,
  RefreshCw
} from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";

export default function ProfileDropdown() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Fetch user stats when dropdown opens
  useEffect(() => {
    if (isOpen && !isLoadingStats) {
      fetchStats();
    }
  }, [isOpen]);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await fetch("/api/user-stats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats({ totalUsers: data.totalUsers, activeUsers: data.activeUsers });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleSwitchAccount = async () => {
    const token = localStorage.getItem("bearer_token");

    const { error } = await authClient.signOut({
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    if (error?.code) {
      toast.error("Failed to switch account. Please try again.");
    } else {
      localStorage.removeItem("bearer_token");
      toast.success("Please sign in with a different account");
      refetch();
      setIsOpen(false);
      router.push("/login");
    }
  };

  const handleSignOut = async () => {
    const token = localStorage.getItem("bearer_token");

    const { error } = await authClient.signOut({
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    if (error?.code) {
      toast.error("Failed to sign out. Please try again.");
    } else {
      localStorage.removeItem("bearer_token");
      toast.success("Signed out successfully");
      refetch();
      setIsOpen(false);
      router.push("/");
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center">
        <Loader2 className="h-5 w-5 animate-spin text-green-600" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <button className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors rounded-md hover:bg-accent">
            Login
          </button>
        </Link>
        <Link href="/register">
          <button className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-md shadow-md hover:shadow-lg transition-all">
            Sign Up
          </button>
        </Link>
      </div>
    );
  }

  const getInitial = (name: string) => {
    return name?.charAt(0).toUpperCase() || "U";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-accent/50 transition-all duration-200 group"
        aria-label="User menu"
      >
        {/* Avatar */}
        <div className="relative">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="h-9 w-9 rounded-full border-2 border-green-500/30 group-hover:border-green-500/50 transition-all"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-green-500/30 group-hover:shadow-green-500/50 transition-all">
              {getInitial(session.user.name || "")}
            </div>
          )}
          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>
        </div>

        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-72 origin-top-right z-50"
          >
            <div className="relative overflow-hidden rounded-2xl border-2 border-green-200/50 dark:border-green-700/50 bg-white/80 dark:bg-card/80 backdrop-blur-xl shadow-2xl shadow-green-500/20">
              {/* User Info Section */}
              <div className="p-4 border-b border-border/50 bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/10">
                <div className="flex items-center gap-3">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="h-12 w-12 rounded-full border-2 border-green-500/50 shadow-md"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg shadow-green-500/30">
                      {getInitial(session.user.name || "")}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                {/* Profile Overview */}
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-green-50/50 dark:hover:bg-green-950/20 transition-all group"
                >
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                    <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Profile Overview</p>
                    <p className="text-xs text-muted-foreground">View your account info</p>
                  </div>
                </Link>

                {/* Switch Account */}
                <button
                  onClick={handleSwitchAccount}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-all group mt-1"
                >
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors">
                    <RefreshCw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">Switch Account</p>
                    <p className="text-xs text-muted-foreground">Sign in with another account</p>
                  </div>
                </button>

                {/* Divider */}
                <div className="my-2 border-t border-border/50"></div>

                {/* Total Users */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Total Users</p>
                    <p className="text-xs text-muted-foreground">
                      {isLoadingStats ? (
                        <Loader2 className="h-3 w-3 animate-spin inline" />
                      ) : (
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {stats.totalUsers.toLocaleString()}
                        </span>
                      )}
                      {!isLoadingStats && " registered"}
                    </p>
                  </div>
                </div>

                {/* Active Users */}
                <div className="mt-2 flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 dark:from-emerald-950/20 dark:to-emerald-900/10">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Active Users</p>
                    <p className="text-xs text-muted-foreground">
                      {isLoadingStats ? (
                        <Loader2 className="h-3 w-3 animate-spin inline" />
                      ) : (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {stats.activeUsers.toLocaleString()}
                        </span>
                      )}
                      {!isLoadingStats && " online now"}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="my-2 border-t border-border/50"></div>

                {/* Logout */}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all group"
                >
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                    <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Logout</p>
                    <p className="text-xs text-muted-foreground">Sign out of your account</p>
                  </div>
                </button>
              </div>

              {/* Bottom Glow */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}