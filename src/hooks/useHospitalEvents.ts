import { useState, useEffect } from 'react';
import { HospitalEvent } from '../types';
import { loadHospitalEvents } from '../utils/hospitalEventsUtils';
import { subscribeToHospitalEvents } from '../lib/firebase';

/**
 * React hook to reactively subscribe to the active hospital special occasion gallery photos.
 * Synchronizes in real-time across all connected devices via Firestore onSnapshot.
 */
export function useHospitalEvents() {
  const [events, setEvents] = useState<HospitalEvent[]>(() => loadHospitalEvents());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = subscribeToHospitalEvents((liveEvents) => {
      if (liveEvents && liveEvents.length > 0) {
        setEvents(liveEvents);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    events,
    loading
  };
}

export default useHospitalEvents;
