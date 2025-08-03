'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Info } from 'lucide-react'
import { EconomicInputs, BitcoinEconomicsModel } from '@/lib/bitcoin-economics'
import { formatCurrency } from '@/lib/utils'

interface ObjectivesHeaderProps {
  inputs: EconomicInputs
}

export function ObjectivesHeader({ inputs }: ObjectivesHeaderProps) {
  const securityBudgetTarget = BitcoinEconomicsModel.securityBudgetTargetUsd(inputs)
  
  const getSecurityBudgetDescription = () => {
    switch (inputs.securityBudgetMode) {
      case "percent_of_2025":
        return `${(inputs.alpha! * 100).toFixed(0)}% of 2025 security budget (${formatCurrency(inputs.base2025RevenueUsd!)})`
      case "percent_of_settlement_value":
        return `${(inputs.beta! * 100).toFixed(2)}% of daily settlement value (${formatCurrency(inputs.settlementUsdDay!)})`
      case "absolute_usd":
        return `Fixed absolute target`
      default:
        return "Unknown mode"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-slate-800/50 border-slate-700 mb-6">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Simulation Objectives</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Security Budget Target */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-blue-400" />
                <h4 className="font-semibold text-white">Security Budget Target</h4>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-2xl font-bold text-white mb-1">
                  {formatCurrency(securityBudgetTarget)}/day
                </p>
                <p className="text-sm text-slate-300">
                  Based on: <span className="text-blue-400">{getSecurityBudgetDescription()}</span>
                </p>
              </div>
            </div>

            {/* Optimization Goals */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-green-400" />
                <h4 className="font-semibold text-white">What We're Optimizing For</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Network Security:</span>
                  <span className="text-white">Maintain {formatCurrency(securityBudgetTarget)}/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Miner Profitability:</span>
                  <span className="text-white">{(inputs.margin * 100).toFixed(0)}% profit margin</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transaction Demand:</span>
                  <span className="text-white">Minimize fee impact (elasticity: {inputs.elasticity})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Attack Resistance:</span>
                  <span className="text-white">Maximize cost of 6h attack</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Assumptions */}
          <div className="mt-6 pt-4 border-t border-slate-600">
            <h4 className="font-semibold text-white mb-3">Key Economic Assumptions</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Pool Share:</span>
                <span className="text-white ml-2">{(inputs.poolShare * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-slate-400">Mining Cost:</span>
                <span className="text-white ml-2">{formatCurrency(inputs.costPerTHDay)}/TH/day</span>
              </div>
              <div>
                <span className="text-slate-400">MEV Uplift:</span>
                <span className="text-white ml-2">{(inputs.mevUplift * 100).toFixed(0)}%</span>
              </div>
              <div>
                <span className="text-slate-400">Avg Tx Size:</span>
                <span className="text-white ml-2">{inputs.avgTxVb} vB</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}