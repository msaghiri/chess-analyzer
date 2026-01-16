import type { PieceMap, PawnChain, PawnHeuristics } from "../featureExtraction.types";
import type { PieceFiles, PiecePosition, PressureMap } from "../featureExtraction.types";
import {
	RANKS,
	FILES,
	RANK_INDEX,
	FILE_INDEX,
	parsePieceMap,
	sortPiecesByFile,
	WHITE_PAWN,
	BLACK_PAWN,
} from "../featureExtractionUtils";

/* ---------------------------------- UTILS --------------------------------- */
const getPawns = (chessboard: string[][]): PieceMap => {
	const pawns: PieceMap = {
		white: [],
		black: [],
	};

	for (let rank = 0; rank < RANKS; rank++) {
		for (let file = 0; file < FILES; file++) {
			const pos: PiecePosition = [rank, file];
			if (chessboard[rank][file] === WHITE_PAWN) {
				pawns.white.push(pos);
			} else if (chessboard[rank][file] === BLACK_PAWN) {
				pawns.black.push(pos);
			}
		}
	}

	return pawns;
};

/* ------------------------------ PASSED PAWNS ------------------------------ */
const isPassedPawn = (
	pawn: PiecePosition,
	direction: number,
	opponentFiles: {
		opponentLeftFile: PiecePosition[];
		opponentRightFile: PiecePosition[];
		opponentSameFile: PiecePosition[];
	}
): boolean => {
	const { opponentLeftFile, opponentRightFile, opponentSameFile } = opponentFiles;

	if (opponentLeftFile === undefined && opponentSameFile === undefined && opponentRightFile === undefined) return true;

	const blockedOnFile = (file: PiecePosition[]) => {
		for (let i = 0; i < file.length; i++) {
			const opponentPawn = file[i];
			if (opponentPawn[RANK_INDEX] * direction > pawn[RANK_INDEX] * direction) return true;
		}
		return false;
	};

	if (opponentLeftFile !== undefined && blockedOnFile(opponentLeftFile)) return false;
	if (opponentSameFile !== undefined && blockedOnFile(opponentSameFile)) return false;
	if (opponentRightFile !== undefined && blockedOnFile(opponentRightFile)) return false;

	return true;
};

const getPassedPawns = (pawnsByFile: PieceFiles): PieceMap => {
	const whitePawnsByFile = pawnsByFile.white;
	const blackPawnsByFile = pawnsByFile.black;

	const whitePassedPawns: PiecePosition[] = [];
	const blackPassedPawns: PiecePosition[] = [];

	for (let file = 0; file < FILES; file++) {
		const leftFile = file === 0 ? -1 : file - 1;
		const rightFile = file === 7 ? -1 : file + 1;

		const fullWhiteFile = whitePawnsByFile[file];
		const leftWhiteFile = whitePawnsByFile[leftFile];
		const rightWhiteFile = whitePawnsByFile[rightFile];

		const fullBlackFile = blackPawnsByFile[file];
		const leftBlackFile = blackPawnsByFile[leftFile];
		const rightBlackFile = blackPawnsByFile[rightFile];

		//check white pawns in that file
		const opponentFiles = {
			opponentLeftFile: leftBlackFile,
			opponentRightFile: rightBlackFile,
			opponentSameFile: fullBlackFile,
		};

		if (file in whitePawnsByFile) {
			for (let i = 0; i < fullWhiteFile.length; i++) {
				const currentPawn = fullWhiteFile[i];
				if (isPassedPawn(currentPawn, -1, opponentFiles)) whitePassedPawns.push(currentPawn);
			}
		}

		//check black pawns in that file
		opponentFiles.opponentLeftFile = leftWhiteFile;
		opponentFiles.opponentRightFile = rightWhiteFile;
		opponentFiles.opponentSameFile = fullWhiteFile;
		if (file in blackPawnsByFile) {
			for (let i = 0; i < fullBlackFile.length; i++) {
				const currentPawn = fullBlackFile[i];
				if (isPassedPawn(currentPawn, 1, opponentFiles)) blackPassedPawns.push(currentPawn);
			}
		}
	}

	return { white: whitePassedPawns, black: blackPassedPawns };
};

