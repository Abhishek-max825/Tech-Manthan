import React from 'react'
import { motion } from 'framer-motion'

const MicStatus = ({ permission, onMicAccess, onReset }) => {
  const requestMicAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop()) // Stop immediately after permission
      onMicAccess('granted')
    } catch (error) {
      console.error('Microphone access error:', error)
      onMicAccess('denied')
    }
  }

  const getStatusColor = () => {
    switch (permission) {
      case 'granted':
        return 'text-green-400'
      case 'denied':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusText = () => {
    switch (permission) {
      case 'granted':
        return 'Allowed'
      case 'denied':
        return 'Denied'
      default:
        return 'Not Set'
    }
  }

  const getStatusIcon = () => {
    switch (permission) {
      case 'granted':
        return '🎤'
      case 'denied':
        return '🚫'
      default:
        return '❓'
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      {/* Mic Access Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={requestMicAccess}
        disabled={permission === 'granted'}
        className={`px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 flex items-center gap-3 ${
          permission === 'granted'
            ? 'bg-green-600 cursor-default'
            : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/50'
        }`}
      >
        <span className="text-xl">{getStatusIcon()}</span>
        <div className="text-left">
          <div className="text-sm font-medium">Mic Access</div>
          <div className={`text-xs ${getStatusColor()}`}>{getStatusText()}</div>
        </div>
      </motion.button>

      {/* Reset Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onReset}
        className="px-6 py-3 rounded-lg font-semibold text-white bg-gray-700 hover:bg-gray-600 transition-all duration-300 shadow-lg shadow-gray-500/50"
      >
        Reset
      </motion.button>
    </div>
  )
}

export default MicStatus
