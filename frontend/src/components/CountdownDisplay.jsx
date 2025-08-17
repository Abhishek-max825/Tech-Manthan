import React from 'react'
import { motion } from 'framer-motion'

const CountdownDisplay = ({ countdown, isListening }) => {
  const colors = ['text-green-400', 'text-blue-400', 'text-purple-400', 'text-yellow-400', 'text-pink-400']
  const currentColor = colors[countdown % colors.length]

  return (
    <div className="relative">
      <motion.div
        key={countdown}
        initial={{ scale: 1.2, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`text-8xl md:text-9xl font-bold ${currentColor} animate-color-cycle drop-shadow-lg`}
        style={{
          textShadow: `0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor`
        }}
      >
        {countdown}
      </motion.div>
      
      {isListening && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-4 h-4 bg-red-500 rounded-full"
          />
        </div>
      )}
      
      <div className="mt-4 text-center">
        {isListening ? (
          <p className="text-red-400 text-lg font-semibold flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
            Listening for claps...
          </p>
        ) : countdown > 0 ? (
          <p className="text-gray-400 text-lg">Ready to start</p>
        ) : (
          <p className="text-green-400 text-lg font-semibold">Countdown complete!</p>
        )}
        
        {isListening && (
          <p className="text-gray-500 text-sm mt-1">Processing audio...</p>
        )}
      </div>
    </div>
  )
}

export default CountdownDisplay
