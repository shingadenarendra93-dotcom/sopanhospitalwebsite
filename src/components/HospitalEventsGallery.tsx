import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  Info,
  Maximize2,
  Minimize2,
  FileText,
  Award,
  Heart,
  BookOpen,
  Layers
} from 'lucide-react';
import { HospitalEvent } from '../types';
import { 
  loadHospitalEvents, 
  addHospitalEventPhoto, 
  removeHospitalEventPhoto, 
  resetHospitalEventsToDefault,
  syncHospitalEventsWithFirestore,
  compressImageFile,
  PRESET_OCCASION_PHOTOS,
  OCCASION_CATEGORIES,
  matchEventCategory
} from '../utils/hospitalEventsUtils';
import { subscribeToHospitalEvents } from '../lib/firebase';
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
  const [photoAddedSuccess, setPhotoAddedSuccess] = useState<string | null>(null);

  // Add Photo Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Events');
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

  // Photo Studio & Upload Window View States
  const [isPhotoStudioMaximized, setIsPhotoStudioMaximized] = useState<boolean>(false);
  const [photoStudioTab, setPhotoStudioTab] = useState<'device' | 'presets' | 'url'>('device');
  const [photoPreviewFit, setPhotoPreviewFit] = useState<'contain' | 'cover'>('contain');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  // Remove Photo Confirmation State
  const [photoToDelete, setPhotoToDelete] = useState<HospitalEvent | null>(null);

  useEffect(() => {
    // Real-Time onSnapshot subscription: live sync across all devices for added & deleted photos
    const unsubscribe = subscribeToHospitalEvents((liveEvents) => {
      if (liveEvents && liveEvents.length > 0) {
        setEventsList(liveEvents);
      }
    });

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
      unsubscribe();
      window.removeEventListener('sopan_hospital_events_updated', handleEventsSync);
      window.removeEventListener('sopan_admin_session_changed', handleAuthSync);
      window.removeEventListener('storage', handleEventsSync);
    };
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Category icon mapping
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Events':
        return <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'Awards':
        return <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'Staff':
        return <Users className="w-3.5 h-3.5 text-sky-500 shrink-0" />;
      case 'Patient Stories':
        return <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
      case 'Medical Camps':
        return <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      case 'Clinical CME':
        return <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />;
      case 'Special Occasion':
        return <Camera className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
    }
  };

  // Filtered Events with Smart Category Matching
  const filteredEvents = useMemo(() => {
    return eventsList.filter(evt => {
      const matchesCategory = matchEventCategory(evt, selectedCategory);
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

  // Dynamic count badges for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: eventsList.length };
    OCCASION_CATEGORIES.forEach(cat => {
      if (cat !== 'All') {
        counts[cat] = eventsList.filter(evt => matchEventCategory(evt, cat)).length;
      }
    });
    return counts;
  }, [eventsList]);

  // Handle local image file upload with live compression for fast Firestore sync
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      triggerToast('Please select an image smaller than 15MB.');
      return;
    }

    setUploadedFileName(file.name);
    try {
      // Compress so photo stays well under Firestore's 1MB document limit and live-syncs instantly
      const compressedDataUrl = await compressImageFile(file);
      setNewImageUrl(compressedDataUrl);
      setCustomImageUrl('');
      setSelectedPresetIndex(-1);
      triggerToast(`Photograph "${file.name}" uploaded and optimized for live sync.`);
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setNewImageUrl(result);
        setCustomImageUrl('');
        setSelectedPresetIndex(-1);
        triggerToast(`Photograph "${file.name}" uploaded successfully.`);
      };
      reader.readAsDataURL(file);
    }
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
    // Keep modal open to allow adding more photographs or viewing confirmation without interrupting workflow
    setPhotoAddedSuccess(created.title);
    triggerToast(`Photograph "${created.title}" successfully added to the hospital occasion gallery!`);

    // Reset Form for next photograph
    setNewTitle('');
    setNewSummary('');
    setNewHighlights('');
    setCustomImageUrl('');
    setNewImageUrl(PRESET_OCCASION_PHOTOS[0].url);
    setSelectedPresetIndex(0);
    setUploadedFileName('');
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
      {/* Toast Alert Portaled to body with high z-index */}
      {toastMessage && typeof document !== 'undefined' && createPortal(
        <div className="fixed top-5 right-5 sm:right-6 z-[100005] bg-slate-900/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-3.5 animate-in slide-in-from-top-4 duration-200 text-xs sm:text-sm max-w-md">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-white flex items-center gap-2">
              <span>Photo Upload Confirmed</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono uppercase font-bold">Live</span>
            </div>
            <div className="text-slate-300 text-xs mt-0.5">{toastMessage}</div>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>,
        document.body
      )}

      {/* Header Banner */}
      <div className="gallery-responsive-hero bg-gradient-to-br from-slate-900 via-slate-850 to-[#2c221a] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-[#8E5B3E]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-amber-200 text-xs font-semibold backdrop-blur-xs">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              Hospital Occasion Archives & Special Events Gallery
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-black tracking-tight text-white">
              Sopan Hospital Special Occasion Photographs
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Curated photographic documentation of 35+ years of milestones, annual World Stroke Day summits, cath lab inaugurations, Parkinson’s community camps, and festival celebrations led by <strong>Dr. Sanjay Sopan Varade (MD, DM Neuro)</strong> in Nashik.
            </p>
          </div>

          {/* Quick Admin Add Photo Button / Status */}
          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            {isAdmin ? (
              <button
                type="button"
                id="btn-admin-add-photo"
                onClick={() => setIsAddModalOpen(true)}
                className="touch-friendly-btn px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-[#8E5B3E] hover:from-amber-500 hover:to-[#7A4B30] text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-200" />
                <span>+ Add Special Occasion Photo</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowAdminLoginModal(true)}
                className="touch-friendly-btn px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs backdrop-blur-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
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
        <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
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
              className="touch-friendly-btn px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
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
              className="touch-friendly-btn px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset gallery photos to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
          </div>
        </div>
      )}

      {/* Category Filter and Search Toolbar */}
      <div className="bg-[#FAF7F2] border border-[#E6E0D4] rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          
          {/* Category Filter Header & Pills */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8173] flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#8E5B3E]" />
                Browse By Category
              </span>
              <span className="text-xs text-[#635E56] font-medium hidden sm:inline">
                {eventsList.length} Photographs in Archive
              </span>
            </div>

            {/* Category Filter Pills (Touch friendly, horizontal scrollable) */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
              {OCCASION_CATEGORIES.map(cat => {
                const count = categoryCounts[cat] || 0;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`gallery-filter-pill touch-friendly-btn px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      isSelected
                        ? 'bg-[#342E28] text-white shadow-md ring-2 ring-[#8E5B3E]/30'
                        : 'bg-white text-[#635E56] hover:bg-[#EFE9DF] hover:text-[#27231E] border border-[#E6E0D4]'
                    }`}
                  >
                    {getCategoryIcon(cat)}
                    <span>{cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                      isSelected 
                        ? 'bg-white/25 text-amber-200' 
                        : 'bg-[#F2ECE1] text-[#7A5338]'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="w-4 h-4 text-[#8C8478] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search title, venue, tags..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-[#D8CFC2] bg-white text-xs text-[#27231E] focus:outline-hidden focus:ring-2 focus:ring-[#8E5B3E]/30 min-h-[44px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Status & Reset Strip */}
        {(selectedCategory !== 'All' || searchQuery) && (
          <div className="pt-2.5 border-t border-[#EAE3D6] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[#7A746B]">Active Filter:</span>
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#342E28] text-white font-semibold text-xs shadow-2xs">
                  {getCategoryIcon(selectedCategory)}
                  <span>Category: {selectedCategory}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('All')}
                    className="ml-1 text-amber-300 hover:text-white cursor-pointer"
                    title="Clear category filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-200 font-semibold text-xs">
                  <Search className="w-3 h-3 text-amber-700" />
                  <span>Query: "{searchQuery}"</span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="ml-1 text-amber-700 hover:text-amber-950 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <span className="text-[#8A8173] font-medium ml-1">
                ({filteredEvents.length} {filteredEvents.length === 1 ? 'photograph' : 'photographs'} matching)
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="text-xs text-[#8E5B3E] hover:text-[#704229] font-bold hover:underline cursor-pointer"
            >
              Reset to All ({eventsList.length})
            </button>
          </div>
        )}
      </div>

      {/* Events Photograph Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-dashed border-slate-200 text-slate-400 space-y-3">
          <Camera className="w-10 h-10 mx-auto text-slate-300" />
          <h4 className="text-sm font-bold text-slate-700">No photographs found in "{selectedCategory}"</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery 
              ? `No images matching "${searchQuery}" in category "${selectedCategory}".` 
              : `No photographs have been cataloged under "${selectedCategory}" yet.`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="touch-friendly-btn px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              View All Photographs ({eventsList.length})
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setNewCategory(selectedCategory === 'All' ? 'Events' : selectedCategory);
                  setIsAddModalOpen(true);
                }}
                className="touch-friendly-btn px-4 py-2 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Photo to {selectedCategory === 'All' ? 'Gallery' : `"${selectedCategory}"`}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredEvents.map(evt => (
            <div
              key={evt.id}
              className="gallery-responsive-card group bg-white rounded-2xl sm:rounded-3xl border border-[#E6E0D4] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative"
            >
              <div>
                {/* Event Image with Badges */}
                <div 
                  onClick={() => setActiveEventModal(evt)}
                  className="relative h-48 sm:h-52 md:h-56 overflow-hidden bg-slate-100 cursor-pointer"
                >
                  <img
                    src={evt.imageUrl}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('unsplash.com')) {
                        target.src = 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80';
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
                  
                  {/* Category Pill with 1-click filter */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory(evt.category);
                    }}
                    className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 hover:bg-white text-[#7A5338] hover:text-[#5B3921] backdrop-blur-xs border border-white/50 shadow-2xs cursor-pointer transition-all hover:scale-105 z-10 flex items-center gap-1"
                    title={`Click to filter by "${evt.category}"`}
                  >
                    <span>{evt.category}</span>
                  </button>

                  {/* Admin Delete Action Button on photo card */}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoToDelete(evt);
                      }}
                      className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white shadow-md hover:scale-105 transition-all z-10 touch-friendly-btn cursor-pointer"
                      title="Remove this photo from hospital gallery"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Attendees Count Badge */}
                  <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/60 text-white backdrop-blur-xs">
                    <Users className="w-3.5 h-3.5 text-cyan-300" />
                    {evt.attendeesCount}
                  </span>

                  {/* Click to zoom indicator */}
                  <div className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs">
                    <Eye className="w-3.5 h-3.5 text-[#8E5B3E]" />
                  </div>
                </div>

                {/* Content Section */}
                <div 
                  onClick={() => setActiveEventModal(evt)}
                  className="p-4 sm:p-5 space-y-2.5 cursor-pointer"
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

                  <h3 className="font-serif font-bold text-sm sm:text-base text-[#27231E] group-hover:text-[#8E5B3E] transition-colors line-clamp-2 leading-snug">
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
              <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-[#FAF7F2] border-t border-[#EAE3D6] flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setActiveEventModal(evt)}
                  className="touch-friendly-btn font-bold text-[#8E5B3E] hover:text-[#784A31] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                >
                  <span>View Details & Full Photo</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setPhotoToDelete(evt)}
                    className="touch-friendly-btn text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 font-semibold flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
                    title="Remove this photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADD SPECIAL OCCASION PHOTO (EXPANSIVE 1200px+ STUDIO PORTALED TO DOCUMENT.BODY) */}
      {/* ======================================================== */}
      {isAddModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
          <div 
            style={{
              boxSizing: 'border-box',
              flexShrink: 0,
            }}
            className={`bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden my-auto shrink-0 transition-all duration-200 ${
              isPhotoStudioMaximized
                ? 'w-[99vw] h-[98vh] max-w-none'
                : 'w-[calc(100vw-24px)] sm:w-[94vw] max-w-[1240px] h-[92vh] max-h-[92vh] min-h-[640px]'
            }`}
          >
            
            {/* Standard Top Header */}
            <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900 text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                    <span>Add Special Occasion Photograph</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono uppercase">
                      Gallery Studio
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Sopan Hospital Archives • Side-by-side layout (all fields & upload visible without scrolling)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form Body - Vertical Stack Layout (No fixed height restrictions, clean vertical flow) */}
            <form onSubmit={handleAddPhotoSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 md:p-8 flex flex-col gap-6 text-xs text-slate-700">
              
              {/* IN-MODAL TOAST CONFIRMATION BANNER (PERSISTS WHILE MODAL STAYS OPEN) */}
              {photoAddedSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-emerald-900 flex items-center gap-2">
                        <span>Photograph Added to Gallery Successfully!</span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Confirmed</span>
                      </div>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        "{photoAddedSuccess}" is now live in the hospital gallery. You can upload another photograph below, or click "Done / Close Window".
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddModalOpen(false);
                        setPhotoAddedSuccess(null);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      Done / Close Window
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoAddedSuccess(null)}
                      className="p-1.5 rounded-xl text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                      title="Dismiss message"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* TOP 'SPECIAL OCCASION' PHOTO UPLOAD BANNER (VERTICAL STACK - SQUARE SHAPE) */}
              <div className="flex flex-col items-center justify-center gap-4 p-5 sm:p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center w-full">
                
                {/* Header text for photo section */}
                <div className="space-y-1 text-center max-w-lg">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 flex items-center justify-center gap-2">
                    <Camera className="w-4 h-4 text-amber-600" />
                    <span>Special Occasion Photograph Upload</span>
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    Click the square box below to upload a photo from your device, or choose from hospital presets or web URL.
                  </p>
                </div>

                {/* EXACT 250px x 250px SQUARE PHOTO UPLOAD & PREVIEW BOX */}
                <div className="relative flex flex-col items-center justify-center">
                  <label
                    style={{ width: '250px', height: '250px', minWidth: '250px', minHeight: '250px' }}
                    className="w-[250px] h-[250px] min-w-[250px] min-h-[250px] aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border-2 border-dashed border-amber-500/80 hover:border-amber-400 shadow-xl relative flex flex-col items-center justify-center cursor-pointer group shrink-0 transition-all hover:scale-[1.01]"
                    title="Click to browse & upload photo from your device"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {/* Image Preview inside 250px Square */}
                    <img
                      src={customImageUrl || newImageUrl}
                      alt="Special Occasion Preview"
                      className={`w-full h-full ${photoPreviewFit === 'cover' ? 'object-cover' : 'object-contain'} p-1.5 transition-all duration-200`}
                      onError={(e) => {
                        e.currentTarget.src = PRESET_OCCASION_PHOTOS[0].url;
                      }}
                    />

                    {/* Subtle gradient vignette */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/85 via-black/20 to-black/40 group-hover:from-black/90 group-hover:via-black/40 transition-colors" />

                    {/* Top Overlay Badge & Fit/Cover Toggle */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-auto">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-amber-950 shadow-sm">
                        {newCategory || 'Special Occasion'}
                      </span>
                      
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPhotoPreviewFit(prev => prev === 'contain' ? 'cover' : 'contain');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-black/75 hover:bg-black text-white text-[10px] font-semibold flex items-center gap-1 backdrop-blur-xs border border-white/25 transition-colors cursor-pointer shadow-sm"
                        title="Toggle full fit vs fill cover"
                      >
                        <Eye className="w-3 h-3 text-cyan-300" />
                        <span>{photoPreviewFit === 'contain' ? 'Fit' : 'Cover'}</span>
                      </button>
                    </div>

                    {/* Hover Upload Indicator Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2 pointer-events-none p-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/30 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-lg">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-xs text-amber-200">
                        {uploadedFileName ? 'Click to Change Photo' : 'Click to Upload Photo'}
                      </div>
                      <div className="text-[10px] text-slate-300">
                        Square 250px × 250px
                      </div>
                    </div>

                    {/* Bottom Status / Filename Badge */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none text-white text-center">
                      {uploadedFileName ? (
                        <div className="text-[11px] text-emerald-300 font-mono bg-emerald-950/90 border border-emerald-500/50 px-2 py-0.5 rounded-lg truncate shadow-sm">
                          ✓ {uploadedFileName}
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-200 drop-shadow-md flex items-center justify-center gap-1">
                          <Upload className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="truncate">Click square to upload device image</span>
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                {/* Photo Source Controls (Browse Device, Presets, Web URL) */}
                <div className="w-full max-w-lg space-y-3">
                  {/* Photo Source Switcher Pills */}
                  <div className="flex items-center gap-1.5 bg-slate-200/80 p-1.5 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setPhotoStudioTab('device')}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                        photoStudioTab === 'device'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Browse Device</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPhotoStudioTab('presets')}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                        photoStudioTab === 'presets'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Presets ({PRESET_OCCASION_PHOTOS.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPhotoStudioTab('url')}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                        photoStudioTab === 'url'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Web URL</span>
                    </button>
                  </div>

                  {/* TAB 1: DEVICE FILE UPLOAD HELPER */}
                  {photoStudioTab === 'device' && (
                    <label className="border-2 border-dashed border-amber-400 hover:border-amber-500 bg-white hover:bg-amber-50/70 rounded-2xl p-3 flex items-center justify-center gap-3 cursor-pointer transition-colors text-amber-950 group shadow-xs">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 border border-amber-500/30 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                        <Upload className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-bold text-xs sm:text-sm text-slate-900">
                          {uploadedFileName ? 'Change Photo File' : 'Browse & Upload Device Photo'}
                        </div>
                        <div className="text-[11px] text-amber-800">
                          {uploadedFileName ? uploadedFileName : 'Supports PNG, JPG, JPEG, WebP (Square 250px × 250px)'}
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}

                  {/* TAB 2: CURATED PRESETS SHELF */}
                  {photoStudioTab === 'presets' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-2xl bg-white text-left">
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
                          className={`p-1.5 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                            selectedPresetIndex === idx && !customImageUrl
                              ? 'border-amber-600 ring-2 ring-amber-500/40 bg-amber-50/30'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <img src={p.url} alt={p.label} className="w-full h-14 object-cover rounded-lg mb-1" />
                          <span className="text-[10px] font-semibold text-slate-800 line-clamp-1 block leading-tight">
                            {p.label}
                          </span>
                          {selectedPresetIndex === idx && !customImageUrl && (
                            <div className="absolute top-2 right-2 w-4 h-4 bg-amber-600 text-white rounded-full flex items-center justify-center">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* TAB 3: WEB IMAGE URL */}
                  {photoStudioTab === 'url' && (
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={customImageUrl}
                        onChange={e => {
                          setCustomImageUrl(e.target.value);
                          setSelectedPresetIndex(-1);
                        }}
                        placeholder="https://example.com/hospital-special-occasion.jpg"
                        className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customImageUrl.trim()) {
                            triggerToast('Web URL photo loaded to square preview.');
                          }
                        }}
                        className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                      >
                        Load Photo
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* OCCASION DETAILS - PLACED DIRECTLY BELOW THE PHOTO UPLOAD SECTION */}
              <div className="space-y-4">
                {/* Occasion Title - Placed right below the photo upload box! */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1 text-xs sm:text-sm">
                    Occasion Title / Event Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g. World Stroke Day Medical Summit 2026 or Neuro-ICU Inauguration"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:bg-white"
                  />
                </div>

                {/* Category & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1 text-xs">
                      Category *
                    </label>
                    <select
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:bg-white"
                    >
                      <option value="Events">Events</option>
                      <option value="Awards">Awards</option>
                      <option value="Staff">Staff</option>
                      <option value="Patient Stories">Patient Stories</option>
                      <option value="Medical Camps">Medical Camps</option>
                      <option value="Clinical CME">Clinical CME</option>
                      <option value="Special Occasion">Special Occasion</option>
                      <option value="Facility Inauguration">Facility Inauguration</option>
                      <option value="Stroke Awareness">Stroke Awareness</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1 text-xs">
                      Event Date *
                    </label>
                    <input
                      type="text"
                      required
                      value={newDate}
                      onChange={e => setNewDate(e.target.value)}
                      placeholder="e.g. 29 Oct 2026"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Venue & Attendees */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1 text-xs">
                      Venue / Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={newLocation}
                      onChange={e => setNewLocation(e.target.value)}
                      placeholder="Sopan Hospital Auditorium, Nashik"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1 text-xs">
                      Attendees Count
                    </label>
                    <input
                      type="text"
                      value={newAttendees}
                      onChange={e => setNewAttendees(e.target.value)}
                      placeholder="e.g. 150+ Attendees"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Principal Lead & Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1 text-xs">
                      Principal Lead / Dignitary
                    </label>
                    <input
                      type="text"
                      value={newLeadClinician}
                      onChange={e => setNewLeadClinician(e.target.value)}
                      placeholder="Dr. Sanjay Sopan Varade"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1 text-xs">
                      Topical Tags
                    </label>
                    <input
                      type="text"
                      value={newTags}
                      onChange={e => setNewTags(e.target.value)}
                      placeholder="SopanHospital, StrokeSummit"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Description & Milestones */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1 text-xs">
                      Description / Synopsis *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={newSummary}
                      onChange={e => setNewSummary(e.target.value)}
                      placeholder="Clinical overview, equipment inaugurated, or felicitation notes..."
                      className="w-full px-3 py-2.5 min-h-[90px] bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:bg-white resize-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1 text-xs">
                      Key Milestones (1 per line)
                    </label>
                    <textarea
                      rows={3}
                      value={newHighlights}
                      onChange={e => setNewHighlights(e.target.value)}
                      placeholder="• Unit expanded&#10;• 50+ Survivors felicitated"
                      className="w-full px-3 py-2.5 min-h-[90px] bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:bg-white resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Compact Footer Strip */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
                <span className="text-xs text-slate-500 hidden sm:inline">
                  ✓ High-resolution photographs immediately sync across hospital web archives.
                </span>

                <div className="flex items-center justify-end gap-2.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Photograph to Gallery</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ======================================================== */}
      {/* MODAL 2: CONFIRM DELETE PHOTO (HOSPITAL ADMIN) */}
      {/* ======================================================== */}
      {photoToDelete && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
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
        </div>,
        document.body
      )}

      {/* ======================================================== */}
      {/* MODAL 3: EVENT DETAILS & HIGH-RES PHOTO MODAL */}
      {/* ======================================================== */}
      {activeEventModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
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
        </div>,
        document.body
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
