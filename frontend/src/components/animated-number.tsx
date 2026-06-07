export function AnimatedNumber({ value, suffix = "", duration, className }: { value: number; suffix?: string; duration?: number; className?: string }) {
  return (
    <span className={`tabular-nums tracking-tight ${className || ""}`}>
      {value.toLocaleString()}{suffix}
    </span>
  );
}