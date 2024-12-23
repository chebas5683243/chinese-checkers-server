import { HEX_DIRECTION_VECTORS } from "../constants/hex-directions";
import { Board } from "../models/board";
import { Group } from "../models/group";
import { Turn } from "../models/turn";
import { logger } from "../utils/logger";
import { hexCompare, HexCoordinates, hexDivide, hexSubtract } from "./hex";

export function validateMoves(board: Board, turn: Turn, group: Group): Board {
  const fromSlot = board[turn.from.r][turn.from.q];

  if (!fromSlot) {
    throw new Error("From slot is not valid");
  }

  if (fromSlot.group !== group) {
    throw new Error("Piece does not belong to the group");
  }

  const stepSize = getTurnStepSize(turn);

  if (stepSize === 1) {
    return validateSingleStepMove(board, turn);
  }

  return validateHoppingMoves(board, turn);
}

function getTurnStepSize(currentTurn: Turn): number {
  const fromStep = currentTurn.from;
  const firstStep = currentTurn.moves[0];

  const isSingleStep = checkIfIsSingleStep(fromStep, firstStep);
  if (isSingleStep) return 1;

  const isHopping = checkIfIsHopping(fromStep, firstStep);
  if (isHopping) return 2;

  throw new Error("Invalid move");
}

function validateSingleStepMove(board: Board, turn: Turn): Board {
  const moves = turn.moves;

  if (moves.length !== 1) {
    throw new Error("Invalid number of moves for single step");
  }

  const onlyMove = moves[0];

  const fromSlot = board[turn.from.r][turn.from.q];
  const toSlot = board[onlyMove.r][onlyMove.q];

  if (!fromSlot || fromSlot.isEmpty) {
    throw new Error("From slot is empty");
  }

  if (!toSlot || !toSlot.isEmpty) {
    throw new Error("To slot is not empty");
  }

  const newBoard = structuredClone(board);

  const newFromSlot = newBoard[turn.from.r][turn.from.q];
  const newToSlot = newBoard[onlyMove.r][onlyMove.q];

  if (!newFromSlot || !newToSlot) {
    throw new Error("Invalid slots");
  }

  newToSlot.group = newFromSlot.group;
  newToSlot.isEmpty = false;

  newFromSlot.group = undefined;
  newFromSlot.isEmpty = true;

  return newBoard;
}

function validateHoppingMoves(board: Board, turn: Turn): Board {
  const newBoard = structuredClone(board);

  let fromHex = turn.from;
  let currentSlot = newBoard[fromHex.r][fromHex.q];

  if (!currentSlot || currentSlot.isEmpty) {
    throw new Error("From slot is empty");
  }

  for (let i = 0; i < turn.moves.length; i++) {
    const toHex = turn.moves[i];

    const isHop = checkIfIsHopping(fromHex, toHex);

    if (!isHop) {
      logger.error("test", JSON.stringify({ fromHex, toHex }));
      throw new Error("Move is not a hop");
    }

    const intermediateSlot = getIntermediateSlot(newBoard, fromHex, toHex);

    if (!intermediateSlot) {
      throw new Error("Intermediate slot is not valid");
    }

    const toSlot = newBoard[toHex.r][toHex.q];

    if (!toSlot || !toSlot.isEmpty) {
      throw new Error("To slot is not empty");
    }

    toSlot.group = currentSlot.group;
    toSlot.isEmpty = false;

    currentSlot.group = undefined;
    currentSlot.isEmpty = true;

    currentSlot = toSlot;
    fromHex = toHex;
  }

  return newBoard;
}

function checkIfIsSingleStep(
  from: HexCoordinates,
  to: HexCoordinates
): boolean {
  const delta = hexSubtract(from, to);
  return HEX_DIRECTION_VECTORS.some((v) => hexCompare(v, delta));
}

function checkIfIsHopping(from: HexCoordinates, to: HexCoordinates): boolean {
  const delta = hexSubtract(from, to);
  const halfDelta = hexDivide(delta, 2);

  return HEX_DIRECTION_VECTORS.some((v) => hexCompare(v, halfDelta));
}

function getIntermediateSlot(
  board: Board,
  from: HexCoordinates,
  to: HexCoordinates
) {
  const delta = hexSubtract(from, to);
  const halfDelta = hexDivide(delta, 2);

  const intermediateHexCoords = hexSubtract(from, halfDelta);

  return board[intermediateHexCoords.r][intermediateHexCoords.q];
}
