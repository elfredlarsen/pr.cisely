type Props = { ms: number };

function pad(n: number, w = 2) {
  return n.toString().padStart(w, "0");
}

export function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hundredths = Math.floor((ms % 1000) / 10);
  return {
    main: `${pad(minutes)}:${pad(seconds)}`,
    hundredths: pad(hundredths),
  };
}

export function TimeDisplay({ ms }: Props) {
  const { main, hundredths } = formatTime(ms);
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="flex items-baseline justify-center font-mono tabular-nums text-foreground select-none"
    >
      <span className="text-[clamp(4rem,16vw,12rem)] leading-none font-medium tracking-tight">
        {main}
      </span>
      <span className="text-[clamp(1.5rem,5vw,3.5rem)] leading-none font-medium text-muted-foreground ml-2">
        :{hundredths}
      </span>
      <span className="sr-only">
        {main} minutter og sekunder, {hundredths} hundrededele
      </span>
    </div>
  );
}
