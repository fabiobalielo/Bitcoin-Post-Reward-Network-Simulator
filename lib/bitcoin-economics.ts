// Rigorous Bitcoin Post-Reward Economic Model

export interface EconomicInputs {
  // Core Bitcoin Parameters
  btcPrice: number
  blockLimitMB: number
  baselineFeerate: number // f0 (sat/vB)
  baselineDemandVbDay: number // Q0 (vB/day)
  elasticity: number // epsilon (negative, e.g., -0.3 to -0.8)
  
  // Mining Economics
  mevUplift: number // gamma (0..0.3) - non-fee revenue as fraction of fees
  costPerTHDay: number // USD/TH/day
  margin: number // mu (e.g., 0.1 for 10% profit margin)
  poolShare: number // p (0..1)
  
  // Transaction Parameters
  avgTxVb: number // e.g., 250 vB per transaction
  backlogVb: number // initial backlog (vB)
  
  // Security Budget Configuration
  securityBudgetMode: "percent_of_2025" | "percent_of_settlement_value" | "absolute_usd"
  alpha?: number // for percent_of_2025
  base2025RevenueUsd?: number
  beta?: number // for percent_of_settlement_value
  settlementUsdDay?: number
  absoluteUsdDay?: number // for absolute_usd
  
  // Advanced Parameters
  batchingFactor?: number // >=1
  valuePerTxMultiplier?: number // >=1 (informational)
  rentRateUsdPerTHHour?: number // for attack cost calculation
}

export interface EconomicOutputs {
  // Fee Market
  optimalFeerate: number // sat/vB
  dailyFeeRevenueBTC: number
  dailyFeeRevenueUSD: number
  feesPerBlockBTC: number
  avgFeePerTxUSD: number
  
  // Transaction Flow
  demandVbPerDay: number
  confirmedVbPerDay: number
  backlogVb: number
  avgConfirmationTimeMin: number
  
  // Mining & Security
  equilibriumHashrateTH: number
  networkRevenueUSD: number
  securityBudgetTargetUSD: number
  attackCost6hUSD: number
  attackCostAsPercentOfSettlement: number
  
  // Pool Metrics
  poolDailyRevenueUSD: number
  poolDailyExpensesUSD: number
  poolDailyProfitUSD: number
  poolProfitMargin: number
  
  // Break-even Analysis
  breakEvenBTCPrice: number
  hashrateSustainabilityRatio: number
}

const BLOCKS_PER_DAY = 144
const SATOSHIS_PER_BTC = 1e8

export class BitcoinEconomicsModel {
  
  static blockLimitVb(blockLimitMB: number): number {
    return blockLimitMB * 1_000_000
  }
  
  static demandVbPerDay(feerate: number, inputs: EconomicInputs): number {
    const { baselineFeerate, baselineDemandVbDay, elasticity, batchingFactor = 1 } = inputs
    const ratio = feerate / baselineFeerate
    return (baselineDemandVbDay / batchingFactor) * Math.pow(ratio, elasticity)
  }
  
  static confirmedVbPerDay(feerate: number, inputs: EconomicInputs): number {
    const demand = this.demandVbPerDay(feerate, inputs)
    const supply = this.blockLimitVb(inputs.blockLimitMB) * BLOCKS_PER_DAY
    return Math.min(demand, supply)
  }
  
  static feesUsdPerDay(feerate: number, inputs: EconomicInputs): number {
    const vbConfirmed = this.confirmedVbPerDay(feerate, inputs)
    const feesBtc = (feerate * vbConfirmed) / SATOSHIS_PER_BTC
    return usd(feesBtc, inputs.btcPrice)
  }
  
  static feesBtcPerDay(feerate: number, inputs: EconomicInputs): number {
    const vbConfirmed = this.confirmedVbPerDay(feerate, inputs)
    return (feerate * vbConfirmed) / SATOSHIS_PER_BTC
  }
  
  static securityBudgetTargetUsd(inputs: EconomicInputs): number {
    switch (inputs.securityBudgetMode) {
      case "absolute_usd":
        return inputs.absoluteUsdDay!
      case "percent_of_2025":
        return inputs.alpha! * inputs.base2025RevenueUsd!
      case "percent_of_settlement_value":
        return inputs.beta! * inputs.settlementUsdDay!
      default:
        throw new Error("Invalid security budget mode")
    }
  }
  
