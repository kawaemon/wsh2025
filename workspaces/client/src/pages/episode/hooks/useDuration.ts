import { useStore } from '@wsh-2025/client/src/app/StoreContext';

export function useDuration() {
  const state = useStore((s) => s);
  return state.pages.episode.duration;
}
