const DefaultTimeoutMS = 10000;

async function fetchData(url, { signal, timeoutMs = DefaultTimeoutMS } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const combinedSignal = signal
    ? AbortSignal.any
      ? AbortSignal.any([signal, controller.signal])
      : controller.signal
    : controller.signal;

  try {
    const res = await fetch(url, { signal: combinedSignal });

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function getPokemonPage({ page, pageSize, signal }) {
  const offset = (page - 1) * pageSize;
  const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${pageSize}`;
  return await fetchData(url, { signal });
}

export async function getPokemonDetails({ url, signal }) {
  return await fetchData(url, { signal });
}