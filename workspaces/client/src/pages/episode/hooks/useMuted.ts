import { useStore } from '@wsh-2025/client/src/app/StoreContext';

export function useMuted() {
  const muted = useStore((state) => state.pages.episode.muted);
  const toggleMuted = useStore((state) => state.pages.episode.toggleMuted);
  return [muted, toggleMuted] as const;
}
