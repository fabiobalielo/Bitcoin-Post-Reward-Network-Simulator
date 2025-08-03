import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number, decimals: number = 2): string {
  const maxDecimals = Math.min(decimals, 2) // Cap at 2 decimal places
  if (num >= 1e12) return `${(num / 1e12).toFixed(maxDecimals)}T`
  if (num >= 1e9) return `${(num / 1e9).toFixed(maxDecimals)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(maxDecimals)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(maxDecimals)}K`
  return num.toFixed(maxDecimals)
}

export function formatHashrate(hashrate: number): string {
  if (hashrate >= 1e18) return `${(hashrate / 1e18).toFixed(2)} EH/s`
  if (hashrate >= 1e15) return `${(hashrate / 1e15).toFixed(2)} PH/s`
  if (hashrate >= 1e12) return `${(hashrate / 1e12).toFixed(2)} TH/s`
  return `${hashrate.toFixed(2)} H/s`
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function calculateMinerRevenue(
  avgFeeRate: number,
  blockSize: number,
  btcPrice: number
): number {
  // Simplified calculation: fee rate * block size * BTC price
  const feesInBTC = (avgFeeRate * blockSize) / 100000000 // Convert sats to BTC
  return feesInBTC * btcPrice
}

export function calculateNetworkSecurity(
  hashrate: number,
  minerRevenue: number,
  minerCostPerTH: number
): number {
  // Simplified security model based on cost to attack
  const totalMinerCost = (hashrate / 1e12) * minerCostPerTH * 24 // Daily cost
  const revenuePerDay = minerRevenue * 144 // Blocks per day
  return Math.min(revenuePerDay / totalMinerCost, 2) // Cap at 2x
}