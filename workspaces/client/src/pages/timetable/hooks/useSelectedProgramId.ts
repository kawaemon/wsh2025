import { useStore } from '@wsh-2025/client/src/app/StoreContext';

export function useSelectedProgramId() {
  const state = useStore((s) => s.pages.timetable.selectedProgramId);
  const set = useStore((s) => s.pages.timetable.selectProgram);
  return [state, set] as const;
}
