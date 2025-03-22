import { useStore } from '@wsh-2025/client/src/app/StoreContext';

export function usePlayerRef() {
  return useStore((state) => state.pages.episode.playerRef);
}
