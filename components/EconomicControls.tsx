"use client";

import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { EconomicInputs, getDefaultInputs } from "@/lib/bitcoin-economics";
import { formatCurrency } from "@/lib/utils";
import { RotateCcw, Zap } from "lucide-react";

interface EconomicControlsProps {
  inputs: EconomicInputs;
  onInputsChange: (inputs: EconomicInputs) => void;
}

export function EconomicControls({
  inputs,
  onInputsChange,
}: EconomicControlsProps) {
  const handleInputChange = (
    key: keyof EconomicInputs,
    value: number | string
  ) => {
    onInputsChange({
      ...inputs,
      [key]: value,
    });
  };

  const resetToDefaults = () => {
    onInputsChange(getDefaultInputs());
  };

  // All controls in one organized list
  const allControls = [
    // Core Market Parameters
    {
      label: "Bitcoin Price",
      key: "btcPrice" as keyof EconomicInputs,
      value: inputs.btcPrice,
      min: 50000,
      max: 250000,
      step: 5000,
      format: (v: number) => formatCurrency(v),
      category: "Market"
    },
    {
      label: "Baseline Fee Rate",
      key: "baselineFeerate" as keyof EconomicInputs,
      value: inputs.baselineFeerate,
      min: 5,
      max: 100,
      step: 5,
      format: (v: number) => `${v} sat/vB`,
      category: "Market"
    },
    {
      label: "Block Size Limit",
      key: "blockLimitMB" as keyof EconomicInputs,
      value: inputs.blockLimitMB,
      min: 1,
      max: 32,
      step: 0.5,
      format: (v: number) => `${v.toFixed(1)} MB`,
      category: "Network"
    },
    {
      label: "Demand Elasticity",
      key: "elasticity" as keyof EconomicInputs,
      value: inputs.elasticity,
      min: -1.0,
      max: -0.1,
      step: 0.1,
      format: (v: number) => `${v.toFixed(1)}`,
      category: "Economics"
    },
    {
      label: "MEV Uplift",
      key: "mevUplift" as keyof EconomicInputs,
      value: inputs.mevUplift,
      min: 0,
      max: 0.2,
      step: 0.01,
      format: (v: number) => `${(v * 100).toFixed(0)}%`,
      category: "Economics"
    },
    {
      label: "Mining Cost per TH/day",
      key: "costPerTHDay" as keyof EconomicInputs,
      value: inputs.costPerTHDay,
      min: 1.0,
      max: 5.0,
      step: 0.1,
      format: (v: number) => formatCurrency(v),
      category: "Mining"
    },
    {
      label: "Profit Margin Target",
      key: "margin" as keyof EconomicInputs,
      value: inputs.margin,
      min: 0.05,
      max: 0.3,
      step: 0.05,
      format: (v: number) => `${(v * 100).toFixed(0)}%`,
      category: "Mining"
    },
    {
      label: "Pool Share",
      key: "poolShare" as keyof EconomicInputs,
      value: inputs.poolShare,
      min: 0.001,
      max: 0.05,
      step: 0.001,
      format: (v: number) => `${(v * 100).toFixed(1)}%`,
      category: "Mining"
    },
    {
      label: "Average Transaction Size",
      key: "avgTxVb" as keyof EconomicInputs,
      value: inputs.avgTxVb,
      min: 180,
      max: 400,
      step: 10,
      format: (v: number) => `${v} vB`,
      category: "Network"
    },
    {
      label: "Security Budget (% of Current)",
      key: "alpha" as keyof EconomicInputs,
      value: inputs.alpha || 0.7,
      min: 0.3,
      max: 1.0,
      step: 0.05,
      format: (v: number) => `${(v * 100).toFixed(0)}%`,
      category: "Security"
    },
    {
      label: "Daily Settlement Value",
      key: "settlementUsdDay" as keyof EconomicInputs,
      value: inputs.settlementUsdDay || 10000000000,
      min: 5000000000,
      max: 50000000000,
      step: 1000000000,
      format: (v: number) => `${formatCurrency(v / 1000000000)}B`,
      category: "Security"
    },
    {
      label: "Attack Rent Rate ($/TH/hour)",
      key: "rentRateUsdPerTHHour" as keyof EconomicInputs,
      value: inputs.rentRateUsdPerTHHour || 0.08,
      min: 0.05,
      max: 0.5,
      step: 0.01,
      format: (v: number) => formatCurrency(v),
      category: "Security"
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-6"
    >

      {/* Quick Scenarios - No card wrapper */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="h-4 w-4 text-yellow-400" />
          <h4 className="text-sm font-medium text-slate-200">Quick Scenarios</h4>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            onInputsChange({
              ...inputs,
              btcPrice: 50000,
              baselineFeerate: 10,
              elasticity: -0.2,
              baselineDemandVbDay: 200_000_000,
              mevUplift: 0.02,
            })
          }
          className="w-full p-3 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-600/50 hover:border-blue-500/50 rounded-lg transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <div className="text-sm font-medium text-slate-200 group-hover:text-blue-300">
                🛡️ Conservative
              </div>
              <div className="text-xs text-slate-400 mt-1">
                $50K BTC • Low fees • Stable demand
              </div>
            </div>
            <div className="text-xs text-slate-500 group-hover:text-blue-400">
              Safe scenario
            </div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            onInputsChange({
              ...inputs,
              btcPrice: 150000,
              baselineFeerate: 15,
              elasticity: -0.5,
              baselineDemandVbDay: 280_000_000,
              mevUplift: 0.03,
            })
          }
          className="w-full p-3 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-600/50 hover:border-green-500/50 rounded-lg transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <div className="text-sm font-medium text-slate-200 group-hover:text-green-300">
                📈 Realistic
              </div>
              <div className="text-xs text-slate-400 mt-1">
                $150K BTC • Moderate fees • Balanced
              </div>
            </div>
            <div className="text-xs text-slate-500 group-hover:text-green-400">
              Expected case
            </div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            onInputsChange({
              ...inputs,
              btcPrice: 300000,
              baselineFeerate: 25,
              elasticity: -0.8,
              baselineDemandVbDay: 400_000_000,
              mevUplift: 0.05,
            })
          }
          className="w-full p-3 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-600/50 hover:border-yellow-500/50 rounded-lg transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <div className="text-sm font-medium text-slate-200 group-hover:text-yellow-300">
                🚀 Optimistic
              </div>
              <div className="text-xs text-slate-400 mt-1">
                $300K BTC • High fees • Strong demand
              </div>
            </div>
            <div className="text-xs text-slate-500 group-hover:text-yellow-400">
              Bull scenario
            </div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            onInputsChange({
              ...inputs,
              btcPrice: 25000,
              baselineFeerate: 5,
              elasticity: -1.0,
              baselineDemandVbDay: 150_000_000,
              mevUplift: 0.01,
            })
          }
          className="w-full p-3 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-600/50 hover:border-red-500/50 rounded-lg transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <div className="text-sm font-medium text-slate-200 group-hover:text-red-300">
                ⚠️ Crisis
              </div>
              <div className="text-xs text-slate-400 mt-1">
                $25K BTC • Low fees • Weak demand
              </div>
            </div>
            <div className="text-xs text-slate-500 group-hover:text-red-400">
              Stress test
            </div>
          </div>
        </motion.button>
      </div>

      {/* All Controls - No tabs, organized by category */}
      <div className="space-y-6">
        {allControls.map((control) => (
          <div key={control.key} className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-slate-200">
                  {control.label}
                </label>
                <span className="text-xs text-slate-500 bg-slate-800/30 px-2 py-0.5 rounded">
                  {control.category}
                </span>
              </div>
              <span className="text-sm text-blue-400 font-mono bg-slate-800/50 px-2 py-1 rounded">
                {control.format(control.value)}
              </span>
            </div>
            <Slider
              value={[control.value]}
              onValueChange={([value]) => handleInputChange(control.key, value)}
              min={control.min}
              max={control.max}
              step={control.step}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>{control.format(control.min)}</span>
              <span>{control.format(control.max)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Security Budget Mode Selector */}
      <div className="pt-6 border-t border-slate-600">
        <h4 className="text-sm font-medium text-slate-300 mb-4">Security Budget Mode</h4>
        <div className="space-y-3">
          {[
            { value: "percent_of_2025", label: "% of 2025 Budget" },
            { value: "percent_of_settlement_value", label: "% of Settlement" },
            { value: "absolute_usd", label: "Absolute USD" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleInputChange("securityBudgetMode", value)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg border text-sm font-medium transition-colors ${
                inputs.securityBudgetMode === value
                  ? "border-blue-500 bg-blue-500/10 text-blue-400"
                  : "border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-700/30"
              }`}
            >
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}