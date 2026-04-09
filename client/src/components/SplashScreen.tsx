import { motion, AnimatePresence } from "framer-motion";

export function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
          duration: 1
        }}
        className="relative"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full scale-150" />
        
        <div className="relative w-32 h-32 rounded-[2rem] bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center text-white font-bold text-6xl shadow-[0_20px_50px_rgba(8,145,178,0.3)] mb-8">
          B
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="text-center"
      >
        <h1 className="text-3xl font-black tracking-[0.2em] text-slate-800 uppercase mb-1">
          Barokah
        </h1>
        <div className="flex items-center justify-center gap-2">
          <div className="h-[1px] w-8 bg-slate-300" />
          <p className="text-xs font-bold bg-gradient-to-r from-cyan-600 to-green-600 bg-clip-text text-transparent uppercase tracking-[0.4em]">
            Frozen Food
          </p>
          <div className="h-[1px] w-8 bg-slate-300" />
        </div>
      </motion.div>
      
      <motion.div 
        className="absolute bottom-20 w-64 h-1.5 bg-slate-200 rounded-full overflow-hidden shadow-inner"
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: 256 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <motion.div 
          className="h-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-green-500"
          initial={{ x: "-100%" }}
          animate={{ x: "0%" }}
          transition={{ duration: 2, ease: "circOut", delay: 0.8 }}
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-8 text-[10px] text-slate-400 font-medium tracking-widest uppercase"
      >
        Memuat Sistem POS...
      </motion.p>
    </motion.div>
  );
}

