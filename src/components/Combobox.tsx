import { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import { MOCK_PRODUCTS, type ProductConstant } from '../constants/products';
import { Search, ChevronDown, Check } from 'lucide-react';

interface ComboboxProps {
  value: string;
  onChange: (val: string) => void;
  onSelectProduct?: (product: ProductConstant) => void;
  placeholder?: string;
  className?: string;
}

export default function Combobox({
  value,
  onChange,
  onSelectProduct,
  placeholder = 'Search marble, granite, or tiles...',
  className = '',
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter mock products based on search term
  const filteredProducts = MOCK_PRODUCTS.filter((product) =>
    product.name.toLowerCase().includes(value.trim().toLowerCase())
  );

  // Reset highlight index when filter results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [value]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (product: ProductConstant) => {
    onChange(product.name);
    if (onSelectProduct) {
      onSelectProduct(product);
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        return;
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % Math.max(1, filteredProducts.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + filteredProducts.length) % Math.max(1, filteredProducts.length));
    } else if (e.key === 'Enter') {
      if (isOpen && filteredProducts.length > 0 && highlightedIndex >= 0) {
        e.preventDefault();
        handleSelect(filteredProducts[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Combobox Input Field */}
      <div className="relative flex items-center w-full">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-violet-500 dark:focus:border-violet-400 focus:ring-1 focus:ring-violet-500/50 transition-all"
        />
        <Search className="w-4 h-4 text-neutral-400 dark:text-neutral-500 absolute left-3 pointer-events-none" />
        <ChevronDown 
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-4 h-4 text-neutral-400 dark:text-neutral-500 absolute right-3 cursor-pointer transition-transform duration-200 ${isOpen ? 'rotate-180 text-violet-500' : ''}`}
        />
      </div>

      {/* Floating Suggestions Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-64 overflow-y-auto rounded-xl bg-white/95 dark:bg-neutral-900/95 border border-black/10 dark:border-white/15 backdrop-blur-2xl shadow-2xl dark:shadow-[0_10px_40px_rgba(0,0,0,0.8)] py-1.5 transition-all">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => {
              const isHighlighted = index === highlightedIndex;
              const isSelected = value.toLowerCase() === product.name.toLowerCase();

              return (
                <div
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`px-3.5 py-2.5 cursor-pointer flex items-center justify-between text-xs sm:text-sm transition-colors ${
                    isHighlighted
                      ? 'bg-violet-500/15 dark:bg-violet-500/20 text-violet-900 dark:text-violet-200'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                    <span className="font-semibold truncate flex items-center gap-1.5">
                      {product.name}
                      {isSelected && <Check className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 inline shrink-0" />}
                    </span>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                      Standard slab: {product.defaultLength}ft × {product.defaultWidth}ft
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      product.type === 'Marble'
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                        : product.type === 'Granite'
                        ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                        : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30'
                    }`}>
                      {product.type}
                    </span>
                    <span className="font-bold text-neutral-900 dark:text-white text-xs">
                      ₹{product.defaultPrice}/sq.ft
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-3 text-xs text-neutral-500 dark:text-neutral-400 text-center">
              No matching stone or tile found. Press Enter to use custom entry.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
