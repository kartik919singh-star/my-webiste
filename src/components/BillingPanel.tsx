import type { CustomerDetails, InvoiceItem } from '../types';
import { calculateRowSqFt, calculateRowTotal } from '../utils/calculations';
import { User, Phone, MapPin, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Combobox from './Combobox';
import type { ProductConstant } from '../constants/products';

interface BillingPanelProps {
  customer: CustomerDetails;
  onCustomerChange: (updated: CustomerDetails) => void;
  items: InvoiceItem[];
  onItemsChange: (updated: InvoiceItem[]) => void;
}

export default function BillingPanel({
  customer,
  onCustomerChange,
  items,
  onItemsChange,
}: BillingPanelProps) {
  // Format currency helper
  const formatINR = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Handler to update specific field in a row
  const updateItemField = (id: string, field: keyof InvoiceItem, value: string) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onItemsChange(updated);
  };

  // Handler when a product is selected from the combobox
  const handleSelectProduct = (id: string, product: ProductConstant) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          name: product.name,
          price: product.defaultPrice.toString(),
          length: item.length || product.defaultLength.toString(),
          width: item.width || product.defaultWidth.toString(),
        };
      }
      return item;
    });
    onItemsChange(updated);
  };

  // Add new row with default blank settings
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      name: '',
      length: '',
      width: '',
      quantity: '1',
      price: '',
    };
    onItemsChange([...items, newItem]);
  };

  // Remove specific row
  const handleRemoveItem = (id: string) => {
    // Keep at least one row in the grid
    if (items.length <= 1) {
      onItemsChange([
        {
          id: Date.now().toString(),
          name: '',
          length: '',
          width: '',
          quantity: '1',
          price: '',
        },
      ]);
      return;
    }
    onItemsChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col gap-6 text-neutral-800 dark:text-neutral-200 transition-colors">
      {/* Page Title Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">New Billing Invoice</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Record premium marble & tile transactions with automatic square-footage calculation.
        </p>
      </div>

      {/* Customer Details Glass Section */}
      <div className="bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-lg transition-colors flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-violet-600 dark:text-violet-400 uppercase">
          <User className="w-4 h-4 shrink-0" />
          <span>Customer Information</span>
        </div>

        {/* Responsive Input Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Client Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Client Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
              <input
                type="text"
                value={customer.name}
                onChange={(e) => onCustomerChange({ ...customer, name: e.target.value })}
                placeholder="Enter client name"
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
              <input
                type="tel"
                value={customer.phone}
                onChange={(e) => onCustomerChange({ ...customer, phone: e.target.value })}
                placeholder="+91 XXXXX XXXXX"
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
              />
            </div>
          </div>

          {/* Delivery Address */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Delivery Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
              <textarea
                value={customer.address}
                onChange={(e) => onCustomerChange({ ...customer, address: e.target.value })}
                placeholder="Enter complete shipping address"
                rows={2}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Product Entry Grid Glass Section */}
      <div className="bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-lg transition-colors flex flex-col gap-4 overflow-visible">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-violet-600 dark:text-violet-400 uppercase">
            <ShoppingCart className="w-4 h-4 shrink-0" />
            <span>Product Entry Grid</span>
          </div>
          
          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-violet-500/10 dark:bg-white/5 border border-violet-500/20 dark:border-white/10 text-violet-700 dark:text-neutral-200 hover:bg-violet-500/20 dark:hover:bg-white/10 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Row</span>
          </button>
        </div>

        {/* Grid Container */}
        <div className="overflow-visible">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10">
                <th className="py-3 px-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 w-[30%]">Item Details (Auto-Suggest)</th>
                <th className="py-3 px-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 text-center w-[12%]">Length (ft)</th>
                <th className="py-3 px-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 text-center w-[12%]">Width (ft)</th>
                <th className="py-3 px-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 text-center w-[10%]">Qty</th>
                <th className="py-3 px-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 text-right w-[14%]">Price/Sq.Ft</th>
                <th className="py-3 px-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 text-right w-[12%]">Total Sq.Ft</th>
                <th className="py-3 px-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 text-right w-[10%]">Total</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {items.map((item) => {
                  const sqFt = calculateRowSqFt(item.length, item.width, item.quantity);
                  const total = calculateRowTotal(item.length, item.width, item.quantity, item.price);
                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className="border-b border-black/5 dark:border-white/5 hover:bg-black/[0.01] dark:hover:bg-white/[0.01]"
                    >
                      {/* Item Details Combobox */}
                      <td className="py-3 px-2 overflow-visible">
                        <Combobox
                          value={item.name}
                          onChange={(val) => updateItemField(item.id, 'name', val)}
                          onSelectProduct={(product) => handleSelectProduct(item.id, product)}
                          placeholder="Type item name..."
                        />
                      </td>

                      {/* Length */}
                      <td className="py-3 px-2">
                        <input
                          type="text"
                          value={item.length}
                          onChange={(e) => updateItemField(item.id, 'length', e.target.value)}
                          placeholder="0.0"
                          className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg py-2 px-2 text-xs text-center text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-violet-500/50"
                        />
                      </td>

                      {/* Width */}
                      <td className="py-3 px-2">
                        <input
                          type="text"
                          value={item.width}
                          onChange={(e) => updateItemField(item.id, 'width', e.target.value)}
                          placeholder="0.0"
                          className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg py-2 px-2 text-xs text-center text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-violet-500/50"
                        />
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-2">
                        <input
                          type="text"
                          value={item.quantity}
                          onChange={(e) => updateItemField(item.id, 'quantity', e.target.value)}
                          placeholder="1"
                          className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg py-2 px-2 text-xs text-center text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-violet-500/50"
                        />
                      </td>

                      {/* Price per SqFt */}
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-[10px] text-neutral-400">₹</span>
                          <input
                            type="text"
                            value={item.price}
                            onChange={(e) => updateItemField(item.id, 'price', e.target.value)}
                            placeholder="0.00"
                            className="w-20 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg py-2 px-2 text-xs text-right text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-violet-500/50"
                          />
                        </div>
                      </td>

                      {/* Live SqFt Area */}
                      <td className="py-3 px-2 text-xs text-right font-medium text-neutral-500 dark:text-neutral-400">
                        {sqFt.toFixed(2)} sq.ft
                      </td>

                      {/* Row Total & Delete Button */}
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-xs font-semibold text-neutral-900 dark:text-white">{formatINR(total)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 rounded text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer border-none bg-transparent"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
