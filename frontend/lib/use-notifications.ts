"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  notificationsApi,
  type AdminNotification,
  type NotificationFeed,
} from "@/lib/api";

const POLL_INTERVAL_MS = 15_000;

type State = {
  items: AdminNotification[];
  unread: number;
  loading: boolean;
  error: string | null;
};

const INITIAL: State = { items: [], unread: 0, loading: true, error: null };

export function useNotifications(enabled: boolean) {
  const [state, setState] = useState<State>(INITIAL);
  const seenRef = useRef<{ reservation_id: number; contact_id: number }>({
    reservation_id: 0,
    contact_id: 0,
  });
  const inflight = useRef(false);

  const fetchOnce = useCallback(async () => {
    if (inflight.current) return;
    inflight.current = true;
    try {
      const { reservation_id, contact_id } = seenRef.current;
      const res: NotificationFeed = await notificationsApi.feed({
        last_seen_reservation_id: reservation_id,
        last_seen_contact_id: contact_id,
      });
      seenRef.current = res.latest;
      setState({
        items: res.data,
        unread: res.unread_count,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false, error: (err as Error).message }));
    } finally {
      inflight.current = false;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setState(INITIAL);
      return;
    }
    fetchOnce();
    const id = setInterval(fetchOnce, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [enabled, fetchOnce]);

  const markAllRead = useCallback(() => {
    setState((prev) => ({ ...prev, unread: 0 }));
  }, []);

  return { ...state, refresh: fetchOnce, markAllRead };
}
