export function useAsync<F extends (...args: any[]) => any>(
  func: F,
): (...args: Parameters<F>) => Promise<ReturnType<F>> {
  return (...args: Parameters<F>) =>
    new Promise<ReturnType<F>>((resolve) => {
      try {
        resolve(func(...args));
      } catch (err) {
        return Promise.reject(err) as Promise<ReturnType<F>>;
      }
    });
}
