import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

interface SuccessOverlayProps {
  isVisible: boolean;
  message?: string;
}

export function SuccessOverlay({ isVisible, message = "Success!" }: SuccessOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="flex flex-col items-center gap-4 rounded-xl border bg-card p-10 shadow-lg"
          >
            <div className="relative flex h-20 w-20 items-center justify-center">
              {/* Spinning background for "loading" feel */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary"
              />
              
              {/* Success Checkmark */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                    delay: 0.2, 
                    type: "spring", 
                    stiffness: 500, 
                    damping: 25 
                }}
                className="z-10 bg-primary rounded-full p-2"
              >
                <Check className="h-10 w-10 text-primary-foreground" />
              </motion.div>
            </div>
            
            <motion.h3 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-semibold tracking-tight"
            >
              {message}
            </motion.h3>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
