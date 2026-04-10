'use client';

export default function Error({ error, reset }) {
  return (
    <div className="mx-auto w-full max-w-6xl py-10">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900">
        <div className="text-sm font-semibold uppercase tracking-wide">Something went wrong</div>
        <div className="mt-2 text-sm text-red-800">
          {error?.message || 'Unexpected error while loading /poke.'}
        </div>

        <button
          type="button"
          onClick={() => reset()}
          className="mt-4 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-900"
        >
          Try again
        </button>
      </div>
    </div>
  );
}