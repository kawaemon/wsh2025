import { useCallback, useLayoutEffect, useRef, useState } from 'react';

const MIN_WIDTH = 276;
const GAP = 12;

// repeat(auto-fill, minmax(276px, 1fr)) を計算で求める
// TODO: CSS でなんとかできると思う
export function useCarouselItemWidth() {
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserver = useRef<ResizeObserver>(null);
  const [width, setWidth] = useState(MIN_WIDTH);

  // TODO: layout effect にすべき？
  useLayoutEffect(() => {
    resizeObserver.current = new ResizeObserver((e) => {
      update(e[0]?.target ?? null);
    });
    return () => {
      resizeObserver.current?.disconnect();
    };
  }, []);

  const update = (div: Element | null) => {
    if (div == null) {
      setWidth(MIN_WIDTH);
      return;
    }
    const styles = window.getComputedStyle(div);
    const innerWidth = div.clientWidth - parseInt(styles.paddingLeft) - parseInt(styles.paddingRight);
    const itemCount = Math.max(0, Math.floor((innerWidth + GAP) / (MIN_WIDTH + GAP)));
    const itemWidth = Math.floor((innerWidth + GAP) / itemCount - GAP);
    setWidth(itemWidth);
  };

  const onAttach = useCallback((element: HTMLDivElement | null) => {
    if (containerRef.current != null) {
      resizeObserver.current?.unobserve(containerRef.current);
    }
    containerRef.current = element;
    if (element != null) {
      resizeObserver.current?.observe(element);
      update(element);
    }
  }, []);

  return { ref: onAttach, width };
}
