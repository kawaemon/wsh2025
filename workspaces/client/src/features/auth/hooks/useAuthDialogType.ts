import { useStore } from '@wsh-2025/client/src/app/StoreContext';

export function useAuthDialogType() {
  return useStore((state) => state.features.auth.dialog);
}
