import { useStore } from '@wsh-2025/client/src/app/StoreContext';

export function useMuted() {
  const muted = useStore((state) => state.pages.program.muted);
  const toggle = useStore((state) => state.pages.program.toggleMuted);
  return [muted, toggle] as const;
}
