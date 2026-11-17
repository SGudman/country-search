export function debounce<Args extends unknown[]>(
  callback: (...args: Args) => void,
  _delay: number,
): (...args: Args) => void {
  void _delay;
  return callback;
}
