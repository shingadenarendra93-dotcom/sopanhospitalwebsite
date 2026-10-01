import React, { useState, useMemo } from 'react';
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
  Eye
} from 'lucide-react';
import { HospitalEvent } from '../types';
import { HOSPITAL_EVENTS } from '../data/mockData';

interface HospitalEventsGalleryProps {
  onBookConsultation?: () => void;
  onOpenWhatsApp?: (msg?: string) => void;
}

export const HospitalEventsGallery: React.FC<HospitalEventsGalleryProps> = ({
  onBookConsultation,
  onOpenWhatsApp
}) => {
  const [eventsList] = useState<HospitalEvent[]>(HOSPITAL_EVENTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeEventModal, setActiveEventModal] = useState<HospitalEvent | null>(null);

  const categories = useMemo(() => {
    return ['All', 'Stroke Awareness', 'Clinical CME', 'Free Medical Camp', 'Facility Inauguration', 'Survivor Meet'];
  }, []);

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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-[#2c221a] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-[#8E5B3E]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-amber-200 text-xs font-semibold backdrop-blur-xs">
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            Hospital Archives & Clinical Events Gallery
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-white">
            Sopan Hospital Event Photographs & Medical Outreaches
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Capturing 35+ years of clinical excellence, annual World Stroke Day summits, advanced biplane neurovascular inaugurations, and community neurological health camps led by <strong>Dr. Sanjay Sopan Varade (MD, DM Neuro)</strong> in Nashik, Maharashtra.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FAF7F2] border border-[#E6E0D4] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map(cat => (
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
            placeholder="Search event photos, camps..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D8CFC2] bg-white text-xs text-[#27231E] focus:outline-hidden focus:ring-2 focus:ring-[#8E5B3E]/30"
          />
        </div>
      </div>

      {/* Events Photograph Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 text-slate-400 space-y-2">
          <Camera className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-xs font-semibold text-slate-600">No hospital event photographs found matching "{searchQuery}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(evt => (
            <div
              key={evt.id}
              onClick={() => setActiveEventModal(evt)}
              className="group bg-white rounded-3xl border border-[#E6E0D4] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Event Image with Badge */}
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  <img
                    src={evt.imageUrl}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                  
                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 text-[#7A5338] backdrop-blur-xs border border-white/50 shadow-2xs">
                    {evt.category}
                  </span>

                  {/* Attendees Count Badge */}
                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/60 text-white backdrop-blur-xs">
                    <Users className="w-3.5 h-3.5 text-cyan-300" />
                    {evt.attendeesCount}
                  </span>

                  {/* View Full photo overlay icon */}
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs">
                    <Eye className="w-4 h-4 text-[#8E5B3E]" />
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-[11px] text-[#7A746B]">
                    <span className="flex items-center gap-1 font-semibold text-[#8E5B3E]">
                      <Calendar className="w-3.5 h-3.5" />
                      {evt.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      {evt.location.split(',')[0]}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-[#27231E] group-hover:text-[#8E5B3E] transition-colors line-clamp-2">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-[#635E56] line-clamp-3 leading-relaxed">
                    {evt.summary}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {evt.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF7F2] text-[#7A5338] border border-[#EAE3D6] font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3.5 bg-[#FAF7F2] border-t border-[#EAE3D6] flex items-center justify-between text-xs font-bold text-[#8E5B3E] group-hover:text-[#784A31]">
                <span>View Event Details & Highlights</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EVENT DETAILS & HIGH-RES PHOTO MODAL */}
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
              
              <button
                onClick={() => setActiveEventModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black text-white transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

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
    </div>
  );
};
