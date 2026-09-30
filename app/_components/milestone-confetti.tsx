"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";

export function MilestoneConfetti({ onComplete }: { onComplete: () => void }) {
	const [size, setSize] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const updateSize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
		updateSize();
		window.addEventListener("resize", updateSize);
		return () => window.removeEventListener("resize", updateSize);
	}, []);

	return <Confetti
		width={size.width}
		height={size.height}
		numberOfPieces={size.width ? 180 : 0}
		recycle={false}
		tweenDuration={3500}
		gravity={0.16}
		colors={["#ff3d8b", "#7c5cff", "#22c55e", "#ffd23f"]}
		style={{ position: "fixed", inset: 0, zIndex: 20, pointerEvents: "none" }}
		onConfettiComplete={onComplete}
	/>;
}
