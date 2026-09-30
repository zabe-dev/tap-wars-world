"use client";

import { useEffect, useRef, useState } from "react";
import { countryCode, locationLabel } from "./countries";
import { DeviceLocation, getDeviceLocation } from "./device-location";
import { LocationConsent } from "./location-consent";
import {
  hasRememberedLocationConsent,
  rememberedLocationConsentValue,
} from "./location-consent-storage";
import { getVisitorLocation } from "./visitor-location";

const REMEMBER_KEY = "tapwars:location-consent-remembered";

export function LocationStatus({ onResolved, onConsentDecision, onVerifyDecision, consentRequest = 0 }: {
  onResolved: (location: DeviceLocation) => void;
  onConsentDecision?: () => void;
  onVerifyDecision?: () => Promise<void>;
  consentRequest?: number;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [approximate, setApproximate] = useState("");
  const [consentOpen, setConsentOpen] = useState(false);
  const [rememberChoice, setRememberChoice] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    void getVisitorLocation().then((place) => {
      setApproximate(locationLabel(place.city, countryCode(place.country)));
    });
  }, []);

  useEffect(() => {
    try {
      const remembered = hasRememberedLocationConsent(localStorage.getItem(REMEMBER_KEY));
      if (!remembered) localStorage.removeItem(REMEMBER_KEY);
      setConsentOpen(!remembered);
      if (remembered) onConsentDecision?.();
    } catch {
      setConsentOpen(true);
    }
  }, [onConsentDecision]);

  useEffect(() => {
    if (consentRequest > 0) setConsentOpen(true);
  }, [consentRequest]);

  function saveRememberChoice(remember: boolean) {
    try {
      if (remember) localStorage.setItem(REMEMBER_KEY, rememberedLocationConsentValue());
      else localStorage.removeItem(REMEMBER_KEY);
    } catch {
      /* The choice still applies until this page is closed. */
    }
  }

  async function confirmDecision() {
    setVerifying(true);
    try {
      await onVerifyDecision?.();
      onConsentDecision?.();
      saveRememberChoice(rememberChoice);
      return true;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Verification failed. Please try again.");
      return false;
    } finally {
      setVerifying(false);
    }
  }

  async function dismissConsent() {
    if (!await confirmDecision()) return;
    setConsentOpen(false);
  }

  function closeConsent() {
    setConsentOpen(false);
  }

  async function locate() {
    if (busy.current) return false;
    if (!window.isSecureContext || !navigator.geolocation) {
      setError("Device location requires HTTPS and a supported browser.");
      return false;
    }
    busy.current = true;
    setPending(true);
    setError("");
    setResult("");
    try {
      const place = await getDeviceLocation(navigator.geolocation);
      onResolved(place);
      setResult("");
      return true;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Location is unavailable. Please try again later.");
      return false;
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  return <LocationConsent
    open={consentOpen}
    pending={pending}
    result={result}
    error={error}
    approximate={approximate}
    rememberChoice={rememberChoice}
    onRememberChange={setRememberChoice}
    onDismiss={dismissConsent}
    onClose={closeConsent}
    verifying={verifying}
    onAllow={async () => {
      if (!await confirmDecision()) return;
      if (await locate()) setConsentOpen(false);
    }}
  />;
}
