import React from 'react'
import { motion } from 'framer-motion'

const CountdownDisplay = ({ countdown, isListening, isRedirecting }) => {
  const colors = ['text-green-400', 'text-blue-400', 'text-purple-400', 'text-yellow-400', 'text-pink-400']
  const currentColor = colors[countdown % colors.length]
  const progress = ((10 - countdown) / 10) * 100

  return (
    <div className="relative">
      <motion.div
        key={countdown}
        initial={{ scale: 1.2, opacity: 0.8 }}
        animate={{ 
          scale: isListening ? [1, 1.1, 1] : 1, 
          opacity: 1 
        }}
        transition={{ 
          duration: 0.3, 
          ease: "easeOut",
          scale: isListening ? { duration: 1, repeat: Infinity } : undefined
        }}
        className={`text-8xl md:text-9xl font-bold ${currentColor} animate-color-cycle drop-shadow-lg`}
        style={{
          textShadow: `0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor`
        }}
      >
        <motion.span
          key={countdown}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {countdown}
        </motion.span>
      </motion.div>
      
      {/* Progress Bar */}
      <motion.div 
        key={countdown}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-4 w-64 h-3 bg-gray-700 rounded-full mx-auto overflow-hidden"
      >
        <motion.div
          key={countdown}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 rounded-full"
        />
      </motion.div>
      
      {/* Countdown Info */}
      <motion.div 
        key={countdown}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-2 text-center text-sm text-gray-400"
      >
        <motion.p
          key={countdown}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          Progress: {10 - countdown}/10
        </motion.p>
        {countdown > 0 && (
          <motion.p 
            key={countdown}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-xs mt-1"
          >
            Keep clapping to reach 0!
          </motion.p>
        )}
      </motion.div>
      
      {isListening && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-4 h-4 bg-red-500 rounded-full"
          />
        </motion.div>
      )}
      
      <div className="mt-4 text-center">
        {isListening ? (
          <motion.p 
            key="listening"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-red-400 text-lg font-semibold flex items-center justify-center gap-2"
          >
            <motion.span 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 bg-red-400 rounded-full"
            />
            Listening for claps...
          </motion.p>
        ) : countdown > 0 ? (
          <motion.p 
            key="ready"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-gray-400 text-lg"
          >
            Ready to start
          </motion.p>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-2"
          >
            <motion.p 
              key="complete"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-green-400 text-lg font-semibold"
            >
              Countdown complete!
            </motion.p>
                          {isRedirecting ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center gap-2"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-red-500 text-4xl"
                  >
                    ▶️
                  </motion.div>
                  <motion.p 
                    key="redirecting"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-yellow-400 text-sm"
                  >
                    Redirecting to YouTube in 3 seconds...
                  </motion.p>
                </motion.div>
                          ) : (
                <motion.p 
                  key="reset"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-yellow-400 text-sm"
                >
                  Click reset to play again!
                </motion.p>
              )}
          </motion.div>
        )}
        
        {isListening && (
          <motion.p 
            key="processing"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-gray-500 text-sm mt-1"
          >
            Processing audio...
          </motion.p>
        )}
      </div>
    </div>
  )
}

export default CountdownDisplay
