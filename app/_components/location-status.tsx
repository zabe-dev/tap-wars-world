"use client";

import { useEffect, useRef, useState } from "react";
import { countryCode, locationLabel } from "./countries";
import { getDeviceLocation } from "./device-location";
import { LocationConsent } from "./location-consent";
import { locationConsentDay, millisecondsUntilUtcMidnight } from "./location-consent-date";
import { getVisitorLocation } from "./visitor-location";

const CONSENT_KEY = "tapwars:location-prompt-seen";
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

export function LocationStatus() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [approximate, setApproximate] = useState("");
  const [consentOpen, setConsentOpen] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    void getVisitorLocation().then((place) => {
      setApproximate(locationLabel(place.city, countryCode(place.country)));
    });
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function checkDay() {
      const now = new Date();
      if (IS_DEVELOPMENT) {
        setConsentOpen(true);
        return;
      }
      try {
        if (localStorage.getItem(CONSENT_KEY) !== locationConsentDay(now)) setConsentOpen(true);
      } catch { setConsentOpen(true); }
      clearTimeout(timer);
      timer = setTimeout(checkDay, millisecondsUntilUtcMidnight(now));
    }
    function onVisible() {
      if (document.visibilityState === "visible") checkDay();
    }
    checkDay();
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearTimeout(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, []);

  function dismissConsent() {
    setConsentOpen(false);
    try { localStorage.setItem(CONSENT_KEY, locationConsentDay()); }
    catch { /* The choice still applies until this page is closed. */ }
  }

  function markConsentSeen() {
    try { localStorage.setItem(CONSENT_KEY, locationConsentDay()); }
    catch { /* The choice still applies until this page is closed. */ }
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
    onDismiss={dismissConsent}
    onAllow={() => { markConsentSeen(); void locate(); }}
  />;
}
