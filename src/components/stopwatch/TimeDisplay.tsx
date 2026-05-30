type Props = { ms: number };

function pad(n: number, w = 2) {
  return n.toString().padStart(w, "0");
}

export function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
  };
}

const digitClass =
  "text-[clamp(4rem,16vw,12rem)] leading-none tracking-tight";
const labelClass =
  "text-[11px] font-normal uppercase tracking-wider text-muted-foreground/70";

export function TimeDisplay({ ms }: Props) {
  const { hours, minutes, seconds } = formatTime(ms);
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="flex flex-col items-center select-none text-foreground"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif", fontVariantNumeric: "tabular-nums" }}
    >
      <div className="flex items-baseline justify-center" style={{ fontWeight: 500 }}>
        <div className="flex flex-col items-center">
          <span className={digitClass}>{hours}</span>
          <span className={`${labelClass} mt-2`}>Timer</span>
        </div>
        <span className={`${digitClass} px-2`} aria-hidden="true">:</span>
        <div className="flex flex-col items-center">
          <span className={digitClass}>{minutes}</span>
          <span className={`${labelClass} mt-2`}>Minutter</span>
        </div>
        <span className={`${digitClass} px-2`} aria-hidden="true">:</span>
        <div className="flex flex-col items-center">
          <span className={digitClass}>{seconds}</span>
          <span className={`${labelClass} mt-2`}>Sekunder</span>
        </div>
      </div>
      <span className="sr-only">
        {hours} timer, {minutes} minutter, {seconds} sekunder
      </span>
    </div>
  );
}
