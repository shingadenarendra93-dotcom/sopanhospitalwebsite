import React, { useState, useEffect } from 'react';
import { 
  Newspaper, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  Sparkles, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  ShieldCheck, 
  Calendar, 
  BookOpen, 
  Activity, 
  Lightbulb, 
  ArrowRight, 
  CheckCircle2, 
  Filter, 
  Stethoscope, 
  Globe, 
  Clock,
  AlertCircle,
  MessageCircle,
  Copy
} from 'lucide-react';

export interface NeurologyNewsItem {
  id: string;
  title: string;
  category: 'stroke' | 'epilepsy' | 'parkinsons' | 'neuro-tips' | 'headache' | 'general' | string;
  source: string;
  sourceUrl: string;
  publishDate: string;
  summary: string;
  keyTakeaway: string;
  clinicalSignificance: string;
  patientTips: string[];
  tags: string[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

interface LatestNeurologyNewsProps {
  onBookConsultation?: () => void;
  onOpenWhatsApp?: () => void;
}

export const LatestNeurologyNews: React.FC<LatestNeurologyNewsProps> = ({
  onBookConsultation,
  onOpenWhatsApp
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [customSearchInput, setCustomSearchInput] = useState<string>('');
  const [newsList, setNewsList] = useState<NeurologyNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveGrounding, setIsLiveGrounding] = useState<boolean>(false);
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sopan_saved_neuro_news');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedArticle, setSelectedArticle] = useState<NeurologyNewsItem | null>(null);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>('Just now');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const fetchNeurologyNews = async (category: string, query: string = '') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/neurology-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          customQuery: query
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      setNewsList(data.news || []);
      setIsLiveGrounding(Boolean(data.isLiveGrounding));
      setGroundingChunks(data.groundingChunks || []);
      setSearchQueries(data.searchQueries || []);
      setLastRefreshedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Error fetching neurology news:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNeurologyNews(activeCategory);
  }, [activeCategory]);

