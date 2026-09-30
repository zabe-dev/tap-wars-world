"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { motion, useReducedMotion } from "motion/react";
import styles from "./location-consent.module.css";

export function LocationConsent({ open, onAllow, onDismiss, pending = false, result = "", error = "", approximate = "" }: {
  open: boolean;
  onAllow: () => void;
  onDismiss: () => void;
  pending?: boolean;
  result?: string;
  error?: string;
  approximate?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open) {
      element.showModal();
      element.focus();
    }
    else element.close();
    return () => { element.close(); };
  }, [open]);

  return <dialog ref={dialog} tabIndex={-1} autoFocus className={styles.dialog} aria-labelledby="location-consent-title"
    aria-describedby="location-consent-description" onCancel={(event) => { event.preventDefault(); onDismiss(); }}>
    <motion.div
      className={styles.card}
      initial={reducedMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className={styles.icon} aria-hidden="true"><Icon icon="lucide:map-pin" /></div>
      <p className={styles.eyebrow}>GRANT PERMISSION</p>
      <h2 id="location-consent-title">{result ? "Location found" : "Use your device location?"}</h2>
      {result ? <p id="location-consent-description" className={styles.result} role="status">{result}</p> : <>
        <p className={styles.current}><span>Approximate location</span><strong>{approximate || "Detecting…"}</strong><small>Based on your IP address. No permission needed.</small></p>
        <p id="location-consent-description">Your approximate location comes from your public IP geolocation. You can choose to share your device location for more accurate data.</p>
        <p className={styles.disclosure}>Your coordinates go directly to BigDataCloud to identify the location of your device. We do not receive them or use them for country scores.</p>
      </>}
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.actions}>
        <button type="button" onClick={onDismiss}>
          <Icon icon="lucide:x" aria-hidden="true" />
          Not now
        </button>
        <button type="button" className={styles.allow} onClick={result ? onDismiss : onAllow} disabled={pending}>
          <Icon icon={result ? "lucide:check" : "lucide:map-pin"} aria-hidden="true" />
          {pending ? "Finding…" : result ? "Done" : error ? "Try again" : "Use my location"}
        </button>
      </div>
    </motion.div>
  </dialog>;
}
