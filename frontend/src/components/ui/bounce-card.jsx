import React from "react"
import { motion } from "framer-motion"

const BounceCard = ({ className, children }) => {
  return (
    <motion.div
      whileHover={{ scale: 0.95, rotate: "-1deg" }}
      className={`group relative min-h-[300px] cursor-pointer overflow-hidden rounded-2xl bg-slate-100 p-8 ${className}`}
    >
      {children}
    </motion.div>
  )
}

const CardTitle = ({ children }) => {
  return <h3 className="mx-auto text-center text-3xl font-semibold">{children}</h3>
}

export { BounceCard, CardTitle }
