import { Group } from "./group";

interface Slot {
  id: string;
  isEmpty: boolean;
  group?: Group;
}

export type Board = (Slot | null)[][];
