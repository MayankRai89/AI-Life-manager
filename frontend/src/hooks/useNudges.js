import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAINudge } from "../redux/slices/aiSlice";

const STORAGE_LAST_NUDGE_KEY = "ai_life_last_nudge_at";
const STORAGE_DISMISSED_KEY = "ai_life_nudge_dismissed_at";
const STORAGE_ENABLED_KEY = "ai_life_nudges_enabled";
const CHECK_INTERVAL_MS = 75 * 60 * 1000; // 75 minutes
const DISMISS_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Helper to safely read from localStorage
 */
function getStorageItem(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Helper to safely write to localStorage
 */
function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage quota or access errors in restricted modes
  }
}

/**
 * Helper to parse "HH:MM" string to minutes from midnight
 */
function parseTimeToMinutes(timeStr, defaultMinutes) {
  if (!timeStr || typeof timeStr !== "string") return defaultMinutes;
  const parts = timeStr.split(":");
  if (parts.length < 2) return defaultMinutes;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return defaultMinutes;
  return h * 60 + m;
}

/**
 * Checks whether current time is within wake-to-sleep window
 */
function isWithinWakeSleepWindow(wakeTime, sleepTime) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const wake = parseTimeToMinutes(wakeTime, 7 * 60); // 07:00
  const sleep = parseTimeToMinutes(sleepTime, 23 * 60); // 23:00

  if (wake < sleep) {
    return currentMinutes >= wake && currentMinutes < sleep;
  } else {
    // Crosses midnight, e.g. wake 22:00, sleep 06:00
    return currentMinutes >= wake || currentMinutes < sleep;
  }
}

/**
 * useNudges Hook
 * Periodically triggers wellness nudge checks (every 75 minutes)
 * Respects wake/sleep schedule, 30m dismissal cooldown, and user preferences.
 */
export function useNudges() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state?.auth) || {};
  const isCheckingRef = useRef(false);

  const checkAndFetchNudge = useCallback(() => {
    // Guard: Prevent duplicate concurrent checks
    if (isCheckingRef.current) return;

    // 1. Check if user enabled nudges
    const nudgesEnabledSetting = getStorageItem(STORAGE_ENABLED_KEY);
    if (nudgesEnabledSetting === "false") {
      return;
    }

    // 2. Check wake-to-sleep window
    const wakeTime = user?.schedule?.wakeTime || "07:00";
    const sleepTime = user?.schedule?.sleepTime || "23:00";
    if (!isWithinWakeSleepWindow(wakeTime, sleepTime)) {
      return;
    }

    // 3. Check dismissal cooldown (30 min)
    const rawDismissed = getStorageItem(STORAGE_DISMISSED_KEY);
    if (rawDismissed) {
      const dismissedAt = parseInt(rawDismissed, 10);
      if (!isNaN(dismissedAt) && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS) {
        return;
      }
    }

    // 4. Check last nudge timestamp (ensure at least 75 min since last fetch)
    const rawLastNudge = getStorageItem(STORAGE_LAST_NUDGE_KEY);
    if (rawLastNudge) {
      const lastNudgeAt = parseInt(rawLastNudge, 10);
      if (!isNaN(lastNudgeAt) && Date.now() - lastNudgeAt < CHECK_INTERVAL_MS) {
        return;
      }
    }

    // Calculate approximate minutes since last break based on last nudge or default
    let minutesSinceLastBreak = 75;
    if (rawLastNudge) {
      const lastNudgeAt = parseInt(rawLastNudge, 10);
      if (!isNaN(lastNudgeAt)) {
        minutesSinceLastBreak = Math.round((Date.now() - lastNudgeAt) / (60 * 1000));
      }
    }

    // Fire nudge request
    isCheckingRef.current = true;
    setStorageItem(STORAGE_LAST_NUDGE_KEY, String(Date.now()));

    dispatch(fetchAINudge(minutesSinceLastBreak))
      .unwrap()
      .catch(() => {
        // AI service gracefully failed, fallback or silence handled in slice
      })
      .finally(() => {
        isCheckingRef.current = false;
      });
  }, [dispatch, user]);

  useEffect(() => {
    if (!user) return;

    // Initial check on mount
    checkAndFetchNudge();

    // Set recurring 75-minute interval
    const intervalId = setInterval(() => {
      checkAndFetchNudge();
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [user, checkAndFetchNudge]);

  return {
    triggerCheck: checkAndFetchNudge,
  };
}

export default useNudges;
