import { useEffect } from 'react';

import { useStore } from '@wsh-2025/client/src/app/StoreContext';

// TODO: 消すべき
export function useSubscribePointer(): void {
  const updatePointer = useStore((s) => s.features.layout.updatePointer);

  useEffect(() => {
    const abortController = new AbortController();

    const handlePointerMove = (ev: MouseEvent) => {
      updatePointer({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener('pointermove', handlePointerMove, { signal: abortController.signal });

    return () => {
      abortController.abort();
    };
  }, []);
}
