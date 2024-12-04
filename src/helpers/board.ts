import crypto from "node:crypto";
import { GROUP_COORDINATES, SLOTS_PER_ROW } from "../constants/board";
import { Group } from "../models/group";
import { createHex } from "./hex";

import { Board, Slot } from "../models/board";
import type { HexCoordinates } from "./hex";

function createEmptySlot(hexCoords: HexCoordinates): Slot {
  return {
    isEmpty: true,
    id: `${hexCoords.r}-${hexCoords.q}`,
  };
}

function initializeSlots() {
  const board = Array.from({ length: 17 }, () => Array(17).fill(null)) as Board;

  Object.entries(SLOTS_PER_ROW).forEach(([rowStr, [start, end]]) => {
    const row = Number(rowStr);
    for (let col = start; col <= end; col += 1) {
      const hexCoords = createHex(row, col);
      board[row][col] = createEmptySlot(hexCoords);
    }
  });

  return board;
}

function initializeGroups(board: Board, groups: Group[]) {
  const filledBoard = board;

  groups.forEach((group) => {
    const groupCoordinates = GROUP_COORDINATES[group];
    Object.entries(groupCoordinates).forEach(([rowStr, [start, end]]) => {
      const row = Number(rowStr);
      for (let col = start; col <= end; col += 1) {
        filledBoard[row][col] = {
          isEmpty: false,
          group,
          id: `${row}-${col}`,
        };
      }
    });
  });

  return filledBoard;
}

export function initializeBoard(groups: number[]) {
  const board = initializeSlots();

  const filledBoard = initializeGroups(board, groups);

  return filledBoard;
}

export function hashBoard(board: Board) {
  const flattened = board
    .flat()
    .map((obj) => (obj ? JSON.stringify(obj) : "undefined"));

  const combinedString = flattened.join("|");

  const hash = crypto.createHash("sha256");
  hash.update(combinedString);

  return hash.digest("hex");
}
