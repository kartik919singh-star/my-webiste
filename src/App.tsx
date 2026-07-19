import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import BillingPanel from './components/BillingPanel';
import TotalCard from './components/TotalCard';
import type { CustomerDetails, InvoiceItem } from './types';
import { calculateInvoiceTotals } from './utils/calculations';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  const [activeTab, setActiveTab] = useState('new-invoice');
  const [isGenerating, setIsGenerating] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1280);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1280);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Customer details state
  const [customer, setCustomer] = useState<CustomerDetails>({
    name: 'Rohan Mehra',
    phone: '+91 98765 43210',
    address: 'Indiranagar, 100 Feet Rd, Bangalore',
  });

  // Invoice items state (initialized with a realistic showroom entry to showcase math instantly)
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'init-1',
      name: 'Italian Carrara Marble',
      length: '8.5',
      width: '4.5',
      quantity: '10',
      price: '450',
    },
  ]);

  // Floating animation variants
  const sidebarFloatVariants = {
    animate: {
      y: [0, -6, 0],
      transition: {
        duration: 7.5,
        ease: 'easeInOut' as const,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
  };

  const totalCardFloatVariants = {
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 6,
        ease: 'easeInOut' as const,
        repeat: Infinity,
        repeatType: 'reverse' as const,
        delay: 0.5,
      },
    },
  };

  // Toast system helper
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Perform live subtotal, tax (GST), and grand total aggregates
  const { subtotal, tax, grandTotal } = calculateInvoiceTotals(items);

  // Generate Invoice Handler (Console logging complete details & triggering toast)
  const handleGenerateInvoice = () => {
    if (!customer.name.trim()) {
      addToast('Please enter a client name before generating invoice.', 'error');
      return;
    }
    if (items.some(item => !item.name.trim() || !item.length || !item.width || !item.price)) {
      addToast('Please complete all item entries before generating invoice.', 'info');
      return;
    }

    setIsGenerating(true);

    // Simulate standard document compiling delay for premium visual feedback
    setTimeout(() => {
      const invoicePayload = {
        timestamp: new Date().toISOString(),
        customer,
        items: items.map(item => {
          const len = parseFloat(item.length) || 0;
          const wid = parseFloat(item.width) || 0;
          const qty = parseInt(item.quantity, 10) || 0;
          const prc = parseFloat(item.price) || 0;
          const sqFt = len * wid * qty;
          const rowTotal = sqFt * prc;
          return {
            ...item,
            numericValues: {
              length: len,
              width: wid,
              quantity: qty,
              pricePerSqFt: prc,
              calculatedSqFt: sqFt,
              totalCost: rowTotal
            }
          };
        }),
        totals: {
          subtotal,
          gstRate: 0.18,
          gstAmount: tax,
          grandTotal
        }
      };
      
      console.log('--- GENERATED SHOWROOM INVOICE PAYLOAD ---');
      console.log(JSON.stringify(invoicePayload, null, 2));
      
      addToast(`Invoice generated successfully for ${customer.name}! Grand Total: ₹${grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, 'success');
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen w-full bg-brand-dark text-neutral-200 overflow-x-hidden flex justify-center">
      {/* Background radial glow spots to enhance visual depth */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-violet-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[1400px] min-h-screen p-4 md:p-6 lg:p-8 flex flex-col gap-6 lg:gap-8 justify-start">
        
        {/* Top Header */}
        <header className="flex justify-between items-center pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] tracking-wider uppercase font-semibold text-neutral-400">Showroom Terminal: Active</span>
          </div>
          <div className="text-[10px] text-neutral-500 font-medium">
            System V1.0.0
          </div>
        </header>

        {/* 3-Column Responsive Grid Layout */}
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-[auto_1fr_auto] gap-6 lg:gap-8 items-start">
          
          {/* Column 1: Sidebar (Floating) */}
          <motion.div
            variants={sidebarFloatVariants}
            animate={isDesktop ? "animate" : ""}
            className="w-full xl:w-72 h-full xl:sticky xl:top-8 z-20"
          >
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </motion.div>

          {/* Column 2: Main Billing Panel (STATIC) */}
          <main className="w-full h-full z-10">
            {activeTab === 'new-invoice' ? (
              <BillingPanel
                customer={customer}
                onCustomerChange={setCustomer}
                items={items}
                onItemsChange={setItems}
              />
            ) : (
              <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 text-center">
                <h3 className="text-lg font-semibold text-white mb-2">Section: {activeTab}</h3>
                <p className="text-sm text-neutral-400">This showroom screen is under construction. Use the "New Invoice" tab to access billing dashboard.</p>
              </div>
            )}
          </main>

          {/* Column 3: Floating Total Card (Floating) */}
          <motion.div
            variants={totalCardFloatVariants}
            animate={isDesktop ? "animate" : ""}
            className="w-full xl:w-72 xl:sticky xl:top-8 z-20"
          >
            <TotalCard
              subtotal={subtotal}
              tax={tax}
              grandTotal={grandTotal}
              onGenerateInvoice={handleGenerateInvoice}
              isGenerating={isGenerating}
            />
          </motion.div>

        </div>
        
        {/* Footer */}
        <footer className="py-4 text-center text-[10px] text-neutral-600 border-t border-white/5 mt-auto">
          © {new Date().getFullYear()} Hanumant Marble. Secured Local Showroom Invoice Terminal.
        </footer>
      </div>

      {/* Floating Success Toasts stack container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl ${
                toast.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200 shadow-[0_0_35px_rgba(16,185,129,0.1)]'
                  : toast.type === 'error'
                  ? 'bg-red-950/80 border-red-500/30 text-red-200 shadow-[0_0_35px_rgba(239,68,68,0.1)]'
                  : 'bg-zinc-900/90 border-white/10 text-neutral-200 shadow-[0_0_35px_rgba(255,255,255,0.05)]'
              }`}
            >
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />}
              
              <div className="flex-1">
                <p className="text-xs font-bold text-white mb-0.5">
                  {toast.type === 'success' && 'Invoice Compiled'}
                  {toast.type === 'error' && 'Error Occurred'}
                  {toast.type === 'info' && 'Notice'}
                </p>
                <p className="text-[11px] leading-relaxed opacity-90">{toast.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
