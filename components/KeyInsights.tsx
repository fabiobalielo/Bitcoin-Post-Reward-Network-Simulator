'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EconomicInputs, EconomicOutputs, usd, fmtChange } from '@/lib/bitcoin-economics'
import { formatCurrency } from '@/lib/utils'
import { 
  Lightbulb, 
  AlertTriangle, 
  TrendingUp, 
  Shield, 
  Users, 
  Zap,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'

interface KeyInsightsProps {
  inputs: EconomicInputs
  currentResults: EconomicOutputs
  postRewardResults: EconomicOutputs
}

export function KeyInsights({ inputs, currentResults, postRewardResults }: KeyInsightsProps) {
  // Calculate key metrics
  const feeMultiplier = postRewardResults.optimalFeerate / inputs.baselineFeerate
  const demandReduction = ((inputs.baselineDemandVbDay - postRewardResults.demandVbPerDay) / inputs.baselineDemandVbDay) * 100
  const hashrateDrop = ((750e18 - postRewardResults.equilibriumHashrateTH * 1e12) / 750e18) * 100
  // GOLDEN EQUATION: Fee/tx = (f * avgTxVb / 1e8) * P
  const feePerTx = (postRewardResults.optimalFeerate * inputs.avgTxVb / 100000000) * inputs.btcPrice
  const securityReduction = ((currentResults.attackCost6hUSD - postRewardResults.attackCost6hUSD) / currentResults.attackCost6hUSD) * 100

  // Determine overall assessment
  const getOverallAssessment = () => {
    if (feePerTx > 50) return { status: 'critical', color: 'text-red-400', icon: XCircle }
    if (feePerTx > 20) return { status: 'concerning', color: 'text-yellow-400', icon: AlertTriangle }
    if (feePerTx > 10) return { status: 'challenging', color: 'text-orange-400', icon: Clock }
    return { status: 'manageable', color: 'text-green-400', icon: CheckCircle }
  }

  const assessment = getOverallAssessment()

  const insights = [
    {
      category: 'Fee Impact',
      icon: Zap,
      color: 'text-yellow-400',
      title: 'Transaction Costs Will Skyrocket',
      description: `Fees must increase ${feeMultiplier.toFixed(1)}x (from ${inputs.baselineFeerate} to ${postRewardResults.optimalFeerate.toFixed(0)} sat/vB) to maintain network security.`,
      impact: 'Critical',
      details: `This means each transaction will cost ${formatCurrency(feePerTx)} instead of ${formatCurrency((inputs.baselineFeerate * inputs.avgTxVb / 100000000) * inputs.btcPrice)}.`
    },
    {
      category: 'User Adoption',
      icon: Users,
      color: 'text-purple-400',
      title: 'Massive User Exodus Expected',
      description: `Transaction demand will drop by ${demandReduction.toFixed(0)}% due to higher fees, pushing users to Layer 2 or alternative networks.`,
      impact: demandReduction > 70 ? 'Critical' : demandReduction > 50 ? 'High' : 'Medium',
      details: `Daily transaction volume drops from ${(inputs.baselineDemandVbDay / 1000000).toFixed(0)}MB to ${(postRewardResults.demandVbPerDay / 1000000).toFixed(0)}MB.`
    },
    {
      category: 'Network Security',
      icon: Shield,
      color: 'text-blue-400',
      title: 'Security Budget Maintained',
      description: `Network maintains ${formatCurrency(postRewardResults.securityBudgetTargetUSD)} daily security budget, but with ${hashrateDrop.toFixed(0)}% less hashrate.`,
      impact: hashrateDrop > 80 ? 'High' : hashrateDrop > 60 ? 'Medium' : 'Low',
      details: `Attack cost drops to ${formatCurrency(postRewardResults.attackCost6hUSD)} for 6-hour attack (${securityReduction.toFixed(0)}% reduction).`
    },
    {
      category: 'Mining Economics',
      icon: TrendingUp,
      color: 'text-green-400',
      title: 'Miners Remain Profitable',
      description: `Mining pools maintain ${postRewardResults.poolProfitMargin.toFixed(1)}% profit margins through economic equilibrium and hashrate adjustment.`,
      impact: 'Positive',
      details: `Efficient miners survive while inefficient operations shut down, creating a leaner but sustainable network.`
    }
  ]

  const recommendations = [
    {
      priority: 'High',
      title: 'Accelerate Layer 2 Development',
      description: 'Lightning Network and other L2 solutions become critical for small transactions.',
      icon: Zap,
      color: 'text-orange-400'
    },
    {
      priority: 'High',
      title: 'Improve Transaction Batching',
      description: 'Exchanges and services must batch transactions to reduce per-user costs.',
      icon: TrendingUp,
      color: 'text-blue-400'
    },
    {
      priority: 'Medium',
      title: 'Educate Users on Fee Markets',
      description: 'Users need to understand fee dynamics and plan transactions accordingly.',
      icon: Users,
      color: 'text-purple-400'
    },
    {
      priority: 'Medium',
      title: 'Develop Fee Prediction Tools',
      description: 'Better tools to help users optimize transaction timing and fee rates.',
      icon: Clock,
      color: 'text-yellow-400'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Lightbulb className="h-6 w-6 text-yellow-400" />
        <h2 className="text-2xl font-bold text-white">Key Insights & Recommendations</h2>
      </div>

      {/* Overall Assessment */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className={`${assessment.color} flex items-center space-x-2`}>
            <assessment.icon className="h-5 w-5" />
            <span>Overall Assessment: {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <p className="text-2xl font-bold text-yellow-400">{feeMultiplier.toFixed(1)}x</p>
              <p className="text-sm text-slate-400">Fee Increase Required</p>
            </div>
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <p className="text-2xl font-bold text-red-400">{demandReduction.toFixed(0)}%</p>
              <p className="text-sm text-slate-400">Demand Reduction</p>
            </div>
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <p className="text-2xl font-bold text-blue-400">{formatCurrency(feePerTx)}</p>
              <p className="text-sm text-slate-400">Cost per Transaction</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.category}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.1 + index * 0.1 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <insight.icon className={`h-5 w-5 ${insight.color}`} />
                    <CardTitle className="text-white text-lg">{insight.title}</CardTitle>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    insight.impact === 'Critical' ? 'bg-red-900/30 text-red-400' :
                    insight.impact === 'High' ? 'bg-orange-900/30 text-orange-400' :
                    insight.impact === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' :
                    insight.impact === 'Low' ? 'bg-blue-900/30 text-blue-400' :
                    'bg-green-900/30 text-green-400'
                  }`}>
                    {insight.impact}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-3">{insight.description}</p>
                <p className="text-sm text-slate-400">{insight.details}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recommendations */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>Strategic Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, index) => (
              <div key={rec.title} className="flex items-start space-x-3 p-4 bg-slate-700/30 rounded-lg">
                <rec.icon className={`h-5 w-5 ${rec.color} mt-0.5`} />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-white">{rec.title}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      rec.priority === 'High' ? 'bg-red-900/30 text-red-400' : 'bg-yellow-900/30 text-yellow-400'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}