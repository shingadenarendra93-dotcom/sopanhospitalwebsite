import React, { useState } from 'react';
import { 
  Star, 
  CheckCircle2, 
  MessageSquare, 
  ThumbsUp, 
  Award, 
  ShieldCheck, 
  Plus, 
  Filter, 
  Search, 
  X,
  Building2
} from 'lucide-react';
import { GoogleReview } from '../types';
import { INITIAL_REVIEWS } from '../data/mockData';

interface GoogleReviewsProps {
  onOpenSuccessStories?: () => void;
}

export const GoogleReviews: React.FC<GoogleReviewsProps> = ({ onOpenSuccessStories }) => {
  const [reviews, setReviews] = useState<GoogleReview[]>(INITIAL_REVIEWS);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All');
  const [showWriteModal, setShowWriteModal] = useState<boolean>(false);

  // New review form
  const [authorName, setAuthorName] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [deptTreated, setDeptTreated] = useState<string>('Comprehensive Stroke Center');
  const [doctorMentioned, setDoctorMentioned] = useState<string>('Dr. Sanjay Sopan Varade MD, DM Neuro');
  const [reviewText, setReviewText] = useState<string>('');

  const departments = [
    'All',
    'Comprehensive Stroke Center',
    'Neuro-Oncology & Brain Tumors',
    'Movement Disorders & Parkinson’s',
    'Epilepsy & EEG Monitoring'
  ];

  const filteredReviews = reviews.filter(r => {
    return selectedDeptFilter === 'All' || r.departmentTreated === selectedDeptFilter;
  });

  const handleLike = (id: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, helpfulCount: r.helpfulCount + 1 } : r));
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

    setReviews([newRev, ...reviews]);
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
              <span className="text-xs text-[#7A746B] font-semibold">(1,420+ Verified Reviews)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#27231E]">
              Google Verified Patient & Family Testimonials
            </h2>
            <p className="text-[#635E56] text-xs sm:text-sm mt-0.5">
              Read authentic experiences from patients treated at Sopan Hospital Neurology & Neuroscience Institute under Dr. Sanjay Sopan Varade (MD, DM Neuro • 35+ Years Experience).
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 w-full lg:w-auto">
          <button
            id="btn-write-google-review"
            onClick={() => setShowWriteModal(true)}
            className="px-5 py-3 rounded-2xl bg-[#8E5B3E] hover:bg-[#784A31] text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Star className="w-4 h-4 fill-white" />
            Write a Google Review
          </button>
        </div>
      </div>

      {/* Department Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {departments.map(dept => (
          <button
            key={dept}
            onClick={() => setSelectedDeptFilter(dept)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedDeptFilter === dept
                ? 'bg-[#342E28] text-white shadow-xs'
                : 'bg-white text-[#635E56] hover:bg-[#F7F4EE] border border-[#E6E0D4]'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredReviews.map(rev => (
          <div
            key={rev.id}
            id={`review-card-${rev.id}`}
            className="bg-white border border-[#E6E0D4] rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#EFE9DF] text-[#7A5338] font-bold text-sm flex items-center justify-center border border-[#DFD6C8]">
                    {rev.authorName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#27231E] flex items-center gap-1.5">
                      {rev.authorName}
                      {rev.verifiedPatient && (
                        <span className="text-[#456254] text-[11px]" title="Google Verified Hospital Patient">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#456254]" />
                        </span>
                      )}
                    </h4>
                    <span className="text-[11px] text-[#8C8478]">{rev.relativeTime} • Google Review</span>
                  </div>
                </div>

                <div className="flex items-center text-amber-500">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#3E3A34] leading-relaxed italic">
                "{rev.reviewText}"
              </p>
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
                <label className="font-semibold text-slate-700 block mb-1">Your Full Name (or Family Member) *</label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  placeholder="e.g. Ramesh Kulkarni"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Star Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-slate-700 ml-2">{rating} out of 5 Stars</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department Treated</label>
                  <select
                    value={deptTreated}
                    onChange={e => setDeptTreated(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Comprehensive Stroke Center">Comprehensive Stroke Center</option>
                    <option value="Neuro-Oncology & Brain Tumors">Neuro-Oncology & Brain Tumors</option>
                    <option value="Movement Disorders & Parkinson’s">Movement Disorders & Parkinson’s</option>
                    <option value="Epilepsy & EEG Monitoring">Epilepsy & EEG Monitoring</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Doctor / Specialist</label>
                  <input
                    type="text"
                    value={doctorMentioned}
                    onChange={e => setDoctorMentioned(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Share Your Experience & Recovery Story *</label>
                <textarea
                  rows={4}
                  required
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Share details about the doctors, surgery, stroke response, nursing care, or patient portal..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWriteModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
                >
                  Publish to Google Reviews
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
