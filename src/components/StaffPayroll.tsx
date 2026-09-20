import React, { useState } from 'react';
import { 
  Users, 
  DollarSign, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  Printer, 
  Search, 
  Filter, 
  Plus, 
  Building2, 
  FileSpreadsheet, 
  ShieldCheck, 
  X,
  ChevronRight
} from 'lucide-react';
import { StaffPayrollRecord } from '../types';
import { INITIAL_STAFF_PAYROLL } from '../data/mockData';

export const StaffPayroll: React.FC = () => {
  const [payrollRecords, setPayrollRecords] = useState<StaffPayrollRecord[]>(INITIAL_STAFF_PAYROLL);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedPayslip, setSelectedPayslip] = useState<StaffPayrollRecord | null>(null);
  const [activeCycle, setActiveCycle] = useState<string>('September 2026');

  // Bonus adjust modal
  const [bonusModalRecord, setBonusModalRecord] = useState<StaffPayrollRecord | null>(null);
  const [additionalBonus, setAdditionalBonus] = useState<number>(15000);

  const departments = [
    'All',
    'Comprehensive Stroke Center',
    'Neurosurgery & Neuro-Oncology',
    'Epilepsy & EEG Unit',
    'Neuro-Intensive Care Unit (ICU)',
    'Neuro-Diagnostics & EEG/EMG Lab',
    'Neuro-Rehabilitation & Physio'
  ];

  const filteredRecords = payrollRecords.filter(rec => {
    const matchesStatus = selectedStatus === 'All' || rec.paymentStatus === selectedStatus;
    const matchesDept = selectedDepartment === 'All' || rec.department === selectedDepartment;
    const matchesSearch = 
      rec.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesDept && matchesSearch;
  });

  // Calculate high level payroll analytics
  const totalPayroll = payrollRecords.reduce((acc, r) => acc + r.netPayable, 0);
  const totalEmergencyBonus = payrollRecords.reduce((acc, r) => acc + r.onCallEmergencyBonus, 0);
  const processedCount = payrollRecords.filter(r => r.paymentStatus === 'Paid').length;
  const pendingCount = payrollRecords.filter(r => r.paymentStatus === 'Processing').length;

  const markAsPaid = (id: string) => {
    setPayrollRecords(prev => prev.map(rec => {
      if (rec.id === id) {
        return {
          ...rec,
          paymentStatus: 'Paid',
          paidOn: new Date().toISOString().split('T')[0]
        };
      }
      return rec;
    }));
  };

  const handleApplyBonus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bonusModalRecord) return;

    setPayrollRecords(prev => prev.map(rec => {
      if (rec.id === bonusModalRecord.id) {
        const updatedBonus = rec.onCallEmergencyBonus + Number(additionalBonus);
        const updatedNet = rec.baseSalary + updatedBonus + rec.nightShiftAllowance - rec.deductionsTDS - rec.deductionsPF;
        return {
          ...rec,
          onCallEmergencyBonus: updatedBonus,
          netPayable: updatedNet
        };
      }
      return rec;
    }));

    setBonusModalRecord(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Hospital HR Analytics */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2 border border-cyan-500/30">
            <Building2 className="w-3.5 h-3.5" />
            Hospital Administration & Medical Roster Payroll
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Staff Compensation & Neuro-Emergency Payroll
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Integrated payroll module managing compensation for neurologists, neurosurgeons, ICU night nurses, 
            and stroke rapid response on-call allowances for cycle: <strong className="text-white">{activeCycle}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs shrink-0">
          <span className="text-slate-400 px-2 font-medium">Cycle:</span>
          <select
            value={activeCycle}
            onChange={e => setActiveCycle(e.target.value)}
            className="bg-slate-900 text-cyan-300 font-bold px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer focus:outline-none"
          >
            <option value="September 2026">September 2026 (Current)</option>
            <option value="August 2026">August 2026 (Archived)</option>
            <option value="July 2026">July 2026 (Archived)</option>
          </select>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-semibold block">Total Monthly Disbursement</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            ₹{(totalPayroll / 100000).toFixed(2)} Lakhs
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">All Neuro-Specialties</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-semibold block">On-Call Stroke Allowances</span>
          <div className="text-xl sm:text-2xl font-black text-cyan-700 mt-1">
            ₹{(totalEmergencyBonus / 1000).toFixed(0)}k
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Cath-Lab & Emergency Duties</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-semibold block">Disbursed Records</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
            {processedCount} <span className="text-xs text-slate-400 font-normal">/ {payrollRecords.length} Staff</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Direct Bank Transfer (NEFT/IMPS)</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-semibold block">Pending Approval</span>
          <div className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
            {pendingCount} Staff
          </div>
          <span className="text-[11px] text-amber-600 font-medium">Awaiting Finance Clearance</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full md:w-auto scrollbar-none">
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDepartment === dept
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search employee by name, ID..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 shadow-sm"
          />
        </div>
      </div>

      {/* Staff Payroll Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Role & Department</th>
                <th className="py-3.5 px-4">Base Salary</th>
                <th className="py-3.5 px-4">Emergency & Night Allowances</th>
                <th className="py-3.5 px-4">Deductions (TDS+PF)</th>
                <th className="py-3.5 px-4 font-black">Net Pay</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map(rec => (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900 text-sm">{rec.fullName}</div>
                    <span className="font-mono text-slate-400 text-[11px]">{rec.employeeId}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-800">{rec.role}</div>
                    <div className="text-[11px] text-cyan-700">{rec.department}</div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-700">
                    ₹{rec.baseSalary.toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-emerald-700">
                      +₹{(rec.onCallEmergencyBonus + rec.nightShiftAllowance).toLocaleString('en-IN')}
                    </div>
                    <button
                      onClick={() => setBonusModalRecord(rec)}
                      className="text-[10px] text-cyan-600 hover:text-cyan-800 font-bold underline"
                    >
                      Adjust On-Call Bonus
                    </button>
                  </td>
                  <td className="py-4 px-4 text-rose-600 font-medium">
                    -₹{(rec.deductionsTDS + rec.deductionsPF).toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-900 text-sm">
                    ₹{rec.netPayable.toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      rec.paymentStatus === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {rec.paymentStatus}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    {rec.paymentStatus === 'Processing' && (
                      <button
                        onClick={() => markAsPaid(rec.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-sm"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedPayslip(rec)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-[11px]"
                    >
                      Payslip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Digital Payslip Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="text-xs font-black tracking-widest text-cyan-800 uppercase">
                  SOPAN HOSPITAL NEUROLOGY HOSPITAL & INSTITUTE
                </div>
                <div className="text-[11px] text-slate-500">Official Confidential Salary Advice & Remittance Slip</div>
                <div className="text-xs font-bold text-slate-900 mt-1">Pay Period: {selectedPayslip.payPeriod}</div>
              </div>
              <button
                onClick={() => setSelectedPayslip(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Employee info */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Staff Name</span>
                <span className="font-bold text-slate-900 text-sm">{selectedPayslip.fullName}</span>
                <span className="text-slate-500 block text-[11px] font-mono">{selectedPayslip.employeeId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Designation</span>
                <span className="font-bold text-slate-900">{selectedPayslip.role}</span>
                <span className="text-cyan-700 block text-[11px]">{selectedPayslip.department}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Disbursement Account</span>
                <span className="font-mono font-semibold text-slate-800">{selectedPayslip.bankAccountMasked}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Payment Status</span>
                <span className="font-semibold text-emerald-700">{selectedPayslip.paymentStatus} {selectedPayslip.paidOn && `on ${selectedPayslip.paidOn}`}</span>
              </div>
            </div>

            {/* Earnings and Deductions breakdown */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              {/* Earnings */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 uppercase text-[11px] block border-b pb-1">Gross Earnings</span>
                <div className="flex justify-between text-slate-600">
                  <span>Basic Salary:</span>
                  <span className="font-semibold text-slate-800">₹{selectedPayslip.baseSalary.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>On-Call Emergency Allowance:</span>
                  <span className="font-semibold text-slate-800">₹{selectedPayslip.onCallEmergencyBonus.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Night Shift Allowance:</span>
                  <span className="font-semibold text-slate-800">₹{selectedPayslip.nightShiftAllowance.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Deductions */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 uppercase text-[11px] block border-b pb-1">Statutory Deductions</span>
                <div className="flex justify-between text-slate-600">
                  <span>Tax Deducted at Source (TDS):</span>
                  <span className="font-semibold text-rose-600">₹{selectedPayslip.deductionsTDS.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Provident Fund (PF):</span>
                  <span className="font-semibold text-rose-600">₹{selectedPayslip.deductionsPF.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Total net payable */}
            <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-cyan-900 block">NET SALARY CREDITED</span>
                <span className="text-[11px] text-cyan-700">Authorised by Sopan Finance & HR Directorate</span>
              </div>
              <span className="text-xl font-black text-cyan-950">
                ₹{selectedPayslip.netPayable.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">DIGITAL WATERMARK: VERIFIED-PAYROLL-SOPAN</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Payslip
                </button>
                <button
                  onClick={() => setSelectedPayslip(null)}
                  className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Adjust On-Call Emergency Bonus Modal */}
      {bonusModalRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Adjust On-Call Neuro Allowance</h3>
              <button onClick={() => setBonusModalRecord(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyBonus} className="space-y-4 text-xs">
              <p className="text-slate-600">
                Add emergency Cath-Lab or stroke intervention on-call allowance for <strong>{bonusModalRecord.fullName}</strong>.
              </p>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Additional Allowance Amount (₹)</label>
                <input
                  type="number"
                  min={1000}
                  step={1000}
                  value={additionalBonus}
                  onChange={e => setAdditionalBonus(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBonusModalRecord(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
                >
                  Update & Recalculate Net
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
