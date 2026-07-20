import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import BillingPanel from './components/BillingPanel';
import TotalCard from './components/TotalCard';
import HeaderBar from './components/HeaderBar';
import SalesReports from './components/SalesReports';
import EmployeeManagement from './components/EmployeeManagement';
import { useRole } from './context/RoleContext';
import type { CustomerDetails, InvoiceItem } from './types';
import { calculateInvoiceTotals } from './utils/calculations';
import {
  authService,
  customerService,
  productService,
  invoiceService,
  paymentService,
} from './services/apiService';
import {
  CheckCircle,
  AlertCircle,
  Info,
  Plus,
  Loader2,
  Coins,
  Calendar,
  Tag,
  AlertTriangle,
  Search,
  Trash2,
  Edit2,
  Save,
  X,
  Users,
  TrendingUp,
  Clock,
  CheckSquare,
  Lock,
  Layers,
  ShoppingBag,
  MapPin,
  Phone,
} from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  const { setRole } = useRole();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1280);

  // Authentication State
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loginEmail, setLoginEmail] = useState('admin@hanumant.com');
  const [loginPassword, setLoginPassword] = useState('adminpassword');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Live Database States
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [dbInvoices, setDbInvoices] = useState<any[]>([]);
  const [dbCustomers, setDbCustomers] = useState<any[]>([]);

  // Search filter states
  const [productSearch, setProductSearch] = useState('');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  // Inline Editing States
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingProductData, setEditingProductData] = useState<{ name: string; type: string; price: string; quantity: string; length?: string; width?: string }>({
    name: '',
    type: 'Marble',
    price: '',
    quantity: '',
    length: '',
    width: '',
  });

  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [editingCustomerData, setEditingCustomerData] = useState<{ name: string; phone: string; address: string }>({
    name: '',
    phone: '',
    address: '',
  });

  // State for adding a new product directly from Inventory tab
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<{ name: string; type: string; price: string; quantity: string; length?: string; width?: string }>({
    name: '',
    type: 'Marble',
    price: '',
    quantity: '',
    length: '',
    width: '',
  });

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);

  // Customer Form State
  const [customer, setCustomer] = useState<CustomerDetails>({
    name: 'Rohan Mehra',
    phone: '+91 98765 43210',
    address: 'Indiranagar, 100 Feet Rd, Bangalore',
  });

  // Line items state (start with 1 blank/pre-populated row)
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: Date.now().toString(),
      name: 'Italian Carrara Marble',
      length: '8.5',
      width: '4.5',
      quantity: '10',
      price: '450',
    },
  ]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1280);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check auth session on startup
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await authService.getProfile();
          if (profile && profile.success) {
            setUser(profile);
            setIsAuthenticated(true);
            const userRole = profile.role?.toLowerCase() === 'admin' ? 'Admin' : 'Employee';
            setRole(userRole);
          }
        } catch (err) {
          console.error('Session check failed:', err);
          localStorage.removeItem('token');
        }
      }
      setIsCheckingAuth(false);
    };
    checkSession();
  }, [setRole]);

  // Fetch backend records when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchBackendData();
    }
  }, [isAuthenticated, activeTab]);

  const fetchBackendData = async () => {
    try {
      // 1. Fetch products (apply search if typed)
      let products = [];
      if (productSearch.trim()) {
        products = await productService.searchProducts(productSearch);
      } else {
        products = await productService.getProducts();
      }
      setDbProducts(products);

      // 2. Fetch invoices (apply search if typed)
      let invoices = [];
      if (invoiceSearch.trim()) {
        invoices = await invoiceService.searchInvoices(invoiceSearch);
      } else {
        invoices = await invoiceService.getInvoices();
      }
      setDbInvoices(invoices);

      // 3. Fetch customers (apply search if typed)
      let customers = [];
      if (customerSearch.trim()) {
        customers = await customerService.searchCustomers(customerSearch);
      } else {
        customers = await customerService.getCustomers();
      }
      setDbCustomers(customers);
    } catch (err) {
      console.error('Error fetching database records:', err);
    }
  };

  // Debounced search trigger for backend filters
  useEffect(() => {
    if (isAuthenticated) {
      const delaySearch = setTimeout(() => {
        fetchBackendData();
      }, 300); // Debounce search calls
      return () => clearTimeout(delaySearch);
    }
  }, [productSearch, invoiceSearch, customerSearch]);

  // Toast system helper
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Perform live subtotal, tax (GST), and grand total aggregates
  const { subtotal, tax, grandTotal } = calculateInvoiceTotals(items);

  // Operator Login Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      addToast('Please enter both email and password.', 'error');
      return;
    }
    setIsLoggingIn(true);
    try {
      const res = await authService.login({ email: loginEmail, password: loginPassword });
      if (res.success) {
        setUser(res);
        setIsAuthenticated(true);
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
        const userRole = res.role?.toLowerCase() === 'admin' ? 'Admin' : 'Employee';
        setRole(userRole);
        addToast(`Terminal access granted. Welcome, ${res.name}!`, 'success');
      }
    } catch (err: any) {
      console.error(err);
      addToast(err.response?.data?.message || 'Invalid operator credentials.', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Operator Logout
  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      setRole('Employee');
      addToast('Terminal session logged out.', 'info');
    } catch (err) {
      console.error(err);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      setRole('Employee');
    }
  };

  // Generate Invoice Handler (POST to MongoDB backend)
  const handleGenerateInvoice = async () => {
    if (!customer.name.trim()) {
      addToast('Please enter a client name before generating invoice.', 'error');
      return;
    }
    if (items.some((item) => !item.name.trim() || !item.length || !item.width || !item.price)) {
      addToast('Please complete all item details before generating invoice.', 'info');
      return;
    }

    setIsGenerating(true);

    try {
      const res = await invoiceService.createInvoice({
        customer,
        items,
        subtotal,
        tax,
        grandTotal,
        status: 'Unpaid',
      });

      console.log('--- GENERATED INVOICE SAVED TO DB ---', res);
      addToast(
        `Invoice #${res._id.slice(-6).toUpperCase()} successfully created & saved to MongoDB Atlas!`,
        'success'
      );

      // Refresh data from MongoDB Atlas
      await fetchBackendData();

      // Reset lines to a blank row
      setItems([
        {
          id: Date.now().toString(),
          name: '',
          length: '',
          width: '',
          quantity: '1',
          price: '',
        },
      ]);
      
      // Auto-transition to Recent Bills screen to see the invoice
      setTimeout(() => {
        setActiveTab('recent-bills');
      }, 500);
    } catch (err: any) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to save show invoice.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Add Product Submit
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim() || !newProduct.price || !newProduct.quantity) {
      addToast('Please fill out all product details.', 'info');
      return;
    }

    setIsAddingProduct(true);
    try {
      await productService.createProduct(newProduct);
      addToast(`Material "${newProduct.name}" saved to database catalog!`, 'success');

      setNewProduct({
        name: '',
        type: 'Marble',
        length: '',
        width: '',
        quantity: '',
        price: '',
      });
      fetchBackendData();
    } catch (err: any) {
      console.error(err);
      addToast(err.response?.data?.message || 'Could not save product.', 'error');
    } finally {
      setIsAddingProduct(false);
    }
  };

  // Edit Product Row trigger
  const startEditProduct = (p: any) => {
    setEditingProductId(p._id);
    setEditingProductData({
      name: p.name,
      type: p.type,
      length: p.length.toString(),
      width: p.width.toString(),
      quantity: p.quantity.toString(),
      price: p.price.toString(),
    });
  };

  // Save Edited Product
  const handleSaveProduct = async (id: string) => {
    try {
      await productService.updateProduct(id, editingProductData);
      addToast('Product catalog record updated successfully.', 'success');
      setEditingProductId(null);
      fetchBackendData();
    } catch (err: any) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to update product details.', 'error');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this product and its associated stock inventory?')) return;
    try {
      await productService.deleteProduct(id);
      addToast('Product successfully removed from showroom database.', 'success');
      fetchBackendData();
    } catch (err: any) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to delete product.', 'error');
    }
  };

  // Add Customer Submit
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name.trim() || !newCustomer.phone.trim()) {
      addToast('Please enter both name and mobile phone number.', 'info');
      return;
    }

    setIsAddingCustomer(true);
    try {
      await customerService.createCustomer(newCustomer);
      addToast(`Customer record for "${newCustomer.name}" saved!`, 'success');
      setNewCustomer({ name: '', phone: '', address: '' });
      fetchBackendData();
    } catch (err: any) {
      console.error(err);
      addToast(err.response?.data?.message || 'Could not save client profile.', 'error');
    } finally {
      setIsAddingCustomer(false);
    }
  };

  // Edit Customer trigger
  const startEditCustomer = (c: any) => {
    setEditingCustomerId(c._id);
    setEditingCustomerData({
      name: c.name,
      phone: c.phone,
      address: c.address,
    });
  };

  // Save Edited Customer
  const handleSaveCustomer = async (id: string) => {
    try {
      await customerService.updateCustomer(id, editingCustomerData);
      addToast('Customer profile updated.', 'success');
      setEditingCustomerId(null);
      fetchBackendData();
    } catch (err: any) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to update customer.', 'error');
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this client? Invoices referring to this client will remain.')) return;
    try {
      await customerService.deleteCustomer(id);
      addToast('Customer record deleted.', 'success');
      fetchBackendData();
    } catch (err: any) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to delete customer.', 'error');
    }
  };

  // Delete Invoice
  const handleDeleteInvoice = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this billing invoice record?')) return;
    try {
      await invoiceService.deleteInvoice(id);
      addToast('Invoice record deleted from MongoDB Atlas.', 'success');
      fetchBackendData();
    } catch (err: any) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to delete invoice.', 'error');
    }
  };

  // Record payment handler (POST to /api/payments)
  const handleRecordPayment = async (invoiceId: string, customerId: string, amount: number) => {
    try {
      await paymentService.createPayment({
        invoice: invoiceId,
        customer: customerId,
        amount,
        paymentMethod: 'UPI',
        status: 'Success',
      });

      addToast('Transaction recorded successfully! Invoice status updated to Paid.', 'success');
      fetchBackendData();
    } catch (err: any) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to log payment transaction.', 'error');
    }
  };

  // Live Dashboard Aggregates Calculations
  const dashboardStats = useMemo(() => {
    const totalCustomers = dbCustomers.length;
    const totalProducts = dbProducts.length;
    const totalBills = dbInvoices.length;

    let todaySales = 0;
    let monthlySales = 0;
    let pendingPayments = 0;
    let paidPayments = 0;

    const todayStr = new Date().toDateString();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    dbInvoices.forEach((inv) => {
      const invDate = new Date(inv.date);
      const isPaid = inv.status === 'Paid';

      // Aggregate payments splits
      if (isPaid) {
        paidPayments += inv.grandTotal;
      } else {
        pendingPayments += inv.grandTotal;
      }

      // Aggregate Today's Sales
      if (invDate.toDateString() === todayStr) {
        todaySales += inv.grandTotal;
      }

      // Aggregate Monthly Sales
      if (invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear) {
        monthlySales += inv.grandTotal;
      }
    });

    return {
      totalCustomers,
      totalProducts,
      totalBills,
      todaySales,
      monthlySales,
      pendingPayments,
      paidPayments,
    };
  }, [dbProducts, dbInvoices, dbCustomers]);


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

  // Secure Operator Login View
  if (!isAuthenticated && !isCheckingAuth) {
    return (
      <div className="relative min-h-screen w-full bg-brand-dark text-neutral-200 overflow-hidden flex items-center justify-center p-4">
        {/* Ambient background glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[120px]" />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl flex flex-col gap-6"
        >
          {/* Top shimmer lines */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500/10 via-violet-500 to-violet-500/10" />

          {/* Logo Brand */}
          <div className="flex items-center gap-3 self-center">
            <div className="p-3 bg-gradient-to-tr from-violet-600/30 to-fuchsia-600/30 border border-violet-500/30 rounded-2xl shadow-lg">
              <Layers className="w-8 h-8 text-violet-400" />
            </div>
            <div>
              <h1 className="font-extrabold text-white tracking-wide text-2xl">Hanumant Marble</h1>
              <p className="text-[10px] text-violet-400 font-semibold tracking-widest uppercase">Showroom Terminal</p>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-base font-bold text-white mb-1">Terminal Authentication</h2>
            <p className="text-xs text-neutral-400">Secure access gate to showroom billing & Atlas inventory.</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="operator@hanumant.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Security Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validating session...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Enter Showroom System</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Operator Accounts Selection */}
          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider text-center">
              Quick Login Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setLoginEmail('admin@hanumant.com');
                  setLoginPassword('adminpassword');
                }}
                className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-left cursor-pointer transition-colors"
              >
                <span className="text-[10px] font-bold text-amber-300 block">Admin Operator</span>
                <span className="text-[9px] text-neutral-400 block truncate">admin@hanumant.com</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginEmail('employee@hanumant.com');
                  setLoginPassword('employeepassword');
                }}
                className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-left cursor-pointer transition-colors"
              >
                <span className="text-[10px] font-bold text-emerald-300 block">Employee Officer</span>
                <span className="text-[9px] text-neutral-400 block truncate">employee@hanumant.com</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Loader screen while verifying cookie/session
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen w-full bg-brand-dark flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-neutral-100 dark:bg-brand-dark text-neutral-800 dark:text-neutral-200 overflow-x-hidden flex justify-center transition-colors duration-350">
      {/* Background radial glow spots to enhance visual depth */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0 opacity-40 dark:opacity-100 transition-opacity">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-violet-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Main Container */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 w-full max-w-[1400px] min-h-screen p-4 md:p-6 lg:p-8 flex flex-col gap-6 lg:gap-8 justify-start"
      >
        {/* Top HeaderBar */}
        <HeaderBar user={user} onLogout={handleLogout} />

        {/* 3-Column Responsive Grid Layout */}
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-[auto_1fr_auto] gap-6 lg:gap-8 items-start">
          
          {/* Column 1: Sidebar */}
          <div className="w-full xl:w-72 h-full xl:sticky xl:top-8 z-20">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} user={user} />
          </div>

          {/* Column 2: Main Billing Panel or Tab Views */}
          <main className="w-full h-full z-10 flex flex-col gap-6">
            
            {activeTab === 'sales-reports' ? (
              <SalesReports />
            ) : activeTab === 'staff-management' ? (
              <EmployeeManagement />
            ) : activeTab === 'dashboard' ? (
              /* Live MERN Dashboard Metrics Tab */
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Showroom Analytics Dashboard</h2>
                  <p className="text-xs text-neutral-400">Live operational data connected directly to MongoDB Atlas.</p>
                </div>

                {/* Dashboard Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Card 1: Total Customers */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-md">
                    <div>
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Total Customers</p>
                      <h3 className="text-2xl font-extrabold text-white mt-1">{dashboardStats.totalCustomers}</h3>
                    </div>
                    <div className="p-3 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Card 2: Total Products */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-md">
                    <div>
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Products Catalog</p>
                      <h3 className="text-2xl font-extrabold text-white mt-1">{dashboardStats.totalProducts}</h3>
                    </div>
                    <div className="p-3 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Card 3: Total Invoices */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-md">
                    <div>
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Total Bills</p>
                      <h3 className="text-2xl font-extrabold text-white mt-1">{dashboardStats.totalBills}</h3>
                    </div>
                    <div className="p-3 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl">
                      <Calendar className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Card 4: Monthly Sales */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-md">
                    <div>
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Monthly Sales</p>
                      <h3 className="text-xl font-extrabold text-emerald-400 mt-1">₹{dashboardStats.monthlySales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h3>
                    </div>
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Financial Splits Card */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 shadow-md col-span-1">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Showroom Financial Audits</h4>
                    
                    <div className="flex flex-col gap-3 py-2 border-y border-white/5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-500" /> Pending Payments</span>
                        <span className="font-semibold text-amber-400">₹{dashboardStats.pendingPayments.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-400 flex items-center gap-1.5"><CheckSquare className="w-3.5 h-3.5 text-emerald-500" /> Paid Payments</span>
                        <span className="font-semibold text-emerald-400">₹{dashboardStats.paidPayments.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-white/5 text-sm font-bold">
                        <span className="text-white">Today's Sales</span>
                        <span className="text-violet-400">₹{dashboardStats.todaySales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl text-[10px] text-violet-300 leading-relaxed">
                      All calculations are performed live using indexes across customer invoices.
                    </div>
                  </div>

                  {/* Recent Invoices Table inside Dashboard */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-md col-span-2 flex flex-col gap-3">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Recent Invoices Compiled</span>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-white/10 text-neutral-400 uppercase tracking-wider text-[9px] font-semibold">
                            <th className="py-2">Date</th>
                            <th className="py-2">Client</th>
                            <th className="py-2 text-right">Amount</th>
                            <th className="py-2 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dbInvoices.slice(0, 5).map((inv) => (
                            <tr key={inv._id} className="border-b border-white/5 hover:bg-white/[0.01]">
                              <td className="py-2 text-neutral-400">{new Date(inv.date).toLocaleDateString('en-IN')}</td>
                              <td className="py-2 font-semibold text-white">{inv.customer?.name || 'Walk-in'}</td>
                              <td className="py-2 text-right text-white">₹{inv.grandTotal.toLocaleString('en-IN')}</td>
                              <td className="py-2 text-center">
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                  inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                                }`}>
                                  {inv.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {dbInvoices.length === 0 && (
                            <tr>
                              <td colSpan={4} className="py-4 text-center text-neutral-500">No invoices generated yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'new-invoice' ? (
              <BillingPanel
                customer={customer}
                onCustomerChange={setCustomer}
                items={items}
                onItemsChange={setItems}
              />
            ) : activeTab === 'inventory' ? (
              /* Live Inventory Tab Panel */
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Showroom Material Inventory</h2>
                  <p className="text-xs text-neutral-400">Add, edit, search, and manage stock catalog listings in real-time.</p>
                </div>

                {/* Form to Add New Product to MongoDB */}
                <form
                  onSubmit={handleAddProduct}
                  className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-md flex flex-col gap-4"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-violet-400 uppercase">
                    <Plus className="w-4 h-4 shrink-0" />
                    <span>Add Showroom Material</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Item Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Imperial Red Granite"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/50"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Material Type</label>
                      <select
                        value={newProduct.type}
                        onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value })}
                        className="bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-violet-500/50"
                      >
                        <option value="Marble">Marble</option>
                        <option value="Granite">Granite</option>
                        <option value="Tiles">Tiles</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Price per Sq.Ft (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 450"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/50"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Default Length (ft)</label>
                      <input
                        type="text"
                        placeholder="e.g. 8.5"
                        value={newProduct.length}
                        onChange={(e) => setNewProduct({ ...newProduct, length: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/50"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Default Width (ft)</label>
                      <input
                        type="text"
                        placeholder="e.g. 4.5"
                        value={newProduct.width}
                        onChange={(e) => setNewProduct({ ...newProduct, width: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/50"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Stock Qty (Slabs/Boxes)</label>
                      <input
                        type="number"
                        placeholder="e.g. 25"
                        value={newProduct.quantity}
                        onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAddingProduct}
                    className="w-44 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 self-end cursor-pointer disabled:opacity-50 border-none"
                  >
                    {isAddingProduct ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Save to Inventory</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Showroom Products Stock Catalog list */}
                <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-md flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <span className="text-sm font-semibold tracking-wider text-violet-400 uppercase">Showroom Inventory Catalog</span>
                    
                    {/* Live Search Box */}
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="text"
                        placeholder="Search product name..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-violet-500/50"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px] text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-neutral-400 uppercase tracking-wider text-[9px] font-semibold">
                          <th className="py-2.5 px-2">Material Name</th>
                          <th className="py-2.5 px-2">Type</th>
                          <th className="py-2.5 px-2 text-center">Dimensions</th>
                          <th className="py-2.5 px-2 text-right">Available Stock</th>
                          <th className="py-2.5 px-2 text-right">Price per Sq.Ft</th>
                          <th className="py-2.5 px-2 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dbProducts.map((p) => {
                          const isEditing = editingProductId === p._id;
                          return (
                            <tr key={p._id} className="border-b border-white/5 hover:bg-white/[0.01]">
                              <td className="py-3 px-2 font-medium">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editingProductData.name}
                                    onChange={(e) => setEditingProductData({ ...editingProductData, name: e.target.value })}
                                    className="bg-zinc-950 border border-white/10 rounded px-2 py-1 text-xs text-white"
                                  />
                                ) : (
                                  <span className="text-white font-semibold">{p.name}</span>
                                )}
                              </td>
                              <td className="py-3 px-2">
                                {isEditing ? (
                                  <select
                                    value={editingProductData.type}
                                    onChange={(e) => setEditingProductData({ ...editingProductData, type: e.target.value })}
                                    className="bg-zinc-950 border border-white/10 rounded px-2 py-1 text-xs text-white"
                                  >
                                    <option value="Marble">Marble</option>
                                    <option value="Granite">Granite</option>
                                    <option value="Tiles">Tiles</option>
                                  </select>
                                ) : (
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                    p.type === 'Marble' 
                                      ? 'bg-violet-500/10 text-violet-300 border border-violet-500/20'
                                      : p.type === 'Granite'
                                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                      : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                  }`}>
                                    {p.type}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-2 text-center text-neutral-400">
                                {isEditing ? (
                                  <div className="flex items-center gap-1 justify-center">
                                    <input
                                      type="text"
                                      value={editingProductData.length}
                                      onChange={(e) => setEditingProductData({ ...editingProductData, length: e.target.value })}
                                      className="bg-zinc-950 border border-white/10 rounded w-12 px-1 py-0.5 text-center text-xs"
                                    />
                                    <span>×</span>
                                    <input
                                      type="text"
                                      value={editingProductData.width}
                                      onChange={(e) => setEditingProductData({ ...editingProductData, width: e.target.value })}
                                      className="bg-zinc-950 border border-white/10 rounded w-12 px-1 py-0.5 text-center text-xs"
                                    />
                                  </div>
                                ) : (
                                  <span>{p.length} ft × {p.width} ft</span>
                                )}
                              </td>
                              <td className="py-3 px-2 text-right">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={editingProductData.quantity}
                                    onChange={(e) => setEditingProductData({ ...editingProductData, quantity: e.target.value })}
                                    className="bg-zinc-950 border border-white/10 rounded w-16 px-1 py-0.5 text-right text-xs"
                                  />
                                ) : (
                                  <span className={p.quantity <= 5 ? 'text-red-400 font-bold' : 'text-neutral-200'}>
                                    {p.quantity} slabs
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-2 text-right text-white font-semibold">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={editingProductData.price}
                                    onChange={(e) => setEditingProductData({ ...editingProductData, price: e.target.value })}
                                    className="bg-zinc-950 border border-white/10 rounded w-16 px-1 py-0.5 text-right text-xs"
                                  />
                                ) : (
                                  <span>₹{p.price.toLocaleString('en-IN')}</span>
                                )}
                              </td>
                              <td className="py-3 px-2 text-center">
                                {isEditing ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveProduct(p._id)}
                                      className="p-1 bg-transparent hover:bg-white/10 border-none rounded text-emerald-400 cursor-pointer"
                                      title="Save Changes"
                                    >
                                      <Save className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingProductId(null)}
                                      className="p-1 bg-transparent hover:bg-white/10 border-none rounded text-neutral-400 cursor-pointer"
                                      title="Cancel"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => startEditProduct(p)}
                                      className="p-1 bg-transparent hover:bg-white/10 border-none rounded text-neutral-400 hover:text-white cursor-pointer"
                                      title="Edit Product"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteProduct(p._id)}
                                      className="p-1 bg-transparent hover:bg-white/10 border-none rounded text-neutral-500 hover:text-red-400 cursor-pointer"
                                      title="Delete Product"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {dbProducts.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-neutral-500">
                              No products found matching your search.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : activeTab === 'recent-bills' ? (
              /* Recent Bills tab view */
              <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-md flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span className="text-sm font-semibold tracking-wider text-violet-400 uppercase">Recent Billings (MERN Stack)</span>
                  
                  {/* Live Search Box */}
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Search bill ID or customer..."
                      value={invoiceSearch}
                      onChange={(e) => setInvoiceSearch(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-violet-500/50"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[750px] text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-neutral-400 uppercase tracking-wider text-[9px] font-semibold">
                        <th className="py-2.5 px-2">Date</th>
                        <th className="py-2.5 px-2">Bill ID</th>
                        <th className="py-2.5 px-2">Client Details</th>
                        <th className="py-2.5 px-2 text-right">Item Count</th>
                        <th className="py-2.5 px-2 text-right">GST (18%)</th>
                        <th className="py-2.5 px-2 text-right">Grand Total</th>
                        <th className="py-2.5 px-2 text-center">Status</th>
                        <th className="py-2.5 px-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbInvoices.map((inv) => (
                        <tr key={inv._id} className="border-b border-white/5 hover:bg-white/[0.01]">
                          <td className="py-3.5 px-2 text-neutral-400">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                              <span>{new Date(inv.date).toLocaleDateString('en-IN')}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-2 font-mono text-[10px] text-neutral-500">
                            #{inv._id.slice(-6).toUpperCase()}
                          </td>
                          <td className="py-3.5 px-2">
                            <div className="flex flex-col">
                              <span className="font-semibold text-white">{inv.customer?.name || 'Walk-in'}</span>
                              <span className="text-[10px] text-neutral-500">{inv.customer?.phone || ''}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-2 text-right text-neutral-300">
                            {inv.items?.length || 0} items
                          </td>
                          <td className="py-3.5 px-2 text-right text-neutral-400">
                            ₹{inv.tax?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-2 text-right text-white font-bold text-sm">
                            ₹{inv.grandTotal?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-2 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              inv.status === 'Paid'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {inv.status === 'Unpaid' ? (
                                <button
                                  type="button"
                                  onClick={() => handleRecordPayment(inv._id, inv.customer?._id, inv.grandTotal)}
                                  className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-600 text-black font-semibold text-[10px] border-none transition-colors cursor-pointer"
                                >
                                  Record UPI Pay
                                </button>
                              ) : (
                                <span className="text-neutral-600 text-[10px] font-medium flex items-center justify-center gap-1">
                                  <Coins className="w-3.5 h-3.5 text-emerald-500" /> Paid
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteInvoice(inv._id)}
                                className="p-1 bg-transparent hover:bg-white/10 border-none rounded text-neutral-500 hover:text-red-400 cursor-pointer"
                                title="Delete Invoice"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {dbInvoices.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-neutral-500">
                            No bills found. Create invoices using the "New Invoice" tab.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Settings & Customers CRUD management Tab */
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Showroom Operators & Clients</h2>
                  <p className="text-xs text-neutral-400">Configure parameters, create new client accounts, and adjust details.</p>
                </div>

                {/* Customer manual registration form */}
                <form
                  onSubmit={handleAddCustomer}
                  className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-md flex flex-col gap-4"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-violet-400 uppercase">
                    <Plus className="w-4 h-4 shrink-0" />
                    <span>Create Customer Account</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Client Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Rohini Sharma"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/50"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Phone Mobile (Unique)</label>
                      <input
                        type="text"
                        placeholder="e.g. +91 98765 00000"
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/50"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Freight Delivery Address</label>
                      <input
                        type="text"
                        placeholder="e.g. JP Nagar, Bangalore"
                        value={newCustomer.address}
                        onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAddingCustomer}
                    className="w-44 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 self-end cursor-pointer disabled:opacity-50 border-none"
                  >
                    {isAddingCustomer ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Register Client</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Showroom Registered Customers list (with edits/deletes) */}
                <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-md flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <span className="text-sm font-semibold tracking-wider text-violet-400 uppercase">Registered Customers Database</span>
                    
                    {/* Live Search Box */}
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="text"
                        placeholder="Search customer name or phone..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-violet-500/50"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px] text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-neutral-400 uppercase tracking-wider text-[9px] font-semibold">
                          <th className="py-2.5 px-2">Customer Name</th>
                          <th className="py-2.5 px-2">Phone Number</th>
                          <th className="py-2.5 px-2">Delivery Address</th>
                          <th className="py-2.5 px-2 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dbCustomers.map((c) => {
                          const isEditing = editingCustomerId === c._id;
                          return (
                            <tr key={c._id} className="border-b border-white/5 hover:bg-white/[0.01]">
                              <td className="py-3 px-2 font-medium">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editingCustomerData.name}
                                    onChange={(e) => setEditingCustomerData({ ...editingCustomerData, name: e.target.value })}
                                    className="bg-zinc-950 border border-white/10 rounded px-2 py-1 text-xs text-white"
                                  />
                                ) : (
                                  <span className="text-white font-semibold">{c.name}</span>
                                )}
                              </td>
                              <td className="py-3 px-2 text-neutral-300">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editingCustomerData.phone}
                                    onChange={(e) => setEditingCustomerData({ ...editingCustomerData, phone: e.target.value })}
                                    className="bg-zinc-950 border border-white/10 rounded px-2 py-1 text-xs text-white"
                                  />
                                ) : (
                                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-neutral-600" /> {c.phone}</span>
                                )}
                              </td>
                              <td className="py-3 px-2 text-neutral-400">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editingCustomerData.address}
                                    onChange={(e) => setEditingCustomerData({ ...editingCustomerData, address: e.target.value })}
                                    className="bg-zinc-950 border border-white/10 rounded w-full px-2 py-1 text-xs text-white"
                                  />
                                ) : (
                                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-neutral-600" /> {c.address}</span>
                                )}
                              </td>
                              <td className="py-3 px-2 text-center">
                                {isEditing ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveCustomer(c._id)}
                                      className="p-1 bg-transparent hover:bg-white/10 border-none rounded text-emerald-400 cursor-pointer"
                                      title="Save Changes"
                                    >
                                      <Save className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingCustomerId(null)}
                                      className="p-1 bg-transparent hover:bg-white/10 border-none rounded text-neutral-400 cursor-pointer"
                                      title="Cancel"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => startEditCustomer(c)}
                                      className="p-1 bg-transparent hover:bg-white/10 border-none rounded text-neutral-400 hover:text-white cursor-pointer"
                                      title="Edit Customer"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCustomer(c._id)}
                                      className="p-1 bg-transparent hover:bg-white/10 border-none rounded text-neutral-500 hover:text-red-400 cursor-pointer"
                                      title="Delete Customer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {dbCustomers.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-neutral-500">
                              No customer records found matching search query.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* Column 3: Floating Total Card / Information Card */}
          {activeTab === 'new-invoice' ? (
            <motion.div
              variants={totalCardFloatVariants}
              animate={isDesktop ? 'animate' : ''}
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
          ) : (
            /* Database sync widgets inside tabs */
            <div className="w-full xl:w-72 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 flex flex-col gap-6 text-neutral-300">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-semibold uppercase tracking-wider">Showroom Status</span>
              </div>
              
              <div className="flex flex-col gap-4 py-4 border-y border-white/5 text-xs leading-relaxed">
                <div>
                  <p className="font-semibold text-white mb-0.5">Atlas Connection Status</p>
                  <p className="text-[10px] text-neutral-500 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" /> Active MongoDB Cluster
                  </p>
                </div>
                
                <div>
                  <p className="font-semibold text-white mb-0.5">Client CRUD Sync</p>
                  <p className="text-[10px] text-neutral-500">
                    Modifying data immediately triggers Mongoose pre-save filters and keeps local records correct.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl text-[10px] text-violet-300 leading-relaxed flex gap-2">
                <AlertTriangle className="w-4.5 h-4.5 text-violet-400 shrink-0 mt-0.5 animate-pulse" />
                <span>
                  Make sure your backend server is active (`npm run server`) to capture form submits.
                </span>
              </div>
            </div>
          )}

        </div>
        
        {/* Footer */}
        <footer className="py-4 text-center text-[10px] text-neutral-500 border-t border-black/5 dark:border-white/5 mt-auto">
          © {new Date().getFullYear()} Hanumant Marble. Secured Local Showroom Invoice Terminal.
        </footer>
      </motion.div>

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
                  {toast.type === 'success' && 'Operation Completed'}
                  {toast.type === 'error' && 'Validation Failure'}
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