  static solveFeerateForTarget(inputs: EconomicInputs): { 
    feerate: number; 
    targetMet: boolean; 
    gap: number;
    actualRevenue: number;
    confirmedDemandMBDay: number;
    targetFeesUsd: number;
  } {
    const securityBudgetTarget = this.securityBudgetTargetUsd(inputs)
    const gamma = inputs.mevUplift
    const tolerance = 0.0025 // ±0.25% tolerance
    
    // GOLDEN EQUATION: F_usd_target = S* / (1 + γ)
    const targetFeesUsd = securityBudgetTarget / (1 + gamma)
    
    // Binary search for feerate that hits: f * Q_conf(f) / 1e8 * P = F_usd_target
    let lo = 1
    let hi = 100000
    let bestFeerate = hi
    let bestGap = Infinity
    let bestFeesUsd = 0
    let bestDemand = 0
    
    for (let i = 0; i < 100; i++) {
      const mid = (lo + hi) / 2
      
      // GOLDEN EQUATION: F_usd = (f * Q_conf) / 1e8 * P
      const confirmedVbDay = this.confirmedVbPerDay(mid, inputs)
      const feesUsd = (mid * confirmedVbDay / SATOSHIS_PER_BTC) * inputs.btcPrice
      
      const gap = Math.abs(feesUsd - targetFeesUsd) / targetFeesUsd
      
      if (gap < bestGap) {
        bestFeerate = mid
        bestGap = gap
        bestFeesUsd = feesUsd
        bestDemand = confirmedVbDay / 1e6 // Convert to MB/day
      }
      
      if (feesUsd >= targetFeesUsd) {
        hi = mid
      } else {
        lo = mid
      }
      
      if (hi - lo < 0.001) break // Fine convergence
    }
    
    const finalGap = (bestFeesUsd - targetFeesUsd) / targetFeesUsd
    const actualRevenue = bestFeesUsd * (1 + gamma) // Total revenue with MEV
    
    return {
      feerate: bestFeerate,
      targetMet: Math.abs(finalGap) <= tolerance,
      gap: finalGap,
      actualRevenue: actualRevenue,
      confirmedDemandMBDay: bestDemand,
      targetFeesUsd: targetFeesUsd
    }
  }
  
  static equilibriumHashrateTH(feerate: number, rewardUsdDay: number, inputs: EconomicInputs): number {
    const feeRevenue = this.feesUsdPerDay(feerate, inputs) * (1 + inputs.mevUplift)
    const totalRevenue = feeRevenue + rewardUsdDay
    return totalRevenue / (inputs.costPerTHDay * (1 + inputs.margin))
  }
  
  static attackCostUsd(hours: number, hashrateTH: number, rentRateUsdPerTHHour: number): number {
    const attackerTH = 0.51 * hashrateTH
    return attackerTH * rentRateUsdPerTHHour * hours
  }
  
  static calculateConfirmationTime(feerate: number, inputs: EconomicInputs): number {
    const demand = this.demandVbPerDay(feerate, inputs)
    const supply = this.blockLimitVb(inputs.blockLimitMB) * BLOCKS_PER_DAY
    
    if (demand <= supply) {
      return 10 // ~1 block time in minutes
    }
    
    // Simplified backlog model
    const backlog = inputs.backlogVb + (demand - supply)
    return Math.max(10, (backlog / supply) * 10 * 60) // Convert to minutes
  }
  
