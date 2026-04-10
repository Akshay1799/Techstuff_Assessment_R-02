export default function Loading() {
    return (
      <div className="mx-auto w-full max-w-6xl py-10">
        <div className="rounded-2xl border border-zinc-200 bg-white/70 p-6 shadow-sm">
          <div className="h-6 w-56 animate-pulse rounded bg-zinc-200" />
          <div className="mt-4 space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-zinc-200" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-200" />
            <div className="h-4 w-4/6 animate-pulse rounded bg-zinc-200" />
          </div>
        </div>
      </div>
    );
  }