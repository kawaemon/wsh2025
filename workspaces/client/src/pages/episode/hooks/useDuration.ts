import { useStore } from '@wsh-2025/client/src/app/StoreContext';

export function useDuration() {
  return useStore((state) => state.pages.episode.duration);
}
