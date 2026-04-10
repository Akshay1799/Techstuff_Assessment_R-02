import PokeExplorer from './poke-explorer';

export const metadata = {
  title: 'Pokémon Explorer',
};

export default function PokePage() {
  return (
    <div className='mx-auto w-full max-w-6xl'>
      <div className='flex items-end justify-between gap-6'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Pokémon</h1>
          <p className='mt-1 text-sm text-zinc-600'>Browse Pokémon with pagination.</p>
        </div>
      </div>

      <div className='mt-8'>
        <PokeExplorer />
      </div>
    </div>
  );
}

