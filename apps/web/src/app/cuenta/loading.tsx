export default function Loading() {
  return (
    <div className="flex min-h-[70svh] items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <span className="font-display text-sm tracking-[0.5em] text-smoke uppercase">
          JC Autoimport
        </span>
        <span className="h-px w-40 overflow-hidden bg-line">
          <span className="block h-full w-1/3 animate-[loading-bar_1.1s_var(--ease-out-expo)_infinite] bg-signal" />
        </span>
        <span className="text-[10px] tracking-[0.3em] text-ash uppercase">Cargando</span>
      </div>
    </div>
  );
}
