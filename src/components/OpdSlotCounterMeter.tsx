import React, { useState } from 'react';
import { 
  Users, 
  TrendingDown, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Sliders, 
  ShieldCheck,
  PhoneCall,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Lock
} from 'lucide-react';
import { OpdSlotStats, isAdminLoggedIn } from '../utils/opdSlotUtils';
import { OpdAdminPortalModal } from './OpdAdminPortalModal';

interface OpdSlotCounterMeterProps {
  stats: OpdSlotStats;
  selectedDate?: string;
  onSimulateBooking?: () => void;
  onSetRemainingSlots?: (targetRemaining: number) => void;
  onResetSlots?: () => void;
  compact?: boolean;
}

export const OpdSlotCounterMeter: React.FC<OpdSlotCounterMeterProps> = ({
  stats,
  selectedDate,
  onSimulateBooking,
  onSetRemainingSlots,
  onResetSlots,
  compact = false
}) => {
  const [showSimControls, setShowSimControls] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const adminActive = isAdminLoggedIn();

  // Status-based styling
  const colorStyles = {
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-900',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      barColor: 'bg-emerald-500',
      ringColor: 'ring-emerald-500/20'
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
      barColor: 'bg-amber-500',
      ringColor: 'ring-amber-500/20'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-900',
      badgeBg: 'bg-orange-100 text-orange-800 border-orange-300',
      barColor: 'bg-orange-500',
      ringColor: 'ring-orange-500/20'
    },
    rose: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-950',
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
      barColor: 'bg-rose-500',
      ringColor: 'ring-rose-500/20'
    }
  }[stats.statusColor];

  if (compact) {
    return (
      <>
        <div className={`p-3 rounded-2xl border ${colorStyles.border} ${colorStyles.bg} flex items-center justify-between gap-3 text-xs`}>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#8E5B3E] shrink-0" />
            <div>
              <div className="font-bold text-[#27231E]">
                OPD Quota: {stats.remainingSlots} / {stats.totalSlots} Slots Remaining
              </div>
              <div className="text-[11px] text-[#6E675D]">
                {stats.isFull ? 'Daily capacity reached (0 slots)' : `Intake capacity: ${stats.totalSlots} max (${stats.bookedCount} booked)`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAdminModal(true)}
              className="p-1.5 rounded-xl bg-white border border-[#DDD5C7] text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
              title="OPD Administration: Reset counter, extend capacity, accept/reject"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-700" />
            </button>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${colorStyles.badgeBg}`}>
              {stats.statusLabel}
            </span>
          </div>
        </div>

        <OpdAdminPortalModal
          isOpen={showAdminModal}
          onClose={() => setShowAdminModal(false)}
        />
      </>
    );
  }

  return (
    <div className={`rounded-3xl border-2 ${colorStyles.border} ${colorStyles.bg} p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all duration-300`}>
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/40 rounded-full blur-2xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 pb-4 mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#7A5338] text-xs font-bold border border-[#E6E0D4] mb-1.5 shadow-2xs">
            <TrendingDown className="w-3.5 h-3.5 text-[#8E5B3E]" />
            Live Descending OPD Slot System ({stats.totalSlots} → 0)
          </div>
          <h3 className="text-lg sm:text-xl font-serif font-bold text-[#27231E]">
            Daily OPD Patient Appointment Quota
          </h3>
          <p className="text-xs text-[#635E56] mt-0.5">
            Strict cap of {stats.totalSlots} outpatients per day to guarantee unhurried, exhaustive neurological consultations with Dr. Sanjay Sopan Varade.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* OPD Admin Control Button */}
          <button
            type="button"
            id="btn-opd-admin-panel"
            onClick={() => setShowAdminModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-2xs transition-colors"
            title="Open OPD Desk Administration to reset counter, extend capacity, or accept/reject appointments"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>OPD Admin Desk</span>
            {adminActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            )}
          </button>

          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-2xs ${colorStyles.badgeBg}`}>
            {stats.isFull ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            )}
            {stats.statusLabel}
          </span>
        </div>
      </div>

      {/* Big Counter Display & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Counter Number Hero */}
        <div className="md:col-span-4 bg-white/90 rounded-2xl p-4 border border-[#E8E2D8] flex items-center justify-between sm:justify-start gap-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8E5B3E] to-[#704229] text-white flex flex-col items-center justify-center font-bold shrink-0 shadow-xs">
            <span className="text-[10px] uppercase font-mono tracking-wider text-amber-200">REMAINING</span>
            <span className="text-2xl font-black font-mono leading-none">{stats.remainingSlots}</span>
            <span className="text-[9px] text-amber-100/80">OF {stats.totalSlots}</span>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#8A8173] font-semibold">
              Live Descending Count
            </div>
            <div className="text-lg font-serif font-black text-[#27231E]">
              {stats.remainingSlots} <span className="text-xs font-normal text-[#635E56]">/ {stats.totalSlots} Slots Left</span>
            </div>
            <div className="text-[11px] text-[#7A746B] mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#8E5B3E]" />
              {stats.bookedCount} booked so far
            </div>
          </div>
        </div>

        {/* Progress Bar & Capacity Visualization */}
        <div className="md:col-span-8 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#27231E] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#8E5B3E]" />
              OPD Patient Slot Allocation ({selectedDate ? `Date: ${selectedDate}` : 'Today’s Intake'})
            </span>
            <span className="font-mono font-bold text-[#27231E]">
              {stats.percentageBooked}% Capacity Booked ({stats.bookedCount} / {stats.totalSlots})
            </span>
          </div>

          {/* Visual Track */}
          <div className="h-3.5 w-full bg-white/80 rounded-full overflow-hidden border border-[#DED7CA] p-0.5 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-500 ${colorStyles.barColor}`}
              style={{ width: `${Math.min(100, Math.max(2, stats.percentageBooked))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#7A746B]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
              Slot 1 (Starting quota: {stats.totalSlots})
            </span>
            <span className="font-medium text-[#27231E]">
              {stats.isFull 
                ? `All ${stats.totalSlots} slots assigned (0 remaining)` 
                : `Next available: Slot #${stats.nextSlotNumber}`}
            </span>
            <span className="flex items-center gap-1">
              Slot {stats.totalSlots} (Descending to 0)
              <span className={`w-2 h-2 rounded-full inline-block ${stats.isFull ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            </span>
          </div>
        </div>
      </div>

      {/* OPD Full Notice Banner if 0 slots */}
      {stats.isFull && (
        <div className="mt-4 p-4 rounded-2xl bg-rose-100 border border-rose-300 text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <div className="font-bold text-sm">
                Today's OPD Quota of {stats.totalSlots} Patients is Full (0 Slots Left)
              </div>
              <div className="text-xs text-rose-800">
                To maintain comprehensive patient care, OPD consultations are capped at {stats.totalSlots}. Please select another date, or call our emergency hotline for acute stroke / urgent triage.
              </div>
            </div>
          </div>
          <a
            href="tel:02532317364"
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            Call Emergency (0253 2317364)
          </a>
        </div>
      )}

      {/* Simulation / Testing Controls Toggle */}
      <div className="mt-4 pt-3 border-t border-black/5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="text-[11px] text-[#7A746B] flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#456254]" />
          Token Numbers automatically mirror the descending slot queue (e.g. Slot #{stats.nextSlotNumber})
        </div>

        <button
          type="button"
          onClick={() => setShowSimControls(!showSimControls)}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8E5B3E] hover:text-[#704229] hover:underline"
        >
          <Sliders className="w-3 h-3" />
          <span>{showSimControls ? 'Hide' : 'Test Counter Simulation (50 → 0)'}</span>
          {showSimControls ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Admin / Demonstration Simulation Panel */}
      {showSimControls && (
        <div className="mt-3 p-3.5 rounded-2xl bg-white/95 border border-[#DFD6C8] shadow-xs space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-[#27231E] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Interactive Slot Counter Tester
            </span>
            <span className="text-[#7A746B]">
              Quickly test the counter descending from 50 down to 0
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {onSimulateBooking && (
              <button
                type="button"
                onClick={onSimulateBooking}
                disabled={stats.isFull}
                className="px-3 py-1.5 rounded-xl bg-[#8E5B3E] hover:bg-[#784A31] disabled:opacity-50 text-white text-xs font-semibold shadow-2xs flex items-center gap-1"
                title="Decrements slot counter by 1"
              >
                <TrendingDown className="w-3 h-3" />
                Book 1 Slot (-1 Descending)
              </button>
            )}

            {onSetRemainingSlots && (
              <>
                <button
                  type="button"
                  onClick={() => onSetRemainingSlots(10)}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-semibold"
                  title="Simulate 40 booked, 10 remaining"
                >
                  Set to 10 Slots Left
                </button>
                <button
                  type="button"
                  onClick={() => onSetRemainingSlots(2)}
                  className="px-2.5 py-1.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-950 border border-orange-300 text-xs font-semibold"
                  title="Simulate surge: only 2 slots left"
                >
                  Set to 2 Slots Left (Surge)
                </button>
                <button
                  type="button"
                  onClick={() => onSetRemainingSlots(0)}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-950 border border-rose-300 text-xs font-semibold"
                  title="Simulate OPD full (50 booked, 0 remaining)"
                >
                  Set to 0 Slots Left (OPD Full)
                </button>
              </>
            )}

            {onResetSlots && (
              <button
                type="button"
                onClick={onResetSlots}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold flex items-center gap-1 ml-auto"
                title="Resets daily counter to full 50 slots"
              >
                <RefreshCw className="w-3 h-3 text-slate-600" />
                Reset Counter to 50
              </button>
            )}
          </div>
        </div>
      )}
      {/* Modal instance for full view */}
      <OpdAdminPortalModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
      />
    </div>
  );
};
