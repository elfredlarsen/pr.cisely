type Props = { ms: number };

function pad(n: number, w = 2) {
  return n.toString().padStart(w, "0");
}

export function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const main =
    hours > 0
      ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;
  return { main, hours, minutes, seconds };
}

export function TimeDisplay({ ms }: Props) {
  const { main, hours, minutes, seconds } = formatTime(ms);
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="flex items-baseline justify-center font-mono tabular-nums text-foreground select-none"
    >
      <span className="text-[clamp(4rem,16vw,12rem)] leading-none font-medium tracking-tight">
        {main}
      </span>
      <span className="sr-only">
        {hours > 0
          ? `${hours} timer, ${minutes} minutter og ${seconds} sekunder`
          : `${minutes} minutter og ${seconds} sekunder`}
      </span>
    </div>
  );
}
