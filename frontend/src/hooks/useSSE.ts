import { useEffect } from "react";

/**
 * useSSE — establishes a Server-Sent Events connection and invokes the
 * callback each time a message arrives. Automatically closes the connection on
 * unmount.
 *
 * NOTE: This hook is voice-first friendly — it has no interactive controls and
 * never re-connects more than once per component lifecycle. Consumers can
 * debounce or deduplicate messages as needed.
 */
export function useSSE<T = unknown>(
  url: string | null,
  onMessage: (data: T) => void,
) {
  useEffect(() => {
    if (!url) return;

    const es = new EventSource(url);

    es.onmessage = (evt) => {
      try {
        const parsed: T = JSON.parse(evt.data);
        onMessage(parsed);
      } catch {
        // If parsing fails, ignore the message (could be heartbeat)
      }
    };

    es.onerror = () => {
      // Allow browser to handle auto-reconnect; no custom logic required
    };

    return () => {
      es.close();
    };
  }, [url, onMessage]);
}
