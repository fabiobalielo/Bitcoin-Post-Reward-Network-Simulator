'use client'

import { useState, useEffect, useRef } from 'react'

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export function useWebSocket(url: string) {
  const [lastMessage, setLastMessage] = useState<any>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connected')
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // For now, we'll simulate a connection and use polling instead of WebSocket
    setConnectionStatus('connected')
    
    // Simulate receiving messages every 30 seconds
    intervalRef.current = setInterval(() => {
      setLastMessage({
        type: 'bitcoin_update',
        timestamp: new Date().toISOString(),
        data: { simulated: true }
      })
    }, 30000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [url])

  const sendMessage = (message: any) => {
    // Simulate sending message
    console.log('Simulated message send:', message)
  }

  return {
    lastMessage,
    connectionStatus,
    sendMessage
  }
}