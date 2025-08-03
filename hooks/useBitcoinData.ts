'use client'

import { useState, useEffect } from 'react'
import { bitcoinAPI, BitcoinMetrics } from '@/lib/bitcoin-api'

export function useBitcoinData() {
  const [data, setData] = useState<BitcoinMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        console.log('🔄 Fetching Bitcoin data...')
        setIsLoading(true)
        setError(null)
        
        const metrics = await bitcoinAPI.getAllMetrics()
        
        if (isMounted) {
          console.log('✅ Bitcoin data updated:', {
            price: `$${metrics.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
            mempoolSize: metrics.mempoolSize.toLocaleString(),
            avgFeeRate: `${metrics.avgFeeRate.toFixed(2)} sat/vB`
          })
          
          setData(metrics)
          setLastUpdate(new Date())
          setError(null)
        }
      } catch (err) {
        console.error('❌ Error fetching Bitcoin data:', err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch data')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    // Initial fetch
    fetchData()

    // Refresh data every 15 seconds for better responsiveness
    const interval = setInterval(fetchData, 15000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  return { data, isLoading, error, lastUpdate }
}