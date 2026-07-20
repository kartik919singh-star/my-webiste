import { TrendingUp, BarChart3 } from 'lucide-react';

export default function SalesReports() {
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-xl shadow-lg transition-colors">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-500 dark:text-amber-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Sales Analytics & Revenue Reports
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Admin Terminal — Financial metrics and showroom performance logs.
            </p>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-xl shadow-md">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Monthly Revenue</p>
          <h3 className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-1">₹14,85,400</h3>
          <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            +18.4% vs last month
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-xl shadow-md">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Invoices Issued</p>
          <h3 className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-1">142 Invoices</h3>
          <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded bg-violet-500/20 text-violet-600 dark:text-violet-400">
            94% Paid / Settled
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-xl shadow-md">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Top Material Category</p>
          <h3 className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-1">Italian Marble</h3>
          <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
            58% Total Billing Area
          </span>
        </div>
      </div>

      {/* Chart Placeholder Box */}
      <div className="p-8 rounded-2xl bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-xl shadow-lg flex flex-col items-center justify-center text-center space-y-3 min-h-64">
        <BarChart3 className="w-12 h-12 text-violet-500/40" />
        <h4 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
          Real-time Revenue Graph & Tax Ledger
        </h4>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md">
          Detailed breakdown of GST 18% tax breakdown and customer ledger records will automatically render here.
        </p>
      </div>
    </div>
  );
}
