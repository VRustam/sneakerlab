export function getSafeFavoriteReturnPath(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') return '/products';
  const path = value.trim();
  return path.startsWith('/') && !path.startsWith('//') ? path : '/products';
}
