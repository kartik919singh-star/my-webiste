import { motion } from 'framer-motion';
import { Receipt, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

interface TotalCardProps {
  subtotal?: number;
  tax?: number;
  grandTotal?: number;
  onGenerateInvoice?: () => void;
  isGenerating?: boolean;
}

export default function TotalCard({
  subtotal = 0,
  tax = 0,
  grandTotal = 0,
  onGenerateInvoice,
  isGenerating = false,
}: TotalCardProps) {
  // Format price helper
  const formatPrice = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      className="w-full xl:w-72 flex flex-col justify-between rounded-2xl bg-white/80 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-xl p-6 shadow-xl dark:shadow-[0_0_60px_rgba(245,158,11,0.15)] relative overflow-hidden text-neutral-800 dark:text-neutral-200 group/card transition-all duration-300 hover:border-amber-500/30"
    >
      {/* Top golden gradient shimmer border */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/20 via-amber-400 to-amber-500/20 animate-border-shimmer" />
      
      {/* Background glow orb inside card */}
      <div className="absolute -right-20 -top-20 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl transition-transform duration-500 group-hover/card:scale-110 pointer-events-none" />

      {/* Content Header */}
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover/card:animate-bounce" />
            <span className="text-sm font-bold tracking-wider uppercase text-neutral-700 dark:text-neutral-300">Summary</span>
          </div>
          <div className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold">
            Draft Invoice
          </div>
        </div>

        {/* Calculation List */}
        <div className="flex flex-col gap-4 py-4 border-y border-black/5 dark:border-white/5">
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">Subtotal</span>
            <span className="font-semibold text-neutral-900 dark:text-white">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-1">
              <span className="text-neutral-500 dark:text-neutral-400">GST</span>
              <span className="text-[10px] text-amber-700 dark:text-neutral-400 font-semibold bg-amber-100 dark:bg-white/5 px-1.5 py-0.5 rounded border border-amber-200 dark:border-white/5">18%</span>
            </div>
            <span className="font-semibold text-neutral-900 dark:text-white">{formatPrice(tax)}</span>
          </div>
          
          {/* Divider */}
          <div className="h-px bg-black/5 dark:bg-white/5 border-dashed border-t" />

          {/* Grand Total */}
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-xs text-neutral-500 font-medium">Total Amount Due</span>
              <span className="text-sm text-neutral-600 dark:text-neutral-400 font-semibold">Grand Total</span>
            </div>
            <span className="text-2xl font-black text-amber-600 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-amber-200 dark:via-amber-400 dark:to-amber-300 tracking-tight">
              {formatPrice(grandTotal)}
            </span>
          </div>
        </div>

        {/* Additional metadata info (GST / Terms) */}
        <div className="flex gap-2.5 p-3 rounded-xl bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed transition-colors duration-300">
          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <p className="font-semibold text-neutral-900 dark:text-white text-xs mb-0.5">Taxes & Terms Applied</p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-500">
              Prices are inclusive of standard 18% Integrated GST. Subject to Bangalore showroom freight policies.
            </p>
          </div>
        </div>
      </div>

      {/* Generate Button at bottom */}
      <div className="relative z-10 mt-6 lg:mt-8">
        <motion.button
          whileHover={{ y: isGenerating ? 0 : -2, scale: isGenerating ? 1 : 1.01 }}
          whileTap={{ y: 0, scale: 1 }}
          onClick={onGenerateInvoice}
          disabled={isGenerating}
          className="w-full relative py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-sm tracking-wide shadow-[0_4px_16px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 cursor-pointer transition-all hover:brightness-105 duration-150 disabled:opacity-50 disabled:cursor-not-allowed border-none"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Invoice...</span>
            </>
          ) : (
            <>
              <span>Generate Invoice</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5px] transition-transform duration-300 group-hover/card:translate-x-1" />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
