import React, { useState, useEffect } from 'react'
import CountdownDisplay from './components/CountdownDisplay'
import ClapDetector from './components/ClapDetector'
import MicStatus from './components/MicStatus'
import Toast from './components/Toast'
import Confetti from 'react-confetti'

function App() {
  const [countdown, setCountdown] = useState(10)
  const [isListening, setIsListening] = useState(false)
  const [micPermission, setMicPermission] = useState('denied')
  const [showConfetti, setShowConfetti] = useState(false)
  const [toast, setToast] = useState(null)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const resetGame = () => {
    setCountdown(10)
    setIsListening(false)
    setShowConfetti(false)
    setToast(null)
    setIsRedirecting(false)
  }

  const handleClapDetected = () => {
    if (countdown > 1) {
      setCountdown(prev => prev - 1)
      setToast({ type: 'success', message: 'Clap detected! Keep going!' })
      
      // Add a small delay to show the countdown change
      setTimeout(() => {
        // This will trigger a re-render with the new countdown value
      }, 100)
    } else {
      setCountdown(0)
      setIsListening(false)
      setShowConfetti(true)
      setToast({ type: 'victory', message: 'Congratulations! You completed the countdown! Redirecting to YouTube...' })
      
      setIsRedirecting(true)
      // Redirect to YouTube after 3 seconds
      setTimeout(() => {
        window.open('https://www.youtube.com', '_blank')
      }, 3000)
      
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
      {showConfetti && <Confetti />}
      
      <div className="text-center z-10">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 neon-glow">
          Clap Recognition App
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8">
          Detect claps from your microphone by clapping along to countdown
        </p>
        <div className="bg-gray-800/50 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-white mb-2">How to Play:</h2>
          <ol className="text-gray-300 text-left space-y-1">
            <li>1. Click "Start Listening" to begin</li>
            <li>2. Clap when you're ready to start the countdown</li>
            <li>3. Keep clapping to decrease the countdown from 10 to 0</li>
            <li>4. When you reach 0, you'll be redirected to YouTube!</li>
          </ol>
          <p className="text-yellow-400 text-sm mt-2">💡 Tip: Make sure your microphone is working and try clapping clearly!</p>
        </div>
        
        <CountdownDisplay 
          countdown={countdown} 
          isListening={isListening}
          isRedirecting={isRedirecting}
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
