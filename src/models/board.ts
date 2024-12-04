import type { Group } from "./group";

export interface Slot {
  id: string;
  isEmpty: boolean;
  group?: Group;
}

export type Board = (Slot | null)[][];
