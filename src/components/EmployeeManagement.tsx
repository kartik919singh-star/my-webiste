import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { employeeService } from '../services/apiService';
import { motion, AnimatePresence } from 'framer-motion';

interface Employee {
  _id: string;
  name: string;
  phone: string;
  email: string;
  designation: string;
  salary: number;
  joiningDate: string;
  address?: string;
  status: 'Active' | 'On Leave' | 'Resigned';
  profilePhoto?: string;
}

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal / Form States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Form Field States
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    designation: 'Sales Executive',
    salary: '',
    address: '',
    status: 'Active' as 'Active' | 'On Leave' | 'Resigned',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch employees from backend
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getEmployees(searchQuery);
      setEmployees(data);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchEmployees();
    }, 300);
    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  // Form Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Valid email is required';
    if (!formData.designation.trim()) errors.designation = 'Designation is required';
    if (!formData.salary || parseFloat(formData.salary) <= 0) errors.salary = 'Valid monthly salary is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Add Employee Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await employeeService.createEmployee({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        designation: formData.designation,
        salary: parseFloat(formData.salary),
        address: formData.address,
        status: formData.status,
      });

      setIsAddModalOpen(false);
      resetForm();
      fetchEmployees();
    } catch (err) {
      console.error('Error creating employee:', err);
    }
  };

  // Handle Edit Employee Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee || !validateForm()) return;

    try {
      await employeeService.updateEmployee(editingEmployee._id, {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        designation: formData.designation,
        salary: parseFloat(formData.salary),
        address: formData.address,
        status: formData.status,
      });

      setEditingEmployee(null);
      resetForm();
      fetchEmployees();
    } catch (err) {
      console.error('Error updating employee:', err);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async (id: string) => {
    try {
      await employeeService.deleteEmployee(id);
      setIsDeletingId(null);
      fetchEmployees();
    } catch (err) {
      console.error('Error deleting employee:', err);
    }
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      phone: emp.phone,
      email: emp.email,
      designation: emp.designation,
      salary: emp.salary.toString(),
      address: emp.address || '',
      status: emp.status,
    });
    setFormErrors({});
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      designation: 'Sales Executive',
      salary: '',
      address: '',
      status: 'Active',
    });
    setFormErrors({});
  };

  // Stats calculation
  const totalEmployees = employees.length;
  const activeCount = employees.filter((e) => e.status === 'Active').length;
  const leaveCount = employees.filter((e) => e.status === 'On Leave').length;

  // Pagination calculation
  const totalPages = Math.ceil(employees.length / itemsPerPage) || 1;
  const paginatedEmployees = employees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-xl shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-violet-500/20 text-violet-500">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Employee Management Directory
            </h2>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Manage showroom staff profiles, designations, monthly payroll, and work status.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-md cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Staff</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-neutral-400">Total Staff</p>
            <p className="text-lg font-extrabold text-neutral-900 dark:text-white">{totalEmployees}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-neutral-400">Active Duty</p>
            <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{activeCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-neutral-400">On Leave</p>
            <p className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{leaveCount}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search staff by name, phone, email, or designation..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-violet-500/50 transition-all"
        />
      </div>

      {/* Staff Table */}
      <div className="w-full rounded-2xl bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-100/80 dark:bg-white/5 text-neutral-500 dark:text-neutral-400 uppercase font-semibold text-[10px] tracking-wider border-b border-black/5 dark:border-white/10">
              <tr>
                <th className="px-5 py-3.5">Staff Member</th>
                <th className="px-5 py-3.5">Designation</th>
                <th className="px-5 py-3.5">Contact Details</th>
                <th className="px-5 py-3.5">Monthly Salary</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-neutral-400">
                    Loading employee database...
                  </td>
                </tr>
              ) : paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-neutral-400">
                    No employee profiles found matching search query.
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-neutral-500/5 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                          alt={emp.name}
                          className="w-9 h-9 rounded-full object-cover border border-violet-500/30"
                        />
                        <div>
                          <p className="font-bold text-neutral-900 dark:text-white text-xs">{emp.name}</p>
                          <p className="text-[10px] text-neutral-400">Joined {new Date(emp.joiningDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-medium text-neutral-700 dark:text-neutral-300">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                        <span>{emp.designation}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-0.5 text-[11px] text-neutral-600 dark:text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-neutral-400" />
                          {emp.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-neutral-400" />
                          {emp.email}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-bold text-neutral-900 dark:text-white">
                      ₹{emp.salary.toLocaleString('en-IN')} / mo
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        emp.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : emp.status === 'On Leave'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                      }`}>
                        {emp.status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(emp)}
                          className="p-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 transition-colors cursor-pointer"
                          title="Edit Employee"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setIsDeletingId(emp._id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs text-neutral-500">
          <span>Showing page {currentPage} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-white/5 border border-black/10 dark:border-white/10 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-white/5 border border-black/10 dark:border-white/10 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      <AnimatePresence>
        {(isAddModalOpen || editingEmployee) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-white/10 p-6 shadow-2xl flex flex-col gap-4 text-white"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-violet-400" />
                  <span>{editingEmployee ? 'Edit Staff Profile' : 'Register New Staff'}</span>
                </h3>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingEmployee(null);
                  }}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={editingEmployee ? handleEditSubmit : handleAddSubmit} className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-neutral-400 uppercase">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Suresh Kumar"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-violet-500"
                    />
                    {formErrors.name && <span className="text-[10px] text-red-400">{formErrors.name}</span>}
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-neutral-400 uppercase">Phone Number *</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-violet-500"
                    />
                    {formErrors.phone && <span className="text-[10px] text-red-400">{formErrors.phone}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-neutral-400 uppercase">Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="suresh@hanumant.com"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-violet-500"
                    />
                    {formErrors.email && <span className="text-[10px] text-red-400">{formErrors.email}</span>}
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-neutral-400 uppercase">Designation *</label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g. Sales Manager"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-violet-500"
                    />
                    {formErrors.designation && <span className="text-[10px] text-red-400">{formErrors.designation}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-neutral-400 uppercase">Monthly Salary (₹) *</label>
                    <input
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      placeholder="35000"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-violet-500"
                    />
                    {formErrors.salary && <span className="text-[10px] text-red-400">{formErrors.salary}</span>}
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-neutral-400 uppercase">Work Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-xs focus:outline-none focus:border-violet-500"
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Resigned">Resigned</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-neutral-400 uppercase">Residential Address</label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Residential address details..."
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingEmployee(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md"
                  >
                    {editingEmployee ? 'Save Profile Changes' : 'Create Staff Record'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {isDeletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-white/10 p-5 shadow-2xl flex flex-col gap-3 text-white text-center"
            >
              <Trash2 className="w-8 h-8 text-red-400 mx-auto" />
              <h3 className="text-sm font-bold">Remove Employee Record?</h3>
              <p className="text-xs text-neutral-400">
                Are you sure you want to permanently delete this staff member profile? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3 mt-2">
                <button
                  onClick={() => setIsDeletingId(null)}
                  className="px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteConfirm(isDeletingId)}
                  className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
