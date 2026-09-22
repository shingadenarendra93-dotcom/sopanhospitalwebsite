import React, { useState } from 'react';
import { 
  Bell, 
  Check, 
  MessageCircle, 
  Mail, 
  Calendar as CalendarIcon, 
  Clock, 
  ShieldCheck, 
  Send, 
  Download, 
  ExternalLink, 
  X, 
  Sparkles,
  AlertCircle,
  Smartphone
} from 'lucide-react';
import { Appointment, ReminderSettings } from '../types';
import { formatAppointmentReminderMessage, downloadIcsFile } from '../utils/calendarUtils';

interface AppointmentReminderModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveReminder: (appointmentId: string, updatedSettings: ReminderSettings) => void;
}

export const AppointmentReminderModal: React.FC<AppointmentReminderModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onSaveReminder
}) => {
  if (!isOpen || !appointment) return null;

  const currentSettings = appointment.reminderSettings || {
    whatsapp: true,
    email: Boolean(appointment.patientEmail),
    leadTimeHours: 24,
    whatsappNumber: appointment.patientPhone,
    emailAddress: appointment.patientEmail,
    status: 'Scheduled',
    scheduledTimeText: '24 Hours Prior'
  };

  const [whatsappEnabled, setWhatsappEnabled] = useState<boolean>(currentSettings.whatsapp);
  const [emailEnabled, setEmailEnabled] = useState<boolean>(currentSettings.email);
  const [whatsappNumber, setWhatsappNumber] = useState<string>(currentSettings.whatsappNumber || appointment.patientPhone);
  const [emailAddress, setEmailAddress] = useState<string>(currentSettings.emailAddress || appointment.patientEmail);
  const [leadTimeHours, setLeadTimeHours] = useState<24 | 48 | 2 | 1>(currentSettings.leadTimeHours || 24);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(null);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);

  const previewMessage = formatAppointmentReminderMessage(appointment, leadTimeHours);

  const getLeadTimeDescription = (hours: number): string => {
    switch (hours) {
      case 48:
        return '48 Hours Prior (Advance 2-day reminder for MRI/CT file preparation)';
      case 24:
        return '24 Hours Prior (Standard clinical reminder with token number & reporting time)';
      case 2:
        return '2 Hours Prior (Departure alert with hospital GPS navigation link)';
      case 1:
        return 'Morning of Appointment (8:00 AM on OPD day)';
      default:
        return `${hours} Hours Prior`;
    }
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const scheduledTimeText = getLeadTimeDescription(leadTimeHours);

    const updated: ReminderSettings = {
      whatsapp: whatsappEnabled,
      email: emailEnabled,
      leadTimeHours,
      whatsappNumber: whatsappNumber.trim() || appointment.patientPhone,
      emailAddress: emailAddress.trim() || appointment.patientEmail,
      status: (whatsappEnabled || emailEnabled) ? 'Active' : 'Scheduled',
      scheduledTimeText,
      confirmedAt: new Date().toISOString().split('T')[0]
    };

    onSaveReminder(appointment.id, updated);
    setFeedbackMessage({
      type: 'success',
      text: `Remind Me preferences updated! You will receive automated alerts via ${
        [whatsappEnabled ? 'WhatsApp' : '', emailEnabled ? 'Email' : ''].filter(Boolean).join(' & ') || 'no channels (disabled)'
      }.`
    });

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleSendWhatsAppNow = () => {
    setIsSendingTest(true);
    const cleanNumber = (whatsappNumber || appointment.patientPhone).replace(/[^\d]/g, '');
    const encodedText = encodeURIComponent(previewMessage);
    const whatsappUrl = cleanNumber.length >= 10
      ? `https://wa.me/${cleanNumber.length === 10 ? '91' + cleanNumber : cleanNumber}?text=${encodedText}`
      : `https://wa.me/919422011223?text=${encodedText}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    // Update appointment state to show sent
    const updated: ReminderSettings = {
      whatsapp: true,
      email: emailEnabled,
      leadTimeHours,
      whatsappNumber,
      emailAddress,
      status: 'Sent',
      scheduledTimeText: 'Instant Notification Dispatched via WhatsApp',
      lastDispatchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    onSaveReminder(appointment.id, updated);

    setFeedbackMessage({
      type: 'success',
      text: 'Opening WhatsApp with pre-composed appointment reminder & token slip!'
    });
    setIsSendingTest(false);
  };

  const handleSendEmailNow = () => {
    const targetEmail = emailAddress || appointment.patientEmail || 'patient@example.com';
    const subject = encodeURIComponent(`Appointment Reminder: ${appointment.doctorName} (Token: ${appointment.tokenNumber})`);
    const body = encodeURIComponent(previewMessage);
    const mailtoUrl = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;

    setFeedbackMessage({
      type: 'success',
      text: `Drafted reminder email for ${targetEmail} in your email client!`
    });
  };

  const handleDownloadCalendar = () => {
    downloadIcsFile(appointment);
    setFeedbackMessage({
      type: 'info',
      text: 'Downloaded .ics calendar reminder. Open to add alerts to Apple, Google, or Outlook Calendar!'
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto border border-[#E6E0D4] shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#EAE3D6] flex items-start justify-between bg-[#FAF7F2] rounded-t-3xl">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#8E5B3E]/10 border border-[#8E5B3E]/20 text-[#8E5B3E] flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#8E5B3E]/10 text-[#8E5B3E] text-[10px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3" />
                Automated Remind Me
              </div>
              <h3 className="font-serif font-bold text-lg text-[#27231E]">
                Appointment Reminders
              </h3>
              <p className="text-xs text-[#6E675D] mt-0.5">
                Token <span className="font-mono font-bold text-[#27231E]">{appointment.tokenNumber}</span> • {appointment.patientName} • {appointment.date} at {appointment.timeSlot}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#EFE9DF] text-[#8C8478] hover:text-[#27231E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Feedback message banner */}
          {feedbackMessage && (
            <div className={`p-3.5 rounded-2xl text-xs font-medium border flex items-start gap-2.5 ${
              feedbackMessage.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}>
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>{feedbackMessage.text}</div>
            </div>
          )}

          {/* Quick Doctor Summary Card */}
          <div className="bg-[#FAF7F2] border border-[#EAE3D6] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="text-[10px] uppercase font-bold text-[#8C8478]">Specialist & Venue</div>
              <div className="font-serif font-bold text-sm text-[#27231E]">{appointment.doctorName}</div>
              <div className="text-[#6E675D]">{appointment.department} • {appointment.visitType}</div>
            </div>
            <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-[#EAE3D6] w-full sm:w-auto">
              <div className="text-[10px] uppercase font-bold text-[#8C8478]">Reporting Schedule</div>
              <div className="font-bold text-[#8E5B3E]">{appointment.date} • {appointment.timeSlot}</div>
              <div className="text-[11px] text-[#6E675D]">Report 15 mins prior</div>
            </div>
          </div>

          {/* Channel Opt-Ins */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A7265] flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-[#8E5B3E]" />
              Select Notification Channels
            </h4>

            {/* WhatsApp Option */}
            <div className={`p-4 rounded-2xl border transition-all ${
              whatsappEnabled 
                ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400/20' 
                : 'bg-white border-[#E6E0D4] hover:bg-[#FAF7F2]'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <label className="flex items-start gap-3 cursor-pointer select-none flex-1">
                  <input
                    type="checkbox"
                    checked={whatsappEnabled}
                    onChange={e => setWhatsappEnabled(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-emerald-600 text-white">
                        <MessageCircle className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-sm font-bold text-[#27231E]">
                        Automated WhatsApp Reminder & Token Pass
                      </span>
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-[#6E675D] mt-1">
                      Receive instant appointment confirmation, token slip, and reminder with directions to Mumbai Naka.
                    </p>
                  </div>
                </label>
              </div>

              {whatsappEnabled && (
                <div className="mt-3.5 pt-3 border-t border-emerald-200/60 flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-[#27231E] mb-1">
                      WhatsApp Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={e => setWhatsappNumber(e.target.value)}
                      placeholder="+91 98234 56789"
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs text-[#27231E] focus:ring-2 focus:ring-emerald-500 outline-hidden font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendWhatsAppNow}
                    disabled={isSendingTest}
                    className="self-end px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    Send Test Now
                  </button>
                </div>
              )}
            </div>

            {/* Email Option */}
            <div className={`p-4 rounded-2xl border transition-all ${
              emailEnabled 
                ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-400/20' 
                : 'bg-white border-[#E6E0D4] hover:bg-[#FAF7F2]'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <label className="flex items-start gap-3 cursor-pointer select-none flex-1">
                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={e => setEmailEnabled(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-gray-300"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-amber-600 text-white">
                        <Mail className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-sm font-bold text-[#27231E]">
                        Email Calendar Invite & Clinical Instructions
                      </span>
                    </div>
                    <p className="text-xs text-[#6E675D] mt-1">
                      Includes appointment details, pre-consultation EEG/MRI checklist, and calendar attachment.
                    </p>
                  </div>
                </label>
              </div>

              {emailEnabled && (
                <div className="mt-3.5 pt-3 border-t border-amber-200/60 flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-[#27231E] mb-1">
                      Patient Email Address
                    </label>
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={e => setEmailAddress(e.target.value)}
                      placeholder="patient@example.com"
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-[#27231E] focus:ring-2 focus:ring-amber-500 outline-hidden"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendEmailNow}
                    className="self-end px-3 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Mail className="w-3 h-3" />
                    Send Email Test
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Reminder Schedule / Lead Time */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A7265] mb-2.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#8E5B3E]" />
              Notification Schedule (When to remind you)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { hours: 24 as const, label: '24 Hours Before', sub: 'Standard hospital clinical notification' },
                { hours: 48 as const, label: '48 Hours Before', sub: 'Advance notice for long-distance travel' },
                { hours: 2 as const, label: '2 Hours Before', sub: 'Departure alert & token live tracking' },
                { hours: 1 as const, label: 'Morning of Visit', sub: 'Prompt alert at 8:00 AM on OPD day' }
              ].map(opt => (
                <button
                  key={opt.hours}
                  type="button"
                  onClick={() => setLeadTimeHours(opt.hours)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    leadTimeHours === opt.hours
                      ? 'bg-[#FAF2EB] border-[#8E5B3E] ring-2 ring-[#8E5B3E]/20 text-[#27231E]'
                      : 'bg-white border-[#E6E0D4] hover:bg-[#FAF7F2] text-[#6E675D]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#27231E]">{opt.label}</span>
                    {leadTimeHours === opt.hours && (
                      <Check className="w-3.5 h-3.5 text-[#8E5B3E]" />
                    )}
                  </div>
                  <div className="text-[11px] text-[#8A8173] mt-0.5">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Content Preview Toggle */}
          <div className="border border-[#EAE3D6] rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="w-full px-4 py-3 bg-[#FAF7F2] hover:bg-[#F5F0E6] flex items-center justify-between text-xs font-semibold text-[#27231E] transition-colors"
            >
              <span className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#8E5B3E]" />
                View Formatted Reminder Text Preview
              </span>
              <span className="text-[11px] text-[#8E5B3E]">
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </span>
            </button>
            {showPreview && (
              <div className="p-4 bg-white border-t border-[#EAE3D6] font-mono text-[11px] text-[#3B352D] whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto">
                {previewMessage}
              </div>
            )}
          </div>

          {/* Calendar export option */}
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CalendarIcon className="w-4 h-4 text-[#8E5B3E] shrink-0" />
              <div>
                <div className="text-xs font-bold text-[#27231E]">Add to Device Calendar</div>
                <div className="text-[11px] text-[#6E675D]">Export .ics file for Google, Apple, or Outlook Calendar</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadCalendar}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#EFE9DF] border border-[#D8CFC2] text-xs font-semibold text-[#27231E] flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-[#8E5B3E]" />
              Download .ics
            </button>
          </div>

          {/* Privacy & Guarantee Note */}
          <div className="flex items-center gap-2 text-[11px] text-[#8A8173] pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>DISHA / Clinical Privacy Compliant: Reminders are solely used for verified patient scheduling.</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 border-t border-[#EAE3D6] bg-[#FAF7F2] rounded-b-3xl flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6E675D] hover:text-[#27231E] hover:bg-[#EFE9DF] transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave()}
              className="px-5 py-2.5 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Save Remind Me Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
