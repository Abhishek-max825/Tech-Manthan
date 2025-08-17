import React, { useState, useEffect } from 'react'
import CountdownDisplay from './components/CountdownDisplay'
import ClapDetector from './components/ClapDetector'
import MicStatus from './components/MicStatus'
import Toast from './components/Toast'
import confetti from 'react-confetti'

function App() {
  const [countdown, setCountdown] = useState(10)
  const [isListening, setIsListening] = useState(false)
  const [micPermission, setMicPermission] = useState('denied')
  const [showConfetti, setShowConfetti] = useState(false)
  const [toast, setToast] = useState(null)

  const resetGame = () => {
    setCountdown(10)
    setIsListening(false)
    setShowConfetti(false)
    setToast(null)
  }

  const handleClapDetected = () => {
    if (countdown > 1) {
      setCountdown(prev => prev - 1)
      setToast({ type: 'success', message: 'Clap detected! Keep going!' })
    } else {
      setCountdown(0)
      setIsListening(false)
      setShowConfetti(true)
      setToast({ type: 'victory', message: 'Congratulations! You completed the countdown!' })
      
      // Hide confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000)
    }
  }

  const handleMicAccess = (permission) => {
    setMicPermission(permission)
    if (permission === 'granted') {
      setToast({ type: 'success', message: 'Microphone access granted!' })
    } else {
      setToast({ type: 'error', message: 'Microphone access denied. Please allow microphone access.' })
    }
  }

  const handleError = (error) => {
    setToast({ type: 'error', message: error })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {showConfetti && <confetti />}
      
      <div className="text-center z-10">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 neon-glow">
          Clap Recognition App
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8">
          Detect claps from your microphone by clapping along to countdown
        </p>
        
        <CountdownDisplay 
          countdown={countdown} 
          isListening={isListening}
        />
        
        <div className="mt-8 space-y-4">
          <MicStatus 
            permission={micPermission}
            onMicAccess={handleMicAccess}
            onReset={resetGame}
          />
          
          {micPermission === 'granted' && (
            <ClapDetector
              isListening={isListening}
              setIsListening={setIsListening}
              onClapDetected={handleClapDetected}
              onError={handleError}
              disabled={countdown === 0}
            />
          )}
        </div>
      </div>
      
      {toast && (
        <Toast 
          type={toast.type} 
          message={toast.message} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  )
}

export default App
