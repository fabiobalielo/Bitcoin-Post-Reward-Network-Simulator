// Mining Economics Calculator for Bitcoin Post-Reward Era

export interface MiningPoolMetrics {
  // Hardware & Infrastructure
  totalHashrate: number; // TH/s
  hardwareCost: number; // USD per TH/s
  hardwareLifespan: number; // years

  // Operating Expenses
  electricityCost: number; // USD per kWh
  powerConsumption: number; // Watts per TH/s
  coolingCost: number; // % of electricity cost
  facilityRent: number; // USD per month
  staffCost: number; // USD per month
  maintenanceCost: number; // % of hardware cost per year

  // Network Economics
  networkHashrate: number; // Total network TH/s
  btcPrice: number;
  avgFeeRate: number; // sat/vB
  blockSize: number; // bytes

  // Calculated Metrics
  marketShare: number; // % of network hashrate
  dailyBlocks: number; // blocks mined per day
  dailyRevenue: number; // USD
  dailyExpenses: number; // USD
  dailyProfit: number; // USD
  profitMargin: number; // %
  breakEvenPrice: number; // USD per BTC
  roiMonths: number; // months to ROI
}

export class MiningEconomicsCalculator {
  /**
   * Calculate comprehensive mining pool economics
   */
  static calculateMiningMetrics(params: {
    poolHashrate: number; // TH/s
    networkHashrate: number; // TH/s
    btcPrice: number;
    avgFeeRate: number; // sat/vB
    blockSize: number; // bytes
    electricityCost?: number; // USD per kWh
    hardwareCostPerTH?: number; // USD per TH/s
    powerConsumptionPerTH?: number; // Watts per TH/s
  }): MiningPoolMetrics {
    const {
      poolHashrate,
      networkHashrate,
      btcPrice,
      avgFeeRate,
      blockSize,
      electricityCost = 0.08, // Default $0.08/kWh
      hardwareCostPerTH = 25, // Default $25/TH for modern ASIC
      powerConsumptionPerTH = 25, // Default 25W/TH for efficient miners
    } = params;

    // Convert hashrates from H/s to TH/s for calculations
    const poolTH = poolHashrate / 1e12;
    const networkTH = networkHashrate / 1e12;

    // Market share and block mining probability
    const marketShare = (poolTH / networkTH) * 100;
    const blocksPerDay = 144; // Bitcoin target: 144 blocks per day
    const dailyBlocks = blocksPerDay * (poolTH / networkTH);

    // Revenue calculations (fees only - post reward era)
    const feesPerBlock = (avgFeeRate * blockSize) / 100000000; // Convert sats to BTC
    const dailyBTCRevenue = dailyBlocks * feesPerBlock;
    const dailyRevenue = dailyBTCRevenue * btcPrice;

    // Operating expense calculations (per TH/s, then scale to pool size)
    const powerPerTH = powerConsumptionPerTH / 1000; // Convert W to kW
    const dailyElectricityPerTH = powerPerTH * 24 * electricityCost;
    const dailyCoolingPerTH = dailyElectricityPerTH * 0.3; // 30% additional for cooling

    // Infrastructure costs (amortized daily per TH/s)
    const hardwareLifespan = 3; // years
    const dailyDepreciationPerTH = hardwareCostPerTH / (hardwareLifespan * 365);

    // Facility and operational costs (per TH/s per day) - more realistic for large operations
    const dailyFacilityPerTH = 0.1; // $0.10 per TH/s per day for facility (economies of scale)
    const dailyStaffPerTH = 0.05; // $0.05 per TH/s per day for staff (automated operations)
    const dailyMaintenancePerTH = (hardwareCostPerTH * 0.02) / 365; // 2% annually

    // Total daily expenses per TH/s, then scale to pool
    const dailyExpensesPerTH =
      dailyElectricityPerTH +
      dailyCoolingPerTH +
      dailyDepreciationPerTH +
      dailyFacilityPerTH +
      dailyStaffPerTH +
      dailyMaintenancePerTH;

    const dailyExpenses = dailyExpensesPerTH * poolTH;
    const totalHardwareCost = poolTH * hardwareCostPerTH;

    // Profitability metrics with validation
    const dailyProfit = dailyRevenue - dailyExpenses;
    const profitMargin =
      dailyRevenue > 0
        ? Math.max(-1000, Math.min(1000, (dailyProfit / dailyRevenue) * 100))
        : -100;

    // Break-even BTC price (price needed to cover all costs) - cap at reasonable values
    const breakEvenPrice =
      dailyBTCRevenue > 0
        ? Math.min(10000000, dailyExpenses / dailyBTCRevenue) // Cap at $10M per BTC
        : Infinity;

    // ROI calculation - cap at reasonable timeframes
    const roiMonths =
      dailyProfit > 0
        ? Math.min(1200, totalHardwareCost / (dailyProfit * 30)) // Cap at 100 years
        : Infinity;

    return {
      totalHashrate: poolHashrate,
      hardwareCost: hardwareCostPerTH,
      hardwareLifespan,
      electricityCost,
      powerConsumption: powerConsumptionPerTH,
      coolingCost: 30, // 30% of electricity
      facilityRent: dailyFacilityPerTH * poolTH * 30, // Monthly equivalent
      staffCost: dailyStaffPerTH * poolTH * 30, // Monthly equivalent
      maintenanceCost: 2, // 2% annually
      networkHashrate,
      btcPrice,
      avgFeeRate,
      blockSize,
      marketShare,
      dailyBlocks,
      dailyRevenue,
      dailyExpenses,
      dailyProfit,
      profitMargin,
      breakEvenPrice,
      roiMonths,
    };
  }

