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

export function LocationStatus({ onResolved }: { onResolved: (location: DeviceLocation) => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [approximate, setApproximate] = useState("");
  const [consentOpen, setConsentOpen] = useState(false);
  const [rememberChoice, setRememberChoice] = useState(false);
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
    } catch {
      setConsentOpen(true);
    }
  }, []);

  function saveRememberChoice(remember: boolean) {
    try {
      if (remember) localStorage.setItem(REMEMBER_KEY, rememberedLocationConsentValue());
      else localStorage.removeItem(REMEMBER_KEY);
    } catch {
      /* The choice still applies until this page is closed. */
    }
  }

  function dismissConsent() {
    setConsentOpen(false);
    saveRememberChoice(rememberChoice);
  }

  async function locate() {
    if (busy.current) return;
    if (!window.isSecureContext || !navigator.geolocation) {
      setError("Device location requires HTTPS and a supported browser.");
      return;
    }
    busy.current = true;
    setPending(true);
    setError("");
    setResult("");
    try {
      const place = await getDeviceLocation(navigator.geolocation);
      onResolved(place);
      setResult(`Device location: ${place.city}, ${place.country}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Location is unavailable. Please try again later.");
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
    onAllow={() => { saveRememberChoice(rememberChoice); void locate(); }}
  />;
}
