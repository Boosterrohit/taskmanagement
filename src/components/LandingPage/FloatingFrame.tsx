import { motion } from 'framer-motion'

interface FloatingFrameProps {
  size: 'sm' | 'md' | 'lg' | 'xl'
  style: 'baroque' | 'artdeco' | 'victorian' | 'minimal'
  initialX: number
  initialY: number
  delay: number
  duration: number
  rotation?: number
}

const sizeMap = {
  sm: { width: 80, height: 100, borderWidth: 4 },
  md: { width: 140, height: 180, borderWidth: 6 },
  lg: { width: 200, height: 260, borderWidth: 8 },
  xl: { width: 280, height: 360, borderWidth: 10 },
}

const styleMap = {
  baroque: {
    borderRadius: '8px',
    boxShadow:
      'inset 0 0 20px rgba(125, 211, 252, 0.3), 0 0 40px rgba(125, 211, 252, 0.15)',
    background:
      'linear-gradient(135deg, rgba(125, 211, 252, 0.1) 0%, rgba(56, 189, 248, 0.05) 100%)',
    borderStyle: 'double' as const,
  },
  artdeco: {
    borderRadius: '2px',
    boxShadow:
      'inset 0 0 15px rgba(125, 211, 252, 0.2), 0 0 30px rgba(125, 211, 252, 0.1)',
    background:
      'linear-gradient(45deg, rgba(125, 211, 252, 0.08) 0%, transparent 50%, rgba(125, 211, 252, 0.08) 100%)',
    borderStyle: 'solid' as const,
  },
  victorian: {
    borderRadius: '12px',
    boxShadow:
      'inset 0 0 25px rgba(125, 211, 252, 0.25), 0 0 50px rgba(125, 211, 252, 0.12)',
    background:
      'radial-gradient(ellipse at center, rgba(125, 211, 252, 0.05) 0%, transparent 70%)',
    borderStyle: 'ridge' as const,
  },
  minimal: {
    borderRadius: '0px',
    boxShadow: '0 0 20px rgba(125, 211, 252, 0.1)',
    background: 'transparent',
    borderStyle: 'solid' as const,
  },
}

export function FloatingFrame({
  size,
  style,
  initialX,
  initialY,
  delay,
  duration,
  rotation = 0,
}: FloatingFrameProps) {
  const dimensions = sizeMap[size]
  const frameStyle = styleMap[style]

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${initialX}%`,
        top: `${initialY}%`,
        width: dimensions.width,
        height: dimensions.height,
      }}
      initial={{
        opacity: 0,
        scale: 0.8,
        rotate: rotation - 10,
      }}
      animate={{
        opacity: [0, 0.7, 0.5, 0.7],
        scale: [0.8, 1, 1.02, 1],
        rotate: [rotation - 10, rotation, rotation + 3, rotation],
        y: [0, -20, -10, 0],
        x: [0, 10, -5, 0],
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
      }}
    >
      {/* Outer frame glow */}
      <motion.div
        className="absolute inset-0"
        style={{
          border: `${dimensions.borderWidth}px ${frameStyle.borderStyle} rgba(125, 211, 252, 0.6)`,
          borderRadius: frameStyle.borderRadius,
          boxShadow: frameStyle.boxShadow,
          background: frameStyle.background,
        }}
        animate={{
          boxShadow: [
            frameStyle.boxShadow,
            frameStyle.boxShadow.replace(/0\.15|0\.1|0\.12/g, '0.25'),
            frameStyle.boxShadow,
          ],
        }}
        transition={{
          duration: duration * 0.5,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      />

      {/* Inner frame detail */}
      <div
        className="absolute"
        style={{
          inset: dimensions.borderWidth + 4,
          border: `2px solid rgba(125, 211, 252, 0.3)`,
          borderRadius: frameStyle.borderRadius,
        }}
      />

      {/* Corner ornaments for baroque and victorian */}
      {(style === 'baroque' || style === 'victorian') && (
        <>
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-sky-300/40 rounded-tl" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-sky-300/40 rounded-tr" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-sky-300/40 rounded-bl" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-sky-300/40 rounded-br" />
        </>
      )}

      {/* Art deco geometric details */}
      {style === 'artdeco' && (
        <>
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-sky-300/30 to-transparent -translate-y-1/2" />
          <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-sky-300/30 to-transparent -translate-x-1/2" />
        </>
      )}
    </motion.div>
  )
}
