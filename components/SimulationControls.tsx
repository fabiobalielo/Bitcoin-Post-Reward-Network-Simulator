'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Settings, RotateCcw, Play, Pause } from 'lucide-react'
import { useState } from 'react'

interface SimulationControlsProps {
  params: {
    btcPrice: number
    txDemandMultiplier: number
    minerCostPerTH: number
    blockspaceLimit: number
    feeMultiplier: number
  }
  onParamsChange: (params: any) => void
}

export function SimulationControls({ params, onParamsChange }: SimulationControlsProps) {
  const [isRunning, setIsRunning] = useState(false)

  const handleParamChange = (key: string, value: number) => {
    onParamsChange({
      ...params,
      [key]: value
    })
  }

  const resetToDefaults = () => {
    onParamsChange({
      btcPrice: 45000,
      txDemandMultiplier: 1.0,
      minerCostPerTH: 2.0, // $2/day per TH/s (more realistic)
      blockspaceLimit: 4000000,
      feeMultiplier: 1.0
    })
  }

  const toggleSimulation = () => {
    setIsRunning(!isRunning)
  }

  const controls = [
    {
      label: 'Bitcoin Price',
      key: 'btcPrice',
      value: params.btcPrice,
      min: 10000,
      max: 200000,
      step: 1000,
      format: (v: number) => formatCurrency(v)
    },
    {
      label: 'Transaction Demand',
      key: 'txDemandMultiplier',
      value: params.txDemandMultiplier,
      min: 0.1,
      max: 5.0,
      step: 0.1,
      format: (v: number) => `${v.toFixed(2)}x`
    },
    {
      label: 'Daily Mining Cost per TH/s',
      key: 'minerCostPerTH',
      value: params.minerCostPerTH,
      min: 0.5,
      max: 5.0,
      step: 0.1,
      format: (v: number) => formatCurrency(v) + '/day'
    },
    {
      label: 'Block Size Limit',
      key: 'blockspaceLimit',
      value: params.blockspaceLimit,
      min: 1000000,
      max: 8000000,
      step: 100000,
      format: (v: number) => `${(v / 1000000).toFixed(2)}MB`
    },
    {
      label: 'Fee Multiplier',
      key: 'feeMultiplier',
      value: params.feeMultiplier,
      min: 0.1,
      max: 10.0,
      step: 0.1,
      format: (v: number) => `${v.toFixed(2)}x`
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-white">Simulation Parameters</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetToDefaults}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              <Button
                variant={isRunning ? "destructive" : "default"}
                size="sm"
                onClick={toggleSimulation}
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Run
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {controls.map((control) => (
              <div key={control.key} className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-300">
                    {control.label}
                  </label>
                  <span className="text-sm text-blue-400 font-mono">
                    {control.format(control.value)}
                  </span>
                </div>
                <Slider
                  value={[control.value]}
                  onValueChange={([value]) => handleParamChange(control.key, value)}
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{control.format(control.min)}</span>
                  <span>{control.format(control.max)}</span>
                </div>
              </div>
            ))}
          </div>
          
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg"
            >
              <div className="flex items-center space-x-2 text-blue-400">
                <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-sm">Simulation running - parameters will update in real-time</span>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}