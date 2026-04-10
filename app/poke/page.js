import PokeExplorer from './poke-explorer';

export const metadata = {
  title: 'Pokémon Explorer',
};

export default function PokePage() {
  return (
    <div className='w-full'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h1 className='text-3xl font-semibold tracking-tight text-zinc-900'>Pokémon</h1>
          <p className='mt-1 max-w-2xl text-sm text-zinc-600'>
            Browse the Pokédex with pagination. Select a Pokémon to view details and switch between
            type tabs.
          </p>
        </div>
      </div>

      <div className='mt-8'>
        <PokeExplorer />
      </div>
    </div>
  );
}

