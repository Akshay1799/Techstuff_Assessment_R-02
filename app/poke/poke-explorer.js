 'use client';

import { useEffect, useMemo, useState } from 'react';
import { getPokemonDetails, getPokemonPage } from './pokeApi';

const PAGE_SIZE = 20;

function getPageCount(totalCount) {
  if (!Number.isFinite(totalCount) || totalCount <= 0) return 1;
  return Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
}

function TitleCase({ children }) {
  const text = typeof children === 'string' ? children : '';
  return <span className='capitalize'>{text}</span>;
}

function getPokemonIdFromUrl(url) {
  if (typeof url !== 'string') return null;
  const match = url.match(/\/pokemon\/(\d+)\/?$/);
  return match?.[1] ?? null;
}

function TypeTabs({ types, activeTypeName, onChange, disabled }) {
  if (!Array.isArray(types) || types.length === 0) return null;

  return (
    <div className='flex flex-wrap gap-2'>
      {types.map((t) => {
        const name = t?.type?.name;
        if (!name) return null;
        const isActive = name === activeTypeName;

        return (
          <button
            key={name}
            type='button'
            onClick={() => onChange(name)}
            disabled={disabled}
            className={[
              'rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition',
              isActive
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50',
              disabled ? 'cursor-not-allowed opacity-60' : '',
            ].join(' ')}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
}

function PokemonDetailsPanel({
  selectedName,
  selectedId,
  status,
  errorMessage,
  details,
  activeTypeName,
  onChangeType,
  onRetry,
}) {
  return (
    <div className='rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm backdrop-blur'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <div className='text-xs font-semibold uppercase tracking-wide text-zinc-600'>Details</div>
          <div className='mt-1 text-lg font-semibold text-zinc-900'>
            {selectedName ? <TitleCase>{selectedName}</TitleCase> : 'Select a Pokémon'}
          </div>
          {selectedId ? (
            <div className='mt-0.5 text-xs text-zinc-500'>#{selectedId}</div>
          ) : (
            <div className='mt-0.5 text-xs text-zinc-500'>Click a Pokémon name to view info.</div>
          )}
          {selectedName && status === 'loading' ? (
            <div className='mt-2 text-xs text-zinc-500'>Loading details…</div>
          ) : null}
        </div>
      </div>

      {selectedName ? (
        <div className='mt-4 space-y-4'>
          <div>
            <div className='text-xs font-semibold uppercase tracking-wide text-zinc-600'>
              Types
            </div>
            <div className='mt-2'>
              <TypeTabs
                types={details?.types}
                activeTypeName={activeTypeName}
                onChange={onChangeType}
                disabled={status === 'loading'}
              />
            </div>
          </div>

          {status === 'error' ? (
            <div className='rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800'>
              {errorMessage}
              <button
                type='button'
                onClick={onRetry}
                className='mt-3 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-900'
              >
                Retry
              </button>
            </div>
          ) : status === 'loading' ? (
            <div className='space-y-3'>
              <div className='h-4 w-40 animate-pulse rounded bg-zinc-200' />
              <div className='h-4 w-56 animate-pulse rounded bg-zinc-200' />
              <div className='h-4 w-48 animate-pulse rounded bg-zinc-200' />
            </div>
          ) : details ? (
            <div className='rounded-xl border border-zinc-200 bg-white p-4'>
              <div className='text-xs font-semibold uppercase tracking-wide text-zinc-600'>
                {activeTypeName ? (
                  <>
                    <span className='text-zinc-900'>{activeTypeName}</span> tab
                  </>
                ) : (
                  'Type info'
                )}
              </div>

              <div className='mt-3 grid gap-3 text-sm text-zinc-800'>
                <div className='flex items-center justify-between'>
                  <span className='text-zinc-600'>Game Indices count</span>
                  <span className='font-semibold text-zinc-900'>
                    {Array.isArray(details?.game_indices) ? details.game_indices.length : 0}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-zinc-600'>Total moves count</span>
                  <span className='font-semibold text-zinc-900'>
                    {Array.isArray(details?.moves) ? details.moves.length : 0}
                  </span>
                </div>
              </div>

              <div className='mt-4 border-t border-zinc-200 pt-4'>
                <div className='text-xs font-semibold uppercase tracking-wide text-zinc-600'>
                  Quick stats
                </div>
                <div className='mt-2 grid grid-cols-2 gap-3 text-sm'>
                  <div className='rounded-lg bg-zinc-50 px-3 py-2'>
                    <div className='text-xs text-zinc-500'>Height</div>
                    <div className='font-semibold text-zinc-900'>{details?.height ?? '—'}</div>
                  </div>
                  <div className='rounded-lg bg-zinc-50 px-3 py-2'>
                    <div className='text-xs text-zinc-500'>Weight</div>
                    <div className='font-semibold text-zinc-900'>{details?.weight ?? '—'}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default function PokeExplorer() {
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(null);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('');

  const [selectedPokemon, setSelectedPokemon] = useState(null); // { name, url }
  const [detailsStatus, setDetailsStatus] = useState('idle'); // idle | loading | success | error
  const [detailsErrorMessage, setDetailsErrorMessage] = useState('');
  const [details, setDetails] = useState(null);
  const [activeTypeName, setActiveTypeName] = useState('');

  const pageCount = useMemo(() => getPageCount(totalCount), [totalCount]);
  const canPrev = page > 1;
  const canNext = page < pageCount;

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    async function load() {
      setStatus('loading');
      setErrorMessage('');

      try {
        const data = await getPokemonPage({
          page,
          pageSize: PAGE_SIZE,
          signal: controller.signal,
        });
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

  useEffect(() => {
    if (!selectedPokemon?.url) return;

    let isActive = true;
    const controller = new AbortController();

    async function loadDetails() {
      setDetailsStatus('loading');
      setDetailsErrorMessage('');
      setDetails(null);

      try {
        const data = await getPokemonDetails({ url: selectedPokemon.url, signal: controller.signal });
        if (!isActive) return;

        setDetails(data);
        const firstType = Array.isArray(data?.types) ? data.types?.[0]?.type?.name : '';
        setActiveTypeName((prev) => prev || firstType || '');
        setDetailsStatus('success');
      } catch (err) {
        if (!isActive) return;
        if (err?.name === 'AbortError') return;
        setDetailsStatus('error');
        setDetailsErrorMessage(
          err?.message || 'Something went wrong while fetching Pokémon details.',
        );
      }
    }

    loadDetails();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [selectedPokemon?.url]);

  useEffect(() => {
    const typeNames = new Set(
      (Array.isArray(details?.types) ? details.types : [])
        .map((t) => t?.type?.name)
        .filter(Boolean),
    );

    if (!typeNames.size) {
      if (activeTypeName) setActiveTypeName('');
      return;
    }

    if (!activeTypeName || !typeNames.has(activeTypeName)) {
      const first = (Array.isArray(details?.types) ? details.types : [])?.[0]?.type?.name;
      setActiveTypeName(first || '');
    }
  }, [details, activeTypeName]);

  const selectedId = useMemo(() => getPokemonIdFromUrl(selectedPokemon?.url), [selectedPokemon]);

  return (
    <div className='grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start'>
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
                items.map((p, idx) => {
                  const isSelected = selectedPokemon?.name && p?.name === selectedPokemon.name;
                  return (
                    <tr key={p?.name || idx} className='text-sm'>
                      <td className='px-4 py-3 text-zinc-600'>{offset + idx + 1}</td>
                      <td className='px-4 py-3'>
                        <button
                          type='button'
                          onClick={() => {
                            if (!p?.name || !p?.url) return;
                            setSelectedPokemon({ name: p.name, url: p.url });
                            setActiveTypeName('');
                          }}
                          className={[
                            'inline-flex items-center gap-2 font-semibold transition',
                            isSelected ? 'text-zinc-900' : 'text-blue-700 hover:text-blue-800',
                          ].join(' ')}
                        >
                          <TitleCase>{p?.name}</TitleCase>
                          {isSelected ? (
                            <span className='rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-700'>
                              Selected
                            </span>
                          ) : null}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className='lg:sticky lg:top-6'>
        <div className='transition-opacity duration-200'>
          <PokemonDetailsPanel
            selectedName={selectedPokemon?.name || ''}
            selectedId={selectedId}
            status={detailsStatus}
            errorMessage={detailsErrorMessage}
            details={details}
            activeTypeName={activeTypeName}
            onChangeType={(next) => setActiveTypeName(next)}
            onRetry={() => setSelectedPokemon((p) => (p ? { ...p } : p))}
          />
        </div>
      </div>
    </div>
  );
}

