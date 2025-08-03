// Transaction Fee Analysis for Bitcoin Post-Reward Era

export interface FeeMetrics {
  // Current Fee Data
  currentFeeRate: number // sat/vB
  currentMempoolSize: number // number of transactions
  currentBlockSize: number // bytes
  
  // Fee Distribution
  lowPriorityFee: number // sat/vB (10th percentile)
  mediumPriorityFee: number // sat/vB (50th percentile)
  highPriorityFee: number // sat/vB (90th percentile)
  
  // Revenue Calculations
  feesPerBlock: number // BTC
  feesPerBlockUSD: number // USD
  dailyFeeRevenue: number // USD (144 blocks)
  
  // Fee Market Analysis
  feeMarketDepth: number // Total fees available in mempool
  avgTransactionSize: number // bytes
  avgFeePerTransaction: number // USD
  
  // Post-Reward Projections
  requiredFeeRate: number // sat/vB needed for network security
  feeMultiplierNeeded: number // How much fees need to increase
  sustainableTxThroughput: number // tx/s at required fee levels
}

export class FeeAnalyzer {
  
  /**
   * Analyze current fee market conditions
   */
  static analyzeFeeMarket(params: {
    avgFeeRate: number // sat/vB
    mempoolSize: number
    blockSize: number
    btcPrice: number
    networkHashrate: number
    targetSecurityBudget?: number // USD per day
  }): FeeMetrics {
    
    const {
      avgFeeRate,
      mempoolSize,
      blockSize,
      btcPrice,
      networkHashrate,
      targetSecurityBudget = 50000000 // $50M/day default security budget
    } = params
    
    // Estimate fee distribution (simplified model)
    const lowPriorityFee = Math.max(1, avgFeeRate * 0.3) // 30% of average
    const mediumPriorityFee = avgFeeRate
    const highPriorityFee = avgFeeRate * 3 // 3x average for high priority
    
    // Calculate fees per block
    const feesPerBlockSats = avgFeeRate * blockSize
    const feesPerBlock = feesPerBlockSats / 100000000 // Convert to BTC
    const feesPerBlockUSD = feesPerBlock * btcPrice
    const dailyFeeRevenue = feesPerBlockUSD * 144 // 144 blocks per day
    
    // Fee market analysis
    const avgTransactionSize = 250 // bytes (typical transaction)
    const transactionsPerBlock = Math.floor(blockSize / avgTransactionSize)
    const avgFeePerTransaction = (feesPerBlockUSD / transactionsPerBlock)
    
    // Estimate total fees available in mempool
    const avgMempoolFeeRate = avgFeeRate * 0.8 // Slightly lower than block average
    const totalMempoolBytes = mempoolSize * avgTransactionSize
    const feeMarketDepth = (avgMempoolFeeRate * totalMempoolBytes / 100000000) * btcPrice
    
    // Post-reward requirements
    const requiredDailyRevenue = targetSecurityBudget
    const requiredFeePerBlock = requiredDailyRevenue / 144
    const requiredFeesPerBlockBTC = requiredFeePerBlock / btcPrice
    const requiredFeeRate = (requiredFeesPerBlockBTC * 100000000) / blockSize
    
    const feeMultiplierNeeded = requiredFeeRate / avgFeeRate
    
    // Sustainable throughput (assuming fee elasticity)
    const demandElasticity = -0.3 // 30% demand reduction for 100% fee increase
    const feeIncrease = Math.max(0, feeMultiplierNeeded - 1)
    const demandReduction = Math.min(0.8, Math.abs(demandElasticity * feeIncrease)) // Cap at 80% reduction
    const baseThroughput = transactionsPerBlock * 144 / 86400 // tx/s
    const sustainableTxThroughput = Math.max(0.1, baseThroughput * (1 - demandReduction)) // Minimum 0.1 tx/s
    
    return {
      currentFeeRate: avgFeeRate,
      currentMempoolSize: mempoolSize,
      currentBlockSize: blockSize,
      lowPriorityFee,
      mediumPriorityFee,
      highPriorityFee,
      feesPerBlock,
      feesPerBlockUSD,
      dailyFeeRevenue,
      feeMarketDepth,
      avgTransactionSize,
      avgFeePerTransaction,
      requiredFeeRate,
      feeMultiplierNeeded,
      sustainableTxThroughput
    }
  }
  
