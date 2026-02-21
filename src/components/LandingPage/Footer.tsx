import { motion } from 'framer-motion'
import logo from '../../assets/logo.png'

export function Footer() {
  return (
    <footer className="relative bg-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          {/* Brand & Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-sm"
          >
            <div className="flex items-center gap-2 mb-4">
             <img src={logo} alt="" />
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              A simple, focused todo app designed to help you stay organized,
              prioritize what matters, and accomplish more every single day.
            </p>
          </motion.div>

          {/* Tagline / Classic Text Block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-xs"
          >
            <h4 className="text-gray-900 font-semibold mb-3 text-sm uppercase tracking-wide">
              Our Promise
            </h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              We believe productivity tools should get out of your way. No
              clutter, no confusion — just your tasks, beautifully organized.
            </p>
          </motion.div>

          {/* Contact / Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            <h4 className="text-gray-900 font-semibold text-sm uppercase tracking-wide">
              Connect
            </h4>
            <div className="flex gap-3">
              {[
                { label: 'X', title: 'Follow on X' },
                { label: 'GH', title: 'GitHub' },
                { label: 'LI', title: 'LinkedIn' },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  title={social.title}
                  className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-all duration-200"
                >
                  <span className="text-xs font-bold">{social.label}</span>
                </a>
              ))}
            </div>
            <p className="text-gray-400 text-xs">
              Made with care for productive people.
            </p>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} TaskFlow. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}