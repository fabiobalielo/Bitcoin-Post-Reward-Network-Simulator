'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EconomicInputs, EconomicOutputs, formatHashrate, usd, fmtChange, pctOfCurrent } from '@/lib/bitcoin-economics'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { 
  Shield, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target,
  AlertTriangle,
  Activity
} from 'lucide-react'

interface EconomicDashboardProps {
  inputs: EconomicInputs
  currentResults: EconomicOutputs
  postRewardResults: EconomicOutputs
  isLoading: boolean
}

export function EconomicDashboard({ 
  inputs, 
  currentResults, 
  postRewardResults, 
  isLoading 
}: EconomicDashboardProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <div className="h-4 bg-slate-700 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-slate-700 rounded animate-pulse mb-2" />
              <div className="h-3 bg-slate-700 rounded animate-pulse w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // GOLDEN EQUATIONS - single source of truth for all USD conversions
  // Fee/tx USD = (f * avgTxVb / 1e8) * P
  const currentFeePerTxUSD = (inputs.baselineFeerate * inputs.avgTxVb / 100000000) * inputs.btcPrice
  const postRewardFeePerTxUSD = (postRewardResults.optimalFeerate * inputs.avgTxVb / 100000000) * inputs.btcPrice

  const metrics = [
    {
      title: '🔥 CRITICAL: Fee Rate Required',
      value: `${postRewardResults.optimalFeerate.toFixed(0)} sat/vB`,
      subtitle: `${(postRewardResults.optimalFeerate / inputs.baselineFeerate).toFixed(1)}x current rate (${inputs.baselineFeerate} sat/vB)`,
      change: fmtChange(postRewardResults.optimalFeerate, inputs.baselineFeerate),
      icon: Zap,
      color: 'text-orange-400'
    },
    {
      title: 'Network Security Budget',
      value: formatCurrency(postRewardResults.securityBudgetTargetUSD),
      subtitle: `Current: ${formatCurrency(currentResults.networkRevenueUSD)}${
        (postRewardResults as any).solverInfo?.targetMet 
          ? ' • On target (±0.25%)' 
          : (postRewardResults as any).solverInfo?.gap 
            ? ` • Gap: ${((postRewardResults as any).solverInfo.gap * 100).toFixed(2)}%`
            : ''
      }`,
      change: fmtChange(postRewardResults.securityBudgetTargetUSD, currentResults.networkRevenueUSD),
      icon: Shield,
      color: (postRewardResults as any).solverInfo?.targetMet ? 'text-green-400' : 'text-blue-400'
    },
    {
      title: 'Attack Cost (6h)',
      value: formatCurrency(postRewardResults.attackCost6hUSD),
      subtitle: inputs.settlementUsdDay ? 
        `${postRewardResults.attackCostAsPercentOfSettlement.toFixed(2)}% of daily settlement` :
        'Settlement value not configured',
      change: fmtChange(postRewardResults.attackCost6hUSD, currentResults.attackCost6hUSD),
      icon: Target,
      color: postRewardResults.attackCostAsPercentOfSettlement > 1 ? 'text-green-400' : 
             postRewardResults.attackCostAsPercentOfSettlement > 0.1 ? 'text-yellow-400' : 'text-red-400'
    },
    {
      title: 'Network Hashrate (Equilibrium)',
      value: formatHashrate(postRewardResults.equilibriumHashrateTH),
      subtitle: `Sustainability: ${pctOfCurrent(postRewardResults.hashrateSustainabilityRatio, 1)} of current`,
      change: fmtChange(postRewardResults.hashrateSustainabilityRatio, 1),
      icon: Activity,
      color: postRewardResults.hashrateSustainabilityRatio > 0.8 ? 'text-green-400' : 
             postRewardResults.hashrateSustainabilityRatio > 0.5 ? 'text-yellow-400' : 'text-red-400'
    },
    {
      title: 'Transaction Demand Impact',
      value: `${formatNumber(postRewardResults.demandVbPerDay / 1e6)} MB/day`,
      subtitle: `Baseline: ${formatNumber(inputs.baselineDemandVbDay / 1e6)} MB/day`,
      change: fmtChange(postRewardResults.demandVbPerDay, inputs.baselineDemandVbDay),
      icon: TrendingDown,
      color: postRewardResults.demandVbPerDay < inputs.baselineDemandVbDay * 0.5 ? 'text-red-400' : 
             postRewardResults.demandVbPerDay < inputs.baselineDemandVbDay * 0.8 ? 'text-yellow-400' : 'text-green-400'
    },
    {
      title: '💰 Fee per Transaction',
      value: formatCurrency(postRewardFeePerTxUSD),
      subtitle: `Current: ${formatCurrency(currentFeePerTxUSD)}`,
      change: fmtChange(postRewardFeePerTxUSD, currentFeePerTxUSD),
      icon: TrendingUp,
      color: 'text-yellow-400'
    }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Context Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 border border-orange-700/30 rounded-lg p-3 sm:p-4"
      >
        <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
          <div className="h-3 w-3 bg-orange-400 rounded-full animate-pulse" />
          <h3 className="text-base sm:text-lg font-semibold text-orange-400">Economic Equilibrium Analysis</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          Showing optimal fee rates and network equilibrium for post-reward era (fees-only mining).
          <span className="text-orange-400 font-medium"> Pool analysis based on {(inputs.poolShare * 100).toFixed(1)}% network share.</span>
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-slate-300">
                  {metric.title}
                </CardTitle>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-white mb-1">
                  {metric.value}
                </div>
                <p className="text-xs text-slate-400 mb-1">
                  {metric.subtitle}
                </p>
                <p className={`text-xs ${metric.color} flex items-center`}>
                  {parseFloat(metric.change) > 0 ? '+' : ''}{metric.change}%
                  <span className="text-slate-400 ml-1">change</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pool Economics Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Current Pool Economics */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">This Pool - Current (With Rewards)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs text-slate-400">Daily Revenue</p>
                <p className="text-sm sm:text-lg font-bold text-white">
                  {formatCurrency(currentResults.poolDailyRevenueUSD)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Daily Expenses</p>
                <p className="text-sm sm:text-lg font-bold text-white">
                  {formatCurrency(currentResults.poolDailyExpensesUSD)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Daily Profit</p>
                <p className={`text-sm sm:text-lg font-bold ${currentResults.poolDailyProfitUSD > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(currentResults.poolDailyProfitUSD)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Profit Margin</p>
                <p className="text-sm sm:text-lg font-bold text-white">
                  {(currentResults.poolProfitMargin * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Post-Reward Pool Economics */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">This Pool - Post-Reward (Fees Only)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs text-slate-400">Daily Revenue</p>
                <p className="text-sm sm:text-lg font-bold text-white">
                  {formatCurrency(postRewardResults.poolDailyRevenueUSD)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Daily Expenses</p>
                <p className="text-sm sm:text-lg font-bold text-white">
                  {formatCurrency(postRewardResults.poolDailyExpensesUSD)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Daily Profit</p>
                <p className={`text-sm sm:text-lg font-bold ${postRewardResults.poolDailyProfitUSD > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(postRewardResults.poolDailyProfitUSD)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Profit Margin</p>
                <p className="text-sm sm:text-lg font-bold text-white">
                  {(postRewardResults.poolProfitMargin * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}