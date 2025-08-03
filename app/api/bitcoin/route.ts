import { NextRequest, NextResponse } from 'next/server'
import { bitcoinAPI } from '@/lib/bitcoin-api'

export async function GET(request: NextRequest) {
  try {
    const metrics = await bitcoinAPI.getAllMetrics()
    
    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching Bitcoin metrics:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Bitcoin metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { simulationParams } = body
    
    // Here you would typically save simulation parameters to database
    // For now, we'll just return the processed data
    
    const metrics = await bitcoinAPI.getAllMetrics()
    
    // Apply simulation parameters to the data
    const simulatedMetrics = {
      ...metrics,
      price: simulationParams.btcPrice || metrics.price,
      avgFeeRate: metrics.avgFeeRate * (simulationParams.feeMultiplier || 1),
      mempoolSize: Math.round(metrics.mempoolSize * (simulationParams.txDemandMultiplier || 1))
    }
    
    return NextResponse.json({
      success: true,
      data: simulatedMetrics,
      simulationParams,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error processing simulation:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process simulation',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}