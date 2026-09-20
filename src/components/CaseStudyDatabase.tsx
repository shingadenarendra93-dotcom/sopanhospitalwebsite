import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  PlusCircle, 
  FileText, 
  Printer, 
  Tag, 
  CheckCircle2, 
  Brain, 
  UserCheck, 
  Calendar, 
  ChevronRight, 
  X,
  BookMarked
} from 'lucide-react';
import { CaseStudy, DepartmentType } from '../types';
import { INITIAL_CASE_STUDIES } from '../data/mockData';

export const CaseStudyDatabase: React.FC = () => {
  const [cases, setCases] = useState<CaseStudy[]>(INITIAL_CASE_STUDIES);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCaseModal, setSelectedCaseModal] = useState<CaseStudy | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Case Study Form State
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<DepartmentType>('Comprehensive Stroke Center');
  const [newDemographics, setNewDemographics] = useState<string>('');
  const [newChiefComplaint, setNewChiefComplaint] = useState<string>('');
  const [newExam, setNewExam] = useState<string>('');
  const [newImaging, setNewImaging] = useState<string>('');
  const [newDiagnosis, setNewDiagnosis] = useState<string>('');
  const [newInterventionType, setNewInterventionType] = useState<'Endovascular Surgery' | 'Microsurgery' | 'Immunotherapy' | 'Neuromodulation' | 'Conservative ICU'>('Endovascular Surgery');
  const [newProcedure, setNewProcedure] = useState<string>('');
  const [newOutcome30, setNewOutcome30] = useState<string>('');
  const [newOutcome6M, setNewOutcome6M] = useState<string>('');
  const [newPearls, setNewPearls] = useState<string>('');
  const [newAuthor, setNewAuthor] = useState<string>('Dr. Sanjay Sopan Varade MD, DM Neuro');

  const categories = [
    'All',
    'Comprehensive Stroke Center',
    'Neuro-Oncology & Brain Tumors',
    'Movement Disorders & Parkinson’s',
    'Epilepsy & EEG Monitoring'
  ];

  const filteredCases = cases.filter(cs => {
    const matchesCategory = selectedCategory === 'All' || cs.category === selectedCategory;
    const matchesSearch = 
      cs.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cs.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cs.finalDiagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cs.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newCase: CaseStudy = {
      id: `cs-${Date.now()}`,
      caseNumber: `CS-NEURO-2026-0${cases.length + 10}`,
      title: newTitle,
      category: newCategory,
      patientDemographics: newDemographics || '45-year-old Patient',
      chiefComplaint: newChiefComplaint || 'Acute neurological presentation',
      neurologicalExam: newExam || 'Focal deficits noted on baseline exam',
      neuroimaging: newImaging || '32-Slice CT Scanner Brain diagnostic protocol',
      differentialDiagnosis: ['Primary Neurological Pathology'],
      finalDiagnosis: newDiagnosis || 'Neurological condition',
      interventionType: newInterventionType,
      procedureDetails: newProcedure || 'Standard microsurgical or medical neuro-protocol applied.',
      outcome30Day: newOutcome30 || 'Stable improvement noted at 30-day review.',
      outcome6Month: newOutcome6M || 'Functional independence maintained at 6 months.',
      learningPearls: newPearls.split('\n').filter(p => p.trim().length > 0),
      authorDoctor: newAuthor,
      publicationDate: 'September 2026',
      tags: [newCategory, newInterventionType, 'Peer-Reviewed']
    };

    setCases([newCase, ...cases]);
    setShowAddModal(false);
    // Reset
    setNewTitle('');
    setNewDemographics('');
    setNewChiefComplaint('');
    setNewProcedure('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2 border border-cyan-500/30">
            <Database className="w-3.5 h-3.5" />
            Clinical Neuroscience Research & Academic Repository
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Case Study Management Database
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Anonymized, peer-reviewed clinical archives documenting rare and high-complexity neuro-surgical, 
            endovascular, and epileptology cases treated at Sopan Hospital & Institute.
          </p>
        </div>

        <button
          id="btn-add-case-study"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-950 transition-all flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Clinical Case Study
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white border border-cyan-500 shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search cases by diagnosis, technique..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 shadow-sm"
          />
        </div>
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        {filteredCases.map(cs => (
          <div
            key={cs.id}
            id={`case-card-${cs.id}`}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-md">
                    {cs.caseNumber}
                  </span>
                  <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                    {cs.interventionType}
                  </span>
                  <span className="text-xs text-slate-400">• {cs.publicationDate}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">{cs.title}</h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  Author / Operating Specialist: <strong className="text-slate-700">{cs.authorDoctor}</strong> ({cs.category})
                </div>
              </div>

              <button
                onClick={() => setSelectedCaseModal(cs)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
              >
                <FileText className="w-3.5 h-3.5" />
                Read Full Case & Surgical Log
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Patient Profile</span>
                <span className="font-semibold text-slate-800">{cs.patientDemographics}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Definitive Diagnosis</span>
                <span className="font-semibold text-cyan-800">{cs.finalDiagnosis}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">6-Month Outcome</span>
                <span className="font-semibold text-emerald-700">{cs.outcome6Month}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {cs.tags.map((t, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px]">
                    #{t}
                  </span>
                ))}
              </div>
              <span className="text-slate-400 text-[11px] font-mono">Academic Index: SOPAN-NEURO-CORE</span>
            </div>
          </div>
        ))}
      </div>

      {/* Case Study Full Modal */}
      {selectedCaseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded">
                    {selectedCaseModal.caseNumber}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {selectedCaseModal.category}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 leading-snug">
                  {selectedCaseModal.title}
                </h2>
                <div className="text-xs text-slate-500 mt-1">
                  Primary Investigator: <strong>{selectedCaseModal.authorDoctor}</strong>
                </div>
              </div>
              <button
                onClick={() => setSelectedCaseModal(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Case Details */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="font-bold text-slate-800 block mb-1">Chief Presentation:</span>
                  <p className="text-slate-600">{selectedCaseModal.chiefComplaint}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block mb-1">Neurological Examination:</span>
                  <p className="text-slate-600">{selectedCaseModal.neurologicalExam}</p>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">Neuro-Imaging Findings:</span>
                <p className="text-slate-700 bg-blue-50/50 p-3 rounded-xl border border-blue-100 leading-relaxed">
                  {selectedCaseModal.neuroimaging}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">Surgical / Interventional Procedure Details:</span>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {selectedCaseModal.procedureDetails}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                  <span className="font-bold text-emerald-900 block mb-1">30-Day Clinical Outcome:</span>
                  <p className="text-emerald-800 leading-relaxed">{selectedCaseModal.outcome30Day}</p>
                </div>
                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                  <span className="font-bold text-emerald-900 block mb-1">6-Month Follow-Up Status:</span>
                  <p className="text-emerald-800 leading-relaxed">{selectedCaseModal.outcome6Month}</p>
                </div>
              </div>

              <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200">
                <span className="font-bold text-amber-900 flex items-center gap-1.5 mb-2">
                  <BookMarked className="w-4 h-4 text-amber-700" />
                  Key Clinical Learning Pearls & Practice Points:
                </span>
                <ul className="space-y-1.5 text-amber-950">
                  {selectedCaseModal.learningPearls.map((pearl, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                      <span>{pearl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">Verified by Sopan Institutional Ethics Board</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Case Sheet
                </button>
                <button
                  onClick={() => setSelectedCaseModal(null)}
                  className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Case Study Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Add Clinical Neuroscience Case Study</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Case Study Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Endovascular Thrombectomy in Distal M2 Occlusion..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Comprehensive Stroke Center">Comprehensive Stroke Center</option>
                    <option value="Neuro-Oncology & Brain Tumors">Neuro-Oncology & Brain Tumors</option>
                    <option value="Movement Disorders & Parkinson’s">Movement Disorders & Parkinson’s</option>
                    <option value="Epilepsy & EEG Monitoring">Epilepsy & EEG Monitoring</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Intervention Type</label>
                  <select
                    value={newInterventionType}
                    onChange={e => setNewInterventionType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Endovascular Surgery">Endovascular Surgery</option>
                    <option value="Microsurgery">Microsurgery</option>
                    <option value="Neuromodulation">Neuromodulation</option>
                    <option value="Immunotherapy">Immunotherapy</option>
                    <option value="Conservative ICU">Conservative ICU</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Patient Presentation & Demographics</label>
                <input
                  type="text"
                  value={newDemographics}
                  onChange={e => setNewDemographics(e.target.value)}
                  placeholder="e.g. 52-year-old male with sudden aphasia"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Procedure Details & Surgical Notes</label>
                <textarea
                  rows={2}
                  value={newProcedure}
                  onChange={e => setNewProcedure(e.target.value)}
                  placeholder="Technique, instruments used, recanalization achieved..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">30-Day Clinical Outcome</label>
                  <input
                    type="text"
                    value={newOutcome30}
                    onChange={e => setNewOutcome30(e.target.value)}
                    placeholder="e.g. NIHSS improved from 18 to 2"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Lead Investigator</label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={e => setNewAuthor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
                >
                  Save to Case Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
