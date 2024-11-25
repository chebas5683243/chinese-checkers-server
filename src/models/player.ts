import { Group } from "./group";

export interface Player {
  id: string;
  gameId: string;
  userId: string;
  groups: Group[];
  createdAt: number;
  updatedAt: number;
}
