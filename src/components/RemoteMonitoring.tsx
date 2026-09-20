import React, { useState } from 'react';
import { 
  Send, 
  Paperclip, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Mic, 
  Play, 
  CheckCheck, 
  Clock, 
  User, 
  Stethoscope, 
  PhoneCall, 
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { SecureMessage, PatientVitalsLog } from '../types';
import { INITIAL_MESSAGES, INITIAL_VITALS_LOGS, INITIAL_PATIENT } from '../data/mockData';

export const RemoteMonitoring: React.FC = () => {
  const [messages, setMessages] = useState<SecureMessage[]>(INITIAL_MESSAGES);
  const [vitals] = useState<PatientVitalsLog[]>(INITIAL_VITALS_LOGS);
  const [inputText, setInputText] = useState<string>('');
  const [senderRole, setSenderRole] = useState<'Patient' | 'Caregiver' | 'Neurologist'>('Patient');
  const [isUrgentFlag, setIsUrgentFlag] = useState<boolean>(false);
  const [audioPlayingId, setAudioPlayingId] = useState<string | null>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const senderName = 
      senderRole === 'Patient' ? 'Rajesh Kulkarni (Patient)' :
      senderRole === 'Caregiver' ? 'Sunita Kulkarni (Caregiver)' :
      'Dr. Sanjay Sopan Varade (MD, DM Neuro)';

    const newMsg: SecureMessage = {
      id: `msg-${Date.now()}`,
      senderId: senderRole === 'Neurologist' ? 'doc-sanjay-varade' : 'pat-101',
      senderName,
      senderRole,
      timestamp: 'Just now',
      text: inputText.trim(),
      isUrgent: isUrgentFlag
    };

    setMessages([...messages, newMsg]);
    setInputText('');
    setIsUrgentFlag(false);
  };

  const quickReplies = [
    'Blood pressure logged within normal parameters',
    'Mild dizziness experienced after standing',
    'Morning dosage taken on schedule',
    'Prescription refill required for Citicoline'
  ];

  return (
    <div className="space-y-6">
      {/* RPM Telemetry Triage Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-cyan-950 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2 border border-cyan-500/30">
            <Activity className="w-3.5 h-3.5" />
            Active Remote Patient Monitoring (RPM) Node
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Secure Neurological Telemetry & Remote Care Channel
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            256-bit encrypted communication hub connecting patient <strong className="text-white">{INITIAL_PATIENT.fullName}</strong> directly with Dr. Sanjay Sopan Varade (MD, DM Neuro) and the Sopan Hospital acute care team in Nashik.
          </p>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-700 text-xs shrink-0 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <div>
            <div className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Triage Status: STABLE
            </div>
            <div className="text-[11px] text-slate-400">Response SLA: &lt; 15 mins for Urgent flags</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Messaging (8 col) & Telemetry Card (4 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Chat Conversation Stream */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[640px] overflow-hidden">
          {/* Chat Header */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-sm">
                SV
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-slate-900">Dr. Sanjay Sopan Varade & Care Team</h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="text-xs text-slate-500">Chief Consultant Neurologist (MD, DM Neuro) • Nashik</div>
              </div>
            </div>

            {/* Sender Switcher for Demo / Family */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-400 px-1.5 text-[11px]">Chatting as:</span>
              <select
                value={senderRole}
                onChange={e => setSenderRole(e.target.value as any)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="Patient">Patient (Rajesh)</option>
                <option value="Caregiver">Caregiver (Sunita)</option>
                <option value="Neurologist">Neurologist (Dr. Sanjay Varade)</option>
              </select>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40">
            {messages.map(msg => {
              const isDoctor = msg.senderRole === 'Neurologist' || msg.senderRole === 'Neuro-Nurse';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isDoctor ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-600">{msg.senderName}</span>
                    <span>• {msg.timestamp}</span>
                    {msg.isUrgent && (
                      <span className="bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded text-[10px] flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" /> Urgent Triage
                      </span>
                    )}
                  </div>

                  <div
                    className={`max-w-lg p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      isDoctor
                        ? 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                        : 'bg-cyan-600 text-white rounded-tr-none shadow-cyan-900/20'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* Simulated Voice note player if needed */}
                    {msg.id === 'msg-2' && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2 bg-slate-50 p-2 rounded-xl text-slate-800">
                        <button
                          onClick={() => setAudioPlayingId(audioPlayingId === msg.id ? null : msg.id)}
                          className="w-7 h-7 rounded-full bg-cyan-600 text-white flex items-center justify-center shrink-0"
                        >
                          <Play className="w-3.5 h-3.5 ml-0.5" />
                        </button>
                        <div className="flex-1">
                          <div className="text-[10px] font-bold text-slate-700">
                            Dr. Sanjay Varade Voice Consultation Note (0:42)
                          </div>
                          <div className="w-full bg-slate-200 h-1 rounded-full mt-1 overflow-hidden">
                            <div className={`h-full bg-cyan-600 ${audioPlayingId === msg.id ? 'w-2/3 animate-pulse' : 'w-0'}`} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick reply bar */}
          <div className="px-6 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[10px] text-slate-400 uppercase font-semibold shrink-0">Quick Tags:</span>
            {quickReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => setInputText(reply)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium whitespace-nowrap transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Message Input Footer */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsUrgentFlag(!isUrgentFlag)}
              className={`p-2.5 rounded-xl border transition-all ${
                isUrgentFlag
                  ? 'bg-rose-50 border-rose-500 text-rose-600 ring-2 ring-rose-500/20'
                  : 'border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title="Toggle Urgent Clinical Alert"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={isUrgentFlag ? "FLAGGED URGENT: Type clinical update..." : "Type secure encrypted message to neurology team..."}
              className={`flex-1 px-4 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                isUrgentFlag ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-cyan-500'
              }`}
            />

            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Right Column: Live Remote Telemetry & On-Call Nurse Triage (4 col) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-600" />
                Live Telemetry Digest
              </h4>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Normal Limits
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Last BP Measurement:</span>
                <span className="font-bold text-slate-900">
                  {vitals[0].bloodPressureSys}/{vitals[0].bloodPressureDia} mmHg
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Rest Tremor Index:</span>
                <span className="font-bold text-slate-900">{vitals[0].tremorScore}/10 (Mild)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Seizure Count (24 Hrs):</span>
                <span className="font-bold text-emerald-600">0 (Controlled)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Functional Mobility:</span>
                <span className="font-bold text-slate-900">{vitals[0].mobilityScore}/10 (Good)</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
              <span className="font-semibold block">Protocol Recommendation:</span>
              <p className="text-[11px] leading-relaxed text-blue-800">
                Continue blood pressure measurement twice daily. Maintain daily 30-minute gait training as instructed by neuro-physiotherapy.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-sm space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4" />
              On-Call Neuro ICU Desk
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Sister Maria & Dr. Sanjay Varade are monitoring this encrypted channel. If acute neurological deficits (FAST symptoms) occur, call directly.
            </p>

            <a
              href="tel:02532317364"
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Stroke Hotline: 0253 2317364
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
