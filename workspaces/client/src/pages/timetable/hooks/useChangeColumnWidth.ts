import { useStore } from '@wsh-2025/client/src/app/StoreContext';

export function useChangeColumnWidth() {
  return useStore((state) => state.pages.timetable.changeColumnWidth);
}
