// Start calls inside the promise boundary: some loader failures throw before
// returning a promise, and must not abort the component's startup effect.
export async function backendRequest<T>(request: () => Promise<T>, timeout = 8000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([Promise.resolve().then(request), new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Orbiter backend did not respond. Try reloading the plugin.')), timeout);
    })]);
  } finally {clearTimeout(timer);}
}
