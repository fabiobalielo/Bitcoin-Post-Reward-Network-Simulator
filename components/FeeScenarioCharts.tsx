'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter } from 'recharts'
import { EconomicInputs, EconomicOutputs, BitcoinEconomicsModel, usd } from '@/lib/bitcoin-economics'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, BarChart3, Target, Zap } from 'lucide-react'

interface FeeScenarioChartsProps {
  inputs: EconomicInputs
  currentResults: EconomicOutputs
  postRewardResults: EconomicOutputs
}

export function FeeScenarioCharts({ inputs, currentResults, postRewardResults }: FeeScenarioChartsProps) {
  // Generate fee scenario data
  const generateFeeScenarios = () => {
    const scenarios = []
    const feeRates = [5, 10, 20, 50, 100, 200, 300, 500, 1000]
    
    for (const feeRate of feeRates) {
      const testInputs = { ...inputs, baselineFeerate: feeRate }
      const results = BitcoinEconomicsModel.computeFullModel(testInputs, false)
      
      scenarios.push({
        feeRate,
        dailyRevenue: results.dailyFeeRevenueUSD / 1000000, // Convert to millions
        demandMB: results.demandVbPerDay / 1000000, // Convert to MB
        hashrate: results.equilibriumHashrateTH / 1e12, // Convert to EH/s
        feePerTx: usd((feeRate * inputs.avgTxVb) / 100000000, inputs.btcPrice),
        attackCost: results.attackCost6hUSD / 1000000, // Convert to millions
        securityTarget: results.securityBudgetTargetUSD / 1000000
      })
    }
    
    return scenarios
  }

  // Generate timeline projection
  const generateTimeline = () => {
    const timeline = []
    const currentYear = new Date().getFullYear()
    
    // Historical (simplified)
    for (let year = 2020; year <= currentYear; year++) {
      const blockReward = year < 2024 ? 6.25 : 3.125
      timeline.push({
        year,
        blockRewardRevenue: usd(blockReward * 144, inputs.btcPrice) / 1000000,
        feeRevenue: (year - 2020) * 2 + 5, // Simplified growth
        totalRevenue: (usd(blockReward * 144, inputs.btcPrice) / 1000000) + ((year - 2020) * 2 + 5),
        phase: 'Historical'
      })
    }
    
    // Future projections
    const halvingYears = [2028, 2032, 2036, 2140]
    let currentBlockReward = 3.125
    
    for (const year of halvingYears) {
      if (year < 2140) {
        currentBlockReward = currentBlockReward / 2
      } else {
        currentBlockReward = 0 // Post-reward era
      }
      
      const feeRevenue = year === 2140 ? postRewardResults.dailyFeeRevenueUSD / 1000000 : 
                        Math.min(50, (year - currentYear) * 3 + 15)
      
      timeline.push({
        year,
        blockRewardRevenue: usd(currentBlockReward * 144, inputs.btcPrice) / 1000000,
        feeRevenue,
        totalRevenue: (usd(currentBlockReward * 144, inputs.btcPrice) / 1000000) + feeRevenue,
        phase: year === 2140 ? 'Post-Reward' : 'Transition'
      })
    }
    
    return timeline
  }

  const scenarioData = generateFeeScenarios()
  const timelineData = generateTimeline()

  // User impact data
  const userImpactData = [
    { userType: 'Casual\n(4 tx/mo)', current: 2, postReward: 40, category: 'Low Usage' },
    { userType: 'Active\n(20 tx/mo)', current: 10, postReward: 200, category: 'Medium Usage' },
    { userType: 'Business\n(100 tx/mo)', current: 50, postReward: 1000, category: 'High Usage' },
    { userType: 'Enterprise\n(500 tx/mo)', current: 250, postReward: 5000, category: 'Very High Usage' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center space-x-3">
        <BarChart3 className="h-6 w-6 text-purple-400" />
        <h2 className="text-2xl font-bold text-white">Fee Scenario Analysis</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fee Rate vs Revenue */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Fee Rate Impact on Revenue</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={scenarioData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="feeRate" 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  label={{ value: 'Fee Rate (sat/vB)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  label={{ value: 'Daily Revenue ($M)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value: number, name: string) => [
                    `$${value.toFixed(1)}M`,
                    'Daily Revenue'
                  ]}
                  labelFormatter={(value) => `${value} sat/vB`}
                />
                <Line
                  type="monotone"
                  dataKey="dailyRevenue"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="securityTarget"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-slate-400 mt-2">
              Orange dashed line shows security budget target. Green line shows actual revenue at different fee rates.
            </p>
          </CardContent>
        </Card>

        {/* Demand Response */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Demand vs Fee Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={scenarioData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="feeRate" 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  label={{ value: 'Fee Rate (sat/vB)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  label={{ value: 'Daily Demand (MB)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(0)} MB`,
                    'Daily Demand'
                  ]}
                  labelFormatter={(value) => `${value} sat/vB`}
                />
                <Scatter
                  dataKey="demandMB"
                  fill="#8B5CF6"
                />
              </ScatterChart>
            </ResponsiveContainer>
            <p className="text-xs text-slate-400 mt-2">
              Shows how transaction demand decreases as fees increase (elasticity: {inputs.elasticity}).
            </p>
          </CardContent>
        </Card>

        {/* Timeline Projection */}
        <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Bitcoin Revenue Timeline: Block Rewards vs Fees</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="year" 
                  stroke="#9CA3AF" 
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  label={{ value: 'Daily Revenue ($M)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value: number, name: string) => [
                    `$${value.toFixed(1)}M`,
                    name === 'blockRewardRevenue' ? 'Block Rewards' : 
                    name === 'feeRevenue' ? 'Transaction Fees' : 'Total Revenue'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="blockRewardRevenue"
                  stackId="1"
                  stroke="#F59E0B"
                  fill="#F59E0B"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="feeRevenue"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-xs text-slate-400 mt-2">
              Orange area: Block reward revenue (decreases with halvings). Green area: Fee revenue (must grow to maintain security).
            </p>
          </CardContent>
        </Card>

        {/* User Impact Comparison */}
        <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Monthly Fee Impact by User Type</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userImpactData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="userType" 
                  stroke="#9CA3AF" 
                  fontSize={11}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  label={{ value: 'Monthly Cost ($)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === 'current' ? 'Current Monthly Cost' : 'Post-Reward Monthly Cost'
                  ]}
                />
                <Bar dataKey="current" fill="#10B981" name="current" />
                <Bar dataKey="postReward" fill="#EF4444" name="postReward" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-slate-400 mt-2">
              Green bars: Current monthly fees. Red bars: Post-reward monthly fees. Shows dramatic increase across all user types.
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}