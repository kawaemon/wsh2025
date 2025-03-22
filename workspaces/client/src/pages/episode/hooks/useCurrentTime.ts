import { useStore } from '@wsh-2025/client/src/app/StoreContext';

export function useCurrentTime() {
  const state = useStore((s) => s.pages.episode.currentTime);
  const set = useStore((s) => s.pages.episode.updateCurrentTime);
  return [state, set] as const;
}