/* ----------------------------- BACKWARDS PAWNS ---------------------------- */
const isBackwardsPawn = (
	pawn: PiecePosition,
	color: string,
	friendlyFiles: {
		friendlyLeftFile: PiecePosition[];
		friendlyRightFile: PiecePosition[];
	},
	pressureMap: PressureMap
): boolean => {
	const { friendlyLeftFile, friendlyRightFile } = friendlyFiles;

	const rank = pawn[RANK_INDEX];
	const file = pawn[FILE_INDEX];
	const direction = color === "white" ? -1 : 1;
	const opposingColor = color === "white" ? "black" : "white";

	if (rank * direction > (RANKS - 2) * direction) return false; //we're not counting it "backwards" if it's about to promote

	const defendedByPawnInFile = (file: PiecePosition[]): boolean => {
		for (let i = 0; i < file.length; i++) {
			const friendlyRank = file[i][RANK_INDEX];
			if (friendlyRank * direction < rank * direction) return true;
		}
		return false;
	};

	if (defendedByPawnInFile(friendlyLeftFile) || defendedByPawnInFile(friendlyRightFile)) return false;

	//if (chessboard[rank + direction][file] !== EMPTY_SQUARE) return true; not sure if I want to keep this

	//adopting crafty engines definition -- only considered backwards if an opposing PAWN controls the square
	const advanceSquare = pressureMap[rank + direction][file];
	const minAttacker = opposingColor === "white" ? advanceSquare.whiteMin : advanceSquare.blackMin;
	if (minAttacker === 1) return true; //1 is the value of a pawn

	return false;
};

const getBackwardsPawns = (pawnsByFile: PieceFiles, pressureMap: PressureMap): PieceMap => {
	const result: PieceMap = {
		white: [],
		black: [],
	};

	const processColor = (color: "white" | "black") => {
		const pawns = pawnsByFile[color];

		for (const fileKey in pawns) {
			const file = Number(fileKey);
			const pawnsInFile = pawns[file];

			for (const pawn of pawnsInFile) {
				const friendlyLeftFile = pawns[file - 1] ?? [];
				const friendlyRightFile = pawns[file + 1] ?? [];

				const isBackward = isBackwardsPawn(pawn, color, { friendlyLeftFile, friendlyRightFile }, pressureMap);

				if (isBackward) result[color].push(pawn);
			}
		}
	};

	processColor("white");
	processColor("black");

	return result;
};

/* ------------------------------- PAWN CHAINS ------------------------------ */
const isPawnInChain = (
	pawn: PiecePosition,
	activePawnChains: { pawns: PiecePosition[]; lastPawn: PiecePosition }[]
): number => {
	for (let i = 0; i < activePawnChains.length; i++) {
		const lastPawn = activePawnChains[i].lastPawn;
		const lastPawnFile = lastPawn[FILE_INDEX];
		const lastPawnRank = lastPawn[RANK_INDEX];
		const currPawnFile = pawn[FILE_INDEX];
		const currPawnRank = pawn[RANK_INDEX];

		if (Math.abs(lastPawnRank - currPawnRank) === 1 && Math.abs(lastPawnFile - currPawnFile) === 1) return i;
	}

	return -1;
};

const buildPawnChains = (pawnsByFile: { [file: number]: PiecePosition[] }): PawnChain[] => {
	const activeChains = [];
	for (let file = 0; file < FILES; file++) {
		if (!(file in pawnsByFile)) continue;

		const currFile = pawnsByFile[file];
		for (let i = 0; i < currFile.length; i++) {
			const pawn = currFile[i];
			const chain = isPawnInChain(pawn, activeChains);
			if (chain === -1) {
				activeChains.push({
					pawns: [pawn],
					lastPawn: pawn,
				});
			} else {
				activeChains[chain].pawns.push(pawn);
				activeChains[chain].lastPawn = pawn;
			}
		}
	}

	return activeChains;
};

const getPawnChains = (pawnsByFile: PieceFiles) => {
	const whitePawnsByFile = pawnsByFile.white;
	const blackPawnsByFile = pawnsByFile.black;

	const whitePawnChains = buildPawnChains(whitePawnsByFile);
	const blackPawnChains = buildPawnChains(blackPawnsByFile);

	return { white: whitePawnChains, black: blackPawnChains };
};

