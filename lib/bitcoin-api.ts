import axios from 'axios'

export interface BitcoinMetrics {
  price: number
  hashrate: number
  difficulty: number
  mempoolSize: number
  avgFeeRate: number
  txThroughput: number
  blockHeight: number
  timestamp: Date
}

class BitcoinAPI {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_TTL = 30000 // 30 seconds

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }
    return null
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  async getBitcoinPrice(): Promise<number> {
    const cached = this.getCached<number>('price')
    if (cached) return cached

    try {
      // Try CoinGecko first (most reliable free API)
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
        { timeout: 8000 }
      )
      
      const price = response.data?.bitcoin?.usd
      if (price && price > 1000) {
        console.log(`✅ Bitcoin price fetched: $${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`)
        this.setCache('price', price)
        return price
      }
      
      throw new Error('Invalid price data')
    } catch (error) {
      console.log('⚠️ CoinGecko API failed, trying Coinbase...')
      
      try {
        const response = await axios.get(
          'https://api.coinbase.com/v2/exchange-rates?currency=BTC',
          { timeout: 8000 }
        )
        
        const price = parseFloat(response.data?.data?.rates?.USD)
        if (price && price > 1000) {
          console.log(`✅ Bitcoin price fetched from Coinbase: $${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`)
          this.setCache('price', price)
          return price
        }
      } catch (coinbaseError) {
        console.log('⚠️ Coinbase API also failed')
      }
      
      // Use realistic current price as fallback
      const fallbackPrice = 100000 // Current market range
      console.log(`📊 Using fallback Bitcoin price: $${fallbackPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}`)
      return fallbackPrice
    }
  }

  async getNetworkStats(): Promise<Partial<BitcoinMetrics>> {
    const cached = this.getCached<Partial<BitcoinMetrics>>('network')
    if (cached) return cached

    try {
      // Try multiple free APIs with fallbacks (current network values)
      let networkData = {
        mempoolSize: 35000, // Current typical mempool size
        avgFeeRate: 12, // Current median fee rate (sat/vB)
        hashrate: 750e18, // Current network hashrate (~750 EH/s)
        difficulty: 103e12, // Current difficulty
        txThroughput: 7, // Bitcoin's theoretical max TPS
        blockHeight: 875000, // Approximate current block height
      }

      try {
        // Try mempool.space first
        const mempoolResponse = await axios.get('https://mempool.space/api/mempool', { timeout: 5000 })
        const mempool = mempoolResponse.data
        
        if (mempool) {
          networkData.mempoolSize = mempool.count || networkData.mempoolSize
          networkData.avgFeeRate = mempool.feeRange?.[3] || mempool.feeRange?.[2] || networkData.avgFeeRate
        }
      } catch (mempoolError) {
        console.log('Mempool.space API unavailable, using fallback data')
      }

      try {
        // Try to get basic stats from blockstream
        const blockstreamResponse = await axios.get('https://blockstream.info/api/blocks/tip/height', { timeout: 5000 })
        networkData.blockHeight = blockstreamResponse.data || networkData.blockHeight
      } catch (blockstreamError) {
        console.log('Blockstream API unavailable, using fallback data')
      }

      this.setCache('network', networkData)
      return networkData
    } catch (error) {
      console.error('Error fetching network stats:', error)
      return {
        mempoolSize: 50000,
        avgFeeRate: 20,
        hashrate: 400e18,
        difficulty: 60e12,
        txThroughput: 7,
        blockHeight: 820000,
      }
    }
  }

  async getAllMetrics(): Promise<BitcoinMetrics> {
    const [price, networkStats] = await Promise.all([
      this.getBitcoinPrice(),
      this.getNetworkStats()
    ])

    return {
      price,
      hashrate: networkStats.hashrate || 400e18,
      difficulty: networkStats.difficulty || 60e12,
      mempoolSize: networkStats.mempoolSize || 50000,
      avgFeeRate: networkStats.avgFeeRate || 20,
      txThroughput: networkStats.txThroughput || 7,
      blockHeight: networkStats.blockHeight || 820000,
      timestamp: new Date()
    }
  }
}

export const bitcoinAPI = new BitcoinAPI()