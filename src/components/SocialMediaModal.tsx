import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Smartphone, 
  Globe, 
  Sparkles,
  Share2,
  Tv,
  Users,
  Video
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface SocialPlatformInfo {
  id: 'youtube' | 'facebook' | 'instagram';
  name: string;
  nameMr: string;
  handle: string;
  url: string;
  appSchemeUrl: string;
  themeColor: string;
  accentBg: string;
  accentBorder: string;
  badge: string;
  badgeMr: string;
  subscribersOrFollowers: string;
  description: string;
  descriptionMr: string;
  highlightTag: string;
  highlightTagMr: string;
}

export const OFFICIAL_SOCIAL_LINKS: Record<'youtube' | 'facebook' | 'instagram', SocialPlatformInfo> = {
  youtube: {
    id: 'youtube',
    name: 'YouTube Channel',
    nameMr: 'अधिकृत यूट्यूब चॅनल',
    handle: '@dr.sanjayvarade5339',
    url: 'https://www.youtube.com/@dr.sanjayvarade5339',
    appSchemeUrl: 'vnd.youtube://www.youtube.com/@dr.sanjayvarade5339',
    themeColor: '#FF0000',
    accentBg: 'bg-red-50 hover:bg-red-100/80',
    accentBorder: 'border-red-200 hover:border-red-400',
    badge: 'Official Medical Lectures',
    badgeMr: 'अधिकृत वैद्यकीय व्याख्याने',
    subscribersOrFollowers: 'Dr. Sanjay Varade',
    description: 'Watch comprehensive clinical neurology videos, stroke recovery lectures, epilepsy awareness, and patient guides by Dr. Sanjay Sopan Varade.',
    descriptionMr: 'डॉ. संजय सोपान वराडे (MD, DM Neuro) यांची मेंदूविकार, स्ट्रोक जनजागृती, मिरगी व मायग्रेन उपचारांची माहिती देणारी मार्गदर्शक व्याख्याने पहा.',
    highlightTag: 'Neurology Lectures & Health Tips',
    highlightTagMr: 'न्यूरोलॉजी मार्गदर्शन व माहिती'
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook Page',
    nameMr: 'अधिकृत फेसबुक पेज',
    handle: 'sopanhospitalnashik',
    url: 'https://www.facebook.com/sopanhospitalnashik/',
    appSchemeUrl: 'fb://facewebmodal/f?href=https://www.facebook.com/sopanhospitalnashik/',
    themeColor: '#1877F2',
    accentBg: 'bg-blue-50 hover:bg-blue-100/80',
    accentBorder: 'border-blue-200 hover:border-blue-400',
    badge: 'Hospital Community & News',
    badgeMr: 'हॉस्पिटल व रुग्ण अपडेट्स',
    subscribersOrFollowers: 'Sopan Hospital Nashik',
    description: 'Stay updated with hospital events, free diagnostic camps, NABH neuro-critical facilities, patient milestones, and Nashik healthcare updates.',
    descriptionMr: 'मोफत आरोग्य तपासणी शिबिरे, हॉस्पिटलमधील अत्याधुनिक उपचार सुविधा, रुग्ण अनुभव आणि नाशिकमधील आरोग्य घडामोडींचे अधिकृत अपडेट्स मिळवा.',
    highlightTag: 'Camp Alerts & Hospital Updates',
    highlightTagMr: 'आरोग्य शिबिरे व ताज्या घडामोडी'
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram Profile',
    nameMr: 'इन्स्टाग्राम प्रोफाईल',
    handle: '@sopanhospitalnashik',
    url: 'https://www.instagram.com/sopanhospitalnashik/',
    appSchemeUrl: 'instagram://user?username=sopanhospitalnashik',
    themeColor: '#E1306C',
    accentBg: 'bg-pink-50 hover:bg-pink-100/80',
    accentBorder: 'border-pink-200 hover:border-pink-400',
    badge: 'Visual Highlights & Tips',
    badgeMr: 'फोटो व आरोग्य टिप्स',
    subscribersOrFollowers: 'Sopan Hospital',
    description: 'Visual health infographics, hospital life highlights, doctor advice on neurological wellness, and medical awareness posters.',
    descriptionMr: 'आरोग्य इन्फोग्राफिक्स, हॉस्पिटल छायाचित्रे, डॉक्टर सल्ला आणि मेंदू आरोग्याविषयी उपयुक्त माहिती.',
    highlightTag: 'Photos & Daily Tips',
    highlightTagMr: 'छायाचित्रे व दैनिक टिप्स'
  }
};

