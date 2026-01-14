import type { square, SquarePressure } from "../feature-extraction/featureExtraction.types";
import { getMaterialValue } from "../feature-extraction/featureExtractionUtils";
import {
	BIG_CENTER_SQUARES,
	CENTRAL_FILES,
	centralTypes,
	SMALL_CENTER_SQUARES,
	vulnerabilityMetrics,
	type CentralType,
	type vulnerabilityMetric,
} from "./constants";

export const isPieceVulnerable = (
	color: "white" | "black",
	squarePressure: SquarePressure,
	pieceValue: number
): vulnerabilityMetric => {
	const opposingColor = color === "white" ? "black" : "white";
	const attackers = squarePressure[opposingColor].pieces;
	const defenders = squarePressure[color].pieces;

	if (attackers.length === 0) return vulnerabilityMetrics.SAFE;
	if (defenders.length === 0) return vulnerabilityMetrics.HANGING;

	const balance = calculateExchangeBalance(color, squarePressure, pieceValue);

	if (balance < 0) return vulnerabilityMetrics.LOSE_MATERIAL;
	if (balance === 0) return vulnerabilityMetrics.CAN_BE_TRADED;

	return vulnerabilityMetrics.SAFE;
};

export const calculateExchangeBalance = (
	color: "white" | "black",
	squarePressure: SquarePressure,
	pieceValue: number
): number => {
	const opposingColor = color === "white" ? "black" : "white";

	const attackers = [...squarePressure[opposingColor].pieces].sort(
		(a, b) => getMaterialValue(a.type) - getMaterialValue(b.type)
	);
	const defenders = [...squarePressure[color].pieces].sort(
		(a, b) => getMaterialValue(a.type) - getMaterialValue(b.type)
	);

	let balance = 0;
	let currentPieceValue = pieceValue;

	let aPtr = 0;
	let dPtr = 0;

	while (aPtr < attackers.length) {
		balance -= currentPieceValue;
		currentPieceValue = getMaterialValue(attackers[aPtr].type);
		aPtr++;

		if (dPtr >= defenders.length) break;

		balance += currentPieceValue;
		currentPieceValue = getMaterialValue(defenders[dPtr].type);
		dPtr++;
	}

	return balance;
};

export const getPieceCentrality = (piecePosition: square): CentralType => {
	const file = piecePosition.charAt(0);

	if (piecePosition in SMALL_CENTER_SQUARES) return centralTypes.SMALL_CENTER;
	if (piecePosition in BIG_CENTER_SQUARES) return centralTypes.BIG_CENTER;
	if (file in CENTRAL_FILES) return centralTypes.CENTRAL_FILE;

	return centralTypes.NOT_CENTRAL;
};

export const toPlay = (fen: string): "white" | "black" => {
	const parts = fen.split(" ");
	return parts[1] === "w" ? "white" : "black";
};

export const capitalize = (s: string): string => {
	return s.charAt(0).toUpperCase() + s.slice(1);
};