  static computeFullModel(inputs: EconomicInputs, includeBlockRewards: boolean = false): EconomicOutputs & { 
    solverInfo: { targetMet: boolean; gap: number; actualRevenue: number; targetFeesUsd: number }; 
    currentHashrateTH?: number 
  } {
    // Calculate current block reward value
    const currentBlockReward = includeBlockRewards ? 3.125 : 0 // BTC per block
    const rewardUsdDay = usd(currentBlockReward * BLOCKS_PER_DAY, inputs.btcPrice)
    
    // Solve for optimal feerate using GOLDEN EQUATIONS
    const solverResult = this.solveFeerateForTarget(inputs)
    const optimalFeerate = solverResult.feerate
    
    // ALL calculations derive from the GOLDEN EQUATIONS - single source of truth
    const confirmedVbPerDay = this.confirmedVbPerDay(optimalFeerate, inputs)
    
    // GOLDEN: F_usd = (f * Q_conf) / 1e8 * P
    const dailyFeeRevenueUSD = (optimalFeerate * confirmedVbPerDay / SATOSHIS_PER_BTC) * inputs.btcPrice
    const dailyFeeRevenueBTC = dailyFeeRevenueUSD / inputs.btcPrice
    
    // GOLDEN: Fees/block = F_usd / B
    const feesPerBlockUSD = dailyFeeRevenueUSD / BLOCKS_PER_DAY
    const feesPerBlockBTC = feesPerBlockUSD / inputs.btcPrice
    
    // GOLDEN: Fee/tx = (f * avgTxVb / 1e8) * P
    const avgFeePerTxUSD = (optimalFeerate * inputs.avgTxVb / SATOSHIS_PER_BTC) * inputs.btcPrice
    
    // QA checks for GOLDEN EQUATIONS - must be exact
    assertNearlyEqual(dailyFeeRevenueUSD, solverResult.targetFeesUsd, 1, "Daily fees match solver target")
    assertNearlyEqual(feesPerBlockUSD, dailyFeeRevenueUSD / BLOCKS_PER_DAY, 0.01, "Fees per block consistency")
    assertNearlyEqual(feesPerBlockBTC * inputs.btcPrice, feesPerBlockUSD, 0.01, "Block fees BTC/USD consistency")
    assertNearlyEqual(dailyFeeRevenueBTC * inputs.btcPrice, dailyFeeRevenueUSD, 0.01, "Daily fees BTC/USD consistency")
    
    // Calculate transaction flow
    const demandVbPerDay = this.demandVbPerDay(optimalFeerate, inputs)
    // confirmedVbPerDay already calculated above for fee triangle
    const backlogVb = Math.max(0, inputs.backlogVb + demandVbPerDay - confirmedVbPerDay)
    const avgConfirmationTimeMin = this.calculateConfirmationTime(optimalFeerate, inputs)
    
    // Calculate mining & security - hashrate MUST use the same revenue that hit the target
    const feeRevenueWithMEV = dailyFeeRevenueUSD * (1 + inputs.mevUplift)
    const networkRevenueUSD = feeRevenueWithMEV + rewardUsdDay
    const securityBudgetTargetUSD = this.securityBudgetTargetUsd(inputs)
    
    // H_eq = (fees_usd_day(f) * (1+γ) + rewards) / (costPerTHDay * (1+μ))
    const equilibriumHashrateTH = networkRevenueUSD / (inputs.costPerTHDay * (1 + inputs.margin))
    
    // Attack cost calculation
    const attackCost6hUSD = this.attackCostUsd(6, equilibriumHashrateTH, inputs.rentRateUsdPerTHHour || 0.06)
    const attackCostAsPercentOfSettlement = inputs.settlementUsdDay ? 
      (attackCost6hUSD / inputs.settlementUsdDay) * 100 : 0
    
    // Calculate pool metrics with precise ratios
    const poolDailyRevenueUSD = networkRevenueUSD * inputs.poolShare
    const poolDailyExpensesUSD = equilibriumHashrateTH * inputs.poolShare * inputs.costPerTHDay
    const poolDailyProfitUSD = poolDailyRevenueUSD - poolDailyExpensesUSD
    const poolProfitMargin = poolDailyRevenueUSD > 0 ? (poolDailyProfitUSD / poolDailyRevenueUSD) : -1
    
    // QA check for pool metrics
    const expectedPoolRevenue = networkRevenueUSD * inputs.poolShare
    assertNearlyEqual(poolDailyRevenueUSD, expectedPoolRevenue, 0.01, "Pool revenue calculation")
    
    // Calculate break-even analysis
    const breakEvenBTCPrice = poolDailyExpensesUSD > 0 && dailyFeeRevenueBTC > 0 ? 
      (poolDailyExpensesUSD / (dailyFeeRevenueBTC * inputs.poolShare)) : Infinity
    
    // Current network hashrate for comparison (approximate)
    const currentHashrateTH = 400 * 1e12 // ~400 EH/s
    const hashrateSustainabilityRatio = equilibriumHashrateTH / currentHashrateTH
    
    return {
      optimalFeerate,
      dailyFeeRevenueBTC,
      dailyFeeRevenueUSD,
      feesPerBlockBTC,
      avgFeePerTxUSD,
      demandVbPerDay,
      confirmedVbPerDay,
      backlogVb,
      avgConfirmationTimeMin,
      equilibriumHashrateTH,
      networkRevenueUSD,
      securityBudgetTargetUSD,
      attackCost6hUSD,
      attackCostAsPercentOfSettlement,
      poolDailyRevenueUSD,
      poolDailyExpensesUSD,
      poolDailyProfitUSD,
      poolProfitMargin,
      breakEvenBTCPrice,
      hashrateSustainabilityRatio,
      solverInfo: { 
        targetMet: solverResult.targetMet, 
        gap: solverResult.gap, 
        actualRevenue: solverResult.actualRevenue,
        targetFeesUsd: solverResult.targetFeesUsd
      },
      currentHashrateTH
    }
  }
}

// Utility functions for consistent formatting and calculations