/**
 * Direct launcher that immediately opens the native YouTube, Facebook, or Instagram app
 * on mobile devices, or launches the direct profile in a new tab on desktop.
 * Never opens an intermediate modal window.
 */
export const openSocialPlatform = (
  platformKey: 'youtube' | 'facebook' | 'instagram',
  _preferApp?: boolean
) => {
  const item = OFFICIAL_SOCIAL_LINKS[platformKey];
  if (!item) return;

  const userAgent = typeof navigator !== 'undefined' ? (navigator.userAgent || '') : '';
  const isAndroid = /Android/i.test(userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isMobile = isAndroid || isIOS || /BlackBerry|IEMobile|Opera Mini|Mobile/i.test(userAgent);

  if (isAndroid) {
    // Android Intent URL: Pops up the installed native YouTube or Facebook app directly
    // Without opening any blank browser window or popup
    let androidIntent = item.url;
    if (platformKey === 'youtube') {
      androidIntent = 'intent://www.youtube.com/@dr.sanjayvarade5339#Intent;package=com.google.android.youtube;scheme=https;end;';
    } else if (platformKey === 'facebook') {
      androidIntent = 'intent://facebook.com/sopanhospitalnashik/#Intent;package=com.facebook.katana;scheme=https;end;';
    } else if (platformKey === 'instagram') {
      androidIntent = 'intent://instagram.com/_u/sopanhospitalnashik/#Intent;package=com.instagram.android;scheme=https;end;';
    }
    window.location.href = androidIntent;
    return;
  }

  if (isIOS) {
    // iOS custom app scheme pops up YouTube / Facebook app directly
    window.location.href = item.appSchemeUrl;
    return;
  }

  if (isMobile) {
    window.location.href = item.url;
    return;
  }

  // Desktop: opens official YouTube channel or Facebook page in new tab directly (no modal dialog)
  window.open(item.url, '_blank', 'noopener,noreferrer');
};

/**
 * Pixel-perfect SVG Brand Logos
 */
export const YouTubeIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className} 
    aria-hidden="true"
  >
    <path 
      fill="#FF0000" 
      d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
    />
  </svg>
);

export const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className} 
    aria-hidden="true"
  >
    <path 
      fill="#1877F2" 
      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
    />
  </svg>
);

export const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className} 
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="ig-grad" r="150%" cx="30%" cy="107%">
        <stop offset="0" stopColor="#fdf497" />
        <stop offset="0.05" stopColor="#fdf497" />
        <stop offset="0.45" stopColor="#fd5949" />
        <stop offset="0.6" stopColor="#d6249f" />
        <stop offset="0.9" stopColor="#285AEB" />
      </radialGradient>
    </defs>
    <path 
      fill="url(#ig-grad)" 
      d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
    />
  </svg>
);

interface SocialMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlatform?: 'youtube' | 'facebook' | 'instagram';
}

