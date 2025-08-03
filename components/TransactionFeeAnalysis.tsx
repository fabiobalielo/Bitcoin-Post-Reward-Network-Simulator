"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  EconomicInputs,
  EconomicOutputs,
  usd,
  fmtChange,
} from "@/lib/bitcoin-economics";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calculator,
  Target,
  Clock,
} from "lucide-react";

interface TransactionFeeAnalysisProps {
  inputs: EconomicInputs;
  currentResults: EconomicOutputs;
  postRewardResults: EconomicOutputs;
  isLoading: boolean;
}

export function TransactionFeeAnalysis({
  inputs,
  currentResults,
  postRewardResults,
  isLoading,
}: TransactionFeeAnalysisProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-700 rounded animate-pulse" />
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
      </div>
    );
  }

  // GOLDEN EQUATIONS - Fee/tx USD = (f * avgTxVb / 1e8) * P
  const currentFeePerTx =
    ((inputs.baselineFeerate * inputs.avgTxVb) / 100000000) * inputs.btcPrice;
  const postRewardFeePerTx =
    ((postRewardResults.optimalFeerate * inputs.avgTxVb) / 100000000) *
    inputs.btcPrice;
  const feeIncreaseMultiplier =
    postRewardResults.optimalFeerate / inputs.baselineFeerate;

  // Calculate daily fee totals
  const currentDailyFees = currentResults.dailyFeeRevenueUSD;
  const postRewardDailyFees = postRewardResults.dailyFeeRevenueUSD;

  // Calculate fee burden for different user types
  const casualUserTxPerMonth = 4; // 1 tx per week
  const activeUserTxPerMonth = 20; // ~5 tx per week
  const businessUserTxPerMonth = 100; // Daily transactions

  const userTypes = [
    {
      type: "Casual User",
      txPerMonth: casualUserTxPerMonth,
      currentMonthlyCost: currentFeePerTx * casualUserTxPerMonth,
      postRewardMonthlyCost: postRewardFeePerTx * casualUserTxPerMonth,
      icon: Clock,
      color: "text-green-400",
    },
    {
      type: "Active User",
      txPerMonth: activeUserTxPerMonth,
      currentMonthlyCost: currentFeePerTx * activeUserTxPerMonth,
      postRewardMonthlyCost: postRewardFeePerTx * activeUserTxPerMonth,
      icon: Zap,
      color: "text-yellow-400",
    },
    {
      type: "Business User",
      txPerMonth: businessUserTxPerMonth,
      currentMonthlyCost: currentFeePerTx * businessUserTxPerMonth,
      postRewardMonthlyCost: postRewardFeePerTx * businessUserTxPerMonth,
      icon: TrendingUp,
      color: "text-orange-400",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center space-x-3">
        <DollarSign className="h-6 w-6 text-yellow-400" />
        <h2 className="text-2xl font-bold text-white">
          Transaction Fee Impact Analysis
        </h2>
      </div>

      {/* Fee Comparison Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-700/30 rounded-lg p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-1">Current Fee Rate</p>
            <p className="text-3xl font-bold text-white">
              {inputs.baselineFeerate} sat/vB
            </p>
            <p className="text-sm text-green-400">Normal network conditions</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-1">Post-Reward Fee Rate</p>
            <p className="text-3xl font-bold text-orange-400">
              {postRewardResults.optimalFeerate.toFixed(0)} sat/vB
            </p>
            <p className="text-sm text-orange-400">
              {feeIncreaseMultiplier.toFixed(1)}x increase (
              {fmtChange(postRewardFeePerTx, currentFeePerTx)})
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-1">Fee per Transaction</p>
            <p className="text-3xl font-bold text-yellow-400">
              {formatCurrency(postRewardFeePerTx)}
            </p>
            <p className="text-sm text-slate-400">
              vs {formatCurrency(currentFeePerTx)} today
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fee Revenue Analysis */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Network Fee Revenue</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">
                    Current Daily Fee Revenue
                  </span>
                  <span className="text-lg font-bold text-white">
                    {formatCurrency(currentDailyFees)}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-green-400 h-2 rounded-full"
                    style={{
                      width: `${
                        (currentDailyFees / postRewardDailyFees) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">
                    Post-Reward Daily Fee Revenue
                  </span>
                  <span className="text-lg font-bold text-orange-400">
                    {formatCurrency(postRewardDailyFees)}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-orange-400 h-2 rounded-full"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-600">
                {/* Hide "replace rewards" in post-reward mode, show target status */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">
                    {currentResults.networkRevenueUSD >
                    postRewardResults.networkRevenueUSD
                      ? "Revenue Increase Needed"
                      : "Security Budget Target"}
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      (postRewardResults as any).solverInfo?.targetMet
                        ? "text-green-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {(postRewardResults as any).solverInfo?.targetMet
                      ? "On target (±0.25%)"
                      : fmtChange(postRewardDailyFees, currentDailyFees)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {(postRewardResults as any).solverInfo?.targetMet
                    ? `Target: ${formatCurrency(
                        (postRewardResults as any).solverInfo?.targetFeesUsd ||
                          0
                      )} (MEV ${(inputs.mevUplift * 100).toFixed(
                        0
                      )}% ⇒ ${formatCurrency(
                        postRewardResults.securityBudgetTargetUSD
                      )})`
                    : currentResults.networkRevenueUSD >
                      postRewardResults.networkRevenueUSD
                    ? `To replace ${formatCurrency(
                        Math.max(
                          0,
                          currentResults.networkRevenueUSD - postRewardDailyFees
                        )
                      )} in block rewards`
                    : `Gap: ${formatCurrency(
                        Math.abs(
                          (postRewardResults as any).solverInfo?.targetFeesUsd -
                            postRewardDailyFees
                        )
                      )}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Impact Analysis */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>User Fee Impact</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userTypes.map((user, index) => (
                <div key={user.type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <user.icon className={`h-4 w-4 ${user.color}`} />
                      <span className="text-sm font-medium text-slate-300">
                        {user.type}
                      </span>
                      <span className="text-xs text-slate-500">
                        ({user.txPerMonth} tx/month)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Current</p>
                      <p className="font-bold text-white">
                        {formatCurrency(user.currentMonthlyCost)}/month
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Post-Reward</p>
                      <p className={`font-bold ${user.color}`}>
                        {formatCurrency(user.postRewardMonthlyCost)}/month
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400">
                    Monthly increase:{" "}
                    {formatCurrency(
                      user.postRewardMonthlyCost - user.currentMonthlyCost
                    )}
                    (
                    {fmtChange(
                      user.postRewardMonthlyCost,
                      user.currentMonthlyCost
                    )}
                    )
                  </div>

                  {index < userTypes.length - 1 && (
                    <div className="border-b border-slate-700" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fee Market Dynamics */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Fee Market Dynamics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400">
                  Fees per Block (Current)
                </p>
                <p className="text-lg font-bold text-white">
                  {formatCurrency(currentResults.dailyFeeRevenueUSD / 144)}
                </p>
                <p className="text-xs text-slate-400">
                  {(
                    currentResults.dailyFeeRevenueUSD /
                    144 /
                    inputs.btcPrice
                  ).toFixed(4)}{" "}
                  BTC
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">
                  Fees per Block (Post-Reward)
                </p>
                <p className="text-lg font-bold text-orange-400">
                  {formatCurrency(postRewardResults.dailyFeeRevenueUSD / 144)}
                </p>
                <p className="text-xs text-slate-400">
                  {(
                    postRewardResults.dailyFeeRevenueUSD /
                    144 /
                    inputs.btcPrice
                  ).toFixed(4)}{" "}
                  BTC
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-600">
              <h4 className="text-sm font-medium text-slate-300 mb-3">
                Economic Pressure Points
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Demand Elasticity:</span>
                  <span className="text-white">{inputs.elasticity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Expected Demand Drop:</span>
                  <span className="text-red-400">
                    {fmtChange(
                      postRewardResults.demandVbPerDay,
                      inputs.baselineDemandVbDay
                    ).replace("+", "")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fee Sensitivity:</span>
                  <span className="text-yellow-400">
                    {(1 / Math.abs(inputs.elasticity)).toFixed(1)}x price → 1x
                    demand
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fee Comparison with Other Networks */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Competitive Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-400 mb-2">
                  Post-Reward Bitcoin Transaction Cost
                </p>
                <p className="text-2xl font-bold text-orange-400">
                  {formatCurrency(postRewardFeePerTx)}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">vs Bank Wire Transfer:</span>
                  <span className="text-green-400">
                    {postRewardFeePerTx < 25 ? "Competitive" : "Expensive"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">vs Credit Card (3%):</span>
                  <span className="text-yellow-400">
                    Break-even at {formatCurrency(postRewardFeePerTx / 0.03)}{" "}
                    purchase
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">vs Lightning Network:</span>
                  <span
                    className="text-red-400"
                    title="Assuming $0.01 median Lightning fee"
                  >
                    {(postRewardFeePerTx / 0.01).toFixed(0)}x more expensive
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-600">
                <p className="text-xs text-slate-400">
                  High fees may drive users to Layer 2 solutions (Lightning) or
                  alternative networks for smaller transactions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
