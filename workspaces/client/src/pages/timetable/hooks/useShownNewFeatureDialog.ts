import { useStore } from '@wsh-2025/client/src/app/StoreContext';

export function useShownNewFeatureDialog(): boolean {
  return useStore((state) => state.pages.timetable.shownNewFeatureDialog);
}
