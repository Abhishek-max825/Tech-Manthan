import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

const ClapDetector = ({ isListening, setIsListening, onClapDetected, onError, disabled }) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [audioChunks, setAudioChunks] = useState([])
  const [stream, setStream] = useState(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const [lastClapScore, setLastClapScore] = useState(null)
  const [showClapFeedback, setShowClapFeedback] = useState(false)
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
            sampleRate: 44100,  // Higher sample rate for better quality
            channelCount: 1,
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            latency: 0.01  // Lower latency for better responsiveness
          } 
        })
        
        setStream(mediaStream)
        
        // Add audio level monitoring
        const audioContext = new AudioContext()
        const source = audioContext.createMediaStreamSource(mediaStream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 256
        source.connect(analyser)
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        const updateAudioLevel = () => {
          if (isListening) {
            analyser.getByteFrequencyData(dataArray)
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length
            setAudioLevel(average)
            requestAnimationFrame(updateAudioLevel)
          }
        }
        
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
      mediaRecorder.start(500) // Record in 0.5-second chunks for more responsive detection
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
      
      if (result.clapDetected && result.score > 0.3) { // Lowered threshold for better sensitivity
        const now = Date.now()
        if (now - lastClapTime.current > 500) { // Prevent rapid-fire claps
          lastClapTime.current = now
          setLastClapScore(result.score)
          setShowClapFeedback(true)
          setTimeout(() => setShowClapFeedback(false), 1000)
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
    if (!isListening) {
      setLastClapScore(null) // Reset score when starting
      setShowClapFeedback(false) // Reset feedback when starting
    }
    setIsListening(!isListening)
  }

  const testClapDetection = () => {
    if (!disabled && !processingRef.current) {
      onClapDetected()
    }
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
      
      {isListening && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={testClapDetection}
          disabled={disabled || isProcessing}
          className="px-4 py-2 rounded-lg font-semibold text-white bg-yellow-600 hover:bg-yellow-700 shadow-lg shadow-yellow-500/50 transition-all duration-300"
        >
          Test Clap Detection
        </motion.button>
      )}
      
      {isProcessing && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-blue-400">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            Processing audio...
          </div>
        </div>
      )}
      
      {showClapFeedback && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 text-green-400 text-lg font-semibold">
            <span className="text-2xl">👏</span>
            Clap Detected!
          </div>
        </motion.div>
      )}
      
      {isListening && (
        <div className="text-center text-sm text-gray-400">
          <p>Clap to decrease the countdown</p>
          <p className="text-xs mt-1">Detection sensitivity: 70%</p>
          <div className="mt-2">
            <div className="w-32 h-2 bg-gray-700 rounded-full mx-auto">
              <div 
                className="h-2 bg-green-400 rounded-full transition-all duration-100"
                style={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
              />
            </div>
            <p className="text-xs mt-1">Audio Level: {Math.round(audioLevel)}</p>
            {lastClapScore && (
              <p className="text-xs mt-1 text-green-400">Last Clap Score: {(lastClapScore * 100).toFixed(1)}%</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ClapDetector

