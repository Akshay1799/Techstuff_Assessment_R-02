 'use client';

import { useEffect, useMemo, useState } from 'react';

const PAGE_SIZE = 20;

function getPageCount(totalCount) {
  if (!Number.isFinite(totalCount) || totalCount <= 0) return 1;
  return Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
}

export default function PokeExplorer() {
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(null);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('');

  const pageCount = useMemo(() => getPageCount(totalCount), [totalCount]);
  const canPrev = page > 1;
  const canNext = page < pageCount;

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    async function load() {
      setStatus('loading');
      setErrorMessage('');

      const offset = (page - 1) * PAGE_SIZE;
      const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${PAGE_SIZE}`;

      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Request failed (${res.status})`);
        }

        const data = await res.json();
        if (!isActive) return;

        setItems(Array.isArray(data?.results) ? data.results : []);
        setTotalCount(typeof data?.count === 'number' ? data.count : null);
        setStatus('success');
      } catch (err) {
        if (!isActive) return;
        if (err?.name === 'AbortError') return;
        setStatus('error');
        setErrorMessage(err?.message || 'Something went wrong while fetching Pokémon.');
      }
    }

    load();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [page]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const offset = (page - 1) * PAGE_SIZE;

  return (
    <div className='rounded-2xl border border-zinc-200 bg-white/70 shadow-sm backdrop-blur'>
      <div className='flex flex-col gap-3 border-b border-zinc-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='text-sm text-zinc-700'>
          Page <span className='font-medium text-zinc-900'>{page}</span> of{' '}
          <span className='font-medium text-zinc-900'>{pageCount}</span>
        </div>

        <div className='flex items-center gap-2'>
          <button
            type='button'
            className='rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 shadow-sm disabled:cursor-not-allowed disabled:opacity-50'
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!canPrev || status === 'loading'}
          >
            Previous
          </button>
          <button
            type='button'
            className='rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 shadow-sm disabled:cursor-not-allowed disabled:opacity-50'
            onClick={() => setPage((p) => p + 1)}
            disabled={!canNext || status === 'loading'}
          >
            Next
          </button>
        </div>
      </div>

      {status === 'error' ? (
        <div className='px-4 py-6'>
          <div className='rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800'>
            {errorMessage}
          </div>
        </div>
      ) : null}

      <div className='overflow-x-auto'>
        <table className='w-full min-w-[420px] table-auto'>
          <thead>
            <tr className='bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600'>
              <th className='w-28 px-4 py-3'>Sr. Number</th>
              <th className='px-4 py-3'>Poke Name</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-zinc-200'>
            {status === 'loading' ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className='animate-pulse'>
                  <td className='px-4 py-3'>
                    <div className='h-4 w-12 rounded bg-zinc-200' />
                  </td>
                  <td className='px-4 py-3'>
                    <div className='h-4 w-40 rounded bg-zinc-200' />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={2} className='px-4 py-10 text-center text-sm text-zinc-600'>
                  No Pokémon found.
                </td>
              </tr>
            ) : (
              items.map((p, idx) => (
                <tr key={p?.name || idx} className='text-sm'>
                  <td className='px-4 py-3 text-zinc-600'>{offset + idx + 1}</td>
                  <td className='px-4 py-3 font-medium text-zinc-900'>{p?.name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

