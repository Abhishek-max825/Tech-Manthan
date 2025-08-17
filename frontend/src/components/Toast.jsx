import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Toast = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-600',
          borderColor: 'border-green-500',
          icon: '✅',
          textColor: 'text-green-100'
        }
      case 'error':
        return {
          bgColor: 'bg-red-600',
          borderColor: 'border-red-500',
          icon: '❌',
          textColor: 'text-red-100'
        }
      case 'victory':
        return {
          bgColor: 'bg-purple-600',
          borderColor: 'border-purple-500',
          icon: '🎉',
          textColor: 'text-purple-100'
        }
      default:
        return {
          bgColor: 'bg-blue-600',
          borderColor: 'border-blue-500',
          icon: 'ℹ️',
          textColor: 'text-blue-100'
        }
    }
  }

  const styles = getToastStyles()

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 ${styles.bgColor} ${styles.borderColor} border-2 rounded-lg px-6 py-4 shadow-lg backdrop-blur-sm`}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{styles.icon}</span>
          <p className={`${styles.textColor} font-medium`}>{message}</p>
          <button
            onClick={onClose}
            className="ml-2 text-white hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default Toast