  /**
   * Calculate fee scenarios for different network conditions
   */
  static calculateFeeScenarios(params: {
    baseFeeRate: number
    btcPrice: number
    blockSize: number
    scenarios: Array<{
      name: string
      demandMultiplier: number
      feeMultiplier: number
    }>
  }) {
    const { baseFeeRate, btcPrice, blockSize, scenarios } = params
    
    return scenarios.map(scenario => {
      const effectiveFeeRate = baseFeeRate * scenario.feeMultiplier
      const feesPerBlock = (effectiveFeeRate * blockSize) / 100000000 * btcPrice
      const dailyRevenue = feesPerBlock * 144
      
      return {
        name: scenario.name,
        feeRate: effectiveFeeRate,
        feesPerBlock,
        dailyRevenue,
        demandMultiplier: scenario.demandMultiplier,
        avgConfirmTime: Math.max(10, 600 / (7 * scenario.demandMultiplier)) // Simplified model
      }
    })
  }
  
  /**
   * Estimate fee market evolution over time
   */
  static projectFeeMarketEvolution(params: {
    currentFeeRate: number
    btcPrice: number
    blockSize: number
    yearsToProject: number
    annualDemandGrowth: number // e.g., 0.1 for 10% annual growth
    feeElasticity: number // e.g., -0.3 for 30% demand reduction per 100% fee increase
  }) {
    const {
      currentFeeRate,
      btcPrice,
      blockSize,
      yearsToProject,
      annualDemandGrowth,
      feeElasticity
    } = params
    
    const projections = []
    let currentDemand = 1.0
    let currentFee = currentFeeRate
    
    for (let year = 0; year <= yearsToProject; year++) {
      // Demand grows, but fees increase to maintain block space scarcity
      const demandGrowth = Math.pow(1 + annualDemandGrowth, year)
      const feeIncrease = Math.pow(demandGrowth, Math.abs(1 / feeElasticity))
      
      const projectedFeeRate = currentFeeRate * feeIncrease
      const feesPerBlock = (projectedFeeRate * blockSize) / 100000000 * btcPrice
      const dailyRevenue = feesPerBlock * 144
      
      projections.push({
        year: new Date().getFullYear() + year,
        feeRate: projectedFeeRate,
        feesPerBlock,
        dailyRevenue,
        demandMultiplier: demandGrowth
      })
    }
    
    return projections
  }
}

// Utility functions for fee formatting
export function formatFeeRate(feeRate: number): string {
  if (feeRate >= 1000) return `${(feeRate / 1000).toFixed(2)}k sat/vB`
  if (feeRate >= 100) return `${feeRate.toFixed(0)} sat/vB`
  return `${feeRate.toFixed(2)} sat/vB`
}

export function formatFeePriority(feeRate: number): {
  text: string
  color: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
} {
  if (feeRate < 5) {
    return { text: 'Low Priority', color: 'text-green-400', priority: 'low' }
  } else if (feeRate < 20) {
    return { text: 'Medium Priority', color: 'text-yellow-400', priority: 'medium' }
  } else if (feeRate < 100) {
    return { text: 'High Priority', color: 'text-orange-400', priority: 'high' }
  } else {
    return { text: 'Urgent', color: 'text-red-400', priority: 'urgent' }
  }
}

export function calculateFeeEfficiency(params: {
  feeRate: number // sat/vB
  confirmationTime: number // minutes
  targetTime: number // minutes
}): number {
  const { feeRate, confirmationTime, targetTime } = params
  
  // Efficiency = (target time / actual time) / (fee rate / base rate)
  const timeEfficiency = targetTime / confirmationTime
  const feeEfficiency = 10 / feeRate // Assume 10 sat/vB as base
  
  return timeEfficiency * feeEfficiency
}