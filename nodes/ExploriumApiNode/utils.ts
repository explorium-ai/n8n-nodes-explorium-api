export function excludeEmptyValues<T extends Record<string, any>>(obj: T) {
	const result = Object.fromEntries(
		Object.entries(obj).filter(([_, value]) =>
			Boolean(value && (typeof value !== 'string' || value?.trim())),
		),
	) as T;
	return result;
}
