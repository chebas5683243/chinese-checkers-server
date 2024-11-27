export interface HexCoordinates {
  q: number;
  r: number;
}

export function createHex(r: number, q: number): HexCoordinates {
  return { q, r };
}

export function hexSum(
  hex1: HexCoordinates,
  hex2: HexCoordinates
): HexCoordinates {
  return {
    r: hex1.r + hex2.r,
    q: hex1.q + hex2.q,
  };
}

export function hexSubtract(
  hex1: HexCoordinates,
  hex2: HexCoordinates
): HexCoordinates {
  return {
    r: hex1.r - hex2.r,
    q: hex1.q - hex2.q,
  };
}

export function hexMultiplty(hex: HexCoordinates, k: number): HexCoordinates {
  return {
    r: hex.r * k,
    q: hex.q * k,
  };
}

export function hexDivide(hex: HexCoordinates, k: number): HexCoordinates {
  return {
    r: hex.r / k,
    q: hex.q / k,
  };
}

export function hexCompare(
  hex1: HexCoordinates | undefined,
  hex2: HexCoordinates | undefined
): boolean {
  if (!hex1 || !hex2) return false;
  return hex1.q === hex2.q && hex1.r === hex2.r;
}

export function printHex(hex: HexCoordinates): string {
  return `${hex.r},${hex.q}`;
}
