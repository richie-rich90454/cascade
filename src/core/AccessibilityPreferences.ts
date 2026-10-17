const TEXT_SCALE_STORAGE_KEY = "cascade.accessibility.text-scale.v1";
const MINIMUM_TEXT_SCALE = 0.8;
const MAXIMUM_TEXT_SCALE = 1.2;

export function prefersReducedMotion(): boolean {
    return (
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
}

export function getTextScale(): number {
    try {
        const storedValue = typeof localStorage === "undefined" ? null : localStorage.getItem(TEXT_SCALE_STORAGE_KEY);
        const parsedValue = storedValue === null ? 1 : Number(storedValue);
        if (!Number.isFinite(parsedValue)) {
            return 1;
        }
        return Math.max(MINIMUM_TEXT_SCALE, Math.min(MAXIMUM_TEXT_SCALE, parsedValue));
    } catch {
        return 1;
    }
}

export function setTextScale(textScale: number): number {
    const clampedScale = Math.max(MINIMUM_TEXT_SCALE, Math.min(MAXIMUM_TEXT_SCALE, Math.round(textScale * 100) / 100));
    try {
        if (typeof localStorage !== "undefined") {
            localStorage.setItem(TEXT_SCALE_STORAGE_KEY, String(clampedScale));
        }
    } catch {
        // The setting remains usable for the current scene if storage is unavailable.
    }
    return clampedScale;
}
