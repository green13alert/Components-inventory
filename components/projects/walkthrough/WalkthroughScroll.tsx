import { createContext, useCallback, useContext, useRef, type ReactNode } from 'react';
import type { ScrollView } from 'react-native';

import { anchoredMarkerUpdate } from '@/lib/scroll-anchor';

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
  const holding = useRef(false);
  const holdToken = useRef(0);
  const keyRef = useRef(resetKey);
  if (keyRef.current !== resetKey) {
    keyRef.current = resetKey;
    offset.current = 0;
    expected.current = null;
    correcting.current = false;
    dragging.current = false;
    holding.current = false;
    holdToken.current += 1;
  }

  const holdAnchor = useCallback(() => {
    holding.current = true;
    const token = ++holdToken.current;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (holdToken.current === token) {
          holding.current = false;
        }
      });
    });
  }, []);

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
    const update = anchoredMarkerUpdate({
      previousScreenY: expected.current,
      nextScreenY: screenY,
      userIsDragging: false,
      holdPosition: holding.current,
    });
    if (update.delta === 0) {
      expected.current = update.expectedScreenY;
      return;
    }
    const next = Math.max(0, offset.current + update.delta);
    offset.current = next;
    expected.current = update.expectedScreenY;
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

  return { scrollRef, reportMarker, holdAnchor, onScroll, onScrollBeginDrag, onScrollEndDrag, onMomentumScrollEnd: onScrollEndDrag };
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
