import { useStore } from '@wsh-2025/client/src/app/StoreContext';

interface Params {
  referenceId: string;
}

export function useRecommended({ referenceId }: Params) {
  const state = useStore((state) => {
    const moduleIds = state.features.recommended.references[referenceId];

    const modules = (moduleIds ?? [])
      .map((moduleId) => state.features.recommended.recommendedModules[moduleId])
      .filter(<T>(m: T): m is NonNullable<T> => m != null);

    return modules;
  }, haveSameId);

  return state;
}

function haveSameId(a: Array<{ id: string }>, b: Array<{ id: string }>): boolean {
  return a.every((a) => b.some((b) => a.id === b.id));
}
