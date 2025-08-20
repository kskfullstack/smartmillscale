"use client"

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export interface ScaleData {
  weight: number
  unit: string
  status: 'stable' | 'unstable' | 'overload' | 'underload'
  timestamp: Date
}

export interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
  scaleData: ScaleData | null
  startWeighing: () => void
  stopWeighing: () => void
  tareScale: () => void
  getCurrentWeight: () => void
}

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [scaleData, setScaleData] = useState<ScaleData | null>(null)

  useEffect(() => {
    // Create socket connection
    socketRef.current = io('http://localhost:3001/scale', {
      transports: ['websocket'],
    })

    const socket = socketRef.current

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to scale WebSocket')
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from scale WebSocket')
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setIsConnected(false)
    })

    // Scale event handlers
    socket.on('scale-status', (data) => {
      console.log('Scale status:', data)
    })

    socket.on('scale-data', (data: ScaleData) => {
      setScaleData({
        ...data,
        timestamp: new Date(data.timestamp)
      })
    })

    socket.on('current-weight', (data: ScaleData) => {
      setScaleData({
        ...data,
        timestamp: new Date(data.timestamp)
      })
    })

    socket.on('weighing-started', (data) => {
      console.log('Weighing started:', data)
    })

    socket.on('weighing-stopped', (data) => {
      console.log('Weighing stopped:', data)
    })

    socket.on('scale-tared', (data) => {
      console.log('Scale tared:', data)
    })

    // Cleanup on unmount
    return () => {
      socket.disconnect()
    }
  }, [])

  const startWeighing = () => {
    if (socketRef.current) {
      socketRef.current.emit('start-weighing')
    }
  }

  const stopWeighing = () => {
    if (socketRef.current) {
      socketRef.current.emit('stop-weighing')
    }
  }

  const tareScale = () => {
    if (socketRef.current) {
      socketRef.current.emit('tare-scale')
    }
  }

  const getCurrentWeight = () => {
    if (socketRef.current) {
      socketRef.current.emit('get-current-weight')
    }
  }

  return {
    socket: socketRef.current,
    isConnected,
    scaleData,
    startWeighing,
    stopWeighing,
    tareScale,
    getCurrentWeight,
  }
}