"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { motion, useReducedMotion } from "motion/react";
import styles from "./location-consent.module.css";

export function LocationConsent({ open, onAllow, onDismiss, onClose, pending = false, result = "", error = "", approximate = "", rememberChoice = false, onRememberChange }: {
  open: boolean;
  onAllow: () => void;
  onDismiss: () => void;
  onClose?: () => void;
  pending?: boolean;
  result?: string;
  error?: string;
  approximate?: string;
  rememberChoice?: boolean;
  onRememberChange?: (remember: boolean) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open) {
      element.showModal();
      element.focus();
      const previousBodyOverflow = document.body.style.overflow;
      const previousDocumentOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousBodyOverflow;
        document.documentElement.style.overflow = previousDocumentOverflow;
        element.close();
      };
    }
    element.close();
    return undefined;
  }, [open]);

  return <dialog ref={dialog} tabIndex={-1} autoFocus className={styles.dialog} aria-labelledby="location-consent-title"
    aria-describedby="location-consent-description" onClick={(event) => { if (event.target === event.currentTarget) onClose?.(); }} onCancel={(event) => { event.preventDefault(); onClose?.(); }}>
    <motion.div
      className={styles.card}
      initial={reducedMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <button type="button" className={styles.close} onClick={onClose} aria-label="Close location permission dialog">
        <Icon icon="lucide:x" aria-hidden="true" />
      </button>
      <div className={styles.icon} aria-hidden="true"><Icon icon="lucide:map-pin" /></div>
      <p className={styles.eyebrow}>GRANT PERMISSION</p>
      <h2 id="location-consent-title">{result ? "Location found" : "Use your device location?"}</h2>
      {result ? <p id="location-consent-description" className={styles.result} role="status">{result}</p> : <>
        <p className={styles.current}><span>Approximate location</span><strong>{approximate || "Detecting…"}</strong><small>Based on your IP address. No permission needed.</small></p>
        <p id="location-consent-description">Your approximate location comes from your public IP geolocation. You can choose to share your device location for more accurate data.</p>
        <p className={styles.disclosure}>Your coordinates go directly to <a href="https://www.bigdatacloud.com/" target="_blank" rel="nofollow noreferrer">BigDataCloud</a> to identify the location of your device. We do not receive these coordinates or use them for country scores.</p>
        <label className={styles.remember}>
          <input type="checkbox" checked={rememberChoice} onChange={(event) => onRememberChange?.(event.target.checked)} />
          <span className={styles.checkmark} aria-hidden="true"><Icon icon="lucide:check" /></span>
          <span>Remember my choice for 7 days</span>
        </label>
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
