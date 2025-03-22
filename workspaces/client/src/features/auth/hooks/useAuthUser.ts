import { useStore } from '@wsh-2025/client/src/app/StoreContext';

export function useAuthUser() {
  return useStore((state) => state.features.auth.user);
}
