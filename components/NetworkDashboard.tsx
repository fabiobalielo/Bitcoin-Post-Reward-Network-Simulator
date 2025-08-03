'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BitcoinMetrics } from '@/lib/bitcoin-api'
import { formatNumber, formatHashrate, formatCurrency, calculateMinerRevenue, calculateNetworkSecurity } from '@/lib/utils'
import { FeeAnalyzer, formatFeeRate } from '@/lib/fee-analysis'
import { TrendingUp, TrendingDown, Activity, Shield, Clock, Zap } from 'lucide-react'

interface NetworkDashboardProps {
  data: BitcoinMetrics | null
  simulationParams: {
    btcPrice: number
    txDemandMultiplier: number
    minerCostPerTH: number
    blockspaceLimit: number
    feeMultiplier: number
  }
  isLoading: boolean
}

export function NetworkDashboard({ data, simulationParams, isLoading }: NetworkDashboardProps) {
  if (isLoading || !data) {
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

  // Current Bitcoin network (with block rewards)
  const currentBlockReward = 3.125 // Current BTC per block (post-2024 halving)
  const currentMinerRevenue = (data.price * currentBlockReward) + calculateMinerRevenue(data.avgFeeRate, 4000000, data.price)
  
  // POST-REWARD SIMULATION (Year ~2140)
  const simulatedPrice = simulationParams.btcPrice
  const simulatedFeeRate = data.avgFeeRate * simulationParams.feeMultiplier
  const simulatedMinerRevenue = calculateMinerRevenue(simulatedFeeRate, simulationParams.blockspaceLimit, simulatedPrice)
  const networkSecurity = calculateNetworkSecurity(data.hashrate, simulatedMinerRevenue, simulationParams.minerCostPerTH)
  const estimatedConfirmTime = Math.max(10, 600 / (data.txThroughput * simulationParams.txDemandMultiplier))
  
  // Revenue comparison: current vs post-reward
  const revenueDropPercentage = ((currentMinerRevenue - simulatedMinerRevenue) / currentMinerRevenue * 100)
  
  // Calculate realistic security budget
  const targetSecurityBudget = currentBlockReward * data.price * 144 * 0.6 // 60% of current (more realistic)
  
  // Fee analysis
  const currentFeeAnalysis = FeeAnalyzer.analyzeFeeMarket({
    avgFeeRate: data.avgFeeRate,
    mempoolSize: data.mempoolSize,
    blockSize: 4000000,
    btcPrice: data.price,
    networkHashrate: data.hashrate,
    targetSecurityBudget
  })
  
  const postRewardFeeAnalysis = FeeAnalyzer.analyzeFeeMarket({
    avgFeeRate: simulatedFeeRate,
    mempoolSize: data.mempoolSize * simulationParams.txDemandMultiplier,
    blockSize: simulationParams.blockspaceLimit,
    btcPrice: simulatedPrice,
    networkHashrate: data.hashrate,
    targetSecurityBudget
  })

  const metrics = [
    {
      title: 'Current BTC Price (Live)',
      value: formatCurrency(data.price),
      subtitle: `Simulated: ${formatCurrency(simulatedPrice)}`,
      change: ((simulatedPrice - data.price) / data.price * 100).toFixed(2),
      icon: simulatedPrice > data.price ? TrendingUp : TrendingDown,
      color: 'text-orange-400'
    },
    {
      title: 'Current Miner Revenue',
      value: formatCurrency(currentMinerRevenue),
      subtitle: `Block reward: ${formatCurrency(data.price * currentBlockReward)}`,
      change: '0.0',
      icon: Activity,
      color: 'text-green-400'
    },
    {
      title: 'POST-REWARD Revenue (Fees Only)',
      value: formatCurrency(simulatedMinerRevenue),
      subtitle: `${revenueDropPercentage.toFixed(2)}% drop from current`,
      change: `-${revenueDropPercentage.toFixed(2)}`,
      icon: TrendingDown,
      color: revenueDropPercentage > 80 ? 'text-red-400' : revenueDropPercentage > 50 ? 'text-yellow-400' : 'text-green-400'
    },
    {
      title: 'Network Security Risk',
      value: `${(networkSecurity * 100).toFixed(2)}%`,
      subtitle: networkSecurity < 0.5 ? 'High Risk' : networkSecurity < 0.8 ? 'Medium Risk' : 'Secure',
      change: networkSecurity > 1 ? '+' + ((networkSecurity - 1) * 100).toFixed(2) : '-' + ((1 - networkSecurity) * 100).toFixed(2),
      icon: Shield,
      color: networkSecurity > 0.8 ? 'text-green-400' : networkSecurity > 0.5 ? 'text-yellow-400' : 'text-red-400'
    },
    {
      title: 'Transaction Backlog',
      value: formatNumber(data.mempoolSize * simulationParams.txDemandMultiplier),
      subtitle: `Current: ${formatNumber(data.mempoolSize)} txs`,
      change: ((simulationParams.txDemandMultiplier - 1) * 100).toFixed(2),
      icon: Zap,
      color: simulationParams.txDemandMultiplier > 2 ? 'text-red-400' : simulationParams.txDemandMultiplier > 1 ? 'text-yellow-400' : 'text-green-400'
    },
    {
      title: 'Fee Rate (Current vs Required)',
      value: formatFeeRate(data.avgFeeRate),
      subtitle: `Required: ${formatFeeRate(postRewardFeeAnalysis.requiredFeeRate)}`,
      change: ((postRewardFeeAnalysis.requiredFeeRate - data.avgFeeRate) / data.avgFeeRate * 100).toFixed(2),
      icon: Zap,
      color: postRewardFeeAnalysis.requiredFeeRate > data.avgFeeRate * 5 ? 'text-red-400' : 
             postRewardFeeAnalysis.requiredFeeRate > data.avgFeeRate * 2 ? 'text-yellow-400' : 'text-green-400'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Simulation Context Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 border border-orange-700/30 rounded-lg p-4"
      >
        <div className="flex items-center space-x-3 mb-2">
          <div className="h-3 w-3 bg-orange-400 rounded-full animate-pulse" />
          <h3 className="text-lg font-semibold text-orange-400">Bitcoin Post-Reward Era Simulation (~2140)</h3>
        </div>
        <p className="text-sm text-slate-300">
          Comparing current network (with {currentBlockReward} BTC block rewards = ~${formatCurrency(currentBlockReward * data.price * 144)}/day) vs. future fee-only mining economics.
          <span className="text-orange-400 font-medium"> Live data updates every 15 seconds.</span>
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
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
    </div>
  )
}