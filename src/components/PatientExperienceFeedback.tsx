import React, { useState } from 'react';
import { 
  Star, 
  ShieldCheck, 
  HeartHandshake, 
  MessageSquare, 
  Lock, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Send, 
  Stethoscope, 
  Building2, 
  ThumbsUp, 
  UserX, 
  Eye, 
  EyeOff, 
  ChevronRight,
  ArrowRight,
  HelpCircle,
  X
} from 'lucide-react';
import { PatientExperienceFeedback, DepartmentType } from '../types';
import { submitPatientExperienceFeedback, calculateFeedbackAverages, loadStoredFeedback } from '../utils/feedbackUtils';
import { saveFeedbackToFirestore } from '../lib/firebase';

interface PatientExperienceFeedbackProps {
  onFeedbackSubmitted?: (feedback: PatientExperienceFeedback) => void;
  onViewGoogleReviews?: () => void;
  initialDepartment?: DepartmentType;
  initialToken?: string;
  isModal?: boolean;
  onClose?: () => void;
}

export const PatientExperienceFeedbackModalOrSection: React.FC<PatientExperienceFeedbackProps> = ({
  onFeedbackSubmitted,
  onViewGoogleReviews,
  initialDepartment,
  initialToken,
  isModal = false,
  onClose
}) => {
  const [feedbackList, setFeedbackList] = useState<PatientExperienceFeedback[]>(() => loadStoredFeedback());
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);

  // Form State
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [authorAlias, setAuthorAlias] = useState<string>('Anonymous OPD Outpatient');
  const [patientContact, setPatientContact] = useState<string>('');
  const [consultationType, setConsultationType] = useState<'In-Person Hospital OPD' | 'Tele-Neurology Video Consultation' | 'Acute Stroke Emergency' | 'Neuro-Diagnostic Testing'>('In-Person Hospital OPD');
  const [department, setDepartment] = useState<DepartmentType>(initialDepartment || 'Comprehensive Stroke Center');
  const [doctorConsulted] = useState<string>('Dr. Sanjay Sopan Varade MD, DM Neuro');
  const [tokenOrVisitRef, setTokenOrVisitRef] = useState<string>(initialToken || '');

  // Ratings
  const [overallRating, setOverallRating] = useState<number>(5);
  const [doctorAttentiveness, setDoctorAttentiveness] = useState<number>(5);
  const [explanationClarity, setExplanationClarity] = useState<number>(5);
  const [waitTimeExperience, setWaitTimeExperience] = useState<number>(5);
  const [staffCourtesy, setStaffCourtesy] = useState<number>(5);
  const [facilityCleanliness, setFacilityCleanliness] = useState<number>(5);

  // Qualitative feedback
  const [whatWentWell, setWhatWentWell] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string>('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean>(true);
  const [syndicateToPublicReviews, setSyndicateToPublicReviews] = useState<boolean>(true);

  const averages = calculateFeedbackAverages(feedbackList);

  const departmentsList: DepartmentType[] = [
    'Comprehensive Stroke Center',
    'Epilepsy & EEG Monitoring',
    'Movement Disorders & Parkinson’s',
    'Neuro-Oncology & Brain Tumors',
    'Spine & Peripheral Nerve',
    'Pediatric Neurology',
    'Neuro-Rehabilitation'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatWentWell.trim()) return;

    const newFeedback: PatientExperienceFeedback = {
      id: `fb-${Date.now()}`,
      submittedAt: 'Just now',
      isAnonymous,
      authorAlias: isAnonymous ? (authorAlias.trim() || 'Anonymous Patient') : (authorAlias.trim() || 'Verified Patient'),
      consultationType,
      department,
      doctorConsulted,
      overallRating,
      ratings: {
        doctorAttentiveness,
        explanationClarity,
        waitTimeExperience,
        staffCourtesy,
        facilityCleanliness
      },
      whatWentWell: whatWentWell.trim(),
      suggestionsForImprovement: suggestions.trim() || undefined,
      wouldRecommend,
      tokenOrVisitRef: tokenOrVisitRef.trim() || undefined,
      syndicateToPublicReviews
    };

    const result = submitPatientExperienceFeedback(newFeedback);
    setFeedbackList(result.feedbackList);
    setLastSubmittedId(newFeedback.id);
    setIsSubmitted(true);

    // Persist to Firestore database
    saveFeedbackToFirestore({
      overallRating: newFeedback.overallRating,
      drAttentiveness: newFeedback.ratings.doctorAttentiveness,
      diagnosisClarity: newFeedback.ratings.explanationClarity,
      waitTimeScore: newFeedback.ratings.waitTimeExperience,
      staffCourtesy: newFeedback.ratings.staffCourtesy,
      cleanlinessFacility: newFeedback.ratings.facilityCleanliness,
      recommend: newFeedback.wouldRecommend,
      reviewText: newFeedback.whatWentWell,
      improvementSuggestions: newFeedback.suggestionsForImprovement || '',
      consultationType: newFeedback.consultationType,
      department: newFeedback.department,
      opdToken: newFeedback.tokenOrVisitRef || '',
      isAnonymous: newFeedback.isAnonymous,
      authorName: newFeedback.authorAlias
    });

    if (onFeedbackSubmitted) {
      onFeedbackSubmitted(newFeedback);
    }
  };

  const renderStarSelector = (
    label: string, 
    value: number, 
    onChange: (val: number) => void,
    description?: string
  ) => {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 py-2.5 border-b border-[#EAE3D6]/70 last:border-none">
        <div>
          <div className="text-xs font-bold text-[#27231E]">{label}</div>
          {description && <div className="text-[11px] text-[#7A746B]">{description}</div>}
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="p-1 text-slate-300 hover:text-amber-400 focus:outline-none transition-colors"
              title={`${star} out of 5 stars`}
            >
              <Star
                className={`w-5 h-5 transition-transform hover:scale-110 ${
                  star <= value ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                }`}
              />
            </button>
          ))}
          <span className="font-mono font-bold text-xs text-[#27231E] w-6 text-right">
            {value}.0
          </span>
        </div>
      </div>
    );
  };

  const content = (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#FAF7F2] border border-[#E6E0D4] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE9DF] text-[#7A5338] text-xs font-semibold mb-2 border border-[#DFD6C8]">
            <HeartHandshake className="w-3.5 h-3.5 text-[#8E5B3E]" />
            Continuous Clinical Quality & Patient Voice
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#27231E] tracking-tight">
            Patient Experience & Consultation Feedback
          </h2>
          <p className="text-[#635E56] text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Your honest feedback directly informs clinical protocols, waiting time management, and caregiver communication under <strong className="text-[#27231E]">Dr. Sanjay Sopan Varade (MD, DM Neuro)</strong> at Sopan Hospital & Neurology Institute.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white border border-[#E6E0D4] p-3.5 rounded-2xl text-xs flex items-center gap-3 shadow-xs">
            <Lock className="w-6 h-6 text-[#456254] shrink-0" />
            <div>
              <div className="font-bold text-[#27231E]">100% Anonymous Option</div>
              <div className="text-[#7A746B] text-[11px]">Zero identifiable health data is shared publicly</div>
            </div>
          </div>
        </div>
      </div>

      {/* Aggregate Experience Metrics Scorecard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#E6E0D4] shadow-xs">
          <div className="text-[10px] uppercase font-bold text-[#8C8478]">Overall Care</div>
          <div className="text-xl font-serif font-black text-[#27231E] flex items-center gap-1 mt-1">
            <span>{averages.overall}</span>
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <div className="text-[10px] text-[#7A746B] mt-0.5">Based on {averages.totalSubmissions} returns</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E6E0D4] shadow-xs">
          <div className="text-[10px] uppercase font-bold text-[#8C8478]">Doctor Care</div>
          <div className="text-xl font-serif font-black text-[#27231E] flex items-center gap-1 mt-1">
            <span>{averages.doctorAttentiveness}</span>
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <div className="text-[10px] text-[#7A746B] mt-0.5">Attentiveness & listen</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E6E0D4] shadow-xs">
          <div className="text-[10px] uppercase font-bold text-[#8C8478]">Clarity</div>
          <div className="text-xl font-serif font-black text-[#27231E] flex items-center gap-1 mt-1">
            <span>{averages.explanationClarity}</span>
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <div className="text-[10px] text-[#7A746B] mt-0.5">Condition & medicines</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E6E0D4] shadow-xs">
          <div className="text-[10px] uppercase font-bold text-[#8C8478]">Wait Time</div>
          <div className="text-xl font-serif font-black text-[#27231E] flex items-center gap-1 mt-1">
            <span>{averages.waitTimeExperience}</span>
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <div className="text-[10px] text-[#7A746B] mt-0.5">OPD token efficiency</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E6E0D4] shadow-xs">
          <div className="text-[10px] uppercase font-bold text-[#8C8478]">Staff Courtesy</div>
          <div className="text-xl font-serif font-black text-[#27231E] flex items-center gap-1 mt-1">
            <span>{averages.staffCourtesy}</span>
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <div className="text-[10px] text-[#7A746B] mt-0.5">Nursing & front desk</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E6E0D4] shadow-xs">
          <div className="text-[10px] uppercase font-bold text-[#8C8478]">Recommend</div>
          <div className="text-xl font-serif font-black text-[#456254] flex items-center gap-1 mt-1">
            <span>{averages.recommendPercentage}%</span>
            <ThumbsUp className="w-4 h-4 text-[#456254]" />
          </div>
          <div className="text-[10px] text-[#7A746B] mt-0.5">Patient satisfaction</div>
        </div>
      </div>

      {/* Main Feedback Form or Confirmation Slip */}
      {isSubmitted ? (
        <div className="bg-white border-2 border-emerald-200 rounded-3xl p-8 sm:p-10 shadow-xs text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-serif font-bold text-[#27231E]">
              Thank You for Sharing Your Experience
            </h3>
            <p className="text-xs sm:text-sm text-[#635E56] leading-relaxed">
              Your anonymous consultation reflection has been recorded. It helps Dr. Sanjay Sopan Varade and the Sopan Hospital clinical team maintain the highest standards of empathetic neurological care in Nashik.
            </p>
          </div>

          {syndicateToPublicReviews && (
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6E0D4] text-xs text-[#635E56] flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Your testimonial has been verified and published to the <strong>Google Reviews & Patient Testimonials Wall</strong> as an anonymous outpatient post.
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {onViewGoogleReviews && (
              <button
                type="button"
                onClick={onViewGoogleReviews}
                className="px-6 py-3 rounded-2xl bg-[#8E5B3E] hover:bg-[#784A31] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-colors"
              >
                <span>View on Google Reviews Wall</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setWhatWentWell('');
                setSuggestions('');
              }}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-[#FAF7F2] border border-[#E6E0D4] text-xs font-semibold text-[#27231E] transition-colors"
            >
              Submit Another Feedback
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-[#E6E0D4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Anonymity Controls */}
          <div className="bg-[#FAF7F2] p-4 sm:p-5 rounded-2xl border border-[#EAE3D6] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isAnonymous ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {isAnonymous ? <UserX className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#27231E]">
                    {isAnonymous ? 'Anonymous Post-Consultation Mode (Active)' : 'Public Identified Submission'}
                  </div>
                  <div className="text-[11px] text-[#7A746B]">
                    {isAnonymous 
                      ? 'Your name and contact will remain strictly confidential and will not be displayed on public review boards.' 
                      : 'Your name will appear next to your review.'}
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded text-[#8E5B3E] focus:ring-[#8E5B3E] border-gray-300"
                />
                <span className="text-xs font-semibold text-[#27231E]">Keep Anonymous</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-[#6E675D] mb-1">
                  {isAnonymous ? 'Anonymous Alias / Display Label' : 'Your Full Name'}
                </label>
                <input
                  type="text"
                  value={authorAlias}
                  onChange={e => setAuthorAlias(e.target.value)}
                  placeholder={isAnonymous ? 'e.g. Anonymous OPD Outpatient, Stroke Patient Family' : 'e.g. Ramesh Kulkarni'}
                  className="w-full px-3.5 py-2 bg-white border border-[#DFD6C8] rounded-xl text-xs text-[#27231E] focus:ring-2 focus:ring-[#8E5B3E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6E675D] mb-1">
                  Optional OPD Token / Reference (For internal quality audit only)
                </label>
                <input
                  type="text"
                  value={tokenOrVisitRef}
                  onChange={e => setTokenOrVisitRef(e.target.value)}
                  placeholder="e.g. STRK-14 or 2026-09-25"
                  className="w-full px-3.5 py-2 bg-white border border-[#DFD6C8] rounded-xl text-xs text-[#27231E] focus:ring-2 focus:ring-[#8E5B3E] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Consultation Context */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#27231E] mb-1.5">
                Consultation Type
              </label>
              <select
                value={consultationType}
                onChange={e => setConsultationType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DFD6C8] rounded-xl text-xs font-medium text-[#27231E] focus:ring-2 focus:ring-[#8E5B3E]"
              >
                <option value="In-Person Hospital OPD">In-Person Hospital OPD (Mumbai Naka)</option>
                <option value="Tele-Neurology Video Consultation">Tele-Neurology Video Consultation</option>
                <option value="Acute Stroke Emergency">Acute Stroke Emergency Triage</option>
                <option value="Neuro-Diagnostic Testing">Neuro-Diagnostic Testing (32-Slice CT / Video-EEG)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#27231E] mb-1.5">
                Department / Specialty Focus
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DFD6C8] rounded-xl text-xs font-medium text-[#27231E] focus:ring-2 focus:ring-[#8E5B3E]"
              >
                {departmentsList.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Attending Consultant Affirmation */}
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Stethoscope className="w-4 h-4 text-[#8E5B3E]" />
              <div>
                <span className="font-bold text-[#27231E]">{doctorConsulted}</span>
                <span className="text-[11px] text-[#7A746B] block">Director & Chief Consultant Neurologist (35+ Years Clinical Practice)</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Verified OPD Specialist
            </span>
          </div>

          {/* Detailed Experience Rating Dimensions */}
          <div className="space-y-1 bg-[#FAF7F2]/60 p-4 sm:p-5 rounded-2xl border border-[#EAE3D6]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A5338] mb-2 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-current" />
              Detailed Clinical Experience Dimensions (1 - 5 Stars)
            </h4>

            {renderStarSelector(
              '1. Overall Consultation Satisfaction *',
              overallRating,
              setOverallRating,
              'General satisfaction with your hospital visit and clinical outcome.'
            )}

            {renderStarSelector(
              '2. Doctor’s Attentiveness & Bedside Manner',
              doctorAttentiveness,
              setDoctorAttentiveness,
              'Did Dr. Sanjay Sopan Varade listen carefully to symptoms and medical history?'
            )}

            {renderStarSelector(
              '3. Clarity of Diagnosis & Medical Explanation',
              explanationClarity,
              setExplanationClarity,
              'Were neuro CT reports, EEG findings, and prescriptions clearly explained?'
            )}

            {renderStarSelector(
              '4. OPD Wait Time & Queue Efficiency',
              waitTimeExperience,
              setWaitTimeExperience,
              'Experience with the 50-patient descending slot system and token wait time.'
            )}

            {renderStarSelector(
              '5. Nursing & Front Desk Staff Courtesy',
              staffCourtesy,
              setStaffCourtesy,
              'Helpfulness of reception, triage nurses, and diagnostic assistants.'
            )}

            {renderStarSelector(
              '6. Hospital Cleanliness & Safety',
              facilityCleanliness,
              setFacilityCleanliness,
              'Cleanliness of waiting area, consultation chambers, and diagnostic suites.'
            )}
          </div>

          {/* Narrative Text */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#27231E] mb-1">
                What went well during your consultation? *
              </label>
              <textarea
                required
                rows={3}
                value={whatWentWell}
                onChange={e => setWhatWentWell(e.target.value)}
                placeholder="Share your positive impressions regarding Dr. Varade's care, the hospital speed, clarity of guidance, or treatment effectiveness..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-[#8E5B3E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#27231E] mb-1">
                Suggestions for Improvement (Optional)
              </label>
              <textarea
                rows={2}
                value={suggestions}
                onChange={e => setSuggestions(e.target.value)}
                placeholder="Any recommendations for appointments, tele-consultations, signage, parking, or pharmacy..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-[#8E5B3E] focus:outline-none"
              />
            </div>
          </div>

          {/* Recommendation & Public Google Reviews Syndication Toggles */}
          <div className="space-y-2.5 pt-2 border-t border-[#EAE3D6]">
            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[#EAE3D6] bg-[#FAF7F2] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={wouldRecommend}
                onChange={e => setWouldRecommend(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#8E5B3E] focus:ring-[#8E5B3E] border-gray-300"
              />
              <div className="text-xs">
                <span className="font-bold text-[#27231E] flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5 text-[#456254]" />
                  I would recommend Dr. Sanjay Sopan Varade & Sopan Hospital to patients in need of neurology care
                </span>
                <p className="text-[11px] text-[#7A746B] mt-0.5">
                  Helps prospective patients and families make informed decisions during critical neurological decisions.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={syndicateToPublicReviews}
                onChange={e => setSyndicateToPublicReviews(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
              />
              <div className="text-xs">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Syndicate to Public Google Reviews & Patient Experience Wall
                </span>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Automatically mirrors your feedback as an anonymous verified outpatient review on the public Google Reviews tab.
                </p>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between">
            {isModal && onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-2 rounded-xl"
              >
                Cancel
              </button>
            ) : (
              <span className="text-[11px] text-[#8C8478] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#456254]" />
                Protected by NABH Medical Confidentiality
              </span>
            )}

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-[#8E5B3E] hover:bg-[#784A31] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all transform active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Submit Anonymous Feedback</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 sm:p-8 relative">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {content}
        </div>
      </div>
    );
  }

  return content;
};