export const SocialMediaModal: React.FC<SocialMediaModalProps> = ({
  isOpen,
  onClose,
  defaultPlatform = 'youtube'
}) => {
  const { language } = useLanguage();
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'youtube' | 'facebook' | 'instagram'>('all');

  if (!isOpen) return null;

  const handleCopy = (key: 'youtube' | 'facebook' | 'instagram', url: string) => {
    try {
      navigator.clipboard.writeText(url);
      setCopiedPlatform(key);
      setTimeout(() => setCopiedPlatform(null), 2500);
    } catch {
      // fallback
    }
  };

  const isMr = language === 'mr';

  const platformsToDisplay = activeTab === 'all' 
    ? [OFFICIAL_SOCIAL_LINKS.youtube, OFFICIAL_SOCIAL_LINKS.facebook, OFFICIAL_SOCIAL_LINKS.instagram]
    : [OFFICIAL_SOCIAL_LINKS[activeTab]];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full border border-[#E6E0D4] shadow-2xl overflow-hidden my-auto transform transition-all animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="social-modal-title"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#2B231D] via-[#3E3228] to-[#2B231D] p-5 sm:p-6 text-white relative">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-amber-200 border border-white/15 text-[11px] font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isMr ? 'अधिकृत सोशल मीडिया प्लॅटफॉर्म' : 'Official Social Media Network'}</span>
              </div>
              <h2 id="social-modal-title" className="text-lg sm:text-xl font-serif font-black tracking-tight text-white">
                {isMr ? 'सोपान हॉस्पिटल व डॉ. संजय वराडे' : 'Dr. Sanjay Varade & Sopan Hospital'}
              </h2>
              <p className="text-xs text-[#DFCDB7] leading-relaxed max-w-lg">
                {isMr 
                  ? 'यूट्यूब, फेसबुक आणि इन्स्टाग्रामवर वैद्यकीय व्याख्याने, आरोग्य जनजागृती व ताज्या बातम्यांसाठी थेट जोडा.' 
                  : 'Click below to launch directly in your YouTube, Facebook, or Instagram app, or browse on the web.'}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white/80 hover:text-white transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-white/10 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'all' 
                  ? 'bg-white text-[#2B231D] shadow-sm' 
                  : 'bg-white/10 text-white/80 hover:bg-white/15'
              }`}
            >
              {isMr ? 'सर्व प्लॅटफॉर्म' : 'All Channels (3)'}
            </button>

            <button
              onClick={() => setActiveTab('youtube')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'youtube' 
                  ? 'bg-red-600 text-white shadow-sm' 
                  : 'bg-white/10 text-white/80 hover:bg-white/15'
              }`}
            >
              <YouTubeIcon className="w-3.5 h-3.5" />
              <span>YouTube</span>
            </button>

            <button
              onClick={() => setActiveTab('facebook')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'facebook' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-white/10 text-white/80 hover:bg-white/15'
              }`}
            >
              <FacebookIcon className="w-3.5 h-3.5" />
              <span>Facebook</span>
            </button>

            <button
              onClick={() => setActiveTab('instagram')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'instagram' 
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-sm' 
                  : 'bg-white/10 text-white/80 hover:bg-white/15'
              }`}
            >
              <InstagramIcon className="w-3.5 h-3.5" />
              <span>Instagram</span>
            </button>
          </div>
        </div>

        {/* Modal Body: Cards List */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {platformsToDisplay.map((p) => {
            const isCopied = copiedPlatform === p.id;
            const isYT = p.id === 'youtube';
            const isFB = p.id === 'facebook';

            return (
              <div
                key={p.id}
                className="rounded-2xl border border-[#E6E0D4] bg-[#FAF8F5] p-4 sm:p-5 hover:shadow-md transition-all space-y-3.5"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#E0D5C3] shadow-xs flex items-center justify-center shrink-0">
                      {isYT && <YouTubeIcon className="w-7 h-7" />}
                      {isFB && <FacebookIcon className="w-7 h-7" />}
                      {p.id === 'instagram' && <InstagramIcon className="w-7 h-7" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif font-black text-base text-[#27231E]">
                          {isMr ? p.nameMr : p.name}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isYT ? 'bg-red-100 text-red-800 border border-red-200' :
                          isFB ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          'bg-pink-100 text-pink-800 border border-pink-200'
                        }`}>
                          {isMr ? p.badgeMr : p.badge}
                        </span>
                      </div>
                      <div className="text-xs font-mono font-semibold text-[#7A5338] mt-0.5">
                        {p.handle}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-medium text-[#456254] bg-[#EAF0EC] border border-[#D2DFD6] px-2.5 py-1 rounded-xl self-start sm:self-auto flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#3F5E4D]" />
                    <span>{isMr ? p.highlightTagMr : p.highlightTag}</span>
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-[#635E56] leading-relaxed">
                  {isMr ? p.descriptionMr : p.description}
                </p>

                {/* Action Row */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#ECE5D8]">
                  {/* Primary Button: Direct to App */}
                  <button
                    type="button"
                    onClick={() => openSocialPlatform(p.id, true)}
                    className={`px-3.5 py-2 rounded-xl text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all ${
                      isYT ? 'bg-red-600 hover:bg-red-700' :
                      isFB ? 'bg-[#1877F2] hover:bg-[#1264ce]' :
                      'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95'
                    }`}
                    title={`Open directly in ${p.name} App or Web`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{isMr ? 'थेट ॲप / वेबवर उघडा' : `Direct to ${p.name.split(' ')[0]} App`}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  {/* Secondary Button: Open Web Link */}
                  <button
                    type="button"
                    onClick={() => openSocialPlatform(p.id, false)}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#27231E] border border-[#DDD5C7] text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                    title={`Open in Web Browser: ${p.url}`}
                  >
                    <Globe className="w-3.5 h-3.5 text-[#7A746B]" />
                    <span>{isMr ? 'वेब ब्राउझर' : 'Web Link'}</span>
                  </button>

                  {/* Copy Link Button */}
                  <button
                    type="button"
                    onClick={() => handleCopy(p.id, p.url)}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#27231E] border border-[#DDD5C7] text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all ml-auto"
                    title="Copy direct profile link to clipboard"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">{isMr ? 'कॉपी झाले!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#7A746B]" />
                        <span>{isMr ? 'लिंक कॉपी करा' : 'Copy Link'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info note */}
        <div className="bg-[#FAF7F2] px-5 py-3.5 border-t border-[#E6E0D4] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7A746B]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {isMr 
                ? 'डॉ. संजय सोपान वराडे यांच्या अधिकृत व्हॉट्सॲप आणि सोशल मीडिया खात्यांद्वारे सत्यापित.' 
                : 'Verified official handles for Dr. Sanjay Sopan Varade & Sopan Hospital.'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#27231E] hover:bg-[#3E3832] text-white text-xs font-bold cursor-pointer transition-colors"
          >
            {isMr ? 'बंद करा' : 'Done / Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Compact Clickable Social Buttons Strip (For Navbar & Top Banner)
 * Directly clickable logos that trigger the social app or popup link!
 */
export const SocialHeaderBadges: React.FC<{
  onOpenSocialModal?: (platform?: 'youtube' | 'facebook' | 'instagram') => void;
  variant?: 'topbar' | 'navbar' | 'floating' | 'footer';
}> = ({ onOpenSocialModal, variant = 'navbar' }) => {
  const { language } = useLanguage();
  const isMr = language === 'mr';

  if (variant === 'topbar') {
    return (
      <div className="flex items-center gap-2 shrink-0">
        {/* YouTube Topbar Badge */}
        <button
          type="button"
          onClick={() => {
            if (onOpenSocialModal) {
              onOpenSocialModal('youtube');
            } else {
              openSocialPlatform('youtube', true);
            }
          }}
          className="hover:scale-105 active:scale-95 transition-transform flex items-center gap-1 bg-black/25 hover:bg-black/40 px-2 py-0.5 rounded-full text-white cursor-pointer border border-white/20 text-[10px] font-semibold"
          title="Watch Dr. Sanjay Varade on YouTube (@dr.sanjayvarade5339)"
        >
          <YouTubeIcon className="w-3 h-3" />
          <span className="hidden md:inline">YouTube</span>
        </button>

        {/* Facebook Topbar Badge */}
        <button
          type="button"
          onClick={() => {
            if (onOpenSocialModal) {
              onOpenSocialModal('facebook');
            } else {
              openSocialPlatform('facebook', true);
            }
          }}
          className="hover:scale-105 active:scale-95 transition-transform flex items-center gap-1 bg-black/25 hover:bg-black/40 px-2 py-0.5 rounded-full text-white cursor-pointer border border-white/20 text-[10px] font-semibold"
          title="Follow Sopan Hospital on Facebook (/sopanhospitalnashik)"
        >
          <FacebookIcon className="w-3 h-3" />
          <span className="hidden md:inline">Facebook</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {/* YouTube Logo Button */}
      <button
        type="button"
        id="btn-nav-youtube"
        onClick={() => {
          if (onOpenSocialModal) {
            onOpenSocialModal('youtube');
          } else {
            openSocialPlatform('youtube', true);
          }
        }}
        className="h-8.5 sm:h-9 px-2 sm:px-2.5 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-400 active:scale-95 shadow-2xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
        title="Dr. Sanjay Varade YouTube Channel (@dr.sanjayvarade5339) - Click to direct to app or pop up"
      >
        <YouTubeIcon className="w-4 h-4" />
        <span className="text-[11px] font-bold text-[#27231E] hidden xl:inline">YouTube</span>
      </button>

      {/* Facebook Logo Button */}
      <button
        type="button"
        id="btn-nav-facebook"
        onClick={() => {
          if (onOpenSocialModal) {
            onOpenSocialModal('facebook');
          } else {
            openSocialPlatform('facebook', true);
          }
        }}
        className="h-8.5 sm:h-9 px-2 sm:px-2.5 rounded-xl bg-white hover:bg-blue-50 text-[#1877F2] border border-blue-200 hover:border-blue-400 active:scale-95 shadow-2xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
        title="Sopan Hospital Facebook Page (/sopanhospitalnashik) - Click to direct to app or pop up"
      >
        <FacebookIcon className="w-4 h-4" />
        <span className="text-[11px] font-bold text-[#27231E] hidden xl:inline">Facebook</span>
      </button>
    </div>
  );
};
