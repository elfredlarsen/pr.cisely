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

export function TimeDisplay({ ms }: Props) {
  const { hours, minutes, seconds } = formatTime(ms);
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="flex flex-col items-center select-none"
      style={{ fontFamily: "'Poppins', sans-serif", fontVariantNumeric: "tabular-nums" }}
    >
      <div className="flex items-baseline justify-center text-foreground">
        <span
          className="text-[clamp(4rem,16vw,12rem)] leading-none tracking-tight"
          style={{ fontWeight: 500 }}
        >
          {hours}:{minutes}:{seconds}
        </span>
      </div>
      <div
        className="mt-3 flex justify-center gap-[clamp(2rem,8vw,6rem)] text-xs uppercase tracking-[0.2em] text-muted-foreground"
        aria-hidden="true"
      >
        <span>Timer</span>
        <span>Minutter</span>
        <span>Sekunder</span>
      </div>
      <span className="sr-only">
        {hours} timer, {minutes} minutter, {seconds} sekunder
      </span>
    </div>
  );
}
