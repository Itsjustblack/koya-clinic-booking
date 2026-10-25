export type BookingCursor = { start: Date; id: string };

export function encodeCursor(cursor: BookingCursor): string {
  return Buffer.from(`${cursor.start.toISOString()}:${cursor.id}`).toString(
    'base64url',
  );
}

export function decodeCursor(value: string): BookingCursor {
  const decoded = Buffer.from(value, 'base64url').toString('utf8');
  const separatorIndex = decoded.lastIndexOf(':');

  if (separatorIndex === -1) {
    throw new Error('malformed cursor');
  }

  const start = new Date(decoded.slice(0, separatorIndex));
  const id = decoded.slice(separatorIndex + 1);

  if (Number.isNaN(start.getTime()) || !id) {
    throw new Error('malformed cursor');
  }

  return { start, id };
}
