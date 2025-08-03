"use client";

import { motion } from "framer-motion";
import { User, Github, Twitter } from "lucide-react";

interface AuthorInfoProps {
  variant?: "inline" | "card" | "footer";
  className?: string;
}

export function AuthorInfo({
  variant = "inline",
  className = "",
}: AuthorInfoProps) {
  const authorData = {
    name: "Fabio Balielo",
    title: "Bitcoin Economics Researcher",
    project: "EndPow - Bitcoin Post-Reward Economics",
    twitter: "@fabio_balielo",
    github: "fabiobalielo",
    expertise: ["Bitcoin Economics", "Network Security", "Fee Market Dynamics"],
  };

  if (variant === "footer") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className={`text-center py-8 border-t border-slate-700/50 ${className}`}
      >
        <p className="text-sm text-slate-400">
          Advanced economic modeling and analysis by{" "}
          <span className="text-blue-400 font-medium">{authorData.name}</span>
        </p>
        <p className="text-xs text-slate-500 mt-1">{authorData.project}</p>
      </motion.div>
    );
  }

  if (variant === "card") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-slate-800/50 border border-slate-700 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center space-x-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {authorData.name}
            </h3>
            <p className="text-sm text-slate-400">{authorData.title}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-slate-300">
            <span className="text-blue-400 font-medium">Project:</span>{" "}
            {authorData.project}
          </p>

          <div className="flex items-center space-x-4 text-sm">
            <a
              href={`https://twitter.com/${authorData.twitter.replace(
                "@",
                ""
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Twitter className="h-4 w-4" />
              <span>{authorData.twitter}</span>
            </a>
            <a
              href={`https://github.com/${authorData.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-slate-400 hover:text-slate-300 transition-colors"
            >
              <Github className="h-4 w-4" />
              <span>{authorData.github}</span>
            </a>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default inline variant
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`inline-flex items-center space-x-2 text-sm text-slate-400 ${className}`}
    >
      <span>by</span>
      <span className="text-blue-400 font-medium">{authorData.name}</span>
    </motion.div>
  );
}
