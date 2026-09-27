import React, { useState, useEffect } from 'react';
import { 
  Star, 
  CheckCircle2, 
  ThumbsUp, 
  ShieldCheck, 
  X, 
  HeartHandshake, 
  Lock, 
  UserX
} from 'lucide-react';
import { GoogleReview } from '../types';
import { 
  loadStoredReviews, 
  saveStoredReviews 
} from '../utils/feedbackUtils';
import { PatientExperienceFeedbackModalOrSection } from './PatientExperienceFeedback';

interface GoogleReviewsProps {
  onOpenSuccessStories?: () => void;
}

export const GoogleReviews: React.FC<GoogleReviewsProps> = ({ onOpenSuccessStories }) => {
  const [reviews, setReviews] = useState<GoogleReview[]>(() => loadStoredReviews());
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All');
  const [sourceFilter, setSourceFilter] = useState<'All' | 'Google' | 'AnonymousFeedback'>('All');
  const [showWriteModal, setShowWriteModal] = useState<boolean>(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);

  // New review form
  const [authorName, setAuthorName] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [deptTreated, setDeptTreated] = useState<string>('Comprehensive Stroke Center');
  const [doctorMentioned, setDoctorMentioned] = useState<string>('Dr. Sanjay Sopan Varade MD, DM Neuro');
  const [reviewText, setReviewText] = useState<string>('');

  useEffect(() => {
    const handleSync = () => {
      setReviews(loadStoredReviews());
    };
    window.addEventListener('sopan_reviews_updated', handleSync);
    window.addEventListener('sopan_patient_feedback_updated', handleSync);
    return () => {
      window.removeEventListener('sopan_reviews_updated', handleSync);
      window.removeEventListener('sopan_patient_feedback_updated', handleSync);
    };
  }, []);

  const departments = [
    'All',
    'Comprehensive Stroke Center',
    'Neuro-Oncology & Brain Tumors',
    'Movement Disorders & Parkinson’s',
    'Epilepsy & EEG Monitoring'
  ];

  const filteredReviews = reviews.filter(r => {
    const matchesDept = selectedDeptFilter === 'All' || r.departmentTreated === selectedDeptFilter;
    const matchesSource = 
      sourceFilter === 'All' ? true :
      sourceFilter === 'Google' ? !r.isAnonymousFeedback :
      r.isAnonymousFeedback === true;
    return matchesDept && matchesSource;
  });

  const anonymousCount = reviews.filter(r => r.isAnonymousFeedback).length;
  const googleCount = reviews.filter(r => !r.isAnonymousFeedback).length;

  const handleLike = (id: string) => {
    const updated = reviews.map(r => r.id === id ? { ...r, helpfulCount: r.helpfulCount + 1 } : r);
    setReviews(updated);
    saveStoredReviews(updated);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    const newRev: GoogleReview = {
      id: `rev-${Date.now()}`,
      authorName: authorName.trim() || 'Verified Patient Family',
      rating,
      relativeTime: 'Just now',
      departmentTreated: deptTreated,
      verifiedPatient: true,
      reviewText: reviewText.trim(),
      doctorMentioned,
      helpfulCount: 0
    };

    const updated = [newRev, ...reviews];
    setReviews(updated);
    saveStoredReviews(updated);
    setShowWriteModal(false);
    setAuthorName('');
    setReviewText('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Google Reviews Badge */}
      <div className="bg-[#FAF7F2] border border-[#E6E0D4] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-start gap-5">
          {/* Google G Logo Style Visual */}
          <div className="w-16 h-16 rounded-2xl bg-white border border-[#E6E0D4] shadow-xs flex items-center justify-center p-3 shrink-0">
            <svg viewBox="0 0 24 24" className="w-10 h-10">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl sm:text-3xl font-serif font-black text-[#27231E]">4.9</span>
              <div className="flex items-center text-amber-500">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <span className="text-xs text-[#7A746B] font-semibold">(1,420+ Verified Reviews & Feedback)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#27231E]">
              Google Verified Patient & Experience Testimonials
            </h2>
            <p className="text-[#635E56] text-xs sm:text-sm mt-0.5">
              Authentic reviews and anonymous post-consultation feedback from outpatients and families treated under Chief Neurologist <strong className="text-[#27231E]">Dr. Sanjay Sopan Varade (MD, DM Neuro)</strong> at Mumbai Naka, Nashik.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 w-full lg:w-auto">
          <button
            id="btn-patient-experience-feedback"
            onClick={() => setShowFeedbackModal(true)}
            className="px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2 shrink-0"
            title="Submit anonymous post-consultation feedback"
          >
            <HeartHandshake className="w-4 h-4 text-emerald-200" />
            <span>Post-Consultation Feedback</span>
          </button>

          <button
            id="btn-write-google-review"
            onClick={() => setShowWriteModal(true)}
            className="px-5 py-3 rounded-2xl bg-[#8E5B3E] hover:bg-[#784A31] text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Star className="w-4 h-4 fill-white" />
            <span>Write a Google Review</span>
          </button>
        </div>
      </div>

      {/* Anonymous Feedback Invitation Card */}
      <div className="bg-[#FAF7F2] border border-[#E6E0D4] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-sm text-[#27231E]">
                Recent OPD or Tele-Consultation Patient?
              </h3>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                100% Anonymous Voice
              </span>
            </div>
            <p className="text-xs text-[#635E56] mt-0.5">
              Share your anonymous reflection on Dr. Sanjay Sopan Varade's consultation, wait times, and hospital care in 60 seconds.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowFeedbackModal(true)}
          className="px-4 py-2 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] text-white text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-2xs transition-colors"
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Give Anonymous Feedback</span>
        </button>
      </div>

      {/* Filter Bars (Source & Department) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Source Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF7F2] border border-[#E6E0D4] rounded-2xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSourceFilter('All')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              sourceFilter === 'All' ? 'bg-[#342E28] text-white shadow-2xs' : 'text-[#635E56] hover:text-[#27231E]'
            }`}
          >
            All Testimonials ({reviews.length})
          </button>
          <button
            type="button"
            onClick={() => setSourceFilter('AnonymousFeedback')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
              sourceFilter === 'AnonymousFeedback' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-[#635E56] hover:text-[#27231E]'
            }`}
          >
            <UserX className="w-3.5 h-3.5" />
            <span>Anonymous Feedback ({anonymousCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setSourceFilter('Google')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              sourceFilter === 'Google' ? 'bg-[#342E28] text-white shadow-2xs' : 'text-[#635E56] hover:text-[#27231E]'
            }`}
          >
            Google Reviews ({googleCount})
          </button>
        </div>

        {/* Department Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDeptFilter(dept)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedDeptFilter === dept
                  ? 'bg-[#8E5B3E] text-white shadow-xs'
                  : 'bg-white text-[#635E56] hover:bg-[#F7F4EE] border border-[#E6E0D4]'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredReviews.map(rev => (
          <div
            key={rev.id}
            id={`review-card-${rev.id}`}
            className={`bg-white border rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow ${
              rev.isAnonymousFeedback ? 'border-emerald-200/90 ring-1 ring-emerald-500/10' : 'border-[#E6E0D4]'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl font-bold text-sm flex items-center justify-center border shrink-0 ${
                    rev.isAnonymousFeedback 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                      : 'bg-[#EFE9DF] text-[#7A5338] border-[#DFD6C8]'
                  }`}>
                    {rev.isAnonymousFeedback ? <UserX className="w-5 h-5 text-emerald-700" /> : rev.authorName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#27231E] flex flex-wrap items-center gap-1.5">
                      {rev.authorName}
                      {rev.isAnonymousFeedback ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5 text-emerald-600" />
                          Anonymous Post-Consultation
                        </span>
                      ) : (
                        rev.verifiedPatient && (
                          <span className="text-[#456254] text-[11px]" title="Google Verified Hospital Patient">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#456254]" />
                          </span>
                        )
                      )}
                    </h4>
                    <span className="text-[11px] text-[#8C8478]">
                      {rev.relativeTime} • {rev.isAnonymousFeedback ? 'Verified Outpatient Feedback' : 'Google Review'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center text-amber-500 shrink-0">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>

              {/* Feedback dimensions scorecard if available */}
              {rev.feedbackDimensions && (
                <div className="my-2.5 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE3D6] grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
                  {rev.feedbackDimensions.doctorAttentiveness && (
                    <div>
                      <span className="text-[#7A746B] block">Doctor Attentiveness:</span>
                      <strong className="text-[#27231E]">{rev.feedbackDimensions.doctorAttentiveness}.0 ★</strong>
                    </div>
                  )}
                  {rev.feedbackDimensions.explanationClarity && (
                    <div>
                      <span className="text-[#7A746B] block">Explanation:</span>
                      <strong className="text-[#27231E]">{rev.feedbackDimensions.explanationClarity}.0 ★</strong>
                    </div>
                  )}
                  {rev.feedbackDimensions.waitTimeExperience && (
                    <div>
                      <span className="text-[#7A746B] block">Wait Time:</span>
                      <strong className="text-[#27231E]">{rev.feedbackDimensions.waitTimeExperience}.0 ★</strong>
                    </div>
                  )}
                  {rev.feedbackDimensions.staffCourtesy && (
                    <div>
                      <span className="text-[#7A746B] block">Staff Courtesy:</span>
                      <strong className="text-[#27231E]">{rev.feedbackDimensions.staffCourtesy}.0 ★</strong>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs sm:text-sm text-[#3E3A34] leading-relaxed italic">
                "{rev.reviewText}"
              </p>

              {rev.wouldRecommend && (
                <div className="mt-2 text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3 text-emerald-600" />
                  <span>Recommends Dr. Sanjay Sopan Varade & Sopan Hospital</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#EFE9DF] flex items-center justify-between text-xs">
              <div className="text-[11px] text-[#7A746B]">
                Department: <strong className="text-[#7A5338]">{rev.departmentTreated}</strong>
                {rev.doctorMentioned && (
                  <span className="block text-[#635E56]">Attending: {rev.doctorMentioned}</span>
                )}
              </div>

              <button
                onClick={() => handleLike(rev.id)}
                className="flex items-center gap-1 text-[#8C8478] hover:text-[#27231E] px-2.5 py-1 rounded-xl hover:bg-[#F2ECE1] transition-colors"
                title="Mark review as helpful"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-[#8E5B3E]" />
                <span className="text-[11px] font-semibold">{rev.helpfulCount}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Write a Review Modal */}
      {showWriteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                Write a Google Review for Sopan Hospital
              </h3>
              <button onClick={() => setShowWriteModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  placeholder="e.g. Anand K. Joshi"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-[#8E5B3E]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-slate-800 ml-2">{rating}.0 / 5.0</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Department Treated In</label>
                <select
                  value={deptTreated}
                  onChange={e => setDeptTreated(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-[#8E5B3E]"
                >
                  <option value="Comprehensive Stroke Center">Comprehensive Stroke Center</option>
                  <option value="Movement Disorders & Parkinson’s">Movement Disorders & Parkinson’s</option>
                  <option value="Epilepsy & EEG Monitoring">Epilepsy & EEG Monitoring</option>
                  <option value="Neuro-Oncology & Brain Tumors">Neuro-Oncology & Brain Tumors</option>
                  <option value="Spine & Peripheral Nerve">Spine & Peripheral Nerve</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Attending Neurologist</label>
                <input
                  type="text"
                  value={doctorMentioned}
                  onChange={e => setDoctorMentioned(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Your Review</label>
                <textarea
                  required
                  rows={4}
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Share details of your consultation, hospital speed, or recovery experience under Dr. Sanjay Varade..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-[#8E5B3E]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWriteModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] text-white font-bold"
                >
                  Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Experience Feedback Modal */}
      {showFeedbackModal && (
        <PatientExperienceFeedbackModalOrSection
          isModal={true}
          onClose={() => setShowFeedbackModal(false)}
          onFeedbackSubmitted={() => {
            setReviews(loadStoredReviews());
          }}
          onViewGoogleReviews={() => {
            setShowFeedbackModal(false);
            setSourceFilter('AnonymousFeedback');
          }}
        />
      )}
    </div>
  );
};
