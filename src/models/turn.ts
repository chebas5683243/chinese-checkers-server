export interface Turn {
  id: string;
  gameId: string;
  from: HexCoordinates;
  moves: HexCoordinates[];
  order: number;
  createdAt: number;
}

export interface HexCoordinates {
  q: number;
  r: number;
}
