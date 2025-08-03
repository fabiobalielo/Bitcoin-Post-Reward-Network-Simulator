'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts'
import { BitcoinMetrics } from '@/lib/bitcoin-api'
import { MiningEconomicsCalculator } from '@/lib/mining-economics'
import { FeeAnalyzer } from '@/lib/fee-analysis'
import { formatCurrency, formatHashrate, calculateMinerRevenue } from '@/lib/utils'
import { TrendingUp, DollarSign, Shield, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'

interface MetricsChartsProps {
  data: BitcoinMetrics | null
  simulationParams: {
    btcPrice: number
    txDemandMultiplier: number
    minerCostPerTH: number
    blockspaceLimit: number
    feeMultiplier: number
  }
}

export function MetricsCharts({ data, simulationParams }: MetricsChartsProps) {
  const [historicalData, setHistoricalData] = useState<any[]>([])

  useEffect(() => {
    if (!data) return

    // Calculate mining economics for chart data
    const miningMetrics = MiningEconomicsCalculator.calculateMiningMetrics({
      poolHashrate: data.hashrate * 0.005, // 0.5% pool (more realistic costs)
      networkHashrate: data.hashrate,
      btcPrice: simulationParams.btcPrice,
      avgFeeRate: data.avgFeeRate * simulationParams.feeMultiplier,
      blockSize: simulationParams.blockspaceLimit,
      electricityCost: 0.08, // Standard rate
    })

    // Calculate fee analysis for chart data
    const targetSecurityBudget = 3.125 * data.price * 144 * 0.6 // 60% of current block reward value
    const feeAnalysis = FeeAnalyzer.analyzeFeeMarket({
      avgFeeRate: data.avgFeeRate * simulationParams.feeMultiplier,
      mempoolSize: data.mempoolSize * simulationParams.txDemandMultiplier,
      blockSize: simulationParams.blockspaceLimit,
      btcPrice: simulationParams.btcPrice,
      networkHashrate: data.hashrate,
      targetSecurityBudget
    })

    const newDataPoint = {
      timestamp: new Date().toLocaleTimeString(),
      price: simulationParams.btcPrice,
      hashrate: data.hashrate / 1e18, // Convert to EH/s
      minerRevenue: miningMetrics.dailyRevenue,
      minerExpenses: miningMetrics.dailyExpenses,
      minerProfit: miningMetrics.dailyProfit,
      profitMargin: miningMetrics.profitMargin,
      feeRate: data.avgFeeRate * simulationParams.feeMultiplier,
      feeRevenue: feeAnalysis.dailyFeeRevenue,
      requiredFeeRate: feeAnalysis.requiredFeeRate,
      mempoolSize: data.mempoolSize * simulationParams.txDemandMultiplier,
      confirmTime: Math.max(10, 600 / (data.txThroughput * simulationParams.txDemandMultiplier))
    }

    setHistoricalData(prev => {
      const updated = [...prev, newDataPoint]
      return updated.slice(-20) // Keep last 20 data points
    })
  }, [data, simulationParams])

  if (!data || historicalData.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="h-4 bg-slate-700 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-slate-700 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const charts = [
    {
      title: 'Mining Profitability Analysis',
      icon: DollarSign,
      component: (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="timestamp" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === 'minerRevenue' ? 'Daily Revenue' : 
                name === 'minerExpenses' ? 'Daily Expenses' : 'Daily Profit'
              ]}
            />
            <Line
              type="monotone"
              dataKey="minerRevenue"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="minerExpenses"
              stroke="#EF4444"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="minerProfit"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )
    },
    {
      title: 'Network Hashrate',
      icon: TrendingUp,
      component: (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="timestamp" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              formatter={(value: number) => [`${value.toFixed(2)} EH/s`, 'Hashrate']}
            />
            <Area
              type="monotone"
              dataKey="hashrate"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      )
    },
    {
      title: 'Fee Market Analysis',
      icon: Shield,
      component: (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="timestamp" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              formatter={(value: number, name: string) => [
                name === 'feeRate' ? `${value.toFixed(2)} sat/vB` : 
                name === 'requiredFeeRate' ? `${value.toFixed(2)} sat/vB` : 
                formatCurrency(value),
                name === 'feeRate' ? 'Current Fee Rate' : 
                name === 'requiredFeeRate' ? 'Required Fee Rate' : 'Fee Revenue'
              ]}
            />
            <Line
              type="monotone"
              dataKey="feeRate"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="requiredFeeRate"
              stroke="#EF4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="feeRevenue"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )
    },
    {
      title: 'Confirmation Times',
      icon: Clock,
      component: (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="timestamp" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              formatter={(value: number) => [`${value.toFixed(1)} min`, 'Avg Confirmation Time']}
            />
            <Bar
              dataKey="confirmTime"
              fill="#06B6D4"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-2 mb-6">
        <TrendingUp className="h-6 w-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Network Metrics</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {charts.map((chart, index) => (
          <motion.div
            key={chart.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <chart.icon className="h-5 w-5 text-blue-400" />
                  <CardTitle className="text-white">{chart.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {chart.component}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}