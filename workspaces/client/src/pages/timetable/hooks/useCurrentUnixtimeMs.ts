import { useEffect } from 'react';

import { useStore } from '@wsh-2025/client/src/app/StoreContext';

// TODO: なんとかならんかね
export function useCurrentUnixtimeMs(): number {
  const state = useStore((s) => s.pages.timetable.currentUnixtimeMs);
  const update = useStore((s) => s.pages.timetable.refreshCurrentUnixtimeMs);
  useEffect(() => {
    const interval = setInterval(() => {
      update();
    }, 250);
    return () => {
      clearInterval(interval);
    };
  }, []);
  return state;
}
