'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BitcoinMetrics } from '@/lib/bitcoin-api'
import { FeeAnalyzer, formatFeeRate, formatFeePriority } from '@/lib/fee-analysis'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Zap, 
  Clock, 
  Target,
  BarChart3,
  AlertCircle
} from 'lucide-react'

interface FeeAnalysisProps {
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

export function FeeAnalysis({ data, simulationParams, isLoading }: FeeAnalysisProps) {
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
    )
  }

  // Calculate realistic security budget based on current block rewards
  const currentBlockReward = 3.125 // BTC per block
  const currentBlockRewardUSD = currentBlockReward * data.price * 144 // Daily USD from block rewards
  const targetSecurityBudget = currentBlockRewardUSD * 0.6 // Target 60% of current (more realistic for fee-only era)

  // Analyze current fee market
  const currentFeeAnalysis = FeeAnalyzer.analyzeFeeMarket({
    avgFeeRate: data.avgFeeRate,
    mempoolSize: data.mempoolSize,
    blockSize: 4000000, // Current block size
    btcPrice: data.price,
    networkHashrate: data.hashrate,
    targetSecurityBudget
  })

  // Analyze post-reward fee market
  const postRewardFeeAnalysis = FeeAnalyzer.analyzeFeeMarket({
    avgFeeRate: data.avgFeeRate * simulationParams.feeMultiplier,
    mempoolSize: data.mempoolSize * simulationParams.txDemandMultiplier,
    blockSize: simulationParams.blockspaceLimit,
    btcPrice: simulationParams.btcPrice,
    networkHashrate: data.hashrate,
    targetSecurityBudget
  })

  // Calculate fee scenarios
  const feeScenarios = FeeAnalyzer.calculateFeeScenarios({
    baseFeeRate: data.avgFeeRate,
    btcPrice: simulationParams.btcPrice,
    blockSize: simulationParams.blockspaceLimit,
    scenarios: [
      { name: 'Conservative', demandMultiplier: 0.5, feeMultiplier: 2 },
      { name: 'Moderate', demandMultiplier: 1.0, feeMultiplier: 5 },
      { name: 'Aggressive', demandMultiplier: 2.0, feeMultiplier: 10 },
      { name: 'Crisis', demandMultiplier: 0.3, feeMultiplier: 20 }
    ]
  })

  const currentPriority = formatFeePriority(data.avgFeeRate)
  const postRewardPriority = formatFeePriority(postRewardFeeAnalysis.currentFeeRate)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Zap className="h-6 w-6 text-yellow-400" />
        <h2 className="text-2xl font-bold text-white">Transaction Fee Analysis</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Fee Market */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Current Fee Market</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400">Average Fee Rate</p>
                <p className="text-lg font-bold text-white">
                  {formatFeeRate(currentFeeAnalysis.currentFeeRate)}
                </p>
                <p className={`text-xs ${currentPriority.color}`}>
                  {currentPriority.text}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Fees per Block</p>
                <p className="text-lg font-bold text-white">
                  {formatCurrency(currentFeeAnalysis.feesPerBlockUSD)}
                </p>
                <p className="text-xs text-slate-400">
                  {currentFeeAnalysis.feesPerBlock.toFixed(4)} BTC
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Daily Fee Revenue</p>
                <p className="text-lg font-bold text-white">
                  {formatCurrency(currentFeeAnalysis.dailyFeeRevenue)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Avg Fee per Tx</p>
                <p className="text-lg font-bold text-white">
                  {formatCurrency(currentFeeAnalysis.avgFeePerTransaction)}
                </p>
              </div>
            </div>
            
            <div className="border-t border-slate-600 pt-3">
              <p className="text-xs text-slate-400 mb-2">Fee Priority Levels</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-400">Low Priority:</span>
                  <span className="text-white">{formatFeeRate(currentFeeAnalysis.lowPriorityFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-400">Medium Priority:</span>
                  <span className="text-white">{formatFeeRate(currentFeeAnalysis.mediumPriorityFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-400">High Priority:</span>
                  <span className="text-white">{formatFeeRate(currentFeeAnalysis.highPriorityFee)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Post-Reward Fee Requirements */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Post-Reward Requirements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400">Required Fee Rate</p>
                <p className="text-lg font-bold text-white">
                  {formatFeeRate(postRewardFeeAnalysis.requiredFeeRate)}
                </p>
                <p className={`text-xs ${postRewardPriority.color}`}>
                  {postRewardPriority.text}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Fee Multiplier Needed</p>
                <p className="text-lg font-bold text-white">
                  {postRewardFeeAnalysis.feeMultiplierNeeded.toFixed(2)}x
                </p>
                <p className="text-xs text-slate-400">
                  vs current levels
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Target Daily Revenue</p>
                <p className="text-lg font-bold text-white">
                  {formatCurrency(postRewardFeeAnalysis.dailyFeeRevenue)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Sustainable Throughput</p>
                <p className="text-lg font-bold text-white">
                  {postRewardFeeAnalysis.sustainableTxThroughput.toFixed(2)} tx/s
                </p>
              </div>
            </div>

            <div className="border-t border-slate-600 pt-3">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <p className="text-xs text-slate-400">Economic Impact</p>
              </div>
              <div className="text-sm space-y-1">
                <p className="text-slate-300">
                  Fees need to increase <span className="text-orange-400 font-bold">
                    {Math.min(2000, (postRewardFeeAnalysis.feeMultiplierNeeded - 1) * 100).toFixed(0)}%
                  </span> to maintain network security
                </p>
                <p className="text-slate-300">
                  This may reduce transaction demand by <span className="text-red-400 font-bold">
                    {Math.min(80, Math.max(0, (1 - postRewardFeeAnalysis.sustainableTxThroughput / 7) * 100)).toFixed(0)}%
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fee Scenarios */}
        <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Post-Reward Fee Scenarios</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {feeScenarios.map((scenario, index) => (
                <div key={scenario.name} className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">{scenario.name}</h4>
                    <div className={`h-2 w-2 rounded-full ${
                      index === 0 ? 'bg-green-400' :
                      index === 1 ? 'bg-yellow-400' :
                      index === 2 ? 'bg-orange-400' : 'bg-red-400'
                    }`} />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fee Rate:</span>
                      <span className="text-white">{formatFeeRate(scenario.feeRate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Daily Revenue:</span>
                      <span className="text-white">{formatCurrency(scenario.dailyRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Confirm Time:</span>
                      <span className="text-white">{scenario.avgConfirmTime.toFixed(0)}m</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fee Market Depth */}
        <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Fee Market Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-1">Current Market Depth</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(currentFeeAnalysis.feeMarketDepth)}
                </p>
                <p className="text-xs text-slate-400">
                  Total fees in mempool
                </p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-1">Revenue Gap</p>
                <p className="text-2xl font-bold text-red-400">
                  {formatCurrency(Math.max(0, targetSecurityBudget - currentFeeAnalysis.dailyFeeRevenue))}
                </p>
                <p className="text-xs text-slate-400">
                  Daily shortfall vs target
                </p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-1">Fee Efficiency</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {((currentFeeAnalysis.dailyFeeRevenue / targetSecurityBudget) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-slate-400">
                  Of target security budget
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}