import { createContext, useCallback, useContext, useRef, type ReactNode } from 'react';
import type { ScrollView } from 'react-native';

import { scrollAnchorDelta } from '@/lib/scroll-anchor';

type ScrollEvent = {
  nativeEvent: { contentOffset: { y: number } };
};

const WalkthroughScrollContext = createContext<((screenY: number) => void) | null>(null);

export function useWalkthroughMarker(): ((screenY: number) => void) | null {
  return useContext(WalkthroughScrollContext);
}

export function useWalkthroughScrollController(resetKey: string) {
  const scrollRef = useRef<ScrollView | null>(null);
  const offset = useRef(0);
  const dragging = useRef(false);
  const expected = useRef<number | null>(null);
  const correcting = useRef(false);
  const keyRef = useRef(resetKey);
  if (keyRef.current !== resetKey) {
    keyRef.current = resetKey;
    offset.current = 0;
    expected.current = null;
    correcting.current = false;
    dragging.current = false;
  }

  const reportMarker = useCallback((screenY: number) => {
    if (correcting.current) {
      if (expected.current == null || Math.abs(screenY - expected.current) < 1) {
        expected.current = screenY;
        correcting.current = false;
      }
      return;
    }
    if (dragging.current) {
      expected.current = screenY;
      return;
    }
    const delta = scrollAnchorDelta(expected.current, screenY, false);
    if (expected.current == null || delta === 0) {
      expected.current = screenY;
      return;
    }
    const next = Math.max(0, offset.current + delta);
    offset.current = next;
    expected.current = screenY - delta;
      correcting.current = true;
      scrollRef.current?.scrollTo({ y: next, animated: false });
      requestAnimationFrame(() => {
        correcting.current = false;
      });
  }, []);

  const onScroll = useCallback((event: ScrollEvent) => {
    offset.current = event.nativeEvent.contentOffset.y;
  }, []);

  const onScrollBeginDrag = useCallback(() => {
    dragging.current = true;
  }, []);

  const onScrollEndDrag = useCallback(() => {
    dragging.current = false;
    expected.current = null;
  }, []);

  return { scrollRef, reportMarker, onScroll, onScrollBeginDrag, onScrollEndDrag, onMomentumScrollEnd: onScrollEndDrag };
}

export function WalkthroughScrollProvider({
  reportMarker,
  children,
}: {
  reportMarker: (screenY: number) => void;
  children: ReactNode;
}) {
  const reportRef = useRef(reportMarker);
  reportRef.current = reportMarker;
  const stable = useRef((screenY: number) => {
    reportRef.current(screenY);
  });
  return <WalkthroughScrollContext.Provider value={stable.current}>{children}</WalkthroughScrollContext.Provider>;
}
