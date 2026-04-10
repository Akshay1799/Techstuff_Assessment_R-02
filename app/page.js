export default function Home() {
  return (
    <div className='mx-auto w-full max-w-5xl'>
      <h1 className='text-2xl font-semibold tracking-tight'>Pokémon Data Explorer</h1>
      <p className='mt-2 text-sm text-zinc-600'>
        Go to <a className='underline underline-offset-4' href='/poke'>/poke</a> to view the Pokémon table.
      </p>
    </div>
  );
}