  /**
   * Calculate network-wide mining economics
   */
  static calculateNetworkEconomics(params: {
    networkHashrate: number;
    btcPrice: number;
    avgFeeRate: number;
    blockSize: number;
    electricityCost?: number;
  }) {
    // Assume average mining pool represents the network
    const averagePoolSize = params.networkHashrate * 0.1; // 10% of network

    return this.calculateMiningMetrics({
      poolHashrate: averagePoolSize,
      ...params,
    });
  }

  /**
   * Calculate hashrate sustainability threshold
   */
  static calculateHashrateSustainability(params: {
    btcPrice: number;
    avgFeeRate: number;
    blockSize: number;
    electricityCost?: number;
    targetProfitMargin?: number;
  }): number {
    const {
      btcPrice,
      avgFeeRate,
      blockSize,
      electricityCost = 0.08,
      targetProfitMargin = 10, // 10% profit margin target
    } = params;

    // Calculate total network daily revenue from fees
    const feesPerBlock = (avgFeeRate * blockSize) / 100000000; // BTC per block
    const dailyBTCRevenue = 144 * feesPerBlock; // 144 blocks per day
    const dailyUSDRevenue = dailyBTCRevenue * btcPrice;

    // Calculate realistic costs per TH/s per day
    const powerPerTH = 25 / 1000; // 25W converted to kW
    const dailyElectricityPerTH = powerPerTH * 24 * electricityCost;
    const dailyCoolingPerTH = dailyElectricityPerTH * 0.3;
    const dailyInfrastructurePerTH = 0.1 + 0.05 + 0.15; // Facility + staff + maintenance (more realistic)
    const totalCostPerTHPerDay =
      dailyElectricityPerTH + dailyCoolingPerTH + dailyInfrastructurePerTH;

    // Calculate sustainable hashrate with target profit margin
    const targetCostRatio = (100 - targetProfitMargin) / 100;
    const maxAffordableCostPerDay = dailyUSDRevenue * targetCostRatio;
    const sustainableHashrateTH =
      maxAffordableCostPerDay / totalCostPerTHPerDay;

    return Math.max(0, sustainableHashrateTH * 1e12); // Convert TH/s to H/s
  }
}

// Utility functions for formatting mining metrics
export function formatHashrate(hashrate: number): string {
  if (hashrate >= 1e18) return `${(hashrate / 1e18).toFixed(2)} EH/s`;
  if (hashrate >= 1e15) return `${(hashrate / 1e15).toFixed(2)} PH/s`;
  if (hashrate >= 1e12) return `${(hashrate / 1e12).toFixed(2)} TH/s`;
  return `${hashrate.toFixed(2)} H/s`;
}

export function formatProfitability(profitMargin: number): {
  text: string;
  color: string;
  status: "profitable" | "marginal" | "unprofitable";
} {
  if (profitMargin > 20) {
    return {
      text: "Highly Profitable",
      color: "text-green-400",
      status: "profitable",
    };
  } else if (profitMargin > 10) {
    return {
      text: "Profitable",
      color: "text-green-400",
      status: "profitable",
    };
  } else if (profitMargin > 0) {
    return {
      text: "Marginally Profitable",
      color: "text-yellow-400",
      status: "marginal",
    };
  } else if (profitMargin > -20) {
    return {
      text: "Unprofitable",
      color: "text-red-400",
      status: "unprofitable",
    };
  } else {
    return {
      text: "Severely Unprofitable",
      color: "text-red-400",
      status: "unprofitable",
    };
  }
}
