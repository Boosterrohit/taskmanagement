  // import { motion } from 'framer-motion'
  import { FloatingFrame } from './FloatingFrame'
  import { GoldenParticles } from './GoldenParticles'
  import { Button } from '../ui/button'
  import { ArrowBigRight, Square, SquareCheck } from 'lucide-react'
  import { Link } from 'react-router-dom'

  const frameConfigs = [
    // Large statement frames
    {
      size: 'xl' as const,
      style: 'baroque' as const,
      x: 5,
      y: 10,
      delay: 0,
      duration: 12,
      rotation: -5,
    },
    {
      size: 'xl' as const,
      style: 'victorian' as const,
      x: 70,
      y: 50,
      delay: 1.5,
      duration: 14,
      rotation: 8,
    },

    // Medium frames
    {
      size: 'lg' as const,
      style: 'artdeco' as const,
      x: 60,
      y: 5,
      delay: 0.5,
      duration: 10,
      rotation: 3,
    },
    {
      size: 'lg' as const,
      style: 'baroque' as const,
      x: 15,
      y: 55,
      delay: 2,
      duration: 11,
      rotation: -8,
    },
    {
      size: 'lg' as const,
      style: 'minimal' as const,
      x: 80,
      y: 15,
      delay: 1,
      duration: 13,
      rotation: 0,
    },

    // Medium-small frames
    {
      size: 'md' as const,
      style: 'victorian' as const,
      x: 40,
      y: 25,
      delay: 0.8,
      duration: 9,
      rotation: 5,
    },
    {
      size: 'md' as const,
      style: 'artdeco' as const,
      x: 25,
      y: 75,
      delay: 1.2,
      duration: 10,
      rotation: -3,
    },
    {
      size: 'md' as const,
      style: 'baroque' as const,
      x: 85,
      y: 70,
      delay: 2.5,
      duration: 12,
      rotation: 10,
    },
    {
      size: 'md' as const,
      style: 'minimal' as const,
      x: 50,
      y: 60,
      delay: 0.3,
      duration: 8,
      rotation: -2,
    },

    // Small accent frames
    {
      size: 'sm' as const,
      style: 'artdeco' as const,
      x: 10,
      y: 35,
      delay: 1.8,
      duration: 7,
      rotation: 15,
    },
    {
      size: 'sm' as const,
      style: 'victorian' as const,
      x: 55,
      y: 85,
      delay: 0.6,
      duration: 8,
      rotation: -12,
    },
    {
      size: 'sm' as const,
      style: 'baroque' as const,
      x: 90,
      y: 40,
      delay: 2.2,
      duration: 9,
      rotation: 6,
    },
    {
      size: 'sm' as const,
      style: 'minimal' as const,
      x: 35,
      y: 5,
      delay: 1.5,
      duration: 7,
      rotation: -4,
    },
    {
      size: 'sm' as const,
      style: 'artdeco' as const,
      x: 75,
      y: 90,
      delay: 0.9,
      duration: 8,
      rotation: 8,
    },
  ]

  export function HeroSection() {
    return (
      <section>
        <div className="relative min-h-screen inset-0 overflow-hidden">
        {/* Base gradient */}
        <div
          className="absolute inset-0 overflow-hidden"
        style={{
    background: `linear-gradient(180deg, #f0f6fc 0%, #e6f0fa 100%)`,
  }}

        />

        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] "
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Vignette effect */}
        <div
          className="absolute inset-0"
        />

        {/* Animated golden particles */}
        <GoldenParticles count={40} />

        {/* Floating frames */}
        {frameConfigs.map((config, index) => (
          <FloatingFrame
            key={index}
            size={config.size}
            style={config.style}
            initialX={config.x}
            initialY={config.y}
            delay={config.delay}
            duration={config.duration}
            rotation={config.rotation}
          />
        ))}

      

        <div className='flex flex-row  p-3 max-w-7xl mx-auto md:px-4 px-1 py-8 md:py-12 justify-between items-center gap-2 z-10 absolute inset-0'>
          <div className='w-full flex justify-center'>
      <div className='px-5 items-center md:items-start flex flex-col'>
        <p className='text-blue-500 bg-blue-200 font-semibold p-1 rounded-full '>Simple. Powerful. Yours.</p>
      <h1 className='md:text-7xl text-4xl font-bold flex flex-col mt-5'>
        <p className='text-black leading-tight md:text-left text-center'>Organize your life, <span className='text-[#155dfc]'>one task at a time</span></p>
      </h1>
      <div className='py-4'>
        <p className='text-lg md:text-left text-center '>The simple todo app that helps you stay focused and get things done. No clutter, no complexity—just your tasks and your goals. </p>
      </div>

        <div className='mt-3'>
        <Link to="/my-task">
          <Button className='bg-[#155dfc] px-7 py-7 text-xl hover:bg-blue-500'>Get Started <ArrowBigRight/></Button>
        </Link>
      </div>
      </div>
      
          </div>
          <div className='w-full justify-center items-center relative hidden md:flex'>
            <div className='w-60 h-60 border-4 border-blue-300 rounded-full '>

          </div>
          <p className='flex gap-1 items-center absolute bg-white shadow-lg p-3 rounded-md text-gray-500 text-sm -top-12 left-10 animate-float-y1'><SquareCheck className='text-[#155dfc]'/><del>Launch product roadmap</del></p>
          <p className='flex gap-1 items-center absolute bg-white shadow-lg p-3 rounded-md text-gray-500 text-sm -bottom-5 left-20 animate-float-x1'><SquareCheck className='text-[#155dfc]'/><del>Ship new features</del></p>
          <p className='flex gap-1 items-center absolute bg-white shadow-lg p-3 rounded-md text-gray-800 text-sm top-24 -right-0 animate-float-y2'><Square className='text-gray-500'/>
  Review design system</p>
          </div>
        </div>

      
      </div>
      </section>
    )
  }