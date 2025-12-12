/**
 * useGameTimer Hook
 * 
 * A functional hook for tracking game time.
 * Uses useEffect with cleanup to prevent memory leaks.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

interface TimerState {
  readonly elapsedSeconds: number
  readonly isRunning: boolean
}

interface TimerActions {
  readonly start: () => void
  readonly pause: () => void
  readonly reset: () => void
  readonly formatTime: () => string
}

type UseGameTimerReturn = TimerState & TimerActions

/**
 * Format seconds into MM:SS format.
 */
function formatElapsedTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * A hook that manages a game timer.
 * 
 * @param autoStart - Whether to start the timer automatically
 * @returns Timer state and control functions
 */
export function useGameTimer(autoStart = true): UseGameTimerReturn {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(autoStart)
  const intervalRef = useRef<number | null>(null)
  
  // Start the timer
  const start = useCallback((): void => {
    setIsRunning(true)
  }, [])
  
  // Pause the timer
  const pause = useCallback((): void => {
    setIsRunning(false)
  }, [])
  
  // Reset the timer
  const reset = useCallback((): void => {
    setElapsedSeconds(0)
    setIsRunning(autoStart)
  }, [autoStart])
  
  // Format current time
  const formatTime = useCallback((): string => {
    return formatElapsedTime(elapsedSeconds)
  }, [elapsedSeconds])
  
  // Timer effect
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    } else if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    // Cleanup on unmount
    return (): void => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])
  
  return {
    elapsedSeconds,
    isRunning,
    start,
    pause,
    reset,
    formatTime,
  }
}
