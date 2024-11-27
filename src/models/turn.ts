import type { HexCoordinates } from "../helpers/hex";

export interface Turn {
  id: string;
  gameId: string;
  from: HexCoordinates;
  moves: HexCoordinates[];
  order: number;
  createdAt: number;
}
