'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const menuItems = [
    { href: '/', label: '🏠 ホーム', icon: '📝' },
    { href: '/calendar', label: '📅 カレンダー', icon: '📅' },
    { href: '/stats', label: '📊 統計・グラフ', icon: '📊' },
  ]

  return (
    <>
      {/* ハンバーガーメニューボタン */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 neomorphic-btn p-3 rounded-full bg-dark-card/80 backdrop-blur-md border border-white/10 shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="メニュー"
      >
        <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
          <motion.span
            className="w-full h-0.5 bg-dark-accent rounded"
            animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            className="w-full h-0.5 bg-dark-accent rounded"
            animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            className="w-full h-0.5 bg-dark-accent rounded"
            animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.button>

      {/* メニューオーバーレイ */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-dark-card/95 backdrop-blur-md border-l border-white/10 shadow-2xl z-40 overflow-y-auto"
            >
              <div className="p-6 pt-20">
                <h2 className="text-2xl font-bold text-dark-accent mb-6">メニュー</h2>
                <nav className="space-y-2">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`block p-4 rounded-xl transition-all ${
                          isActive
                            ? 'bg-dark-accent/20 border-2 border-dark-accent text-dark-accent'
                            : 'bg-dark-card/50 border border-white/10 hover:bg-dark-card/70 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.icon}</span>
                          <span className="font-semibold text-dark-text">{item.label}</span>
                        </div>
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

