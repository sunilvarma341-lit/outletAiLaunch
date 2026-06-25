import { useEffect, useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";

const SPRING = { stiffness: 90, damping: 14, mass: 0.5 };

/**
 * Tracks mouse position (desktop) and device orientation (mobile gyro) and
 * exposes smoothed -1..1 motion values for x/y, plus iOS permission request.
 */
export function useTilt() {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING);
  const y = useSpring(rawY, SPRING);
  const baseline = useRef(null);

  useEffect(() => {
    function handleMouseMove(e) {
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
    }

    function handleOrientation(e) {
      if (e.beta === null || e.gamma === null) return;
      if (!baseline.current) {
        baseline.current = { beta: e.beta, gamma: e.gamma };
      }
      const dx = (e.gamma - baseline.current.gamma) / 30;
      const dy = (e.beta - baseline.current.beta) / 30;
      rawX.set(Math.max(-1, Math.min(1, dx)));
      rawY.set(Math.max(-1, Math.min(1, dy)));
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("deviceorientation", handleOrientation);

    function requestIOSPermission() {
      if (typeof DeviceOrientationEvent?.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission().catch(() => {});
      }
      window.removeEventListener("pointerdown", requestIOSPermission);
    }
    window.addEventListener("pointerdown", requestIOSPermission, { once: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("deviceorientation", handleOrientation);
      window.removeEventListener("pointerdown", requestIOSPermission);
    };
  }, [rawX, rawY]);

  return { x, y };
}
