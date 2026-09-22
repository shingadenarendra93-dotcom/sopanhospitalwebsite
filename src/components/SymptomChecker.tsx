import React, { useState, useMemo, useRef } from 'react';
import {
  Activity,
  AlertTriangle,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Glasses,
  HelpCircle,
  Info,
  MessageCircle,
  Phone,
  Printer,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  X,
  Zap
} from 'lucide-react';
import { 
  SymptomCategory, 
  SymptomSeverity, 
  SymptomOnset 
} from '../types';
import { 
  SYMPTOM_LIST, 
  PRESET_SCENARIOS, 
  assessSymptoms, 
  PresetScenario 
} from '../data/symptomCheckerData';

interface SymptomCheckerProps {
  onBookAppointment: (symptomsSummary: string, suspectedCondition?: string) => void;
  onOpenWhatsApp: (customMessage?: string) => void;
  onExploreVR?: (hotspotId?: string) => void;
}

export const SymptomChecker: React.FC<SymptomCheckerProps> = ({
  onBookAppointment,
  onOpenWhatsApp,
  onExploreVR
}) => {
  // Symptom state
  const [selectedSymptomIds, setSelectedSymptomIds] = useState<string[]>([
    'sym-severe-throbbing-headache',
    'sym-nausea-photophobia'
  ]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modifiers
  const [onset, setOnset] = useState<SymptomOnset>('Rapid (< 24 hours)');
  const [severity, setSeverity] = useState<SymptomSeverity>('Moderate');
  const [patientAge, setPatientAge] = useState<number>(42);

  // UI view state: 'selector' | 'report-preview'
  const [showTriageSummaryModal, setShowTriageSummaryModal] = useState<boolean>(false);
  const printSlipRef = useRef<HTMLDivElement>(null);

  // Categories list
  const categories: ('All' | SymptomCategory)[] = [
    'All',
    'Cranial & Headache',
    'Motor, Movement & Weakness',
    'Sensory & Numbness',
    'Balance, Dizziness & Vestibular',
    'Speech, Vision & Facial',
    'Cognitive, Memory & Seizure'
  ];

  // Filtered symptoms based on category and search
  const filteredSymptoms = useMemo(() => {
    return SYMPTOM_LIST.filter(s => {
      const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
      const matchesSearch = 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.commonIn.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Assessment results
  const assessmentResults = useMemo(() => {
    return assessSymptoms(selectedSymptomIds, onset, severity);
  }, [selectedSymptomIds, onset, severity]);

  // Selected symptoms objects
  const selectedSymptoms = useMemo(() => {
    return SYMPTOM_LIST.filter(s => selectedSymptomIds.includes(s.id));
  }, [selectedSymptomIds]);

  // Check if any selected symptom is a critical red flag
  const activeRedFlags = useMemo(() => {
    return selectedSymptoms.filter(s => s.isRedFlag);
  }, [selectedSymptoms]);

  // Primary top match condition
  const topMatch = assessmentResults[0];

  // Toggle symptom selection
  const toggleSymptom = (id: string) => {
    setSelectedSymptomIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Load a preset scenario
  const applyPreset = (preset: PresetScenario) => {
    setSelectedSymptomIds(preset.symptomIds);
    setOnset(preset.onset);
    setSeverity(preset.severity);
    setPatientAge(preset.age);
    setSearchQuery('');
  };

  // Clear all selections
  const clearAllSymptoms = () => {
    setSelectedSymptomIds([]);
  };

  // Generate WhatsApp message for instant triage
  const handleWhatsAppTriage = () => {
    const symptomNames = selectedSymptoms.map(s => s.name).join(', ');
    const topConditionName = topMatch ? topMatch.condition.name : 'Neurological Consultation Request';
    const message = `Hello Sopan Hospital Triage Team, I used the Interactive Neuro Symptom Checker on your portal. 
*Patient Age:* ${patientAge}
*Onset:* ${onset}
*Severity:* ${severity}
*Reported Symptoms:* ${symptomNames || 'Not specified'}
*Suggested Screening Focus:* ${topConditionName}
I would like to consult Chief Neurologist Dr. Sanjay Sopan Varade (MD, DM Neuro) at Mumbai Naka, Nashik. Please guide on appointment slots.`;
    onOpenWhatsApp(message);
  };

  // Book appointment handler
  const handleScheduleAppointment = () => {
    const symptomsSummary = `[Symptom Checker Triage] Onset: ${onset}, Severity: ${severity}, Age: ${patientAge}. Symptoms: ${selectedSymptoms.map(s => s.name).join('; ')}`;
    const suspected = topMatch ? topMatch.condition.name : undefined;
    onBookAppointment(symptomsSummary, suspected);
  };

  // Trigger print dialog for the clinical triage slip
  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="space-y-8" id="section-symptom-checker">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2E2720] via-[#241F1A] to-[#1A1612] text-white rounded-3xl p-6 sm:p-8 border border-[#483F34] shadow-sm">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8E5B3E]/30 text-[#EBD4C0] border border-[#8E5B3E]/40 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5 text-[#DDA277]" />
            Clinical Triage & Patient Screening Assistant
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-white">
            Interactive Neurological <span className="text-[#E2A676]">Symptom Checker</span>
          </h2>

          <p className="text-xs sm:text-sm text-[#D1C7BA] leading-relaxed">
            Select your current signs, onset speed, and severity to receive an automated screening analysis 
            aligned with protocols from <strong className="text-white">Dr. Sanjay Sopan Varade (MD, DM Neuro)</strong> at 
            Sopan Hospital & Institute, Mumbai Naka, Nashik.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#B8ACA0]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Evidence-based algorithms
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-amber-400" />
              F.A.S.T. Stroke Emergency Screener
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-[#E2A676]" />
              Direct OPD Booking (₹1,500)
            </span>
          </div>
        </div>

        {/* Decorative corner glow */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#8E5B3E]/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Preset Clinical Scenarios for 1-Click Evaluation */}
      <div className="bg-[#FAF7F2] border border-[#E8E0D2] rounded-3xl p-5 sm:p-6 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#736A5E]">
            <Sparkles className="w-4 h-4 text-[#8E5B3E]" />
            <span>Common Clinical Scenarios (1-Click Presets)</span>
          </div>
          <span className="text-[11px] text-[#8C8375] hidden sm:inline">Click any scenario to pre-populate inputs</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {PRESET_SCENARIOS.map((preset) => (
            <button
              key={preset.id}
              id={`preset-${preset.id}`}
              onClick={() => applyPreset(preset)}
              className="p-3 rounded-2xl bg-white hover:bg-[#F4EEE2] border border-[#E3D8C6] text-left transition-all hover:shadow-xs group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${preset.badgeColor}`}>
                  {preset.badge}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#9C9283] group-hover:text-[#8E5B3E] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <h4 className="text-xs font-bold text-[#27231E] line-clamp-1 mb-1">
                {preset.title}
              </h4>
              <p className="text-[11px] text-[#6E6557] line-clamp-2 leading-snug">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Workflow: Inputs on Left, Assessment & Triage on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Symptom Selection & Modifiers (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Clinical Context Modifiers (Onset, Severity, Age) */}
          <div className="bg-white border border-[#E8E0D2] rounded-3xl p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#695F52] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#8E5B3E]" />
              <span>Step 1: Clinical Context & Timeline</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Onset */}
              <div>
                <label className="block text-[11px] font-bold text-[#4F463B] mb-1.5">
                  Onset Speed
                </label>
                <select
                  id="select-symptom-onset"
                  value={onset}
                  onChange={(e) => setOnset(e.target.value as SymptomOnset)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded-xl px-3 py-2 text-xs text-[#27231E] font-medium focus:ring-2 focus:ring-[#8E5B3E] focus:outline-none"
                >
                  <option value="Sudden (< 1 hour)">Sudden (&lt; 1 hour) [Emergency]</option>
                  <option value="Rapid (< 24 hours)">Rapid (&lt; 24 hours)</option>
                  <option value="Gradual (Days to Weeks)">Gradual (Days to Weeks)</option>
                  <option value="Chronic / Recurrent (> 3 Months)">Chronic / Recurrent (&gt; 3 Months)</option>
                </select>
              </div>

              {/* Severity */}
              <div>
                <label className="block text-[11px] font-bold text-[#4F463B] mb-1.5">
                  Severity Level
                </label>
                <div className="grid grid-cols-3 gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#DDD3C2]">
                  {(['Mild', 'Moderate', 'Severe'] as SymptomSeverity[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSeverity(lvl)}
                      className={`py-1.5 text-[11px] font-bold rounded-lg transition-colors ${
                        severity === lvl
                          ? 'bg-[#8E5B3E] text-white shadow-xs'
                          : 'text-[#6E6557] hover:text-[#27231E]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Patient Age */}
              <div>
                <label className="block text-[11px] font-bold text-[#4F463B] mb-1.5">
                  Patient Age (Years)
                </label>
                <input
                  type="number"
                  min={1}
                  max={105}
                  value={patientAge}
                  onChange={(e) => setPatientAge(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-[#FAF8F5] border border-[#DDD3C2] rounded-xl px-3 py-2 text-xs text-[#27231E] font-medium focus:ring-2 focus:ring-[#8E5B3E] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Symptom Selector & Search */}
          <div className="bg-white border border-[#E8E0D2] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-serif font-bold text-[#27231E]">
                  Step 2: Select Patient Signs & Symptoms
                </h3>
                <p className="text-[11px] text-[#786E61]">
                  Currently selected: <span className="font-bold text-[#8E5B3E]">{selectedSymptomIds.length} symptoms</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {selectedSymptomIds.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllSymptoms}
                    className="text-[11px] text-rose-700 hover:text-rose-900 font-bold px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#998F80] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-search-symptoms"
                type="text"
                placeholder="Search symptom (e.g. 'tremor', 'headache', 'dizzy', 'pins and needles', 'vision')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#DDD3C2] rounded-2xl text-xs text-[#27231E] placeholder:text-[#998F80] focus:ring-2 focus:ring-[#8E5B3E] focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#998F80] hover:text-[#27231E]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-[#342E28] text-white'
                      : 'bg-[#F5EFE4] text-[#695F52] hover:bg-[#EAE1D2] hover:text-[#27231E]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Selected Symptoms Pill Badges */}
            {selectedSymptoms.length > 0 && (
              <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#E6DDCE] space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8375] block">
                  Active Selected Symptoms:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSymptoms.map((sym) => (
                    <span
                      key={sym.id}
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-xl border ${
                        sym.isRedFlag
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-white text-[#3E362C] border-[#DED4C3]'
                      }`}
                    >
                      {sym.isRedFlag && <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />}
                      <span>{sym.name}</span>
                      <button
                        type="button"
                        onClick={() => toggleSymptom(sym.id)}
                        className="text-[#998F80] hover:text-rose-700 ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Symptoms Grid List */}
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {filteredSymptoms.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#8C8375] bg-[#FAF8F5] rounded-2xl border border-dashed border-[#DDD3C2]">
                  No symptoms matching "{searchQuery}". Try broader keywords or change the category filter.
                </div>
              ) : (
                filteredSymptoms.map((symptom) => {
                  const isChecked = selectedSymptomIds.includes(symptom.id);
                  return (
                    <div
                      key={symptom.id}
                      id={`symptom-card-${symptom.id}`}
                      onClick={() => toggleSymptom(symptom.id)}
                      className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                        isChecked
                          ? symptom.isRedFlag
                            ? 'bg-rose-50/60 border-rose-300 ring-1 ring-rose-300'
                            : 'bg-[#F8F3EA] border-[#8E5B3E] ring-1 ring-[#8E5B3E]/30'
                          : 'bg-white hover:bg-[#FAF8F5] border-[#E8E0D2]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? symptom.isRedFlag
                              ? 'bg-rose-600 border-rose-600 text-white'
                              : 'bg-[#8E5B3E] border-[#8E5B3E] text-white'
                            : 'border-[#CCC1AF] bg-[#FAF8F5]'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className="text-xs sm:text-sm font-bold text-[#27231E]">
                            {symptom.name}
                          </span>
                          {symptom.isRedFlag && (
                            <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200">
                              Red Flag Alert
                            </span>
                          )}
                          <span className="text-[10px] font-medium text-[#8C8375] bg-[#F2EDE4] px-2 py-0.5 rounded-md">
                            {symptom.category}
                          </span>
                        </div>

                        <p className="text-[11px] text-[#695F52] leading-relaxed">
                          {symptom.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-1 mt-1.5 text-[10px] text-[#8C8375]">
                          <span>Frequently observed in:</span>
                          {symptom.commonIn.map((cond, i) => (
                            <span key={i} className="font-semibold text-[#4F463B] bg-white px-1.5 py-0.5 rounded border border-[#E3DACB]">
                              {cond}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Intelligent Triage, Red-Flag Emergency, Condition Matches & Booking CTA (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          {/* Critical Red-Flag Emergency Alert (Visible when active) */}
          {activeRedFlags.length > 0 && (
            <div 
              id="alert-stroke-emergency"
              className="bg-gradient-to-br from-rose-700 via-rose-800 to-red-900 text-white rounded-3xl p-5 sm:p-6 border-2 border-rose-500 shadow-xl space-y-4 animate-fadeIn"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-200 block">
                    Neurological Emergency Screener
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                    Potential Acute Stroke / Red Flag Warning
                  </h3>
                </div>
              </div>

              <div className="bg-black/20 p-3.5 rounded-2xl border border-white/20 text-xs space-y-1.5">
                <div className="font-bold text-rose-100 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-300" />
                  <span>Detected Emergency Symptoms:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-white/90 text-[11px]">
                  {activeRedFlags.map((rf) => (
                    <li key={rf.id}>{rf.name}</li>
                  ))}
                </ul>
              </div>

              <p className="text-[11px] text-rose-100 leading-relaxed">
                <strong>Time is Brain (1.9 million neurons/min).</strong> Do NOT wait to see if symptoms improve. 
                Do not administer oral food, water, or aspirin until swallowing is verified.
              </p>

              <div className="space-y-2 pt-1">
                <a
                  id="btn-call-emergency-hotline"
                  href="tel:02532317364"
                  className="w-full py-3 px-4 bg-white text-rose-900 hover:bg-rose-50 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Phone className="w-4 h-4 text-rose-600" />
                  Call 24/7 Stroke Hotline: 0253 2317364
                </a>

                <button
                  type="button"
                  id="btn-alert-whatsapp-team"
                  onClick={handleWhatsAppTriage}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  Alert Triage Team on WhatsApp (9405545521)
                </button>
              </div>
            </div>
          )}

          {/* Screening Assessment Report Card */}
          <div className="bg-white border border-[#E8E0D2] rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE3D5]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8375]">
                  Clinical Analysis
                </span>
                <h3 className="text-base font-serif font-bold text-[#27231E]">
                  Suspected Conditions
                </h3>
              </div>

              {assessmentResults.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowTriageSummaryModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8E5B3E] hover:text-[#784A31] bg-[#FAF5EE] hover:bg-[#F3EADB] px-3 py-1.5 rounded-xl border border-[#E0D4C2] transition-colors cursor-pointer"
                  title="View complete printable triage slip"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
              )}
            </div>

            {selectedSymptomIds.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-3 bg-[#FAF8F5] rounded-2xl border border-dashed border-[#DDD3C2]">
                <div className="w-12 h-12 rounded-2xl bg-[#EFE9DF] text-[#8E5B3E] flex items-center justify-center mx-auto">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-[#27231E]">No Symptoms Selected Yet</h4>
                <p className="text-[11px] text-[#786E61] max-w-xs mx-auto">
                  Please select at least 1 symptom from the list or choose a preset clinical scenario above to generate an assessment.
                </p>
              </div>
            ) : assessmentResults.length === 0 ? (
              <div className="py-8 px-4 text-center space-y-2 bg-[#FAF8F5] rounded-2xl border border-[#DDD3C2]">
                <HelpCircle className="w-8 h-8 text-[#8E5B3E] mx-auto" />
                <h4 className="text-xs font-bold text-[#27231E]">Atypical Symptom Combination</h4>
                <p className="text-[11px] text-[#786E61]">
                  Your selected symptoms do not match a single common textbook pattern. We recommend an in-person diagnostic evaluation with Dr. Sanjay Sopan Varade.
                </p>
                <button
                  onClick={handleScheduleAppointment}
                  className="mt-2 px-4 py-2 bg-[#8E5B3E] text-white text-xs font-bold rounded-xl"
                >
                  Schedule Evaluation (₹1,500)
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Condition Result Cards */}
                {assessmentResults.slice(0, 3).map((res, index) => {
                  const isTop = index === 0;
                  return (
                    <div
                      key={res.condition.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isTop
                          ? 'bg-[#FCFAF7] border-[#D8C7B0] shadow-xs'
                          : 'bg-[#FAF8F5] border-[#E8E0D2]'
                      }`}
                    >
                      {/* Header: Score & Urgency */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs font-bold text-[#8E5B3E]">
                              #{index + 1} Match
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                res.condition.urgency === 'Emergency (Immediate)'
                                  ? 'bg-rose-100 text-rose-800'
                                  : res.condition.urgency === 'Urgent (Within 24-48h)'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {res.condition.urgency}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-[#27231E] leading-snug">
                            {res.condition.name}
                          </h4>
                        </div>

                        {/* Match Confidence Gauge */}
                        <div className="text-right shrink-0">
                          <span className="text-lg font-serif font-black text-[#27231E]">
                            {res.matchScore}%
                          </span>
                          <span className="text-[9px] uppercase tracking-wider text-[#8C8375] block -mt-1 font-semibold">
                            Confidence
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-[#695F52] leading-relaxed mb-3">
                        {res.condition.overview}
                      </p>

                      {/* Matching Symptoms Tags */}
                      <div className="space-y-1.5 mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8375] block">
                          Matching Symptoms ({res.matchedSymptoms.length}):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {res.matchedSymptoms.map((s) => (
                            <span
                              key={s.id}
                              className="text-[10px] font-semibold bg-[#F0EAE0] text-[#42392E] px-2 py-0.5 rounded-md"
                            >
                              ✓ {s.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Recommended Diagnostic Tests at Sopan */}
                      <div className="bg-white p-2.5 rounded-xl border border-[#E3DACB] text-[11px] text-[#544B3F] space-y-1 mb-3">
                        <span className="font-bold text-[#27231E] flex items-center gap-1 text-[10px] uppercase tracking-wider">
                          <Activity className="w-3 h-3 text-[#8E5B3E]" />
                          Hospital Diagnostic Pathways:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-[10px] text-[#695F52]">
                          {res.condition.diagnosticInvestigations.slice(0, 2).map((inv, idx) => (
                            <li key={idx}>{inv}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Dr. Sanjay Sopan Varade's Advice */}
                      <div className="bg-[#FAF5EE] p-2.5 rounded-xl border border-[#EADCC8] text-[11px] text-[#544B3F] space-y-1">
                        <span className="font-bold text-[#8E5B3E] flex items-center gap-1 text-[10px]">
                          <Stethoscope className="w-3 h-3 text-[#8E5B3E]" />
                          Chief Neurologist Clinical Guidance:
                        </span>
                        <p className="text-[11px] text-[#5A5043] italic leading-relaxed">
                          "{res.condition.doctorAdvice}"
                        </p>
                      </div>

                      {/* VR Hotspot / Disease Link if available */}
                      {res.condition.vrHotspotId && onExploreVR && (
                        <div className="mt-2 pt-2 border-t border-[#EAE1D2] flex justify-end">
                          <button
                            type="button"
                            onClick={() => onExploreVR(res.condition.vrHotspotId)}
                            className="text-[10px] font-bold text-[#8E5B3E] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Glasses className="w-3 h-3" />
                            View 3D Anatomical Correlate in VR Brain
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Direct Booking & Action Buttons */}
            {assessmentResults.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-[#EBE3D5]">
                <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E3DACB] flex items-center gap-3">
                  <img
                    src="/DSC_0050.png"
                    alt="Dr. Sanjay Sopan Varade"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/doctor-photo.png';
                    }}
                    className="w-12 h-12 rounded-xl object-cover border border-[#D8C9B4] shrink-0 shadow-2xs"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-serif font-bold text-[#27231E]">
                      Dr. Sanjay Sopan Varade (MD, DM Neuro)
                    </div>
                    <div className="text-[11px] text-[#8E5B3E] font-semibold">
                      OPD Fee: ₹1,500 • 35+ Yrs Practice
                    </div>
                    <div className="text-[10px] text-[#73695B]">
                      Sopan Hospital, Mumbai Naka, Nashik
                    </div>
                  </div>
                </div>

                {/* Primary CTA: Book OPD Consultation */}
                <button
                  id="btn-book-opd-from-symptom-checker"
                  onClick={handleScheduleAppointment}
                  className="w-full py-3 px-4 bg-[#8E5B3E] hover:bg-[#784A31] text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book OPD Consultation with Dr. Varade (₹1,500)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Secondary CTA: WhatsApp Triage */}
                <button
                  id="btn-whatsapp-triage-send"
                  type="button"
                  onClick={handleWhatsAppTriage}
                  className="w-full py-2.5 px-4 bg-white hover:bg-[#F9F5EE] text-[#456254] border border-[#CBD8CE] rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-[#456254]" />
                  <span>Share Triage Summary via WhatsApp (9405545521)</span>
                </button>
              </div>
            )}
          </div>

          {/* Medical Disclaimer Note */}
          <div className="bg-[#FAF8F5] border border-[#E3DACB] rounded-2xl p-3.5 text-[11px] text-[#786E61] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#42392E]">
              <Info className="w-3.5 h-3.5 text-[#8E5B3E]" />
              <span>Responsible Medical Use Disclaimer</span>
            </div>
            <p className="leading-relaxed">
              This interactive symptom checker is designed solely for informational screening and triage orientation. 
              It does not constitute a formal medical diagnosis or replace clinical judgment by a licensed neurologist. 
              Always consult <strong>Dr. Sanjay Sopan Varade (MD, DM Neuro)</strong> or your nearest emergency center for acute symptoms.
            </p>
          </div>
        </div>
      </div>

      {/* Printable Clinical Triage Slip Modal */}
      {showTriageSummaryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#D8CEBE] shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#EAE2D5]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8E5B3E]">
                  SOPAN HOSPITAL & NEUROLOGY INSTITUTE
                </span>
                <h3 className="text-xl font-serif font-bold text-[#27231E]">
                  Patient Pre-Consultation Triage Slip
                </h3>
                <p className="text-[11px] text-[#6E6557]">
                  Mumbai Naka, Nashik • Chief Consultant: Dr. Sanjay Sopan Varade (MD, DM Neuro)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTriageSummaryModal(false)}
                className="p-1.5 rounded-full hover:bg-[#F5EFE4] text-[#8C8375] hover:text-[#27231E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Content Section */}
            <div ref={printSlipRef} className="space-y-4 text-xs">
              {/* Patient Demographics & Timeline */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E8E0D2]">
                <div>
                  <span className="text-[#8C8375] text-[10px] block">Patient Age</span>
                  <span className="font-bold text-[#27231E]">{patientAge} Years</span>
                </div>
                <div>
                  <span className="text-[#8C8375] text-[10px] block">Symptom Onset</span>
                  <span className="font-bold text-[#27231E]">{onset}</span>
                </div>
                <div>
                  <span className="text-[#8C8375] text-[10px] block">Reported Severity</span>
                  <span className="font-bold text-[#27231E]">{severity}</span>
                </div>
                <div>
                  <span className="text-[#8C8375] text-[10px] block">Triage Status</span>
                  <span className={`font-bold ${activeRedFlags.length > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {activeRedFlags.length > 0 ? 'Red Flag Alert' : 'Standard Priority'}
                  </span>
                </div>
              </div>

              {/* Reported Symptoms */}
              <div className="space-y-1.5">
                <span className="font-bold text-[#27231E] uppercase text-[10px] tracking-wider block">
                  Reported Signs & Symptoms ({selectedSymptoms.length}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedSymptoms.map((s) => (
                    <div key={s.id} className="p-2 bg-[#FAF8F5] rounded-xl border border-[#E8E0D2] flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold text-[#27231E] block">{s.name}</span>
                        <span className="text-[10px] text-[#786E61]">{s.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Condition Matches */}
              <div className="space-y-2">
                <span className="font-bold text-[#27231E] uppercase text-[10px] tracking-wider block">
                  Automated Algorithmic Differential Matches:
                </span>
                {assessmentResults.slice(0, 3).map((res, i) => (
                  <div key={res.condition.id} className="p-3 bg-[#FCFAF7] rounded-xl border border-[#E2D6C5] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#27231E]">
                        #{i + 1} {res.condition.name}
                      </span>
                      <span className="font-black text-[#8E5B3E]">{res.matchScore}% Match</span>
                    </div>
                    <p className="text-[11px] text-[#695F52] leading-snug">
                      {res.condition.overview}
                    </p>
                    <div className="text-[10px] text-[#544B3F]">
                      <strong>Suggested Sopan Hospital Tests:</strong> {res.condition.diagnosticInvestigations.join(', ')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Doctor's Signature / Stamp Box */}
              <div className="pt-4 border-t border-[#EAE2D5] flex items-end justify-between">
                <div>
                  <span className="text-[10px] text-[#8C8375] block">Attending Department:</span>
                  <span className="font-bold text-[#27231E] text-xs">
                    {topMatch ? topMatch.condition.recommendedDepartment : 'Comprehensive Stroke & Neurology'}
                  </span>
                  <span className="text-[10px] text-[#8C8375] block mt-0.5">
                    Sopan Hospital, Shrihari Kute Marg, Near Sandip Hotel, Mumbai Naka, Nashik
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-bold text-[#27231E]">Dr. Sanjay Sopan Varade</div>
                  <div className="text-[10px] text-[#8E5B3E]">MD, DM Neuro (CMC Vellore)</div>
                  <div className="text-[9px] text-[#8C8375]">Director & Chief Neurologist</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-[#EAE2D5]">
              <button
                type="button"
                onClick={handlePrintSlip}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#342E28] hover:bg-[#201C18] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save Slip
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowTriageSummaryModal(false);
                  handleScheduleAppointment();
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#8E5B3E] hover:bg-[#784A31] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                Proceed to Book OPD (₹1,500)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
