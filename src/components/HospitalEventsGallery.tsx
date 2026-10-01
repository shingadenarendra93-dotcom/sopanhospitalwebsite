import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  MapPin, 
  User, 
  Users, 
  Tag, 
  Search, 
  Sparkles, 
  ExternalLink, 
  X, 
  ChevronRight, 
  CheckCircle2, 
  Camera, 
  Share2, 
  MessageCircle,
  Filter,
  Eye,
  Plus,
  Trash2,
  ShieldCheck,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  Info
} from 'lucide-react';
import { HospitalEvent } from '../types';
import { 
  loadHospitalEvents, 
  addHospitalEventPhoto, 
  removeHospitalEventPhoto, 
  resetHospitalEventsToDefault,
  syncHospitalEventsWithFirestore,
  PRESET_OCCASION_PHOTOS,
  OCCASION_CATEGORIES 
} from '../utils/hospitalEventsUtils';
import { isAdminLoggedIn, getAdminSession } from '../utils/opdSlotUtils';
import { OpdAdminPortalModal } from './OpdAdminPortalModal';

interface HospitalEventsGalleryProps {
  onBookConsultation?: () => void;
  onOpenWhatsApp?: (msg?: string) => void;
}

export const HospitalEventsGallery: React.FC<HospitalEventsGalleryProps> = ({
  onBookConsultation,
  onOpenWhatsApp
}) => {
  const [eventsList, setEventsList] = useState<HospitalEvent[]>(() => loadHospitalEvents());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeEventModal, setActiveEventModal] = useState<HospitalEvent | null>(null);
  
  // Admin state
  const [isAdmin, setIsAdmin] = useState<boolean>(() => isAdminLoggedIn());
  const [adminUser, setAdminUser] = useState(() => getAdminSession());
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Photo Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Special Occasion');
  const [newDate, setNewDate] = useState<string>(() => {
    const d = new Date();
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  });
  const [newLocation, setNewLocation] = useState<string>('Sopan Hospital, Shrihari Kute Marg, Mumbai Naka, Nashik');
  const [newLeadClinician, setNewLeadClinician] = useState<string>('Dr. Sanjay Sopan Varade (MD, DM Neuro)');
  const [newAttendees, setNewAttendees] = useState<string>('150+ Attendees & Dignitaries');
  const [newImageUrl, setNewImageUrl] = useState<string>(PRESET_OCCASION_PHOTOS[0].url);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [newSummary, setNewSummary] = useState<string>('');
  const [newHighlights, setNewHighlights] = useState<string>('');
  const [newTags, setNewTags] = useState<string>('SopanHospital, SpecialOccasion, Nashik');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);

  // Remove Photo Confirmation State
  const [photoToDelete, setPhotoToDelete] = useState<HospitalEvent | null>(null);

  useEffect(() => {
    // Initial fetch from Firestore to keep photos synchronized
    syncHospitalEventsWithFirestore().then(synced => {
      if (synced && synced.length > 0) {
        setEventsList(synced);
      }
    }).catch(() => {});

    const handleEventsSync = () => {
      setEventsList(loadHospitalEvents());
    };
    const handleAuthSync = () => {
      setIsAdmin(isAdminLoggedIn());
      setAdminUser(getAdminSession());
    };

    window.addEventListener('sopan_hospital_events_updated', handleEventsSync);
    window.addEventListener('sopan_admin_session_changed', handleAuthSync);
    window.addEventListener('storage', handleEventsSync);

    return () => {
      window.removeEventListener('sopan_hospital_events_updated', handleEventsSync);
      window.removeEventListener('sopan_admin_session_changed', handleAuthSync);
      window.removeEventListener('storage', handleEventsSync);
    };
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredEvents = useMemo(() => {
    return eventsList.filter(evt => {
      const matchesCategory = selectedCategory === 'All' || evt.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        evt.title.toLowerCase().includes(q) ||
        evt.summary.toLowerCase().includes(q) ||
        evt.location.toLowerCase().includes(q) ||
        evt.tags.some(t => t.toLowerCase().includes(q))
      );
      return matchesCategory && matchesSearch;
    });
  }, [eventsList, selectedCategory, searchQuery]);

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      triggerToast('Please select an image smaller than 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setNewImageUrl(result);
      setCustomImageUrl('');
      setSelectedPresetIndex(-1);
    };
    reader.readAsDataURL(file);
  };

  // Submit new photo
  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      triggerToast('Please enter an occasion title.');
      return;
    }

    const finalImage = customImageUrl.trim() || newImageUrl;
    if (!finalImage) {
      triggerToast('Please provide a photo image URL or select a preset.');
      return;
    }

    const highlightsArray = newHighlights
      .split('\n')
      .map(h => h.trim().replace(/^[-•*]\s*/, ''))
      .filter(Boolean);

    const tagsArray = newTags
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const created = addHospitalEventPhoto({
      title: newTitle.trim(),
      category: newCategory as any,
      date: newDate.trim(),
      location: newLocation.trim(),
      leadClinician: newLeadClinician.trim(),
      summary: newSummary.trim() || `Special occasion photograph captured at Sopan Hospital: ${newTitle.trim()}`,
      attendeesCount: newAttendees.trim() || 'Distinguished Guests & Staff',
      imageUrl: finalImage,
      tags: tagsArray.length > 0 ? tagsArray : ['HospitalOccasion', 'SopanNeurology'],
      keyHighlights: highlightsArray.length > 0 ? highlightsArray : [
        'Organized under the clinical direction of Dr. Sanjay Sopan Varade (MD, DM Neuro).',
        'Commemorating medical achievements and community outreach at Sopan Hospital Nashik.'
      ]
    });

    setEventsList(loadHospitalEvents());
    setIsAddModalOpen(false);
    triggerToast(`Photograph for "${created.title}" successfully added to hospital occasion gallery!`);

    // Reset Form
    setNewTitle('');
    setNewSummary('');
    setNewHighlights('');
    setCustomImageUrl('');
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!photoToDelete) return;
    const deletedTitle = photoToDelete.title;
    removeHospitalEventPhoto(photoToDelete.id);
    setEventsList(loadHospitalEvents());
    setPhotoToDelete(null);
    if (activeEventModal?.id === photoToDelete.id) {
      setActiveEventModal(null);
    }
    triggerToast(`Photograph "${deletedTitle}" removed from hospital gallery.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-top-4 duration-200 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-[#2c221a] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-[#8E5B3E]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-amber-200 text-xs font-semibold backdrop-blur-xs">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              Hospital Occasion Archives & Special Events Gallery
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-white">
              Sopan Hospital Special Occasion Photographs
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Curated photographic documentation of 35+ years of milestones, annual World Stroke Day summits, cath lab inaugurations, Parkinson’s community camps, and festival celebrations led by <strong>Dr. Sanjay Sopan Varade (MD, DM Neuro)</strong> in Nashik.
            </p>
          </div>

          {/* Quick Admin Add Photo Button / Status */}
          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            {isAdmin ? (
              <button
                type="button"
                id="btn-admin-add-photo"
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-[#8E5B3E] hover:from-amber-500 hover:to-[#7A4B30] text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4 text-amber-200" />
                <span>+ Add Special Occasion Photo</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowAdminLoginModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs backdrop-blur-xs flex items-center justify-center gap-2 transition-colors"
                title="Authenticate as Hospital Administrator to add or remove special occasion photos"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-300" />
                <span>Admin Login: Manage Photos</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hospital Admin Active Management Bar */}
      {isAdmin && (
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-cyan-300">
              Hospital Admin Photo Manager Active ({adminUser?.username || 'Official Staff'})
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-300 hidden sm:inline">
              Authorized to upload, edit, and remove special occasion photographs ({eventsList.length} photos in archive)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Photo
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset gallery photos back to default 35+ years clinical archive?')) {
                  resetHospitalEventsToDefault();
                  setEventsList(loadHospitalEvents());
                  triggerToast('Hospital event photographs reset to default archives.');
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              title="Reset gallery photos to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#FAF7F2] border border-[#E6E0D4] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {OCCASION_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#342E28] text-white shadow-2xs'
                  : 'bg-white text-[#635E56] hover:bg-[#EFE9DF] border border-[#E6E0D4]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#8C8478] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search occasion photos, camps..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D8CFC2] bg-white text-xs text-[#27231E] focus:outline-hidden focus:ring-2 focus:ring-[#8E5B3E]/30"
          />
        </div>
      </div>

      {/* Events Photograph Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 text-slate-400 space-y-3">
          <Camera className="w-10 h-10 mx-auto text-slate-300" />
          <h4 className="text-sm font-bold text-slate-700">No hospital event photographs found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery ? `No photos matching "${searchQuery}".` : 'No photos available in this category.'}
          </p>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Photo to this Category
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(evt => (
            <div
              key={evt.id}
              className="group bg-white rounded-3xl border border-[#E6E0D4] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative"
            >
              <div>
                {/* Event Image with Badges */}
                <div 
                  onClick={() => setActiveEventModal(evt)}
                  className="relative h-56 overflow-hidden bg-slate-100 cursor-pointer"
                >
                  <img
                    src={evt.imageUrl}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.currentTarget;
                      if (!target.src.includes('unsplash.com')) {
                        target.src = 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80';
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
                  
                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 text-[#7A5338] backdrop-blur-xs border border-white/50 shadow-2xs">
                    {evt.category}
                  </span>

                  {/* Admin Delete Action Button on photo card */}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoToDelete(evt);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white shadow-md hover:scale-105 transition-all z-10"
                      title="Remove this photo from hospital gallery"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Attendees Count Badge */}
                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/60 text-white backdrop-blur-xs">
                    <Users className="w-3.5 h-3.5 text-cyan-300" />
                    {evt.attendeesCount}
                  </span>

                  {/* Click to zoom indicator */}
                  <div className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs">
                    <Eye className="w-3.5 h-3.5 text-[#8E5B3E]" />
                  </div>
                </div>

                {/* Content Section */}
                <div 
                  onClick={() => setActiveEventModal(evt)}
                  className="p-5 space-y-3 cursor-pointer"
                >
                  <div className="flex items-center justify-between text-[11px] text-[#7A746B]">
                    <span className="flex items-center gap-1 font-semibold text-[#8E5B3E]">
                      <Calendar className="w-3.5 h-3.5" />
                      {evt.date}
                    </span>
                    <span className="flex items-center gap-1 truncate max-w-[150px]">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      {evt.location.split(',')[0]}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-[#27231E] group-hover:text-[#8E5B3E] transition-colors line-clamp-2 leading-snug">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-[#635E56] line-clamp-2 leading-relaxed">
                    {evt.summary}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {evt.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF7F2] text-[#7A5338] border border-[#EAE3D6] font-medium">
                        #{tag}
                      </span>
                    ))}
                    {evt.addedBy && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold ml-auto">
                        Official Upload
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer with Details & Admin Delete */}
              <div className="px-5 py-3 bg-[#FAF7F2] border-t border-[#EAE3D6] flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setActiveEventModal(evt)}
                  className="font-bold text-[#8E5B3E] hover:text-[#784A31] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>View Details & Full Photo</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setPhotoToDelete(evt)}
                    className="text-rose-600 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-50 font-semibold flex items-center gap-1 text-[11px] transition-colors"
                    title="Remove this photo"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADD SPECIAL OCCASION PHOTO (HOSPITAL ADMIN) */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 my-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white rounded-t-3xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Add Special Occasion Hospital Photograph</h3>
                  <p className="text-[11px] text-slate-400">Hospital Administration Archive Upload Panel</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddPhotoSubmit} className="p-6 space-y-4 text-xs text-slate-700">
              {/* Title */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Occasion Title / Event Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Annual World Stroke Day Conclave 2026 or Diwali Neuro Ward Felicitation"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#8E5B3E]/30"
                />
              </div>

              {/* Category & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Occasion Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#8E5B3E]/30"
                  >
                    <option value="Special Occasion">Special Occasion</option>
                    <option value="Stroke Awareness">Stroke Awareness</option>
                    <option value="Clinical CME">Clinical CME</option>
                    <option value="Free Medical Camp">Free Medical Camp</option>
                    <option value="Facility Inauguration">Facility Inauguration</option>
                    <option value="Survivor Meet">Survivor Meet</option>
                    <option value="Hospital Celebration">Hospital Celebration</option>
                    <option value="Doctor Felicitation">Doctor Felicitation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    placeholder="e.g. 29 October 2026"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#8E5B3E]/30"
                  />
                </div>
              </div>

              {/* Location & Dignitary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Venue / Hospital Pavilion *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                    placeholder="e.g. Auditorium, Sopan Hospital, Mumbai Naka, Nashik"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#8E5B3E]/30"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Principal Lead / Dignitary
                  </label>
                  <input
                    type="text"
                    value={newLeadClinician}
                    onChange={e => setNewLeadClinician(e.target.value)}
                    placeholder="Dr. Sanjay Sopan Varade (MD, DM Neuro)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#8E5B3E]/30"
                  />
                </div>
              </div>

              {/* Attendees */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Attendees / Crowd Count
                </label>
                <input
                  type="text"
                  value={newAttendees}
                  onChange={e => setNewAttendees(e.target.value)}
                  placeholder="e.g. 250+ Doctors, Patients & Dignitaries"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#8E5B3E]/30"
                />
              </div>

              {/* Photo Source Selection: Presets OR Custom URL OR File Upload */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E6E0D4] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#27231E] flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#8E5B3E]" />
                    Photograph Image Source *
                  </label>
                  <span className="text-[11px] text-[#7A746B]">Select preset, paste URL, or upload</span>
                </div>

                {/* Preset Chips */}
                <div>
                  <span className="text-[11px] font-semibold text-[#635E56] block mb-1.5">
                    Quick Curated Clinical Presets:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRESET_OCCASION_PHOTOS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedPresetIndex(idx);
                          setNewImageUrl(p.url);
                          setCustomImageUrl('');
                          if (!newTitle) setNewTitle(p.label);
                          if (newCategory === 'Special Occasion') setNewCategory(p.category);
                        }}
                        className={`p-1.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                          selectedPresetIndex === idx && !customImageUrl
                            ? 'border-[#8E5B3E] ring-2 ring-[#8E5B3E]/30 bg-white'
                            : 'border-[#DFD6C8] bg-white/70 hover:bg-white'
                        }`}
                      >
                        <img src={p.url} alt={p.label} className="w-full h-14 object-cover rounded-lg mb-1" />
                        <span className="text-[10px] font-semibold text-[#27231E] line-clamp-1 block leading-tight">
                          {p.label}
                        </span>
                        {selectedPresetIndex === idx && !customImageUrl && (
                          <div className="absolute top-2 right-2 w-4 h-4 bg-[#8E5B3E] text-white rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom URL or Upload */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-[#635E56] block mb-1">
                      Or Custom Image Web URL:
                    </label>
                    <input
                      type="url"
                      value={customImageUrl}
                      onChange={e => {
                        setCustomImageUrl(e.target.value);
                        setSelectedPresetIndex(-1);
                      }}
                      placeholder="https://example.com/hospital-photo.jpg"
                      className="w-full px-3 py-1.5 bg-white border border-[#DFD6C8] rounded-xl text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#635E56] block mb-1">
                      Or Upload from Device:
                    </label>
                    <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-[#DFD6C8] rounded-xl text-xs text-[#8E5B3E] font-semibold hover:bg-amber-50 cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose Image File...</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Live Preview of Selected Photo */}
                <div className="pt-2 border-t border-[#EAE3D6] flex items-center gap-3">
                  <div className="w-20 h-16 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                    <img
                      src={customImageUrl || newImageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = PRESET_OCCASION_PHOTOS[0].url;
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-[#635E56]">
                    <div className="font-bold text-[#27231E]">Photograph Ready for Gallery</div>
                    <div className="text-[10px] text-[#7A746B] truncate max-w-sm">
                      {customImageUrl || newImageUrl}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary / Description */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Occasion Summary & Highlights *
                </label>
                <textarea
                  rows={2}
                  required
                  value={newSummary}
                  onChange={e => setNewSummary(e.target.value)}
                  placeholder="Detailed clinical synopsis, dignitaries present, patient felicitation details..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#8E5B3E]/30"
                />
              </div>

              {/* Key Milestones */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Key Milestones (1 per line)
                </label>
                <textarea
                  rows={2}
                  value={newHighlights}
                  onChange={e => setNewHighlights(e.target.value)}
                  placeholder="• 24/7 Stroke response unit expanded&#10;• 50+ Stroke survivors felicitated&#10;• Free memory test kits distributed"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#8E5B3E]/30"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={e => setNewTags(e.target.value)}
                  placeholder="StrokeSummit, VaradeNeuro, NashikMedical"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] text-white font-bold shadow-md flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Photo to Gallery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: CONFIRM DELETE PHOTO (HOSPITAL ADMIN) */}
      {/* ======================================================== */}
      {photoToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Remove Hospital Photograph?</h3>
                <p className="text-[11px] text-slate-500">Confirm deletion from public gallery</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <img
                src={photoToDelete.imageUrl}
                alt={photoToDelete.title}
                className="w-16 h-14 object-cover rounded-xl shrink-0"
              />
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-900 truncate">{photoToDelete.title}</div>
                <div className="text-[11px] text-slate-500">{photoToDelete.category} • {photoToDelete.date}</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove this photograph from the hospital gallery? This action will remove it from public view and will be logged in the administrator audit trail.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPhotoToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Yes, Remove Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: EVENT DETAILS & HIGH-RES PHOTO MODAL */}
      {/* ======================================================== */}
      {activeEventModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 my-auto">
            {/* Modal Image Hero */}
            <div className="relative h-64 sm:h-72 w-full bg-slate-950 overflow-hidden shrink-0">
              <img
                src={activeEventModal.imageUrl}
                alt={activeEventModal.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />
              
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {isAdmin && (
                  <button
                    onClick={() => {
                      setPhotoToDelete(activeEventModal);
                    }}
                    className="p-2 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white transition-colors"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setActiveEventModal(null)}
                  className="p-2 rounded-full bg-black/50 hover:bg-black text-white transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-xs border border-white/30 text-amber-200">
                  {activeEventModal.category}
                </span>
                <h3 className="font-serif font-black text-lg sm:text-xl leading-tight">
                  {activeEventModal.title}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 flex-1">
              {/* Event Metadata Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E6E0D4] text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8A8173] block">Date</span>
                  <span className="font-semibold text-[#27231E] flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-[#8E5B3E]" />
                    {activeEventModal.date}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8A8173] block">Attendance</span>
                  <span className="font-semibold text-[#27231E] flex items-center gap-1 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-cyan-700" />
                    {activeEventModal.attendeesCount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8A8173] block">Venue</span>
                  <span className="font-semibold text-[#27231E] flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    {activeEventModal.location}
                  </span>
                </div>
              </div>

              {/* Lead Clinician */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs">
                <div className="w-9 h-9 rounded-full bg-[#8E5B3E] text-white flex items-center justify-center font-bold shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-amber-900 font-bold">Principal Event Chair</div>
                  <div className="font-bold text-slate-900">{activeEventModal.leadClinician}</div>
                </div>
              </div>

              {/* Detailed Summary */}
              <div className="space-y-1.5 text-xs text-slate-700 leading-relaxed">
                <h4 className="font-bold text-slate-900 text-sm">Event Overview & Clinical Purpose</h4>
                <p>{activeEventModal.summary}</p>
              </div>

              {/* Key Highlights */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Key Milestones & Outcomes</h4>
                <div className="space-y-2">
                  {activeEventModal.keyHighlights.map((hl, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                {activeEventModal.tags.map((t, idx) => (
                  <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
              <button
                type="button"
                onClick={() => {
                  const text = `Hello Sopan Hospital, I would like more information regarding the event: ${activeEventModal.title}`;
                  if (onOpenWhatsApp) {
                    onOpenWhatsApp(text);
                  } else {
                    window.open(`https://wa.me/919405545521?text=${encodeURIComponent(text)}`, '_blank');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-2xs"
              >
                <MessageCircle className="w-4 h-4" />
                Inquire on WhatsApp
              </button>

              <div className="flex items-center gap-2">
                {onBookConsultation && (
                  <button
                    onClick={() => {
                      setActiveEventModal(null);
                      onBookConsultation();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] text-white font-bold shadow-2xs"
                  >
                    Book OPD Consultation
                  </button>
                )}
                <button
                  onClick={() => setActiveEventModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Modal if requested */}
      <OpdAdminPortalModal
        isOpen={showAdminLoginModal}
        initialTab="gallery"
        onClose={() => setShowAdminLoginModal(false)}
      />
    </div>
  );
};
