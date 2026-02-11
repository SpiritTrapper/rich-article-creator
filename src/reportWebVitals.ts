import type { Metric } from "web-vitals";

export default function reportWebVitals(onPerfEntry?: (metric: Metric) => void) {
  if (onPerfEntry) {
    import("web-vitals").then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
      onCLS(onPerfEntry);
      onINP(onPerfEntry);
      onLCP(onPerfEntry);
      onFCP(onPerfEntry);
      onTTFB(onPerfEntry);
    });
  }
}
