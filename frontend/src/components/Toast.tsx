import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';

type Toast = { id: string; msg: string; kind: 'success' | 'info' | 'error' };
const Ctx = createContext<(msg: string, kind?: Toast['kind']) => void>(() => {});

export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((msg: string, kind: Toast['kind'] = 'success') => {
    const id = Math.random().toString(36).slice(2, 8);
    setToasts((p) => [...p, { id, msg, kind }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3400);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
              className="flex items-start gap-2.5 rounded-xl bg-jungle-950 text-white px-4 py-3 shadow-2xl border border-white/10">
              {t.kind === 'success' ? <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 shrink-0" /> : t.kind === 'error' ? <AlertTriangle size={18} className="text-amber-400 mt-0.5 shrink-0" /> : <Info size={18} className="text-sky-300 mt-0.5 shrink-0" />}
              <p className="text-sm leading-snug">{t.msg}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
