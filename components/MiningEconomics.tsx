"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BitcoinMetrics } from "@/lib/bitcoin-api";
import {
  MiningEconomicsCalculator,
  formatHashrate,
  formatProfitability,
} from "@/lib/mining-economics";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  DollarSign,
  AlertTriangle,
  Factory,
  Calculator,
  Target,
} from "lucide-react";

interface MiningEconomicsProps {
  data: BitcoinMetrics | null;
  simulationParams: {
    btcPrice: number;
    txDemandMultiplier: number;
    minerCostPerTH: number;
    blockspaceLimit: number;
    feeMultiplier: number;
  };
  isLoading: boolean;
}

export function MiningEconomics({
  data,
  simulationParams,
  isLoading,
}: MiningEconomicsProps) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <div className="h-4 bg-slate-700 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-slate-700 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate current mining economics (with block rewards)
  const currentBlockReward = 3.125; // BTC per block

  // Use a realistic pool size (0.5% of network = ~2 EH/s for more realistic costs)
  const poolHashrate = data.hashrate * 0.005; // 0.5% of network hashrate

  const currentMetrics = MiningEconomicsCalculator.calculateMiningMetrics({
    poolHashrate: poolHashrate,
    networkHashrate: data.hashrate,
    btcPrice: data.price,
    avgFeeRate: data.avgFeeRate,
    blockSize: 4000000, // Current block size limit
    electricityCost: 0.08, // $0.08/kWh standard rate
  });

  // Add block reward to current revenue
  const currentDailyBlockReward =
    currentMetrics.dailyBlocks * currentBlockReward * data.price;
  const currentTotalRevenue =
    currentMetrics.dailyRevenue + currentDailyBlockReward;
  const currentTotalProfit = currentTotalRevenue - currentMetrics.dailyExpenses;
  const currentProfitMargin = (currentTotalProfit / currentTotalRevenue) * 100;

  // Calculate post-reward mining economics (fees only)
  const postRewardMetrics = MiningEconomicsCalculator.calculateMiningMetrics({
    poolHashrate: poolHashrate,
    networkHashrate: data.hashrate,
    btcPrice: simulationParams.btcPrice,
    avgFeeRate: data.avgFeeRate * simulationParams.feeMultiplier,
    blockSize: simulationParams.blockspaceLimit,
    electricityCost: 0.08, // Standard electricity rate
  });

  // Calculate sustainable hashrate
  const sustainableHashrate =
    MiningEconomicsCalculator.calculateHashrateSustainability({
      btcPrice: simulationParams.btcPrice,
      avgFeeRate: data.avgFeeRate * simulationParams.feeMultiplier,
      blockSize: simulationParams.blockspaceLimit,
      electricityCost: 0.08,
      targetProfitMargin: 10,
    });

  const hashrateDrop =
    ((data.hashrate - sustainableHashrate) / data.hashrate) * 100;

  const currentProfitability = formatProfitability(currentProfitMargin);
  const postRewardProfitability = formatProfitability(
    postRewardMetrics.profitMargin
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Factory className="h-6 w-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Mining Pool Economics</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Mining Economics */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-green-400 flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Current Mining (With Block Rewards)</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400">Daily Revenue</p>
                <p className="text-lg font-bold text-white">
                  {formatCurrency(currentTotalRevenue)}
                </p>
                <p className="text-xs text-green-400">
                  Block Rewards: {formatCurrency(currentDailyBlockReward)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Daily Expenses</p>
                <p className="text-lg font-bold text-white">
                  {formatCurrency(currentMetrics.dailyExpenses)}
                </p>
                <p className="text-xs text-slate-400">
                  Electricity:{" "}
                  <span className="text-white">
                    {formatCurrency(currentMetrics.dailyExpenses * 0.6)}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Daily Profit</p>
                <p
                  className={`text-lg font-bold ${
                    currentTotalProfit > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {formatCurrency(currentTotalProfit)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Profit Margin</p>
                <p className={`text-lg font-bold text-white`}>
                  {currentProfitMargin.toFixed(2)}%
                </p>
                <p className={`text-xs ${currentProfitability.color}`}>
                  {currentProfitability.text}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Post-Reward Mining Economics */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-orange-400 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Post-Reward Mining (Fees Only)</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400">Daily Revenue</p>
                <p className="text-lg font-bold text-white">
                  {formatCurrency(postRewardMetrics.dailyRevenue)}
                </p>
                <p className="text-xs text-orange-400">
                  Fees Only: {formatCurrency(postRewardMetrics.dailyRevenue)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Daily Expenses</p>
                <p className="text-lg font-bold text-white">
                  {formatCurrency(postRewardMetrics.dailyExpenses)}
                </p>
                <p className="text-xs text-slate-400">
                  <span className="text-white">Same operational costs</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Daily Profit</p>
                <p
                  className={`text-lg font-bold ${
                    postRewardMetrics.dailyProfit > 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {formatCurrency(postRewardMetrics.dailyProfit)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Profit Margin</p>
                <p className={`text-lg font-bold text-white`}>
                  {postRewardMetrics.profitMargin.toFixed(2)}%
                </p>
                <p className={`text-xs ${postRewardProfitability.color}`}>
                  {postRewardProfitability.text}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Break-Even Analysis */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Break-Even Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400">Break-Even BTC Price</p>
                <p className="text-xl font-bold text-white">
                  {postRewardMetrics.breakEvenPrice === Infinity
                    ? "N/A"
                    : formatCurrency(postRewardMetrics.breakEvenPrice)}
                </p>
                <p className="text-xs text-slate-400">
                  Price needed to cover all costs
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">ROI Timeline</p>
                <p className="text-xl font-bold text-white">
                  {postRewardMetrics.roiMonths === Infinity
                    ? "Never"
                    : `${postRewardMetrics.roiMonths.toFixed(2)} months`}
                </p>
                <p className="text-xs text-slate-400">
                  Time to recover hardware investment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Network Sustainability */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Network Sustainability</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400">
                  Current Network Hashrate
                </p>
                <p className="text-xl font-bold text-white">
                  {formatHashrate(data.hashrate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">
                  Sustainable Hashrate (10% margin)
                </p>
                <p className="text-xl font-bold text-white">
                  {formatHashrate(sustainableHashrate)}
                </p>
                <p
                  className={`text-xs ${
                    hashrateDrop > 50
                      ? "text-red-400"
                      : hashrateDrop > 20
                      ? "text-yellow-400"
                      : "text-green-400"
                  }`}
                >
                  {hashrateDrop > 0
                    ? `${hashrateDrop.toFixed(2)}% drop expected`
                    : "Hashrate sustainable"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">
                  Network Security Impact
                </p>
                <p
                  className={`text-lg font-bold ${
                    hashrateDrop > 50
                      ? "text-red-400"
                      : hashrateDrop > 20
                      ? "text-yellow-400"
                      : "text-green-400"
                  }`}
                >
                  {hashrateDrop > 70
                    ? "Critical Risk"
                    : hashrateDrop > 50
                    ? "High Risk"
                    : hashrateDrop > 20
                    ? "Medium Risk"
                    : "Low Risk"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Economic Summary */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-yellow-400">
            Economic Impact Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-slate-700/30 rounded">
              <p className="text-slate-400">Revenue Drop</p>
              <p className="text-2xl font-bold text-red-400">
                {(
                  ((currentTotalRevenue - postRewardMetrics.dailyRevenue) /
                    currentTotalRevenue) *
                  100
                ).toFixed(2)}
                %
              </p>
            </div>
            <div className="text-center p-3 bg-slate-700/30 rounded">
              <p className="text-slate-400">Miners at Risk</p>
              <p className="text-2xl font-bold text-yellow-400">
                {postRewardMetrics.profitMargin < 0
                  ? "100.00%"
                  : `${Math.max(0, hashrateDrop).toFixed(2)}%`}
              </p>
            </div>
            <div className="text-center p-3 bg-slate-700/30 rounded">
              <p className="text-slate-400">Security Budget</p>
              <p className="text-2xl font-bold text-blue-400">
                {formatCurrency(postRewardMetrics.dailyRevenue * 144)}{" "}
                {/* Network-wide daily */}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
