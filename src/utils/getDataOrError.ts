export async function getDataOrError<T>(
  callback: Promise<any>
): Promise<[T, undefined] | [undefined, Error]> {
  try {
    const data = await callback;
    return [data as T, undefined];
  } catch (err) {
    return [undefined, err as Error];
  }
}
