import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Activity, 
  FileText, 
  ShieldCheck, 
  Sparkles,
  ClipboardList,
  Clock,
  Check
} from 'lucide-react';
import { savePatientToWebsiteData, fetchWebsiteData, subscribeToWebsiteData, PatientWebsiteData } from '../lib/firebase';
import firebaseConfigData from '../../firebase-applet-config.json';

interface PatientWebsiteDataFormProps {
  onSuccess?: (docId: string) => void;
}

export const PatientWebsiteDataForm: React.FC<PatientWebsiteDataFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    patientName: '',
    phone: '',
    email: '',
    age: '',
    gender: 'Male',
    department: 'General Neurology',
    chiefComplaint: '',
    preferredDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recentRecords, setRecentRecords] = useState<PatientWebsiteData[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [activeView, setActiveView] = useState<'form' | 'list'>('form');

  const departments = [
    'General Neurology',
    'Hyper-Acute Stroke Unit',
    'Epilepsy & 24-hr Video-EEG',
    'Parkinson & Movement Disorders',
    'Headache & Migraine Center',
    'Pediatric Neurology',
    'Neuro-Rehabilitation & Physio',
    'Neuro-Spine & Peripheral Nerve'
  ];

  // Load records from Firestore on mount
  const loadRecords = async () => {
    setIsLoadingRecords(true);
    try {
      const records = await fetchWebsiteData();
      setRecentRecords(records);
    } catch (err) {
      console.warn('Failed to load website_data records:', err);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  useEffect(() => {
    loadRecords();
    const unsubscribe = subscribeToWebsiteData((liveRecords) => {
      setRecentRecords(liveRecords);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFillSample = () => {
    setFormData({
      patientName: 'Sunil Ramesh Deshmukh',
      phone: '+91 98230 45678',
      email: 'sunil.deshmukh@example.com',
      age: '54',
      gender: 'Male',
      department: 'Hyper-Acute Stroke Unit',
      chiefComplaint: 'Mild left arm numbness and transient dizziness following morning walk',
      preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      notes: 'Referred for Doppler & 32-Slice CT Angiography evaluation under Dr. Sanjay Sopan Varade.',
    });
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName.trim()) {
      setErrorMessage('Please provide the patient full name.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage('Please provide a valid contact number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setLastSubmittedId(null);

    const result = await savePatientToWebsiteData({
      patientName: formData.patientName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || '',
      age: formData.age ? Number(formData.age) : '',
      gender: formData.gender || 'Not Specified',
      department: formData.department || 'General Neurology',
      chiefComplaint: formData.chiefComplaint.trim() || '',
      preferredDate: formData.preferredDate || new Date().toISOString().split('T')[0],
      notes: formData.notes.trim() || '',
      source: 'Patient Web Portal / website_data Form',
      userId: 'guest'
    });

    setIsSubmitting(false);

    if (result.success && result.id) {
      setLastSubmittedId(result.id);
      if (onSuccess) onSuccess(result.id);
      // Reset form
      setFormData({
        patientName: '',
        phone: '',
        email: '',
        age: '',
        gender: 'Male',
        department: 'General Neurology',
        chiefComplaint: '',
        preferredDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
      // Refresh list
      loadRecords();
    } else {
      setErrorMessage(result.error || 'Failed to save record to Firestore.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Firestore Integration Banner */}
      <div className="bg-gradient-to-r from-[#241E17] via-[#332A20] to-[#241E17] text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#44382C]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Firebase Firestore Connected: <strong>{firebaseConfigData.projectId}</strong></span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight flex items-center gap-2.5">
              <Database className="w-7 h-7 text-[#D4A373]" />
              <span>Firestore Collection: <code className="text-[#E8A86B] font-mono text-xl sm:text-2xl">website_data</code></span>
            </h2>
            <p className="text-sm text-[#DFD5C6] max-w-2xl leading-relaxed">
              Real-time patient intake repository storing structured patient inquiries, demographic data, and clinical complaints directly into your Firestore project database.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveView('form')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'form' 
                  ? 'bg-[#8E5B3E] text-white shadow-xs' 
                  : 'bg-white/10 hover:bg-white/15 text-[#DFD5C6]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Save Patient Form</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView('list');
                loadRecords();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'list' 
                  ? 'bg-[#8E5B3E] text-white shadow-xs' 
                  : 'bg-white/10 hover:bg-white/15 text-[#DFD5C6]'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>View Saved Records ({recentRecords.length})</span>
            </button>
          </div>
        </div>
      </div>

      {activeView === 'form' ? (
        <div className="bg-white rounded-3xl border border-[#E6E0D4] shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EFE9DF] gap-3">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#27231E] flex items-center gap-2">
                <User className="w-5 h-5 text-[#8E5B3E]" />
                <span>Patient Intake Registration</span>
              </h3>
              <p className="text-xs text-[#7A7163] mt-0.5">
                Submits document to Firestore path: <span className="font-mono bg-[#FAF7F2] px-1.5 py-0.5 rounded text-[#8E5B3E] border border-[#E6E0D4]">/website_data/{'{documentId}'}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleFillSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F6F3EE] hover:bg-[#EFE9DF] text-[#7A5338] text-xs font-semibold border border-[#E0D5C3] cursor-pointer transition-colors self-start sm:self-auto"
              title="Autofill sample clinical patient data for quick testing"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Fill Sample Patient</span>
            </button>
          </div>

          {/* Success Toast */}
          {lastSubmittedId && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3 animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs sm:text-sm">
                <div className="font-bold text-emerald-900">
                  Successfully saved patient data into Firestore collection <code className="font-mono text-emerald-800">'website_data'</code>!
                </div>
                <div className="text-emerald-800 flex flex-wrap items-center gap-2">
                  <span>Firestore Document ID:</span>
                  <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 select-all">
                    {lastSubmittedId}
                  </span>
                </div>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveView('list')}
                    className="text-xs font-bold text-emerald-800 underline hover:text-emerald-950 cursor-pointer"
                  >
                    View in Saved Records Table →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <span className="font-bold">Error saving data: </span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Patient Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3B342B] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#8E5B3E]" />
                  <span>Patient Full Name *</span>
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Ramesh Kulkarni"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-[#27231E] text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8E5B3E]/30 focus:border-[#8E5B3E] transition-all"
                />
              </div>

              {/* Contact Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3B342B] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#8E5B3E]" />
                  <span>Phone / WhatsApp Number *</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="e.g. +91 94055 45521"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-[#27231E] text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8E5B3E]/30 focus:border-[#8E5B3E] transition-all"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3B342B] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#8E5B3E]" />
                  <span>Email Address (Optional)</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="patient@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-[#27231E] text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8E5B3E]/30 focus:border-[#8E5B3E] transition-all"
                />
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#3B342B]">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="e.g. 48"
                    min="1"
                    max="120"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-[#27231E] text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8E5B3E]/30 focus:border-[#8E5B3E] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#3B342B]">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-[#27231E] text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8E5B3E]/30 focus:border-[#8E5B3E] transition-all"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3B342B] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#8E5B3E]" />
                  <span>Clinical Department</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-[#27231E] text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8E5B3E]/30 focus:border-[#8E5B3E] transition-all"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Preferred Consultation Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3B342B] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#8E5B3E]" />
                  <span>Preferred Consultation Date</span>
                </label>
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-[#27231E] text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8E5B3E]/30 focus:border-[#8E5B3E] transition-all"
                />
              </div>
            </div>

            {/* Chief Complaint */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#3B342B] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-rose-600" />
                <span>Chief Complaint / Symptoms / Diagnosis</span>
              </label>
              <textarea
                name="chiefComplaint"
                value={formData.chiefComplaint}
                onChange={handleChange}
                rows={2}
                placeholder="Describe current neurological symptoms (e.g. chronic headache, seizure episodes, limb weakness, numbness, tremor)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-[#27231E] text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8E5B3E]/30 focus:border-[#8E5B3E] transition-all"
              />
            </div>

            {/* Clinical Notes / Treatment History */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#3B342B] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#456254]" />
                <span>Additional Clinical Notes & History</span>
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                placeholder="Prior medications, allergies, previous MRI/CT scans, surgery details..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD5C9] bg-[#FAF8F5] text-[#27231E] text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#8E5B3E]/30 focus:border-[#8E5B3E] transition-all"
              />
            </div>

            {/* Submit Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#EFE9DF]">
              <div className="text-[11px] text-[#7A7163] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Data is written directly to Firestore database collection: <strong className="font-mono text-[#27231E]">website_data</strong></span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#8E5B3E] hover:bg-[#784A31] text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Writing to Firestore...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Save Patient into 'website_data'</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Saved Records Table View */
        <div className="bg-white rounded-3xl border border-[#E6E0D4] shadow-xs p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EFE9DF] gap-3">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#27231E] flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#8E5B3E]" />
                <span>Documents in Firestore Collection: <code className="text-[#8E5B3E] font-mono">website_data</code></span>
              </h3>
              <p className="text-xs text-[#7A7163] mt-0.5">
                Displaying real-time records from project <strong className="font-mono text-[#27231E]">{firebaseConfigData.projectId}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadRecords}
                disabled={isLoadingRecords}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F6F3EE] hover:bg-[#EFE9DF] text-[#7A5338] text-xs font-semibold border border-[#E0D5C3] cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRecords ? 'animate-spin' : ''}`} />
                <span>Refresh from Firestore</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView('form')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#8E5B3E] text-white text-xs font-bold cursor-pointer"
              >
                <span>+ New Patient</span>
              </button>
            </div>
          </div>

          {isLoadingRecords ? (
            <div className="py-12 text-center text-[#7A7163] text-xs flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[#8E5B3E]" />
              <span>Querying Firestore collection 'website_data'...</span>
            </div>
          ) : recentRecords.length === 0 ? (
            <div className="py-12 text-center text-[#7A7163] space-y-3 bg-[#FAF8F5] rounded-2xl border border-dashed border-[#E6E0D4]">
              <Database className="w-10 h-10 text-[#C7BCAB] mx-auto" />
              <div className="text-sm font-semibold text-[#27231E]">No documents in 'website_data' collection yet</div>
              <p className="text-xs max-w-sm mx-auto">
                Fill the form above or click "Fill Sample Patient" to insert your first test document into Firestore.
              </p>
              <button
                type="button"
                onClick={() => setActiveView('form')}
                className="px-4 py-2 rounded-xl bg-[#8E5B3E] text-white text-xs font-bold"
              >
                Submit First Record
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E6E0D4] text-[#7A7163] bg-[#FAF8F5]">
                    <th className="py-3 px-3 font-semibold">Document ID</th>
                    <th className="py-3 px-3 font-semibold">Patient Name</th>
                    <th className="py-3 px-3 font-semibold">Contact / Phone</th>
                    <th className="py-3 px-3 font-semibold">Department</th>
                    <th className="py-3 px-3 font-semibold">Complaint</th>
                    <th className="py-3 px-3 font-semibold">Date Saved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9DF]">
                  {recentRecords.map(record => (
                    <tr key={record.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td className="py-3 px-3 font-mono text-[11px] text-[#8E5B3E] font-medium">
                        {record.id || 'N/A'}
                      </td>
                      <td className="py-3 px-3 font-bold text-[#27231E]">
                        {record.patientName}
                        {record.age && <span className="text-[11px] text-[#7A7163] font-normal ml-1">({record.age}y, {record.gender})</span>}
                      </td>
                      <td className="py-3 px-3 font-medium text-[#456254]">
                        {record.phone}
                        {record.email && <div className="text-[10px] text-[#7A7163] truncate max-w-[120px]">{record.email}</div>}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#F2EDE4] text-[#635545] font-semibold text-[11px]">
                          {record.department || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-3 max-w-xs truncate text-[#554D42]" title={record.chiefComplaint || ''}>
                        {record.chiefComplaint || '—'}
                      </td>
                      <td className="py-3 px-3 text-[#7A7163] text-[11px] whitespace-nowrap">
                        {record.createdAt ? new Date(record.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }) : 'Just now'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientWebsiteDataForm;
