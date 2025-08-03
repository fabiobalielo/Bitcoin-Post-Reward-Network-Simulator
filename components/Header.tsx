"use client";

import { motion } from "framer-motion";
import { Activity, Wifi, WifiOff } from "lucide-react";
import { ConnectionStatus } from "@/hooks/useWebSocket";

interface HeaderProps {
  connectionStatus: ConnectionStatus;
  lastUpdate?: Date | null;
}

export function Header({ connectionStatus, lastUpdate }: HeaderProps) {
  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="h-4 w-4 text-green-400" />;
      case "connecting":
        return <Activity className="h-4 w-4 text-yellow-400 animate-pulse" />;
      default:
        return <WifiOff className="h-4 w-4 text-red-400" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Live Data";
      case "connecting":
        return "Connecting...";
      case "disconnected":
        return "Disconnected";
      case "error":
        return "Connection Error";
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm w-full">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-slate-900">₿</span>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-white truncate">
                Bitcoin Post-Reward Simulator
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 truncate">
                Network dynamics after block rewards end
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm flex-shrink-0"
          >
            <div className="flex items-center space-x-1 sm:space-x-2">
              {getStatusIcon()}
              <span className="text-slate-300 hidden sm:inline">
                {getStatusText()}
              </span>
              <span className="text-slate-300 sm:hidden">Live</span>
            </div>
            {lastUpdate && (
              <div className="text-xs text-slate-400 hidden sm:block">
                Last update: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </header>
  );
}
