import React, { useState } from 'react';
import { 
  User, 
  FileText, 
  Pill, 
  Activity, 
  HeartHandshake, 
  Download, 
  Printer, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight, 
  Calendar, 
  Clock, 
  Shield, 
  Eye, 
  Phone, 
  Layers, 
  X
} from 'lucide-react';
import { 
  PatientProfile, 
  DiagnosticReport, 
  Prescription, 
  PatientVitalsLog 
} from '../types';
import { 
  INITIAL_PATIENT, 
  INITIAL_REPORTS, 
  INITIAL_PRESCRIPTIONS, 
  INITIAL_VITALS_LOGS 
} from '../data/mockData';

export const PatientPortal: React.FC = () => {
  const [patient] = useState<PatientProfile>(INITIAL_PATIENT);
  const [reports] = useState<DiagnosticReport[]>(INITIAL_REPORTS);
  const [prescriptions] = useState<Prescription[]>(INITIAL_PRESCRIPTIONS);
  const [vitalsLogs, setVitalsLogs] = useState<PatientVitalsLog[]>(INITIAL_VITALS_LOGS);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'prescriptions' | 'telemetry'>('overview');
  const [caregiverView, setCaregiverView] = useState<boolean>(false);
  const [selectedReportModal, setSelectedReportModal] = useState<DiagnosticReport | null>(null);

  // Quick log new vitals
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [newBPSys, setNewBPSys] = useState<number>(120);
  const [newBPDia, setNewBPDia] = useState<number>(80);
  const [newPulse, setNewPulse] = useState<number>(72);
  const [newTremor, setNewTremor] = useState<number>(1);
  const [newSeizures, setNewSeizures] = useState<number>(0);
  const [newMobility, setNewMobility] = useState<number>(8);
  const [newNotes, setNewNotes] = useState<string>('');

  const handleAddVitals = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: PatientVitalsLog = {
      id: `vit-${Date.now()}`,
      patientId: patient.id,
      date: 'Just Now',
      bloodPressureSys: Number(newBPSys),
      bloodPressureDia: Number(newBPDia),
      pulseRate: Number(newPulse),
      tremorScore: Number(newTremor),
      seizureCountToday: Number(newSeizures),
      mobilityScore: Number(newMobility),
      cognitiveNotes: newNotes || 'Routine morning self-check completed.',
      triageStatus: newBPSys > 150 || newSeizures > 0 ? 'Immediate Alert' : newBPSys > 135 ? 'Guarded' : 'Stable'
    };

    setVitalsLogs([newLog, ...vitalsLogs]);
    setShowLogModal(false);
    setNewNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Patient Identification Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-2xl shrink-0 shadow-lg shadow-cyan-950">
              {patient.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{patient.fullName}</h2>
                <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-cyan-500/30">
                  {patient.uhid}
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-medium border border-emerald-500/30 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Active Portal
                </span>
              </div>

              <div className="text-xs text-slate-300 flex flex-wrap items-center gap-y-1 gap-x-4">
                <span>Age: <strong className="text-white">{patient.age} Yrs</strong> ({patient.gender})</span>
                <span>Blood Group: <strong className="text-white">{patient.bloodGroup}</strong></span>
                <span>Primary Neurologist: <strong className="text-cyan-300">{patient.attendingDoctor}</strong></span>
              </div>

              <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Diagnosis: <strong className="text-slate-200">{patient.primaryDiagnosis}</strong></span>
              </div>
            </div>
          </div>

          {/* Caregiver mode switcher & emergency hotlink */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            <button
              id="btn-toggle-caregiver-view"
              onClick={() => setCaregiverView(!caregiverView)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 ${
                caregiverView
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-950/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-amber-400" />
              {caregiverView ? 'Caregiver Mode Active (Sunita K.)' : 'Switch to Caregiver View'}
            </button>

            <button
              onClick={() => setShowLogModal(true)}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-900 transition-all flex items-center gap-1.5"
            >
              <Activity className="w-4 h-4" />
              Log Daily Vitals
            </button>
          </div>
        </div>

        {/* Caregiver Assistance Banner if active */}
        {caregiverView && (
          <div className="mt-5 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Viewing as designated Caregiver: <strong>Sunita Kulkarni (Spouse)</strong>. Emergency notifications routed to <strong>{patient.emergencyContact}</strong>.
              </span>
            </div>
            <span className="text-[11px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-300 font-mono">
              Caregiver Token Verified
            </span>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          id="tab-portal-overview"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Clinical Dashboard
        </button>

        <button
          id="tab-portal-reports"
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Neuro-Imaging & Reports ({reports.length})
        </button>

        <button
          id="tab-portal-prescriptions"
          onClick={() => setActiveTab('prescriptions')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'prescriptions'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Pill className="w-3.5 h-3.5" />
          Active Prescriptions ({prescriptions.length})
        </button>

        <button
          id="tab-portal-telemetry"
          onClick={() => setActiveTab('telemetry')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'telemetry'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Vitals & Seizure Telemetry
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Vitals Summary (2 col) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-600" />
                  <h3 className="font-bold text-sm text-slate-900">Latest Recovery & Telemetry Metrics</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">Logged: {vitalsLogs[0].date}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Blood Pressure</span>
                  <div className="text-lg font-bold text-slate-900">
                    {vitalsLogs[0].bloodPressureSys}/{vitalsLogs[0].bloodPressureDia}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium">Target: &lt;130/80</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Heart / Pulse</span>
                  <div className="text-lg font-bold text-slate-900">
                    {vitalsLogs[0].pulseRate} <span className="text-xs font-normal text-slate-500">bpm</span>
                  </div>
                  <span className="text-[11px] text-cyan-600 font-medium">Regular Sinus</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Tremor Score</span>
                  <div className="text-lg font-bold text-slate-900">
                    {vitalsLogs[0].tremorScore} <span className="text-xs font-normal text-slate-500">/ 10</span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium">Minimal tremor</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Seizure Count</span>
                  <div className="text-lg font-bold text-slate-900">
                    {vitalsLogs[0].seizureCountToday}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium">Seizure Free 28d</span>
                </div>
              </div>

              <div className="p-3 bg-cyan-50/50 rounded-xl border border-cyan-100 text-xs text-cyan-950 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold">Physician Observation:</span> {vitalsLogs[0].cognitiveNotes}
                </div>
              </div>
            </div>

            {/* Quick Diagnostic Reports Preview */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-sm text-slate-900">Verified Neuro-Radiology Scans</h3>
                </div>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1"
                >
                  View All ({reports.length})
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {reports.slice(0, 2).map(rep => (
                  <div key={rep.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{rep.testName}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                          {rep.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{rep.impression}</p>
                      <span className="text-[11px] text-slate-400 font-mono mt-1 block">{rep.date} • Ref: {rep.referringDoctor}</span>
                    </div>

                    <button
                      onClick={() => setSelectedReportModal(rep)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold shrink-0 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-purple-600" />
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Emergency Contacts & Hospital Desk (1 col) */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-600" />
                Emergency Contact & Caregiver
              </h3>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-2">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">Primary Caregiver</span>
                  <span className="font-bold text-slate-900 text-sm">{patient.caregiverName}</span>
                  <span className="text-slate-500 block text-[11px]">{patient.emergencyRelation}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">Caregiver Phone</span>
                  <span className="font-mono text-slate-800 font-semibold">{patient.caregiverPhone}</span>
                </div>
              </div>

              <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-100 text-xs space-y-2">
                <div className="flex items-center gap-1.5 text-rose-800 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Known Allergies
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {patient.allergies.map(al => (
                    <span key={al} className="bg-white text-rose-800 border border-rose-200 px-2 py-0.5 rounded text-[11px] font-medium">
                      {al}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="text-[11px] text-slate-500 mb-2">
                  24/7 Stroke & Neuro-Emergency Hotline (Nashik)
                </div>
                <a
                  href="tel:02532317364"
                  className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Stroke Hotline: 0253 2317364
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Diagnostic Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Hospital Neuro-Imaging & Laboratory Reports</h3>
            <span className="text-xs text-slate-500 font-mono">Digitally Signed by Chief Radiologists</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map(rep => (
              <div key={rep.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-md uppercase">
                      {rep.modality}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 mt-1">{rep.testName}</h4>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {rep.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Impression:</span> {rep.impression}
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                  <span className="font-semibold text-slate-700 text-[11px] block">Key Findings:</span>
                  <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                    {rep.findings.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">Date: {rep.date}</span>
                  <button
                    onClick={() => setSelectedReportModal(rep)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Open Diagnostic Slip
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Prescriptions */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Active Neuro-Pharmacology Regimen</h3>
            <span className="text-xs text-slate-500">Automatic Hospital Pharmacy Refill Enabled</span>
          </div>

          {prescriptions.map(rx => (
            <div key={rx.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{rx.diagnosis}</h4>
                  <span className="text-xs text-slate-500">Prescribed by {rx.doctorName} • Date: {rx.date}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-cyan-800 bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-lg">
                    Next Follow-up: {rx.followUpDate}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {rx.medicines.map((med, idx) => (
                  <div key={idx} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shrink-0 mt-0.5">
                        <Pill className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{med.name}</div>
                        <div className="text-[11px] text-slate-600 font-medium">
                          Dosage: {med.dosage} • Frequency: {med.frequency}
                        </div>
                        <div className="text-[11px] text-slate-500 italic mt-0.5">
                          Note: {med.instructions}
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-xs shrink-0">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium text-[11px]">
                        {med.duration}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Carry this prescription during all OPD follow-ups.</span>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Prescription
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Vitals & Seizure Telemetry */}
      {activeTab === 'telemetry' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Daily Telemetry Log & Seizure Diary</h3>
              <p className="text-xs text-slate-500">Transmitted real-time to the Sopan Neuro Remote Monitoring Center</p>
            </div>
            <button
              onClick={() => setShowLogModal(true)}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5" />
              Add Today's Reading
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Date / Timestamp</th>
                  <th className="py-2.5 px-3">BP (Sys/Dia)</th>
                  <th className="py-2.5 px-3">Pulse</th>
                  <th className="py-2.5 px-3">Tremor Score (0-10)</th>
                  <th className="py-2.5 px-3">Seizure Count</th>
                  <th className="py-2.5 px-3">Mobility (0-10)</th>
                  <th className="py-2.5 px-3">Triage Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vitalsLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-medium text-slate-900">{log.date}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{log.bloodPressureSys}/{log.bloodPressureDia} mmHg</td>
                    <td className="py-3 px-3 text-slate-700">{log.pulseRate} bpm</td>
                    <td className="py-3 px-3 text-slate-700">{log.tremorScore}/10</td>
                    <td className="py-3 px-3 text-slate-700">{log.seizureCountToday}</td>
                    <td className="py-3 px-3 text-slate-700">{log.mobilityScore}/10</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        log.triageStatus === 'Stable' ? 'bg-emerald-100 text-emerald-800' :
                        log.triageStatus === 'Guarded' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800 animate-pulse'
                      }`}>
                        {log.triageStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Diagnostic Report Slip Modal */}
      {selectedReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-800">
                  DEPARTMENT OF NEURO-RADIOLOGY & IMAGING SCIENCES
                </span>
                <h3 className="text-lg font-bold text-slate-900">{selectedReportModal.testName}</h3>
              </div>
              <button
                onClick={() => setSelectedReportModal(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Patient</span>
                <span className="font-bold text-slate-900">{patient.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">UHID</span>
                <span className="font-mono text-slate-900">{patient.uhid}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Modality</span>
                <span className="font-bold text-cyan-700">{selectedReportModal.modality}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Date</span>
                <span className="font-semibold text-slate-900">{selectedReportModal.date}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h5 className="font-bold text-slate-900 uppercase text-[11px] mb-1">Clinical Impression:</h5>
                <p className="text-slate-700 leading-relaxed bg-cyan-50/50 p-3 rounded-xl border border-cyan-100">
                  {selectedReportModal.impression}
                </p>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 uppercase text-[11px] mb-1">Detailed Findings:</h5>
                <div className="space-y-1.5">
                  {selectedReportModal.findings.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 mt-1.5 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono">Digital Signature: Verified by Institute PACS</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Report
                </button>
                <button
                  onClick={() => setSelectedReportModal(null)}
                  className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log Daily Vitals Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Log Daily Neurological Recovery Vitals</h3>
              <button onClick={() => setShowLogModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVitals} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Blood Pressure Systolic (mmHg)</label>
                  <input
                    type="number"
                    value={newBPSys}
                    onChange={e => setNewBPSys(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Blood Pressure Diastolic (mmHg)</label>
                  <input
                    type="number"
                    value={newBPDia}
                    onChange={e => setNewBPDia(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Pulse (bpm)</label>
                  <input
                    type="number"
                    value={newPulse}
                    onChange={e => setNewPulse(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tremor (0-10)</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={newTremor}
                    onChange={e => setNewTremor(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Seizures (24h)</label>
                  <input
                    type="number"
                    min={0}
                    value={newSeizures}
                    onChange={e => setNewSeizures(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Symptoms / Cognitive Recovery Note</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  placeholder="Note speech clarity, right-side weakness, medication side effects..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
                >
                  Save to Clinical Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
