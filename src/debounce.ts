export function debounce<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
): (...args: Args) => void {
  let timerId: ReturnType<typeof setTimeout> | undefined;

  return (...args: Args) => {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => callback(...args), delay);
  };
}
