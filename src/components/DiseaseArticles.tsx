import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  AlertCircle, 
  Glasses, 
  HeartHandshake, 
  Stethoscope, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  Zap, 
  Activity, 
  Gauge, 
  Target, 
  HelpCircle,
  PhoneCall
} from 'lucide-react';
import { DiseaseArticle, BrainAnatomyHotspot } from '../types';
import { DISEASE_ARTICLES, BRAIN_HOTSPOTS } from '../data/mockData';

interface DiseaseArticlesProps {
  onOpenVRForArticle?: (hotspotId: string) => void;
  onBookConsultationForDisease?: (diseaseName: string) => void;
}

export const DiseaseArticles: React.FC<DiseaseArticlesProps> = ({
  onOpenVRForArticle,
  onBookConsultationForDisease
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<DiseaseArticle>(DISEASE_ARTICLES[0]);
  const [viewMode, setViewMode] = useState<'patient-caregiver' | 'clinical'>('patient-caregiver');

  const categories = ['All', 'Vascular Neurology', 'Epileptology', 'Movement Disorders', 'Neuro-Surgical Oncology'];

  const filteredArticles = DISEASE_ARTICLES.filter(art => {
    const matchesCategory = selectedCategory === 'All' || art.category === selectedCategory;
    const matchesSearch = 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.symptoms.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'Activity': return <Activity className="w-4 h-4 text-emerald-500" />;
      case 'Gauge': return <Gauge className="w-4 h-4 text-cyan-500" />;
      case 'Target': return <Target className="w-4 h-4 text-purple-500" />;
      default: return <Stethoscope className="w-4 h-4 text-blue-500" />;
    }
  };

  const getAssociatedHotspot = (hotspotId: string): BrainAnatomyHotspot | undefined => {
    return BRAIN_HOTSPOTS.find(h => h.id === hotspotId);
  };

  return (
    <div className="space-y-6">
      {/* Section Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-cyan-950 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold mb-3 border border-cyan-500/30">
            <BookOpen className="w-3.5 h-3.5" />
            Patient & Caregiver Neurological Encyclopedia
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
            Neurological Diseases, Advanced Treatments & Care Protocols
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Written and reviewed by our senior neurologists and neurosurgeons. Understand brain conditions, 
            explore 3D VR anatomical models, and access practical home care guides for patients and family caregivers.
          </p>
        </div>

        {/* Global Patient / Specialist Audience Switcher */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-700/60 text-xs">
            <span className="text-slate-400 px-2 font-medium">Audience Lens:</span>
            <button
              id="btn-lens-patient"
              onClick={() => setViewMode('patient-caregiver')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'patient-caregiver'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              Patient & Caregiver Mode (Clear, Empathetic)
            </button>
            <button
              id="btn-lens-clinical"
              onClick={() => setViewMode('clinical')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'clinical'
                  ? 'bg-slate-700 text-cyan-300 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Clinical / Specialist Mode (Medical Detail)
            </button>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Updated Weekly by Sopan Neuro-Academic Council
          </div>
        </div>
      </div>

      {/* Search & Categories Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              id={`cat-pill-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white border border-cyan-500 shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="search-articles-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search symptoms, stroke, DBS..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 shadow-sm"
          />
        </div>
      </div>

      {/* Main Layout: Left Article Selector (4 col) & Right Deep Content (8 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Article List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            Condition Guides ({filteredArticles.length})
          </div>

          <div className="space-y-2.5">
            {filteredArticles.map(art => {
              const isSelected = art.id === selectedArticle.id;
              return (
                <div
                  key={art.id}
                  id={`article-card-${art.id}`}
                  onClick={() => setSelectedArticle(art)}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white border-cyan-500 shadow-lg shadow-cyan-950/20'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-lg ${isSelected ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        {getCategoryIcon(art.iconName)}
                      </span>
                      <span className={`text-[11px] font-medium ${isSelected ? 'text-cyan-300' : 'text-slate-500'}`}>
                        {art.category}
                      </span>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {art.readTime}
                    </span>
                  </div>

                  <h4 className={`text-sm font-bold leading-snug mb-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {art.title}
                  </h4>
                  <p className={`text-xs line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {art.subtitle}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
                    <span className={`flex items-center gap-1 ${isSelected ? 'text-cyan-400' : 'text-cyan-600'}`}>
                      <Glasses className="w-3 h-3" />
                      Has 3D Brain VR Model
                    </span>
                    <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400 translate-x-1' : 'text-slate-400'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Article Full Reader */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Article Header */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <span className="bg-cyan-50 text-cyan-700 text-xs font-semibold px-3 py-1 rounded-full border border-cyan-200">
                {selectedArticle.category}
              </span>
              <div className="flex items-center gap-2">
                <button
                  id="btn-explore-vr-brain"
                  onClick={() => {
                    if (onOpenVRForArticle) onOpenVRForArticle(selectedArticle.vrHotspotId);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium shadow-sm transition-all"
                >
                  <Glasses className="w-3.5 h-3.5" />
                  View Pathology in 3D / VR Brain
                </button>
                <button
                  id="btn-book-for-disease"
                  onClick={() => {
                    if (onBookConsultationForDisease) onBookConsultationForDisease(selectedArticle.title);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium shadow-sm transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Book Specialist OPD
                </button>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              {selectedArticle.title}
            </h1>
            <p className="text-sm font-medium text-slate-600 leading-relaxed">
              {selectedArticle.subtitle}
            </p>
          </div>

          {/* Overview Callout based on selected audience mode */}
          <div className={`p-4 rounded-xl border ${
            viewMode === 'patient-caregiver' 
              ? 'bg-blue-50/70 border-blue-200 text-blue-950' 
              : 'bg-slate-900 text-slate-200 border-slate-800'
          }`}>
            <div className="flex items-center gap-2 font-semibold text-xs mb-2">
              {viewMode === 'patient-caregiver' ? (
                <>
                  <HeartHandshake className="w-4 h-4 text-blue-600" />
                  <span>Patient & Family Summary (What You Need to Know)</span>
                </>
              ) : (
                <>
                  <Stethoscope className="w-4 h-4 text-cyan-400" />
                  <span>Clinical Neuro-Pathology & Institute Pathophysiology</span>
                </>
              )}
            </div>
            <p className="text-xs sm:text-sm leading-relaxed">
              {viewMode === 'patient-caregiver' 
                ? selectedArticle.patientOverview 
                : selectedArticle.overview}
            </p>
          </div>

          {/* Emergency Warning Signs Box */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-5">
            <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase tracking-wide mb-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Emergency Red Flags — When to Rush to Sopan 24/7 Neuro-Emergency
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {selectedArticle.emergencySigns.map((sign, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-red-100 text-xs text-red-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                  <span className="font-medium">{sign}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Common Symptoms */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-600" />
              Clinical Signs & Typical Symptoms
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedArticle.symptoms.map((sym, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 mt-0.5 shrink-0" />
                  <span>{sym}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Modern Treatments & Interventions */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-600" />
              Advanced Treatment Modalities at Sopan Institute
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedArticle.treatments.map((tr, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-cyan-300 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-xs text-slate-900">{tr.name}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                      tr.type === 'Surgical' ? 'bg-amber-100 text-amber-800' :
                      tr.type === 'Interventional' ? 'bg-purple-100 text-purple-800' :
                      tr.type === 'Medical' ? 'bg-blue-100 text-blue-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {tr.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {tr.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Caregiver Guidelines & Home Protocols */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 sm:p-5">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wide mb-3">
              <HeartHandshake className="w-4 h-4" />
              Caregiver Action Guide (Daily Support & Home Safety)
            </div>
            <div className="space-y-2">
              {selectedArticle.caregiverGuidelines.map((guide, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-emerald-950 bg-white/70 p-2.5 rounded-lg border border-emerald-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{guide}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Anatomical Cross Reference */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="text-slate-500">
              Target Brain Lobe:{' '}
              <span className="font-semibold text-slate-800">{selectedArticle.anatomicalFocus}</span>
            </div>
            <button
              onClick={() => {
                if (onOpenVRForArticle) onOpenVRForArticle(selectedArticle.vrHotspotId);
              }}
              className="text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1"
            >
              Inspect {selectedArticle.anatomicalFocus} in 3D VR Viewer
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
