"use client";

import Script from "next/script";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import styles from "./turnstile-widget.module.css";

const SITE_KEY = "0x4AAAAAAFKMDr4uK-TRC8Dc";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
	render: (container: HTMLElement, options: Record<string, unknown>) => string;
	execute: (widgetId: string) => void;
	reset: (widgetId: string) => void;
	remove: (widgetId: string) => void;
};

declare global { interface Window { turnstile?: TurnstileApi } }

export type TurnstileHandle = { getToken: () => Promise<string>; reset: () => void };

export const TurnstileWidget = forwardRef<TurnstileHandle>(function TurnstileWidget(_, ref) {
	const container = useRef<HTMLDivElement>(null);
	const widgetId = useRef<string | null>(null);
	const ready = useRef<Promise<void> | null>(null);
	const resolveReady = useRef<(() => void) | null>(null);
	const rejectReady = useRef<((error: Error) => void) | null>(null);
	const pending = useRef<{ resolve: (token: string) => void; reject: (error: Error) => void } | null>(null);

	if (!ready.current) {
		const initialization = new Promise<void>((resolve, reject) => {
			resolveReady.current = resolve;
			rejectReady.current = reject;
		});
		initialization.catch(() => undefined);
		ready.current = initialization;
	}

	function renderWidget() {
		if (!window.turnstile || !container.current || widgetId.current) return;
		try {
			widgetId.current = window.turnstile.render(container.current, {
				sitekey: SITE_KEY,
				action: "tap",
				execution: "execute",
				appearance: "interaction-only",
				callback: (token: string) => { pending.current?.resolve(token); pending.current = null; },
				"error-callback": () => { pending.current?.reject(new Error("Bot verification failed. Please try again.")); pending.current = null; },
				"expired-callback": () => { pending.current?.reject(new Error("Bot verification expired. Please try again.")); pending.current = null; },
				"timeout-callback": () => { pending.current?.reject(new Error("Bot verification timed out. Please try again.")); pending.current = null; },
			});
			resolveReady.current?.();
			resolveReady.current = null;
			rejectReady.current = null;
		} catch {
			rejectReady.current?.(new Error("Bot verification could not load."));
			rejectReady.current = null;
		}
	}

	function handleScriptError() {
		rejectReady.current?.(new Error("Bot verification could not load."));
		rejectReady.current = null;
	}

	useEffect(() => {
		renderWidget();
		return () => {
			if (widgetId.current) window.turnstile?.remove(widgetId.current);
			widgetId.current = null;
			pending.current?.reject(new Error("Bot verification was interrupted."));
			pending.current = null;
		};
	}, []);

	useImperativeHandle(ref, () => ({
		async getToken() {
			await ready.current;
			if (!widgetId.current || !window.turnstile) throw new Error("Bot verification is still loading.");
			if (pending.current) throw new Error("Bot verification is already running.");
			window.turnstile.reset(widgetId.current);
			return new Promise<string>((resolve, reject) => {
				pending.current = { resolve, reject };
				window.turnstile?.execute(widgetId.current!);
			});
		},
		reset() {
			if (widgetId.current) window.turnstile?.reset(widgetId.current);
		},
	}), []);

	return <><Script src={SCRIPT_SRC} strategy="afterInteractive" onLoad={renderWidget} onError={handleScriptError} /><div ref={container} className={styles.widget} /></>;
});
