import { useEffect, useRef, useCallback } from 'react';

export interface SseEvent {
  requestId: number;
  status: string;
  action: string;
  timestamp: string;
}

/**
 * useSSE — subscribes to server-sent events for real-time request updates.
 * Auto-reconnects on disconnect. Cleans up on unmount.
 *
 * @param onEvent - callback when a 'request-update' event is received
 * @param enabled - whether the hook should be active (default: true)
 */
export default function useSSE(onEvent: (event: SseEvent) => void, enabled = true) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    if (!enabled) return;

    // Close any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource('http://localhost:8080/api/sse/subscribe', {
      withCredentials: true,
    });

    es.addEventListener('connected', () => {
      console.log('[SSE] Connected to real-time updates');
    });

    es.addEventListener('request-update', (e: MessageEvent) => {
      try {
        const data: SseEvent = JSON.parse(e.data);
        console.log('[SSE] Request update:', data);
        onEventRef.current(data);
      } catch (err) {
        console.error('[SSE] Failed to parse event:', err);
      }
    });

    es.onerror = () => {
      console.warn('[SSE] Connection lost, will auto-reconnect...');
      es.close();
      // EventSource auto-reconnects, but if we closed it we need to manually retry
      setTimeout(() => {
        if (enabled) connect();
      }, 5000);
    };

    eventSourceRef.current = es;
  }, [enabled]);

  useEffect(() => {
    connect();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [connect]);
}