/* ----------------------------- ISOLATED PAWNS ----------------------------- */
const getIsolatedPawns = (pawnsByFile: PieceFiles): PieceMap => {
	const whiteIsolatedPawns: PiecePosition[] = [];
	const blackIsolatedPawns: PiecePosition[] = [];

	const whitePawnFiles = pawnsByFile.white;
	const blackPawnFiles = pawnsByFile.black;

	for (let file = 0; file < FILES; file++) {
		const leftFile = file - 1;
		const rightFile = file + 1;

		let leftWhitePawn = true;
		let rightWhitePawn = true;

		let leftBlackPawn = true;
		let rightBlackPawn = true;

		if (whitePawnFiles[leftFile] === undefined || whitePawnFiles[leftFile].length === 0) leftWhitePawn = false;
		if (whitePawnFiles[rightFile] === undefined || whitePawnFiles[rightFile].length === 0) rightWhitePawn = false;

		if (blackPawnFiles[leftFile] === undefined || blackPawnFiles[leftFile].length === 0) leftBlackPawn = false;
		if (blackPawnFiles[rightFile] === undefined || blackPawnFiles[rightFile].length === 0) rightBlackPawn = false;

		if (file in blackPawnFiles && leftBlackPawn === false && rightBlackPawn === false)
			blackIsolatedPawns.push(...blackPawnFiles[file]);
		if (file in whitePawnFiles && leftWhitePawn === false && rightWhitePawn === false)
			whiteIsolatedPawns.push(...whitePawnFiles[file]);
	}

	const isolatedPawns: PieceMap = {
		white: whiteIsolatedPawns,
		black: blackIsolatedPawns,
	};

	return isolatedPawns;
};
/* -------------------------------------------------------------------------- */

export const analyzePawns = (chessboard: string[][], pressureMap: PressureMap): PawnHeuristics => {
	const pawns = getPawns(chessboard);
	const pawnsByFile = sortPiecesByFile(pawns);

	const passedPawns = getPassedPawns(pawnsByFile);
	const pawnChains = getPawnChains(pawnsByFile);
	const isolatedPawns = getIsolatedPawns(pawnsByFile);
	const backwardsPawns = getBackwardsPawns(pawnsByFile, pressureMap);

	return { pawns, passedPawns, pawnChains, isolatedPawns, backwardsPawns };
};

//for testing purposes only, temporary
export const logPawnAnalysis = (pawnAnalysis: {
	passedPawns: PieceMap;
	pawnChains: { white: PawnChain[]; black: PawnChain[] };
	isolatedPawns: PieceMap;
	backwardsPawns: PieceMap;
}) => {
	const passedPawns = pawnAnalysis.passedPawns;
	const isolatedPawns = pawnAnalysis.isolatedPawns;
	const pawnChains = pawnAnalysis.pawnChains;
	const backwardsPawns = pawnAnalysis.backwardsPawns;

	const passedPawnSquares = parsePieceMap(passedPawns);
	const passedPawnSquaresWhite = passedPawnSquares.white;
	const passedPawnSquaresBlack = passedPawnSquares.black;

	const isolatedPawnSquares = parsePieceMap(isolatedPawns);
	const isolatedPawnSquaresWhite = isolatedPawnSquares.white;
	const isolatedPawnSquaresBlack = isolatedPawnSquares.black;

	const pawnChainsWhite = pawnChains.white;
	const pawnChainsBlack = pawnChains.black;

	const backwardsPawnSquares = parsePieceMap(backwardsPawns);
	const backwardsPawnSquaresWhite = backwardsPawnSquares.white;
	const backwardsPawnSquaresBlack = backwardsPawnSquares.black;

	console.log("---- PASSED PAWNS ---- ");
	console.log("White:");
	console.log(passedPawnSquaresWhite);
	console.log("Black:");
	console.log(passedPawnSquaresBlack);

	console.log("---- ISOLATED PAWNS ----");
	console.log("White:");
	console.log(isolatedPawnSquaresWhite);
	console.log("Black:");
	console.log(isolatedPawnSquaresBlack);

	console.log("---- PAWN CHAINS ----");
	console.log("White:");
	for (let i = 0; i < pawnChainsWhite.length; i++) {
		const chain = pawnChainsWhite[i].pawns;
		if (chain.length < 2) continue;
		console.log(chain);
		console.log("---------------");
	}
	console.log("Black:");
	for (let i = 0; i < pawnChainsBlack.length; i++) {
		const chain = pawnChainsBlack[i].pawns;
		if (chain.length < 2) continue;
		console.log(chain);
		console.log("---------------");
	}
	console.log("---- BACKWARDS PAWNS ----");
	console.log("White:");
	console.log(backwardsPawnSquaresWhite);
	console.log("Black:");
	console.log(backwardsPawnSquaresBlack);
};
