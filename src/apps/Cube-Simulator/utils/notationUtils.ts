export const invertNotation = (notation: string): string => {
  if (notation.endsWith("2'")) return notation.slice(0, -1);
  if (notation.endsWith("2")) return `${notation}'`;
  if (notation.endsWith("'")) return notation.slice(0, -1);
  return `${notation}'`;
};
