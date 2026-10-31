import React from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Download, 
  Printer, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Check, 
  FileText,
  ShieldCheck,
  Building
} from 'lucide-react';
import { Appointment } from '../types';
import { SopanLogo } from './SopanLogo';
import { generateTokenSlipPdf } from '../utils/pdfGenerator';
import { formatFriendlyDate } from '../utils/opdSlotUtils';

interface AppointmentSlipModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onAcceptAppointment?: (apt: Appointment) => void;
}

export const AppointmentSlipModal: React.FC<AppointmentSlipModalProps> = ({
  appointment,
  isOpen,
  onClose,
  isAdmin = false,
  onAcceptAppointment
}) => {
  if (!isOpen || !appointment) return null;

  const statusLower = (appointment.status || '').toLowerCase().trim();
  const isConfirmed = statusLower === 'confirmed' || statusLower === 'completed';
  const isCancelled = statusLower === 'cancelled' || statusLower === 'rejected';
  const isPending = !isConfirmed && !isCancelled;

  const handleDownloadPdf = () => {
    generateTokenSlipPdf(appointment);
  };

  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100000] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-xs sm:text-sm">
              {isConfirmed ? 'Hospital Confirmed Token Slip' : isPending ? 'Appointment Booking Acknowledgement' : 'Cancelled Appointment Details'}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              Ref: {appointment.id}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close view"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-5 max-h-[82vh] overflow-y-auto text-slate-800">
          
          {/* ==================================================== */}
          {/* CASE 1: PENDING STATUS (AWAITING HOSPITAL CONFIRMATION) */}
          {/* ==================================================== */}
          {isPending && (
            <div className="space-y-4">
              {/* Prominent Pending Notification Banner */}
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                      Status: PENDING
                    </span>
                    <span className="text-xs text-amber-800 font-semibold">• Verification Underway</span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-amber-950 leading-snug">
                    "Your appointment has been received and is awaiting confirmation from the hospital."
                  </p>
                  <p className="text-xs text-amber-800 leading-relaxed mt-1">
                    Our outpatient clinical desk will review your slot request and issue the final confirmed token pass shortly. You can track this in real-time in your Patient Portal.
                  </p>
                </div>
              </div>

              {/* Patient & Booking Schedule Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3.5 text-xs">
                <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                  <span className="font-bold text-slate-700 uppercase tracking-wide text-[11px]">
                    Booking Details Submitted
                  </span>
                  <span className="font-mono text-slate-500 font-bold">
                    Assigned Token: {appointment.tokenNumber || 'Assigned on Booking'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Patient Name</span>
                    <span className="font-bold text-slate-900 text-sm">{appointment.patientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Age & Gender</span>
                    <span className="font-bold text-slate-800">{appointment.patientAge} Years • {appointment.patientGender}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Mobile Phone</span>
                    <span className="font-bold text-slate-800">{appointment.patientPhone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Consulting Neurologist</span>
                    <span className="font-bold text-slate-900">{appointment.doctorName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Appointment Date</span>
                    <span className="font-bold text-slate-900">{formatFriendlyDate(appointment.date)} ({appointment.date})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Requested Time Slot</span>
                    <span className="font-bold text-slate-900">{appointment.timeSlot}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Department</span>
                    <span className="font-semibold text-slate-700">{appointment.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Queue Slot Allocation</span>
                    <span className="font-bold text-[#8E5B3E]">Slot #{appointment.slotNumber || 1} of 50</span>
                  </div>
                </div>

                {appointment.symptoms && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase">Reported Symptoms</span>
                    <span className="text-slate-700 font-medium">{appointment.symptoms}</span>
                  </div>
                )}
              </div>

              {/* Note: NO false confirmed slip, NO download button */}
              <div className="p-3 bg-slate-100 rounded-xl text-slate-600 text-[11px] flex items-center gap-2 border border-slate-200">
                <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
                <span>The final Confirmed Token Slip and Download PDF button become available immediately once the hospital administration confirms this appointment.</span>
              </div>

              {/* Admin-only direct confirmation action */}
              {isAdmin && onAcceptAppointment && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-xs text-emerald-900 block">Administrator Action</span>
                    <span className="text-[11px] text-emerald-700">Approve this booking now to generate the confirmed token slip for the patient.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onAcceptAppointment(appointment);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer w-full sm:w-auto justify-center"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept & Confirm Appointment</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* CASE 2: CONFIRMED STATUS (COMPLETE FORMAL TOKEN SLIP) */}
          {/* ==================================================== */}
          {isConfirmed && (
            <div className="space-y-5">
              {/* Formal Printable / Downloadable Slip Card */}
              <div 
                id="hospital-token-slip-container" 
                className="border-2 border-[#8E5B3E]/30 rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-[#FAF7F2] to-white shadow-md relative"
              >
                {/* Hospital Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#E6E0D4] pb-4 mb-4 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-2xl bg-white border border-[#E6E0D4] shrink-0 shadow-2xs">
                      <SopanLogo size="sm" />
                    </div>
                    <div>
                      <div className="text-xs font-black tracking-wider text-[#0B3C95] uppercase">
                        SOPAN HOSPITAL & NEUROLOGY INSTITUTE
                      </div>
                      <div className="text-[10px] text-[#7A5338] font-bold">
                        NABH Accredited Super-Speciality Neuroscience Center
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Shrihari Kute Marg, Near Sandip Hotel, Mumbai Naka, Nashik - 422001
                      </div>
                    </div>
                  </div>

                  {/* Token & Confirmed Status Stamp */}
                  <div className="text-left sm:text-right shrink-0">
                    <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Status: CONFIRMED</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-serif font-black text-[#0B3C95] mt-1 tracking-tight">
                      TOKEN: {appointment.tokenNumber}
                    </div>
                  </div>
                </div>

                {/* Patient & Doctor Demographics */}
                <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Patient Name</span>
                    <span className="font-bold text-slate-900 text-sm sm:text-base">{appointment.patientName}</span>
                    <span className="text-slate-600 block text-xs mt-0.5">
                      {appointment.patientAge} Yrs • {appointment.patientGender}
                    </span>
                    <span className="text-slate-500 block text-[11px] font-mono mt-0.5">
                      Phone: {appointment.patientPhone}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Consulting Neurologist</span>
                    <span className="font-bold text-slate-900 text-sm sm:text-base">{appointment.doctorName}</span>
                    <span className="text-[#8E5B3E] block text-xs font-semibold mt-0.5">
                      {appointment.department}
                    </span>
                    <span className="text-slate-500 block text-[11px] mt-0.5">
                      Chief Consultant: Dr. Sanjay Sopan Varade
                    </span>
                  </div>
                </div>

                {/* Queue & Schedule Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-3.5 rounded-2xl border border-[#E6E0D4] text-xs mb-4 shadow-2xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Appointment Date</span>
                    <span className="font-bold text-slate-900">{formatFriendlyDate(appointment.date)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Allocated Time</span>
                    <span className="font-bold text-slate-900">{appointment.timeSlot}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Daily OPD Queue</span>
                    <span className="font-bold text-[#8E5B3E]">Slot #{appointment.slotNumber || 1} of 50</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Visit Type</span>
                    <span className="font-semibold text-slate-800">{appointment.visitType || 'In-Person Hospital OPD'}</span>
                  </div>
                </div>

                {appointment.symptoms && (
                  <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100 mb-4">
                    <span className="font-bold text-slate-800">Primary Reason / Symptoms:</span> {appointment.symptoms}
                  </div>
                )}

                {/* Instructions */}
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E6E0D4] text-[11px] text-[#5C554B] space-y-1">
                  <div className="font-bold text-[#27231E]">Hospital Guidelines:</div>
                  <p>• Please report 15 minutes before your allocated time slot.</p>
                  <p>• Bring previous prescriptions, MRI / CT brain scans, and EEG recordings.</p>
                  <p>• 24/7 Acute Stroke Hotline: 0253 2317364 | WhatsApp: 9405545521</p>
                </div>

                {/* Digital Barcode representation */}
                <div className="flex flex-col items-center justify-center pt-4">
                  <div className="font-mono text-lg tracking-[0.3em] text-slate-700 select-none">
                    ||| | |||| || | ||| |||| | || | |||
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                    REF: {appointment.id.toUpperCase()} • VALID WITH CLINIC ID
                  </span>
                </div>
              </div>

              {/* Action Buttons: Download PDF & Print */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Slip</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Ticket PDF</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* CASE 3: CANCELLED / REJECTED STATUS */}
          {/* ==================================================== */}
          {isCancelled && (
            <div className="space-y-4">
              <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-wider bg-rose-200 text-rose-900 px-2 py-0.5 rounded-md">
                    Status: CANCELLED / REJECTED
                  </span>
                  <h4 className="font-bold text-rose-950 text-sm">This booking request was cancelled.</h4>
                  {appointment.rejectionReason && (
                    <p className="text-xs text-rose-800 mt-1">
                      <strong>Reason:</strong> {appointment.rejectionReason}
                    </p>
                  )}
                  <p className="text-xs text-slate-600 mt-1">
                    For reschedule assistance, contact the OPD desk at 0253 2317364 or book a new appointment.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Sopan Hospital & Neurology Institute • Mumbai Naka, Nashik</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
