'use client'

// Updated to use new rigorous economic model
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ObjectivesHeader } from '@/components/ObjectivesHeader'
import { EconomicControls } from '@/components/EconomicControls'
import { EconomicDashboard } from '@/components/EconomicDashboard'
import { TransactionFeeAnalysis } from '@/components/TransactionFeeAnalysis'
import { FeeScenarioCharts } from '@/components/FeeScenarioCharts'
import { KeyInsights } from '@/components/KeyInsights'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useBitcoinData } from '@/hooks/useBitcoinData'
import { EconomicInputs, BitcoinEconomicsModel, getDefaultInputs } from '@/lib/bitcoin-economics'
import { Settings, X, RotateCcw } from 'lucide-react'

export default function Home() {
  const [economicInputs, setEconomicInputs] = useState<EconomicInputs>(() => {
    const defaults = getDefaultInputs()
    return defaults // Use all default values including current BTC price
  })
  const [sidebarOpen, setSidebarOpen] = useState(false) // Start closed on mobile

  const { data: bitcoinData, isLoading, lastUpdate } = useBitcoinData()
  const { lastMessage, connectionStatus } = useWebSocket('/api/ws')

  // Update BTC price from live data
  const updatedInputs = bitcoinData ? {
    ...economicInputs,
    btcPrice: bitcoinData.price
  } : economicInputs

  // Calculate current state (with block rewards)
  const currentResults = BitcoinEconomicsModel.computeFullModel(updatedInputs, true)
  
  // Calculate post-reward state (fees only)
  const postRewardResults = BitcoinEconomicsModel.computeFullModel(updatedInputs, false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Full-width header */}
      <Header connectionStatus={connectionStatus} lastUpdate={lastUpdate} />
      
      {/* Sidebar + Main content layout */}
      <div className="flex h-[calc(100vh-88px)]"> {/* Adjust height to account for header */}
        {/* Sidebar - Mobile overlay, Desktop side panel */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Mobile backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              
              {/* Sidebar */}
              <motion.div
                initial={{ x: -320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -320, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed lg:relative z-50 w-80 max-w-[85vw] h-full bg-gradient-to-b from-slate-900/95 to-slate-800/90 backdrop-blur-sm border-r border-slate-600/50 flex flex-col"
              >
                {/* Fixed Header */}
                <div className="p-4 lg:p-6 border-b border-slate-600/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <Settings className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">Controls</h2>
                        <p className="text-xs text-slate-400">Economic parameters</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarOpen(false)}
                      className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 lg:p-6 pb-24">
                    <EconomicControls
                      inputs={economicInputs}
                      onInputsChange={setEconomicInputs}
                    />
                  </div>
                </div>
                
                {/* Fixed Reset Button at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent">
                  <Button
                    variant="outline"
                    onClick={() => setEconomicInputs(getDefaultInputs())}
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset All Parameters
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Toggle Button - Always visible on mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed top-24 left-4 lg:left-6 z-30"
          >
            <Button
              onClick={() => setSidebarOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-xl border border-blue-500/20 backdrop-blur-sm"
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Controls</span>
            </Button>
          </motion.div>

          <main className="container mx-auto px-4 sm:px-6 py-6 lg:py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6 lg:space-y-8"
            >
              {/* Objectives Header */}
              <ObjectivesHeader inputs={updatedInputs} />

              {/* Economic Dashboard */}
              <EconomicDashboard
                inputs={updatedInputs}
                currentResults={currentResults}
                postRewardResults={postRewardResults}
                isLoading={isLoading}
              />

              {/* Transaction Fee Analysis */}
              <TransactionFeeAnalysis
                inputs={updatedInputs}
                currentResults={currentResults}
                postRewardResults={postRewardResults}
                isLoading={isLoading}
              />

              {/* Fee Scenario Charts */}
              <FeeScenarioCharts
                inputs={updatedInputs}
                currentResults={currentResults}
                postRewardResults={postRewardResults}
              />

              {/* Key Insights & Recommendations */}
              <KeyInsights
                inputs={updatedInputs}
                currentResults={currentResults}
                postRewardResults={postRewardResults}
              />
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  )
}