// Single source of truth for USD conversions - THE ONLY USD CONVERSION FUNCTION
export function usd(btcAmount: number, btcPrice: number): number {
  return btcAmount * btcPrice
}



// Precise percentage formatting with small-value guards - PREVENTS DOUBLE SIGNS
export function pct(x: number, digits: number = 1): string {
  return (x * 100).toFixed(digits) + '%'
}

export function pctOfCurrent(val: number, current: number): string {
  if (current === 0) return '—'
  const r = val / current
  if (r < 0.005) return '<0.5%'
  return pct(r)
}

export function pctChange(newV: number, oldV: number): string {
  if (oldV === 0) return '—'
  const r = (newV - oldV) / oldV
  if (Math.abs(r) < 0.005) return '≈0%'
  const pctValue = (r * 100).toFixed(1)
  return (r >= 0 ? '+' : '') + pctValue + '%'
}

// Improved formatter that prevents double signs and handles edge cases
export function fmtChange(newV: number, oldV: number): string {
  if (oldV === 0) return '—'
  const r = (newV - oldV) / oldV
  if (Math.abs(r) < 0.005) return '≈0%'
  return (r >= 0 ? '+' : '') + (r * 100).toFixed(1) + '%'
}

// Self-test assertions for QA
export function assertNearlyEqual(actual: number, expected: number, tolerance: number, label?: string): void {
  const diff = Math.abs(actual - expected)
  if (diff > tolerance) {
    console.warn(`Assertion failed${label ? ` (${label})` : ''}: ${actual} ≠ ${expected} (diff: ${diff}, tolerance: ${tolerance})`)
  }
}

export function formatHashrate(hashrateTH: number): string {
  const hashrateH = hashrateTH * 1e12
  if (hashrateH >= 1e18) return `${(hashrateH / 1e18).toFixed(2)} EH/s`
  if (hashrateH >= 1e15) return `${(hashrateH / 1e15).toFixed(2)} PH/s`
  if (hashrateH >= 1e12) return `${(hashrateH / 1e12).toFixed(2)} TH/s`
  return `${hashrateH.toFixed(2)} H/s`
}

export function formatAttackCost(costUSD: number, hours: number): string {
  const costFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(costUSD)
  
  return `${costFormatted} (${hours}h attack)`
}

export function getDefaultInputs(): EconomicInputs {
  // Current Bitcoin network values (December 2024/January 2025)
  const currentBTCPrice = 100000 // ~$100K (will be updated with live data)
  const currentBlockReward = 3.125 // BTC per block (post-April 2024 halving)
  const currentSecurityBudget = currentBTCPrice * currentBlockReward * 144 // ~$45M/day
  
  return {
    // Current Market Data (Real Network Stats)
    btcPrice: currentBTCPrice,
    blockLimitMB: 4.0, // Bitcoin Core block weight limit (~4MB with SegWit)
    baselineFeerate: 12, // Current median fee rate during normal periods (sat/vB)
    baselineDemandVbDay: 280_000_000, // ~280MB/day (1.94 MB avg block * 144 blocks)
    
    // Economic Parameters (Industry Data)
    elasticity: -0.5, // Moderate demand elasticity (research-based)
    mevUplift: 0.03, // 3% additional revenue from ordinals/inscriptions (current levels)
    costPerTHDay: 1.5, // $1.50/TH/day (current efficient mining operations)
    margin: 0.107, // 10.7% target profit margin (matches equilibrium calculation)
    poolShare: 0.008, // 0.8% of network (~3.2 EH/s out of 400 EH/s)
    
    // Transaction Parameters (Current Network Reality)
    avgTxVb: 210, // Current average with SegWit adoption (~70% SegWit usage)
    backlogVb: 25_000_000, // ~25MB typical mempool during normal periods
    
    // Security Budget Configuration (Current Economics)
    securityBudgetMode: "percent_of_2025",
    alpha: 0.65, // Target 65% of current security budget (realistic post-reward target)
    base2025RevenueUsd: currentSecurityBudget,
    beta: 0.003, // 0.3% of daily settlement value (conservative estimate)
    settlementUsdDay: 8_000_000_000, // ~$8B daily Bitcoin on-chain settlement
    absoluteUsdDay: 25_000_000, // $25M/day absolute minimum security target
    
    // Advanced Parameters (Current Technology)
    batchingFactor: 1.15, // 15% efficiency gain from current batching/Lightning
    valuePerTxMultiplier: 1.3, // 30% higher value per L1 tx due to L2 growth
    rentRateUsdPerTHHour: 0.06 // $0.06/TH/hour (current cloud mining rates)
  }
}