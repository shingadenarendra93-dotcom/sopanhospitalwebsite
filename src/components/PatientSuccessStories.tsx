import React, { useState, useEffect } from 'react';
import { 
  Star, 
  CheckCircle2, 
  Heart, 
  ThumbsUp, 
  Award, 
  ShieldCheck, 
  Calendar, 
  User, 
  Share2, 
  Volume2, 
  Play, 
  Pause, 
  ArrowRight, 
  Sparkles, 
  MessageCircle, 
  FileText, 
  Plus, 
  X,
  Stethoscope
} from 'lucide-react';
import { PatientSuccessStory } from '../types';
import { INITIAL_SUCCESS_STORIES } from '../data/mockData';

interface PatientSuccessStoriesProps {
  onBookAppointment?: () => void;
  onOpenReviews?: () => void;
  onOpenWhatsApp?: () => void;
}

export const PatientSuccessStories: React.FC<PatientSuccessStoriesProps> = ({
  onBookAppointment,
  onOpenReviews,
  onOpenWhatsApp
}) => {
  const [stories, setStories] = useState<PatientSuccessStory[]>(INITIAL_SUCCESS_STORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeAudioStoryId, setActiveAudioStoryId] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [copiedStoryId, setCopiedStoryId] = useState<string | null>(null);
  const [doctorPhoto, setDoctorPhoto] = useState<string | null>(() => {
    return localStorage.getItem('sopan_dr_custom_photo') || null;
  });

  useEffect(() => {
    const handleSync = () => {
      setDoctorPhoto(localStorage.getItem('sopan_dr_custom_photo') || null);
    };
    window.addEventListener('sopan_photo_updated', handleSync);
    return () => window.removeEventListener('sopan_photo_updated', handleSync);
  }, []);

  // New story submission form state
  const [newPatientName, setNewPatientName] = useState<string>('');
  const [newCity, setNewCity] = useState<string>('Nashik');
  const [newCategory, setNewCategory] = useState<PatientSuccessStory['conditionCategory']>('Stroke Recovery');
  const [newDiagnosis, setNewDiagnosis] = useState<string>('');
  const [newQuote, setNewQuote] = useState<string>('');
  const [newCaregiverReflection, setNewCaregiverReflection] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const categories = [
    'All',
    'Stroke Recovery',
    'Epilepsy & Seizures',
    'Parkinson & Movement',
    'Migraine & Nerve Pain',
    'Neuro-Rehab'
  ];

  const filteredStories = stories.filter(story => {
    return selectedCategory === 'All' || story.conditionCategory === selectedCategory;
  });

  const handleUpvote = (id: string) => {
    setStories(prev =>
      prev.map(s => (s.id === id ? { ...s, helpfulUpvotes: s.helpfulUpvotes + 1 } : s))
    );
  };

  const handleToggleAudio = (id: string) => {
    setActiveAudioStoryId(activeAudioStoryId === id ? null : id);
  };

  const handleShare = (story: PatientSuccessStory) => {
    const text = `Read this inspiring neurological recovery story from Sopan Hospital Nashik under Dr. Sanjay Sopan Varade (MD, DM Neuro): "${story.quote.slice(0, 100)}..."`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedStoryId(story.id);
      setTimeout(() => setCopiedStoryId(null), 2500);
    }
  };

  const handleSubmitNewStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuote.trim() || !newPatientName.trim()) return;

    const createdStory: PatientSuccessStory = {
      id: `story-${Date.now()}`,
      patientIdentifier: `${newPatientName.trim()}, ${newCity.trim()}`,
      conditionCategory: newCategory,
      clinicalDiagnosis: newDiagnosis.trim() || 'Comprehensive Neurological Care',
      procedureOrTreatment: 'Personalized Clinical Protocol & Management',
      attendingConsultant: 'Dr. Sanjay Sopan Varade (MD, DM Neuro)',
      rating: 5.0,
      timeframe: 'Recent Recovery Follow-Up',
      milestoneBadge: 'Clinical Recovery & Health Restored',
      initialPresentation: 'Sought second opinion and expert treatment at Sopan Hospital Nashik.',
      intervention: 'Thorough evaluation, neuro-diagnostic workup, and targeted treatment by Dr. Sanjay Sopan Varade.',
      recoveryOutcome: 'Marked symptom resolution and successful recovery.',
      quote: newQuote.trim(),
      caregiverReflection: newCaregiverReflection.trim() ? newCaregiverReflection.trim() : undefined,
      metrics: [
        { label: 'Overall Condition', before: 'Acute / Debilitating', after: 'Optimal & Stable' },
        { label: 'Care Experience', before: 'Uncertainty', after: '5.0★ Compassionate' }
      ],
      datePublished: 'Just now',
      verifiedHospitalTreated: true,
      helpfulUpvotes: 1
    };

    setStories([createdStory, ...stories]);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowSubmitModal(false);
      setNewPatientName('');
      setNewDiagnosis('');
      setNewQuote('');
      setNewCaregiverReflection('');
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Warm & Silent Atmosphere Hero Banner */}
      <div className="bg-[#FAF7F2] border border-[#E6E0D4] rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#EFE9DF]/60 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE9DF] text-[#7A5338] text-xs font-semibold border border-[#DFD6C8]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8E5B3E]" />
              Verified Sopan Hospital Clinical Journeys • Nashik
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#27231E] tracking-tight">
              Patient Success Stories
            </h2>

            <p className="text-sm text-[#635E56] leading-relaxed">
              Every recovery is a testament to timely neurological intervention, precision neuro-diagnostics, 
              and unwavering compassionate care by <strong className="text-[#27231E] font-semibold">Dr. Sanjay Sopan Varade (MD, DM Neuro • 35+ Years Experience)</strong>. 
              Read verified accounts from stroke survivors, seizure-free individuals, and families whose lives have been restored.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-[#635E56]">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center text-amber-500">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-bold text-[#27231E]">5.0 / 5.0 Rating</span>
              </div>
              <span className="text-[#D3CABE]">•</span>
              <div className="flex items-center gap-1 text-[#456254] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% Verified Hospital Cases</span>
              </div>
              <span className="text-[#D3CABE]">•</span>
              <div className="flex items-center gap-1 text-[#7A5338] font-medium">
                <Award className="w-3.5 h-3.5" />
                <span>Shrihari Kute Marg, Mumbai Naka, Nashik</span>
              </div>
            </div>
          </div>

          {/* Action Hub */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-5 py-3 rounded-2xl bg-[#342E28] hover:bg-[#201D1A] text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Share Your Recovery Story
            </button>

            {onOpenReviews && (
              <button
                onClick={onOpenReviews}
                className="px-5 py-2.5 rounded-2xl bg-white hover:bg-[#F5F1E9] text-[#27231E] border border-[#DDD6C9] text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                View Google Reviews (4.9★)
              </button>
            )}

            {onBookAppointment && (
              <button
                onClick={onBookAppointment}
                className="px-5 py-2.5 rounded-2xl bg-[#8E5B3E] hover:bg-[#784A31] text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-3.5 h-3.5" />
                Book OPD Consultation (₹1,500)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Condition Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-[#342E28] text-white shadow-sm'
                : 'bg-white text-[#635E56] hover:text-[#27231E] hover:bg-[#F7F4EE] border border-[#E6E0D4]'
            }`}
          >
            {cat}
            {cat === 'All' ? ` (${stories.length})` : ` (${stories.filter(s => s.conditionCategory === cat).length})`}
          </button>
        ))}
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredStories.map(story => {
          const isAudioPlaying = activeAudioStoryId === story.id;
          return (
            <div
              key={story.id}
              className="bg-white border border-[#E6E0D4] rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              {/* Header: Patient Info & Rating */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-base sm:text-lg text-[#27231E]">
                        {story.patientIdentifier}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md bg-[#EFE9DF] text-[#7A5338] text-[10px] font-semibold">
                        {story.conditionCategory}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#635E56] mt-0.5">
                      <span className="font-medium text-[#456254] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#456254]" />
                        Verified Case
                      </span>
                      <span>•</span>
                      <span>{story.timeframe}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#FAF7F2] border border-[#E6E0D4] shrink-0">
                    <div className="flex items-center text-amber-500">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[#27231E] ml-1">5.0</span>
                  </div>
                </div>

                {/* Milestone Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F4EFE6] text-[#6E4930] text-xs font-semibold border border-[#E4DCD0]">
                  <Sparkles className="w-3.5 h-3.5 text-[#8E5B3E]" />
                  <span>{story.milestoneBadge}</span>
                </div>

                {/* Testimonial Quote */}
                <div className="bg-[#FAF8F5] border-l-3 border-[#8E5B3E] p-4 rounded-r-2xl text-xs sm:text-sm text-[#3E3A34] italic leading-relaxed">
                  "{story.quote}"
                </div>

                {/* Caregiver Reflection (if present) */}
                {story.caregiverReflection && (
                  <div className="bg-[#F8F6F1] border border-[#E8E2D7] p-3 rounded-xl text-xs text-[#5C564E] space-y-1">
                    <div className="text-[11px] font-semibold text-[#7A5338] flex items-center gap-1.5">
                      <Heart className="w-3 h-3 fill-[#8E5B3E] text-[#8E5B3E]" />
                      Caregiver Voice
                    </div>
                    <p className="italic">{story.caregiverReflection}</p>
                  </div>
                )}

                {/* Clinical Before & After Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#EFE9DF]">
                  {story.metrics.map((metric, idx) => (
                    <div key={idx} className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EAE3D6] text-center">
                      <div className="text-[10px] text-[#7A746B] font-medium leading-tight">{metric.label}</div>
                      <div className="text-[11px] text-rose-700 font-medium line-through mt-0.5">
                        {metric.before}
                      </div>
                      <div className="text-xs font-bold text-[#456254] mt-0.5">
                        {metric.after}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Physician & Procedure attribution */}
                <div className="text-xs text-[#635E56] pt-1">
                  <span className="font-medium text-[#27231E]">Treatment: </span>
                  {story.procedureOrTreatment}
                  <div className="text-[11px] text-[#7A5338] font-medium mt-0.5">
                    Attending Neurologist: {story.attendingConsultant}
                  </div>
                </div>
              </div>

              {/* Card Footer with Audio Note & Social Actions */}
              <div className="pt-3 border-t border-[#EFE9DF] flex items-center justify-between gap-3">
                {/* Audio voice note player toggle */}
                <button
                  onClick={() => handleToggleAudio(story.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isAudioPlaying
                      ? 'bg-[#456254] text-white'
                      : 'bg-[#F2ECE1] text-[#554E45] hover:bg-[#EAE2D5]'
                  }`}
                >
                  {isAudioPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Playing Audio Note (0:38)</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-[#7A5338]" />
                      <span>Listen to Audio Snippet</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleShare(story)}
                    className="p-2 rounded-xl text-[#7A746B] hover:text-[#27231E] hover:bg-[#F2ECE1] transition-colors relative"
                    title="Copy story quote"
                  >
                    <Share2 className="w-4 h-4" />
                    {copiedStoryId === story.id && (
                      <span className="absolute -top-7 right-0 px-2 py-0.5 bg-[#27231E] text-white text-[10px] rounded shadow-md whitespace-nowrap">
                        Copied to clipboard
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => handleUpvote(story.id)}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#E6E0D4] text-xs text-[#554E45] font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-[#8E5B3E]" />
                    <span>{story.helpfulUpvotes}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Restorative Doctor Profile Card with User Photo & Consultation Details */}
      <div className="bg-[#FAF7F2] border border-[#E6E0D4] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={(doctorPhoto && !doctorPhoto.includes('svg')) ? doctorPhoto : '/DSC_0050.JPG'}
              alt="Dr. Sanjay Sopan Varade (MD, DM Neuro)"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('doctor-photo.png')) {
                  target.src = '/doctor-photo.png';
                }
              }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#D8CFC2] shrink-0 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-serif font-bold text-[#27231E]">
                  Dr. Sanjay Sopan Varade
                </h4>
                <span className="px-2 py-0.5 rounded bg-[#EAE2D5] text-[#6E4930] text-[10px] font-bold">
                  MD, DM Neuro (CMC Vellore)
                </span>
              </div>
              <p className="text-xs text-[#635E56] mt-0.5">
                Director & Chief Consultant Neurologist • Sopan Hospital & Neurology Institute Nashik
              </p>
              <div className="flex items-center gap-4 text-xs text-[#7A5338] font-medium mt-1">
                <span>OPD Consultation: <strong className="text-[#27231E]">₹1,500</strong></span>
                <span>•</span>
                <span>Experience: <strong className="text-[#27231E]">17+ Years</strong></span>
                <span>•</span>
                <span>Stroke Hotline: <strong className="text-[#27231E]">0253 2317364</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {onBookAppointment && (
              <button
                onClick={onBookAppointment}
                className="w-full md:w-auto px-5 py-2.5 rounded-2xl bg-[#8E5B3E] hover:bg-[#784A31] text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Book Consultation (₹1,500)
              </button>
            )}

            {onOpenWhatsApp && (
              <button
                onClick={onOpenWhatsApp}
                className="w-full md:w-auto px-4 py-2.5 rounded-2xl bg-[#456254] hover:bg-[#374E43] text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp (9405545521)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Share Your Recovery Story Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-lg w-full border border-[#E6E0D4] shadow-2xl p-6 sm:p-8 space-y-5 relative">
            <button
              onClick={() => setShowSubmitModal(false)}
              className="absolute top-5 right-5 text-[#888176] hover:text-[#27231E] p-1.5 rounded-full hover:bg-[#EFE9DF]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-serif font-bold text-[#27231E]">
                Share Your Patient Journey
              </h3>
              <p className="text-xs text-[#635E56]">
                Your experience gives hope to others facing neurological conditions. Every submission is reviewed by Sopan Hospital care team.
              </p>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#E5ECE8] text-[#456254] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-[#27231E]">Story Shared Successfully</h4>
                <p className="text-xs text-[#635E56]">
                  Thank you for sharing your story of healing at Sopan Hospital with Dr. Sanjay Sopan Varade.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitNewStory} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-[#27231E] block mb-1">Patient Name / Initials *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh P."
                      value={newPatientName}
                      onChange={(e) => setNewPatientName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCD5C9] text-[#27231E] focus:outline-none focus:border-[#8E5B3E]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#27231E] block mb-1">City / Region *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nashik / Dhule"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCD5C9] text-[#27231E] focus:outline-none focus:border-[#8E5B3E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-[#27231E] block mb-1">Condition Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as PatientSuccessStory['conditionCategory'])}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCD5C9] text-[#27231E] focus:outline-none focus:border-[#8E5B3E]"
                    >
                      <option value="Stroke Recovery">Stroke Recovery</option>
                      <option value="Epilepsy & Seizures">Epilepsy & Seizures</option>
                      <option value="Parkinson & Movement">Parkinson & Movement</option>
                      <option value="Migraine & Nerve Pain">Migraine & Nerve Pain</option>
                      <option value="Neuro-Rehab">Neuro-Rehab</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-[#27231E] block mb-1">Diagnosis / Treatment</label>
                    <input
                      type="text"
                      placeholder="e.g. Ischemic Stroke Thrombolysis"
                      value={newDiagnosis}
                      onChange={(e) => setNewDiagnosis(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCD5C9] text-[#27231E] focus:outline-none focus:border-[#8E5B3E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-[#27231E] block mb-1">Your Story & Experience *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe how Dr. Sanjay Sopan Varade and Sopan Hospital helped your recovery..."
                    value={newQuote}
                    onChange={(e) => setNewQuote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCD5C9] text-[#27231E] focus:outline-none focus:border-[#8E5B3E] resize-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#27231E] block mb-1">Caregiver Note (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Family member perspective on recovery"
                    value={newCaregiverReflection}
                    onChange={(e) => setNewCaregiverReflection(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCD5C9] text-[#27231E] focus:outline-none focus:border-[#8E5B3E]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-4 py-2 rounded-xl bg-white border border-[#DCD5C9] text-[#635E56] font-semibold hover:bg-[#F2ECE1]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#342E28] hover:bg-[#201D1A] text-white font-semibold shadow-sm"
                  >
                    Submit Story
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
