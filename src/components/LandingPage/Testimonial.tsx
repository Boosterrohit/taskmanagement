import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Users,
  Award,
  TrendingUp,
  Clock,
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Product Designer at Figma',
    avatar: 'SC',
    avatarColor: 'from-violet-500 to-purple-600',
    content:
      "Finally, a todo app that doesn't get in my way. The interface is so clean and intuitive, I actually enjoy planning my day now. My productivity has skyrocketed since I started using it.",
    rating: 5,
    company: 'Figma',
  },
  {
    name: 'Marcus Johnson',
    role: 'Startup Founder',
    avatar: 'MJ',
    avatarColor: 'from-blue-500 to-cyan-600',
    content:
      "I've tried every productivity app out there. This one actually sticks. The quick-add feature alone saves me hours each week. I can't imagine running my business without it now.",
    rating: 5,
    company: 'TechLaunch',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Engineering Lead at Stripe',
    avatar: 'ER',
    avatarColor: 'from-emerald-500 to-teal-600',
    content:
      'Our entire team switched over within a week. The simplicity is deceiving—it handles complex projects with ease. The collaborative features are exactly what we needed.',
    rating: 5,
    company: 'Stripe',
  },
  {
    name: 'David Kim',
    role: 'Freelance Consultant',
    avatar: 'DK',
    avatarColor: 'from-orange-500 to-amber-600',
    content:
      'As someone who juggles multiple clients, staying organized is critical. This todo app gave me a single source of truth for all my projects. Game changer.',
    rating: 5,
    company: 'Self-employed',
  },
  {
    name: 'Priya Patel',
    role: 'UX Researcher at Google',
    avatar: 'PP',
    avatarColor: 'from-pink-500 to-rose-600',
    content:
      "The attention to detail is remarkable. Every interaction feels intentional and delightful. It's rare to find a productivity tool that's also genuinely beautiful to use.",
    rating: 5,
    company: 'Google',
  },
]

const rightSideStats = [
  {
    icon: Users,
    value: '50,000+',
    label: 'Active Users',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: TrendingUp,
    value: '3x',
    label: 'Productivity Boost',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: CheckCircle2,
    value: '2M+',
    label: 'Tasks Completed',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: Clock,
    value: '4.9/5',
    label: 'Average Rating',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
]



export function Testimonials() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const goTo = useCallback((index: number, dir: number) => {
    setDirection(dir)
    setCurrent((index + testimonials.length) % testimonials.length)
  }, [])

  const prev = () => {
    setIsAutoPlaying(false)
    goTo(current - 1, -1)
  }

  const next = useCallback(() => {
    goTo(current + 1, 1)
  }, [current, goTo])

  useEffect(() => {
    if (!isAutoPlaying) return
    const timer = setInterval(() => {
      next()
    }, 4000)
    return () => clearInterval(timer)
  }, [isAutoPlaying, next])

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.96,
    }),
  }

  const t = testimonials[current]

  return (
    <section className="relative py-24 bg-white overflow-hidden">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #1e40af 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto md:px-6 px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block text-blue-600 text-sm font-semibold tracking-wider uppercase mb-4"
          >
            Customer Stories
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "'Instrument Sans', sans-serif" }}
          >
            Loved by productive people
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-500"
          >
            Join thousands who've transformed how they work and live.
          </motion.p>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* ── LEFT: Carousel ── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Card wrapper */}
            <div className="relative min-h-[340px] flex items-center">
              {/* Decorative shadow cards behind */}
              <div className="absolute inset-0 translate-y-4 translate-x-4 rounded-2xl bg-blue-100/60 border border-blue-200/40" />
              <div className="absolute inset-0 translate-y-2 translate-x-2 rounded-2xl bg-blue-50/80 border border-blue-200/40" />

              {/* Main card */}
              <div className="relative w-full bg-white rounded-2xl border border-gray-200 shadow-xl p-8 overflow-hidden">
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-blue-600 rounded-t-2xl" />

                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={current}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      duration: 0.4,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  >
                    {/* Stars */}
                    <div className="flex gap-1 mb-5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.07, duration: 0.3 }}
                        >
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        </motion.div>
                      ))}
                    </div>

                    {/* Quote mark */}
                    <div
                      className="text-6xl text-blue-200 font-serif leading-none mb-2 select-none"
                      aria-hidden
                    >
                      "
                    </div>

                    {/* Content */}
                    <p className="text-gray-700 text-lg leading-relaxed mb-8">
                      {t.content}
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.avatarColor} flex items-center justify-center shadow-md`}
                      >
                        <span className="text-white font-bold text-sm">
                          {t.avatar}
                        </span>
                      </div>
                      <div>
                        <p
                          className="text-gray-900 font-semibold"
                          style={{
                            fontFamily: "'Instrument Sans', sans-serif",
                          }}
                        >
                          {t.name}
                        </p>
                        <p className="text-gray-500 text-sm">{t.role}</p>
                      </div>
                      <div className="ml-auto">
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                          {t.company}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-8">
              {/* Dot indicators */}
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setIsAutoPlaying(false)
                      goTo(i, i > current ? 1 : -1)
                    }}
                    className={`transition-all duration-300 rounded-full ${
                      i === current
                        ? 'w-7 h-2.5 bg-blue-600'
                        : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>

              {/* Prev / Next buttons */}
              <div className="flex gap-2">
                <button
                  onClick={prev}
                  className="w-10 h-10 rounded-full border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 flex items-center justify-center text-gray-600 hover:text-blue-600 transition-all duration-200 group"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => {
                    setIsAutoPlaying(false)
                    next()
                  }}
                  className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-all duration-200 shadow-md hover:shadow-blue-200 group"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT: Content ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-10"
          >
            {/* Heading */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-blue-600" />
                <span className="text-blue-600 text-sm font-semibold tracking-wide uppercase">
                  Why people choose us
                </span>
              </div>
              <h3
                className="text-3xl font-bold text-gray-900 leading-tight mb-4"
                style={{ fontFamily: "'Instrument Sans', sans-serif" }}
              >
                Built for the way{' '}
                <span className="text-blue-600">real people</span> work
              </h3>
            
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {rightSideStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  className="bg-gray-50 border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div
                    className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}
                  >
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p
                    className="text-xl font-bold text-gray-900 mb-0.5"
                    style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>

          

            {/* Trust badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="flex items-center gap-4 border-t border-gray-100 pt-6"
            >
              <div className="flex -space-x-3">
                {['SC', 'MJ', 'ER', 'DK', 'PP'].map((initials, i) => (
                  <div
                    key={initials}
                    className="w-9 h-9 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm"
                    style={{ zIndex: 5 - i }}
                  >
                    <span className="text-white text-xs font-bold">
                      {initials}
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-500 text-xs">
                  <span className="font-semibold text-gray-700">
                    4.9 out of 5
                  </span>{' '}
                  — from over 3,200 reviews
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}