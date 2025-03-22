import { useStore } from '@wsh-2025/client/src/app/StoreContext';

export function useCloseNewFeatureDialog() {
  return useStore((state) => state.pages.timetable.closeNewFeatureDialog);
}
