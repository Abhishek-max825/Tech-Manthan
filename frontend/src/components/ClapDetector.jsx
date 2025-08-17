import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

const ClapDetector = ({ isListening, setIsListening, onClapDetected, onError, disabled }) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [audioChunks, setAudioChunks] = useState([])
  const [stream, setStream] = useState(null)
  const lastClapTime = useRef(0)
  const processingRef = useRef(false)

  // Debounce function to prevent multiple clap detections
  const debounce = useCallback((func, delay) => {
    let timeoutId
    return (...args) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(null, args), delay)
    }
  }, [])

  // Debounced clap detection handler
  const debouncedClapDetected = useCallback(
    debounce(() => {
      if (!disabled && !processingRef.current) {
        onClapDetected()
      }
    }, 500),
    [disabled, onClapDetected]
  )

  // Initialize microphone access
  useEffect(() => {
    const initializeMicrophone = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          } 
        })
        
        setStream(mediaStream)
        
        const recorder = new MediaRecorder(mediaStream, {
          mimeType: 'audio/webm;codecs=opus'
        })
        
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            setAudioChunks(prev => [...prev, event.data])
          }
        }
        
        recorder.onstop = async () => {
          if (audioChunks.length > 0) {
            await processAudioChunks()
          }
        }
        
        setMediaRecorder(recorder)
        
      } catch (error) {
        console.error('Error accessing microphone:', error)
        onError('Failed to access microphone. Please check permissions.')
      }
    }

    if (isListening && !mediaRecorder) {
      initializeMicrophone()
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [isListening, mediaRecorder, stream, audioChunks, onError])

  // Start/stop recording based on listening state
  useEffect(() => {
    if (mediaRecorder && isListening && !disabled) {
      setAudioChunks([])
      mediaRecorder.start(1000) // Record in 1-second chunks
    } else if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
    }
  }, [isListening, mediaRecorder, disabled])

  // Process audio chunks and send to backend
  const processAudioChunks = async () => {
    if (processingRef.current || disabled) return
    
    processingRef.current = true
    setIsProcessing(true)
    
    try {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
      const formData = new FormData()
      formData.append('audio', audioBlob, 'audio.webm')
      
      const response = await fetch('/api/detect', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.clapDetected && result.score > 0.6) {
        const now = Date.now()
        if (now - lastClapTime.current > 500) { // Prevent rapid-fire claps
          lastClapTime.current = now
          debouncedClapDetected()
        }
      }
      
    } catch (error) {
      console.error('Error processing audio:', error)
      onError(`Error processing audio: ${error.message}`)
    } finally {
      processingRef.current = false
      setIsProcessing(false)
      setAudioChunks([])
    }
  }

  const toggleListening = () => {
    if (disabled) return
    setIsListening(!isListening)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleListening}
        disabled={disabled || isProcessing}
        className={`px-8 py-4 rounded-lg font-semibold text-white transition-all duration-300 ${
          isListening 
            ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/50' 
            : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/50'
        } ${(disabled || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${isListening ? 'bg-red-400 animate-pulse' : 'bg-white'}`} />
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </div>
      </motion.button>
      
      {isProcessing && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-blue-400">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            Processing audio...
          </div>
        </div>
      )}
      
      {isListening && (
        <div className="text-center text-sm text-gray-400">
          <p>Clap to decrease the countdown</p>
          <p className="text-xs mt-1">Detection sensitivity: 60%</p>
        </div>
      )}
    </div>
  )
}

export default ClapDetector

