import { useStore } from '@wsh-2025/client/src/app/StoreContext';

export function usePlaying() {
  const playing = useStore((s) => s.pages.episode.playing);
  const togglePlay = useStore((s) => s.pages.episode.togglePlay);
  return [playing, togglePlay] as const;
}
