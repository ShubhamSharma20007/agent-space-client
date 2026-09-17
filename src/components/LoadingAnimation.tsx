import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

const THINKING_LABELS = ["Thinking", "Analyzing", "Reasoning", "Generating"]

function LoadingAnimation() {
  const [labelIndex, setLabelIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setLabelIndex((prev) => (prev + 1) % THINKING_LABELS.length)
    }, 1800)

    return () => clearInterval(interval)
  }, [])

  const label = THINKING_LABELS[labelIndex]

  return (
    <div className='flex items-center gap-3 max-w-[72%] py-1'>
      {/* Gradient glowing dot */}
      <div className='relative w-9 h-9 flex items-center justify-center shrink-0'>
        <motion.span
          className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-cyan-300 to-violet-400"
          style={{ boxShadow: "0 0 14px rgba(125,211,252,0.55)" }}
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Cycling label with per-character wave */}
      <div className='flex overflow-hidden'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={label}
            className="flex"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {label.split("").map((ch, i) => (
              <motion.span
                key={i}
                className="text-[13px] font-medium tracking-wide text-gray-500 dark:text-gray-400"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.07,
                }}
              >
                {ch === " " ? "\u00A0" : ch}
              </motion.span>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default LoadingAnimation