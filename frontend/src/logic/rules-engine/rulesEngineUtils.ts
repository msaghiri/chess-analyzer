import type { PiecePosition, PressureMap } from "../feature-extraction/featureExtraction.types";
import { getMaterialValue, getSquare, RANK_INDEX, FILE_INDEX } from "../feature-extraction/featureExtractionUtils";
import type { centralType } from "./constants";
import { centralTypes } from "./constants";

const CENTRAL_FILES = ["c", "d", "e", "f"];
const SMALL_CENTER_SQUARES = ["e4", "d4", "e5", "d5"];
const BIG_CENTER_SQUARES = ["c3", "d3", "e3", "f3", "f4", "f5", "f6", "e6", "d6", "c4", "c5", "c6"];

const isCentral = (position: PiecePosition): centralType => {
	const square = getSquare(position);
	const file = square[0];

	if (square in SMALL_CENTER_SQUARES) return centralTypes.SMALL_CENTER;
	if (square in BIG_CENTER_SQUARES) return centralTypes.BIG_CENTER;
	if (file in CENTRAL_FILES) return centralTypes.CENTRAL_FILE;

	return centralTypes.NOT_CENTRAL;
};

const isAdequatelyDefended = (
	chessboard: string[][],
	pressureMap: PressureMap,
	square: PiecePosition,
	color: "w" | "b"
): boolean => {
	const rank = square[RANK_INDEX];
	const file = square[FILE_INDEX];
	const pieceType = chessboard[rank][file].toLowerCase();
	const squareValue = getMaterialValue(pieceType);
};

//const isOutpost = (square: PiecePosition): boolean => {};
