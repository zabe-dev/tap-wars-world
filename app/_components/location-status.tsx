"use client";

import { useEffect, useRef, useState } from "react";
import { countryCode, locationLabel } from "./countries";
import { DeviceLocation, getDeviceLocation } from "./device-location";
import { LocationConsent } from "./location-consent";
import { readTapLocation, sameLocation, TAP_LOCATION_KEY } from "./tap-location-storage";
import { getVisitorLocation } from "./visitor-location";

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
  const approximatePlace = useRef<DeviceLocation | null>(null);
  const initialized = useRef(false);
  const callbacks = useRef({ onResolved, onConsentDecision });
  callbacks.current = { onResolved, onConsentDecision };
  const [verifying, setVerifying] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    let cancelled = false;
    void getVisitorLocation().then((place) => {
      if (cancelled || initialized.current) return;
      initialized.current = true;
      approximatePlace.current = place;
      setApproximate(locationLabel(place.city, countryCode(place.country)));
      let saved = null;
      try { saved = readTapLocation(localStorage.getItem(TAP_LOCATION_KEY)); } catch { /* Storage is optional. */ }
      if (saved && (place.country === "Worldwide" || sameLocation(saved.approximate, place))) {
        callbacks.current.onResolved(saved.location);
        callbacks.current.onConsentDecision?.();
      } else setConsentOpen(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (consentRequest > 0) setConsentOpen(true);
  }, [consentRequest]);

  function selectLocation(location: DeviceLocation, source: "device" | "approximate") {
    try {
      localStorage.setItem(TAP_LOCATION_KEY, JSON.stringify({ source, location, approximate: approximatePlace.current ?? location }));
      localStorage.removeItem("wc-device-location");
      localStorage.removeItem("wc-approximate-location");
      localStorage.removeItem("tapwars:location-consent-remembered");
    } catch { /* The choice still applies this visit. */ }
    onResolved(location);
    onConsentDecision?.();
  }

  async function confirmDecision() {
    setVerifying(true);
    try {
      await onVerifyDecision?.();
      return true;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Verification failed. Please try again.");
      return false;
    } finally {
      setVerifying(false);
    }
  }

  async function dismissConsent() {
    if (!approximatePlace.current) return;
    if (!await confirmDecision()) return;
    selectLocation(approximatePlace.current, "approximate");
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
      selectLocation(place, "device");
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
    onDismiss={dismissConsent}
    onClose={closeConsent}
    verifying={verifying}
    onAllow={async () => {
      if (!await confirmDecision()) return;
      if (await locate()) setConsentOpen(false);
    }}
  />;
}