  const handleCustomSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSearchInput.trim()) return;
    setActiveCategory('custom');
    fetchNeurologyNews('custom', customSearchInput.trim());
  };

  const toggleSaveArticle = (id: string) => {
    setSavedArticleIds(prev => {
      const updated = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      try {
        localStorage.setItem('sopan_saved_neuro_news', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  const handleShareArticle = (item: NeurologyNewsItem) => {
    const textToShare = `📰 ${item.title}\nSource: ${item.source}\nKey Takeaway: ${item.keyTakeaway}\nCurated by Sopan Hospital & Neurology Institute, Nashik`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToShare);
      setCopiedNotification(item.id);
      setTimeout(() => setCopiedNotification(null), 3000);
    }
  };

  const categories = [
    { id: 'all', label: 'All Breakthroughs', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'stroke', label: 'Stroke & Vascular', icon: <Activity className="w-3.5 h-3.5 text-rose-600" /> },
    { id: 'epilepsy', label: 'Epilepsy & EMU', icon: <Sparkles className="w-3.5 h-3.5 text-amber-600" /> },
    { id: 'parkinsons', label: 'Parkinson\'s & Movement', icon: <BookOpen className="w-3.5 h-3.5 text-blue-600" /> },
    { id: 'neuro-tips', label: 'Brain Health & Tips', icon: <Lightbulb className="w-3.5 h-3.5 text-emerald-600" /> }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#FAF5EC] via-[#FFFDF9] to-[#F3ECE1] border border-[#E5DAC8] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#8E5B3E]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE9DF] border border-[#DACFBE] text-[#6E4630] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#8E5B3E]" />
              <span>Real-Time Google Search Grounding • Gemini 3.8</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#27231E] tracking-tight">
              Latest Neurology News & Clinical Research
            </h1>

            <p className="text-sm text-[#635E56] leading-relaxed">
              Curated medical research breakthroughs, peer-reviewed clinical trial reports, and evidence-based neuro-health tips from reputable global neurology journals, synthesized for physicians, caregivers, and patients.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
            <button
              onClick={() => fetchNeurologyNews(activeCategory, customSearchInput)}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-2xl bg-[#342E28] hover:bg-[#25201C] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Grounding Live Research...' : 'Refresh Latest News'}</span>
            </button>
            <div className="text-[11px] text-[#787063] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#8E5B3E]" />
              <span>Updated: {lastRefreshedTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar & Category Navigation */}
      <div className="bg-white border border-[#E5DAC8] rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setCustomSearchInput('');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#8E5B3E] text-white shadow-xs'
                    : 'bg-[#FAF7F2] text-[#635E56] hover:bg-[#F2ECE0] hover:text-[#27231E] border border-[#E8DEC $\to$ #E6DECE]'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Custom Search Query Input */}
          <form onSubmit={handleCustomSearchSubmit} className="flex items-center gap-2 w-full lg:w-96">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8E5B3E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customSearchInput}
                onChange={(e) => setCustomSearchInput(e.target.value)}
                placeholder="Search topic (e.g. Tenecteplase, DBS, Migraine CGRP)..."
                className="w-full pl-9 pr-3.5 py-2 bg-[#FAF7F2] border border-[#E5DAC8] rounded-xl text-xs text-[#27231E] placeholder-[#9E9589] focus:outline-none focus:ring-2 focus:ring-[#8E5B3E]/30 focus:border-[#8E5B3E]"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !customSearchInput.trim()}
              className="px-3.5 py-2 rounded-xl bg-[#456254] hover:bg-[#374E43] text-white text-xs font-semibold shadow-xs transition-colors shrink-0 disabled:opacity-50"
            >
              Search
            </button>
          </form>
        </div>

        {/* Live Search Grounding Source Transparency Indicator */}
        <div className="bg-[#FAF7F2] rounded-2xl p-3.5 border border-[#E8DFD1] text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full mt-1 sm:mt-0 shrink-0 ${isLiveGrounding ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <div>
              <span className="font-semibold text-[#27231E]">
                {isLiveGrounding ? 'Verified Live Google Search Grounding:' : 'Curated Peer-Reviewed Research Repository:'}
              </span>{' '}
              <span className="text-[#635E56]">
                {isLiveGrounding 
                  ? 'Grounded with real-time web citations from certified clinical literature.' 
                  : 'Synthesized from The Lancet Neurology, NEJM, AHA Stroke Journal, and AAN guidelines.'}
              </span>
            </div>
          </div>

          {groundingChunks.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto shrink-0 text-[11px]">
              <span className="font-medium text-[#787063]">Primary Sources:</span>
              <div className="flex items-center gap-1.5">
                {groundingChunks.slice(0, 3).map((chunk, idx) => (
                  <a
                    key={idx}
                    href={chunk.web?.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-0.5 rounded-lg bg-white border border-[#DDD4C4] text-[#456254] hover:text-[#2E4238] font-medium hover:underline flex items-center gap-1 whitespace-nowrap"
                  >
                    <span>{chunk.web?.title?.slice(0, 22) || 'Official Journal'}...</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white border border-[#E5DAC8] rounded-3xl p-6 space-y-4 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-[#EFE9DF] rounded-md w-28" />
                <div className="h-4 bg-[#EFE9DF] rounded-md w-20" />
              </div>
              <div className="h-6 bg-[#EFE9DF] rounded-md w-3/4" />
              <div className="h-16 bg-[#FAF7F2] rounded-xl w-full" />
              <div className="h-4 bg-[#EFE9DF] rounded-md w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* News Articles Grid */}
      {!isLoading && newsList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {newsList.map((item) => {
            const isSaved = savedArticleIds.includes(item.id);
            return (
              <article
                key={item.id}
                className="bg-white border border-[#E5DAC8] rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-3.5">
                  {/* Category & Source Metadata */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-[#FAF5EC] text-[#8E5B3E] font-semibold border border-[#E8DEC $\to$ #E5DAC8] uppercase tracking-wider text-[10px]">
                        {item.category.replace('-', ' ')}
                      </span>
                      <span className="text-[#787063] font-medium truncate max-w-[180px] sm:max-w-[220px]">
                        {item.source}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleSaveArticle(item.id)}
                        className={`p-1.5 rounded-xl border transition-colors ${
                          isSaved 
                            ? 'bg-[#FAF5EC] text-[#8E5B3E] border-[#DACFBE]' 
                            : 'text-[#9E9589] hover:text-[#27231E] border-transparent hover:bg-[#FAF7F2]'
                        }`}
                        title={isSaved ? 'Remove Bookmark' : 'Bookmark Article'}
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4 fill-[#8E5B3E]" /> : <Bookmark className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleShareArticle(item)}
                        className="p-1.5 rounded-xl text-[#9E9589] hover:text-[#27231E] border border-transparent hover:bg-[#FAF7F2] transition-colors relative"
                        title="Share Summary"
                      >
                        <Share2 className="w-4 h-4" />
                        {copiedNotification === item.id && (
                          <span className="absolute -top-7 right-0 px-2 py-0.5 bg-[#27231E] text-white text-[10px] rounded shadow-xs whitespace-nowrap">
                            Copied!
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Headline */}
                  <h2 className="text-base sm:text-lg font-bold font-serif text-[#27231E] group-hover:text-[#8E5B3E] transition-colors leading-snug">
                    {item.title}
                  </h2>

                  {/* Summary */}
                  <p className="text-xs text-[#524B43] leading-relaxed line-clamp-3">
                    {item.summary}
                  </p>

                  {/* Key Takeaway Callout */}
                  <div className="bg-[#FAF7F2] rounded-2xl p-3 border border-[#E8DFD1] space-y-1">
                    <div className="text-[11px] font-bold text-[#8E5B3E] flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Clinical Takeaway:</span>
                    </div>
                    <p className="text-xs text-[#27231E] font-medium leading-relaxed">
                      {item.keyTakeaway}
                    </p>
                  </div>

                  {/* Evidence-based Patient Tips */}
                  {item.patientTips && item.patientTips.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-[#787063] uppercase tracking-wide">
                        Actionable Guidance:
                      </span>
                      <ul className="space-y-1 text-xs text-[#524B43]">
                        {item.patientTips.slice(0, 2).map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#456254] shrink-0 mt-0.5" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.tags.map((tag, idx) => (
                        <span key={idx} className="text-[10px] bg-[#EFE9DF] text-[#635E56] px-2 py-0.5 rounded-md font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Actions & Footer */}
                <div className="pt-4 border-t border-[#EAE3D5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    {item.sourceUrl ? (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#456254] hover:text-[#2E4238] font-semibold hover:underline flex items-center gap-1"
                      >
                        <span>Read at {item.source.slice(0, 20)}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[#787063]">{item.publishDate}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedArticle(item)}
                      className="px-3 py-1.5 rounded-xl bg-[#FAF5EC] hover:bg-[#F0E6D5] text-[#8E5B3E] font-semibold text-xs border border-[#DACFBE] transition-colors"
                    >
                      Full Analysis
                    </button>
                    {onBookConsultation && (
                      <button
                        onClick={onBookConsultation}
                        className="px-3 py-1.5 rounded-xl bg-[#342E28] hover:bg-[#25201C] text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1"
                      >
                        <Stethoscope className="w-3 h-3 text-[#E5DAC8]" />
                        <span>Discuss with Doctor</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && newsList.length === 0 && (
        <div className="bg-white border border-[#E5DAC8] rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF5EC] text-[#8E5B3E] flex items-center justify-center mx-auto border border-[#E5DAC8]">
            <Search className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-lg text-[#27231E]">No clinical research matches found</h3>
            <p className="text-xs text-[#635E56]">
              Try a broader query such as "stroke intervention", "epilepsy monitoring", or "Parkinson tremor".
            </p>
          </div>
          <button
            onClick={() => {
              setActiveCategory('all');
              setCustomSearchInput('');
              fetchNeurologyNews('all');
            }}
            className="px-4 py-2 rounded-xl bg-[#8E5B3E] text-white text-xs font-semibold shadow-xs hover:bg-[#7A4C32] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Physician-Curated Neuro-Health Tips Section */}
      <div className="bg-[#FAF7F2] border border-[#E5DAC8] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8E5B3E] uppercase tracking-wider">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Physician-Vetted Neuro-Wellness Guide</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-serif text-[#27231E]">
              Daily Evidence-Based Habits for Brain Protection
            </h3>
            <p className="text-xs text-[#635E56]">
              Recommended by Chief Neurologist Dr. Sanjay Sopan Varade (MD, DM Neuro) to minimize stroke, epilepsy recurrence, and cognitive decline.
            </p>
          </div>

          {onOpenWhatsApp && (
            <button
              onClick={onOpenWhatsApp}
              className="px-4 py-2 rounded-xl bg-[#456254] hover:bg-[#374E43] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-xs transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Ask Neuro Desk on WhatsApp</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E8DFD1] space-y-2.5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h4 className="font-bold text-sm text-[#27231E]">Strict BP & Microvascular Control</h4>
            <p className="text-xs text-[#524B43] leading-relaxed">
              Hypertension is the single greatest modifiable risk factor for intracerebral hemorrhage and ischemic stroke. Monitor blood pressure twice daily to maintain levels strictly under 130/80 mmHg.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8DFD1] space-y-2.5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h4 className="font-bold text-sm text-[#27231E]">7-8 Hours Glymphatic Sleep</h4>
            <p className="text-xs text-[#524B43] leading-relaxed">
              During deep non-REM slow-wave sleep, the cerebral glymphatic network flushes metabolic tau and amyloid waste. Consistent sleep schedules also raise seizure thresholds for epilepsy patients.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8DFD1] space-y-2.5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h4 className="font-bold text-sm text-[#27231E]">MIND Diet & Aerobic BDNF</h4>
            <p className="text-xs text-[#524B43] leading-relaxed">
              Combining berries, leafy greens, walnuts, and olive oil with 150 weekly minutes of brisk walking releases Brain-Derived Neurotrophic Factor (BDNF) to preserve neuro-plasticity.
            </p>
          </div>
        </div>
      </div>

      {/* Full Analysis Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E5DAC8] shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-[#EAE3D5] pb-4">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FAF5EC] text-[#8E5B3E] font-semibold border border-[#E5DAC8] uppercase text-[10px]">
                  {selectedArticle.category}
                </span>
                <h3 className="font-bold font-serif text-lg sm:text-xl text-[#27231E]">
                  {selectedArticle.title}
                </h3>
                <p className="text-xs text-[#787063]">
                  Published by <strong className="text-[#27231E]">{selectedArticle.source}</strong> • {selectedArticle.publishDate}
                </p>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-1.5 rounded-xl hover:bg-[#FAF7F2] text-[#787063] hover:text-[#27231E]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#342E28] leading-relaxed">
              <div>
                <h4 className="font-bold text-[#8E5B3E] uppercase text-[11px] mb-1">Clinical Study Overview:</h4>
                <p className="text-[#524B43] bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DFD1]">
                  {selectedArticle.summary}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#27231E] text-xs mb-1">Primary Clinical Significance:</h4>
                <p className="text-[#524B43]">
                  {selectedArticle.clinicalSignificance}
                </p>
              </div>

              {selectedArticle.patientTips && selectedArticle.patientTips.length > 0 && (
                <div className="bg-white p-4 rounded-2xl border border-[#E5DAC8] space-y-2">
                  <h4 className="font-bold text-[#456254] text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Doctor-Recommended Patient Guidelines:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#524B43]">
                    {selectedArticle.patientTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#456254] shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#EAE3D5] flex flex-col sm:flex-row items-center justify-between gap-3">
              {selectedArticle.sourceUrl ? (
                <a
                  href={selectedArticle.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#456254] hover:underline font-semibold flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Visit Verified Journal Publication</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : <div />}

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-[#787063] hover:bg-[#FAF7F2] text-xs font-semibold"
                >
                  Close
                </button>
                {onBookConsultation && (
                  <button
                    onClick={() => {
                      setSelectedArticle(null);
                      onBookConsultation();
                    }}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] text-white text-xs font-semibold shadow-xs"
                  >
                    Discuss in Consultation
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
