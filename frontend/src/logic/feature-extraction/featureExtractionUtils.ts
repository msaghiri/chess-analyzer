import type {
	PiecePosition,
	PieceMap,
	PieceFiles,
	PawnChains,
	ParsedPawnChains,
	ParsedPawnChain,
	PawnChain,
	square,
	PieceAttackMap,
	PressureMap,
	ParsedPieceAttackMap,
	ParsedPressureMap,
	AttackedSquares,
	ParsedAttackedSquares,
} from "./featureExtraction.types";

export const RANKS = 8;
export const FILES = 8;
export const EMPTY_SQUARE = ".";

export const RANK_INDEX = 0;
export const FILE_INDEX = 1;

export const WHITE_PAWN = "P";
export const BLACK_PAWN = "p";

const isDigit = (char: string) => {
	return /^\d$/.test(char);
};

export const getMaterialValue = (piece: string): number => {
	switch (piece) {
		case "p":
			return 1;
		case "n":
			return 3;
		case "b":
			return 3;
		case "r":
			return 5;
		case "q":
			return 9;
		case "k":
			return 0;
	}

	return -1;
};

export const getColor = (piece: string): string => {
	if (piece.toUpperCase() === piece) {
		return "white";
	} else {
		return "black";
	}
};

export const getSquare = (piecePosition: PiecePosition) => {
	const squareRank = piecePosition[RANK_INDEX];
	const squareFile = piecePosition[FILE_INDEX];

	const actualSquareRank = Math.abs(RANKS - squareRank);
	const actualSquareFile = String.fromCharCode(97 + squareFile); //97 is the ascii code for a

	return `${actualSquareFile}${actualSquareRank}`;
};

/* ---------------------------- PARSE HEURISTICS ---------------------------- */

export const piecePositionsToSquares = (piecePositions: PiecePosition[]): string[] => {
	const squares: string[] = [];
	piecePositions.forEach((position) => squares.push(getSquare(position)));
	return squares;
};

export const parsePieceMap = (pieceMap: PieceMap) => {
	const white = pieceMap.white;
	const black = pieceMap.black;

	const blackSquares: string[] = [];
	const whiteSquares: string[] = [];

	for (let i = 0; i < white.length; i++) {
		whiteSquares.push(getSquare(white[i]));
	}
	for (let i = 0; i < black.length; i++) {
		blackSquares.push(getSquare(black[i]));
	}

	return {
		white: whiteSquares,
		black: blackSquares,
	};
};

export const parsePawnChains = (pawnChains: PawnChains): ParsedPawnChains => {
	const whitePawnChains = pawnChains.white;
	const blackPawnChains = pawnChains.black;

	const parsePawnChainList = (pawnChainList: PawnChain[]) => {
		const parsedPawnChainList: ParsedPawnChain[] = [];
		pawnChainList.forEach((pawnChain: PawnChain) => {
			const pawns: PiecePosition[] = pawnChain.pawns;
			const parsedPawns: square[] = [];

			pawns.forEach((pawn) => parsedPawns.push(getSquare(pawn)));
			const parsedLastPawn = getSquare(pawnChain.lastPawn);

			const parsedPawnChain: ParsedPawnChain = {
				pawns: parsedPawns,
				lastPawn: parsedLastPawn,
			};

			parsedPawnChainList.push(parsedPawnChain);
		});
		return parsedPawnChainList;
	};

	const parsedWhitePawnChains = parsePawnChainList(whitePawnChains);
	const parsedBlackPawnChains = parsePawnChainList(blackPawnChains);

	return {
		white: parsedWhitePawnChains,
		black: parsedBlackPawnChains,
	};
};

export const parsePieceAttackMap = (pieceAttackMap: PieceAttackMap): ParsedPieceAttackMap => {
	const whiteAttackedSquaresArray: AttackedSquares[] = pieceAttackMap.white;
	const blackAttackedSquaresArray: AttackedSquares[] = pieceAttackMap.black;

	const parseAttackedSquaresArray = (attackedSquaresArray: AttackedSquares[]): ParsedAttackedSquares[] => {
		const parsedAttackedSquaresArray: ParsedAttackedSquares[] = [];
		attackedSquaresArray.forEach((attackedSquares) => {
			const parsedSquares = piecePositionsToSquares(attackedSquares.squares);
			const parsedAttackerPosition = getSquare(attackedSquares.attackerPosition);

			const parsedAttackedSquares: ParsedAttackedSquares = {
				pieceType: attackedSquares.pieceType,
				value: attackedSquares.value,
				squares: parsedSquares,
				attackerPosition: parsedAttackerPosition,
			};

			parsedAttackedSquaresArray.push(parsedAttackedSquares);
		});
		return parsedAttackedSquaresArray;
	};

	const parsedWhiteAttackedSquaresArray = parseAttackedSquaresArray(whiteAttackedSquaresArray);
	const parsedBlackAttackedSquaresArray = parseAttackedSquaresArray(blackAttackedSquaresArray);

	return {
		white: parsedWhiteAttackedSquaresArray,
		black: parsedBlackAttackedSquaresArray,
	};
};

export const parsePressureMap = (pressureMap: PressureMap): ParsedPressureMap => {
	const parsedPressureMap: ParsedPressureMap = {};

	for (let rank = 0; rank < RANKS; rank++) {
		for (let file = 0; file < FILES; file++) {
			const key = getSquare([rank, file] as PiecePosition);
			parsedPressureMap[key] = pressureMap[rank][file];
		}
	}

	return parsedPressureMap;
};

/* -------------------------------- PARSE FEN ------------------------------- */

const parseFenRank = (rank: string) => {
	const rankAsArr = new Array(FILES);
	let squareCounter = 0;
	for (let i = 0; i < rank.length; i++) {
		const currentChar = rank.charAt(i);
		if (isDigit(currentChar)) {
			let counter = 0;
			while (squareCounter < FILES && counter < parseInt(currentChar)) {
				rankAsArr[squareCounter] = EMPTY_SQUARE;
				squareCounter++;
				counter++;
			}
		} else {
			rankAsArr[squareCounter] = currentChar;
			squareCounter++;
		}
	}

	return rankAsArr;
};

export const fenToArray = (fen: string) => {
	const fenFields = fen.split(" ");
	if (fenFields.length != 6) return [];

	const finalArray = new Array(RANKS);

	const piecePlacement = fenFields[0];
	const fenRanksArray = piecePlacement.split("/");

	for (let rank = 0; rank < RANKS; rank++) {
		const arr = parseFenRank(fenRanksArray[rank]);
		finalArray[rank] = arr;
	}

	return finalArray;
};

/* -------------------------------------------------------------------------- */

export const logChessboard = (chessboard: string[][]) => {
	for (let rank = 0; rank < RANKS; rank++) {
		console.log(`${chessboard[rank]} \n`);
	}
};

export const sortPiecesByFile = (pieces: PieceMap): PieceFiles => {
	const pieceFiles: PieceFiles = {
		white: {},
		black: {},
	};

	const whitePieces = pieces.white;
	const blackPieces = pieces.black;

	for (let i = 0; i < whitePieces.length; i++) {
		const currPiece = whitePieces[i];
		const file = currPiece[1];

		if (file in pieceFiles.white) {
			pieceFiles.white[file].push(currPiece);
		} else {
			pieceFiles.white[file] = [currPiece];
		}
	}
	for (let i = 0; i < blackPieces.length; i++) {
		const currPiece = blackPieces[i];
		const file = currPiece[1];

		if (file in pieceFiles.black) {
			pieceFiles.black[file].push(currPiece);
		} else {
			pieceFiles.black[file] = [currPiece];
		}
	}

	return pieceFiles;
};

/* ----------------------------- GENERATE MOVES ----------------------------- */

const squareStates = {
	UNOCCUPIED: 0,
	OCCUPIED_FRIENDLY: 1,
	OCCUPIED_OPPONENT: 2,
};

const getSquareState = (square: string, color: string) => {
	if (square === EMPTY_SQUARE) return squareStates.UNOCCUPIED;

	const squareColor = getColor(square);
	if (color === squareColor) return squareStates.OCCUPIED_FRIENDLY;

	return squareStates.OCCUPIED_OPPONENT;
};

export const getPawnMoves = (chessboard: string[][], pawnPosition: PiecePosition): PiecePosition[] => {
	const pawnMoves: PiecePosition[] = [];

	const rank = pawnPosition[RANK_INDEX];
	const file = pawnPosition[FILE_INDEX];
	const pawn = chessboard[rank][file];
	const color = getColor(pawn);
	const direction = pawn == WHITE_PAWN ? -1 : 1;
	const opposingPawn = pawn == WHITE_PAWN ? BLACK_PAWN : WHITE_PAWN;

	if (rank + direction < 0 || rank + direction >= RANKS) return [];

	const forwardSquare = chessboard[rank + direction][file];
	const forwardSquareState = getSquareState(forwardSquare, color);

	if (forwardSquareState === squareStates.UNOCCUPIED) pawnMoves.push([rank + direction, file]);

	if (chessboard[rank + direction][file - 1] === opposingPawn) pawnMoves.push([rank + direction, file - 1]);
	if (chessboard[rank + direction][file + 1] === opposingPawn) pawnMoves.push([rank + direction, file + 1]);

	return pawnMoves;
};

export const getPawnAttacks = (chessboard: string[][], pawnPosition: PiecePosition): PiecePosition[] => {
	const pawnAttacks: PiecePosition[] = [];

	const rank = pawnPosition[RANK_INDEX];
	const file = pawnPosition[FILE_INDEX];
	const pawn = chessboard[rank][file];
	const direction = pawn == WHITE_PAWN ? -1 : 1;

	if (rank + direction < 0 || rank + direction >= RANKS) return [];

	if (file > 0) pawnAttacks.push([rank + direction, file - 1]);
	if (file < FILES - 1) pawnAttacks.push([rank + direction, file + 1]);

	return pawnAttacks;
};

export const getBishopMoves = (chessboard: string[][], bishopPosition: PiecePosition): PiecePosition[] => {
	const bishopMoves: PiecePosition[] = [];

	const rank = bishopPosition[RANK_INDEX];
	const file = bishopPosition[FILE_INDEX];
	const color = getColor(chessboard[rank][file]);

	//to bottom right
	let currRank = rank + 1;
	let currFile = file + 1;

	while (currRank < RANKS && currFile < FILES) {
		const square = chessboard[currRank][currFile];
		const squarePosition = [currRank, currFile];
		const squareState = getSquareState(square, color);

		if (squareState !== squareStates.OCCUPIED_FRIENDLY) bishopMoves.push(squarePosition);
		if (squareState !== squareStates.UNOCCUPIED) break;

		currRank++;
		currFile++;
	}

	//to bottom left
	currRank = rank + 1;
	currFile = file - 1;
	while (currRank < RANKS && currFile >= 0) {
		const square = chessboard[currRank][currFile];
		const squarePosition = [currRank, currFile];
		const squareState = getSquareState(square, color);

		if (squareState !== squareStates.OCCUPIED_FRIENDLY) bishopMoves.push(squarePosition);
		if (squareState !== squareStates.UNOCCUPIED) break;

		currRank++;
		currFile--;
	}

	//to top left
	currRank = rank - 1;
	currFile = file - 1;
	while (currRank >= 0 && currFile >= 0) {
		const square = chessboard[currRank][currFile];
		const squarePosition = [currRank, currFile];
		const squareState = getSquareState(square, color);

		if (squareState !== squareStates.OCCUPIED_FRIENDLY) bishopMoves.push(squarePosition);
		if (squareState !== squareStates.UNOCCUPIED) break;

		currRank--;
		currFile--;
	}

	//to top right
	currRank = rank - 1;
	currFile = file + 1;
	while (currRank >= 0 && currFile < FILES) {
		const square = chessboard[currRank][currFile];
		const squarePosition = [currRank, currFile];
		const squareState = getSquareState(square, color);

		if (squareState !== squareStates.OCCUPIED_FRIENDLY) bishopMoves.push(squarePosition);
		if (squareState !== squareStates.UNOCCUPIED) break;

		currRank--;
		currFile++;
	}

	return bishopMoves;
};

export const getKnightMoves = (chessboard: string[][], knightPosition: PiecePosition): PiecePosition[] => {
	const knightMoves: PiecePosition[] = [];
	const rank = knightPosition[RANK_INDEX];
	const file = knightPosition[FILE_INDEX];
	const color = getColor(chessboard[rank][file]);

	const possibleDirections: PiecePosition[] = [
		[rank - 2, file - 1],
		[rank - 1, file - 2],
		[rank + 1, file - 2],
		[rank + 2, file - 1],
		[rank + 2, file + 1],
		[rank + 1, file + 2],
		[rank - 1, file + 2],
		[rank - 2, file + 1],
	];

	for (let i = 0; i < possibleDirections.length; i++) {
		const squarePosition = possibleDirections[i];
		const squareRank = squarePosition[RANK_INDEX];
		const squareFile = squarePosition[FILE_INDEX];
		if (squareRank < 0 || squareRank >= RANKS || squareFile < 0 || squareFile >= FILES) continue;

		const square = chessboard[squareRank][squareFile];
		const squareState = getSquareState(square, color);
		if (squareState !== squareStates.OCCUPIED_FRIENDLY) knightMoves.push([squareRank, squareFile]);
	}

	return knightMoves;
};

export const getRookMoves = (chessboard: string[][], rookPosition: PiecePosition): PiecePosition[] => {
	const rookMoves: PiecePosition[] = [];
	const rank = rookPosition[RANK_INDEX];
	const file = rookPosition[FILE_INDEX];
	const color = getColor(chessboard[rank][file]);

	//horizontal moves left
	for (let currFile = file - 1; currFile >= 0; currFile--) {
		const square = chessboard[rank][currFile];
		const squareState = getSquareState(square, color);

		if (squareState !== squareStates.OCCUPIED_FRIENDLY) rookMoves.push([rank, currFile]);
		if (squareState !== squareStates.UNOCCUPIED) break;
	}
	//horizontal moves right
	for (let currFile = file + 1; currFile < FILES; currFile++) {
		const square = chessboard[rank][currFile];
		const squareState = getSquareState(square, color);

		if (squareState !== squareStates.OCCUPIED_FRIENDLY) rookMoves.push([rank, currFile]);
		if (squareState !== squareStates.UNOCCUPIED) break;
	}
	//vertical moves up
	for (let currRank = rank - 1; currRank >= 0; currRank--) {
		const square = chessboard[currRank][file];
		const squareState = getSquareState(square, color);

		if (squareState !== squareStates.OCCUPIED_FRIENDLY) rookMoves.push([currRank, file]);
		if (squareState !== squareStates.UNOCCUPIED) break;
	}
	//vertical moves down
	for (let currRank = rank + 1; currRank < RANKS; currRank++) {
		const square = chessboard[currRank][file];
		const squareState = getSquareState(square, color);

		if (squareState !== squareStates.OCCUPIED_FRIENDLY) rookMoves.push([currRank, file]);
		if (squareState !== squareStates.UNOCCUPIED) break;
	}
	return rookMoves;
};
export const getQueenMoves = (chessboard: string[][], queenPosition: PiecePosition): PiecePosition[] => {
	const queenMoves: PiecePosition[] = [];
	const diagonalMoves = getBishopMoves(chessboard, queenPosition);
	const straightMoves = getRookMoves(chessboard, queenPosition);

	queenMoves.push(...diagonalMoves);
	queenMoves.push(...straightMoves);

	return queenMoves;
};
export const getKingMoves = (chessboard: string[][], kingPosition: PiecePosition): PiecePosition[] => {
	const kingMoves: PiecePosition[] = [];
	const rank = kingPosition[RANK_INDEX];
	const file = kingPosition[FILE_INDEX];
	const color = getColor(chessboard[rank][file]);

	const possibleDirections: PiecePosition[] = [
		[rank + 1, file + 1],
		[rank + 1, file - 1],
		[rank + 1, file],
		[rank - 1, file - 1],
		[rank - 1, file],
		[rank - 1, file + 1],
		[rank, file - 1],
		[rank, file + 1],
	];

	for (let i = 0; i < possibleDirections.length; i++) {
		const squarePosition = possibleDirections[i];
		const squareRank = squarePosition[RANK_INDEX];
		const squareFile = squarePosition[FILE_INDEX];
		if (squareRank < 0 || squareRank >= RANKS || squareFile < 0 || squareFile >= FILES) continue;

		const square = chessboard[squareRank][squareFile];
		const squareState = getSquareState(square, color);
		if (squareState !== squareStates.OCCUPIED_FRIENDLY) kingMoves.push([squareRank, squareFile]);
	}

	return kingMoves;
};

/* -------------------------------- DEFENSES -------------------------------- */
export const getBishopDefending = (chessboard: string[][], bishopPosition: PiecePosition): PiecePosition[] => {
	const bishopDefending: PiecePosition[] = [];

	const rank = bishopPosition[RANK_INDEX];
	const file = bishopPosition[FILE_INDEX];
	const color = getColor(chessboard[rank][file]);

	//to bottom right
	let currRank = rank + 1;
	let currFile = file + 1;

	while (currRank < RANKS && currFile < FILES) {
		const square = chessboard[currRank][currFile];
		const squarePosition = [currRank, currFile];
		const squareState = getSquareState(square, color);

		if (squareState === squareStates.OCCUPIED_FRIENDLY) {
			bishopDefending.push(squarePosition);
			break;
		}

		currRank++;
		currFile++;
	}

	//to bottom left
	currRank = rank + 1;
	currFile = file - 1;
	while (currRank < RANKS && currFile >= 0) {
		const square = chessboard[currRank][currFile];
		const squarePosition = [currRank, currFile];
		const squareState = getSquareState(square, color);

		if (squareState === squareStates.OCCUPIED_FRIENDLY) {
			bishopDefending.push(squarePosition);
			break;
		}

		currRank++;
		currFile--;
	}

	//to top left
	currRank = rank - 1;
	currFile = file - 1;
	while (currRank >= 0 && currFile >= 0) {
		const square = chessboard[currRank][currFile];
		const squarePosition = [currRank, currFile];
		const squareState = getSquareState(square, color);

		if (squareState === squareStates.OCCUPIED_FRIENDLY) {
			bishopDefending.push(squarePosition);
			break;
		}

		currRank--;
		currFile--;
	}

	//to top right
	currRank = rank - 1;
	currFile = file + 1;
	while (currRank >= 0 && currFile < FILES) {
		const square = chessboard[currRank][currFile];
		const squarePosition = [currRank, currFile];
		const squareState = getSquareState(square, color);

		if (squareState === squareStates.OCCUPIED_FRIENDLY) {
			bishopDefending.push(squarePosition);
			break;
		}

		currRank--;
		currFile++;
	}

	return bishopDefending;
};

export const getKnightDefending = (chessboard: string[][], knightPosition: PiecePosition): PiecePosition[] => {
	const knightDefending: PiecePosition[] = [];
	const rank = knightPosition[RANK_INDEX];
	const file = knightPosition[FILE_INDEX];
	const color = getColor(chessboard[rank][file]);

	const possibleDirections: PiecePosition[] = [
		[rank - 2, file - 1],
		[rank - 1, file - 2],
		[rank + 1, file - 2],
		[rank + 2, file - 1],
		[rank + 2, file + 1],
		[rank + 1, file + 2],
		[rank - 1, file + 2],
		[rank - 2, file + 1],
	];

	for (let i = 0; i < possibleDirections.length; i++) {
		const squarePosition = possibleDirections[i];
		const squareRank = squarePosition[RANK_INDEX];
		const squareFile = squarePosition[FILE_INDEX];
		if (squareRank < 0 || squareRank >= RANKS || squareFile < 0 || squareFile >= FILES) continue;

		const square = chessboard[squareRank][squareFile];
		const squareState = getSquareState(square, color);
		if (squareState === squareStates.OCCUPIED_FRIENDLY) knightDefending.push([squareRank, squareFile]);
	}

	return knightDefending;
};

export const getRookDefending = (chessboard: string[][], rookPosition: PiecePosition): PiecePosition[] => {
	const rookDefending: PiecePosition[] = [];
	const rank = rookPosition[RANK_INDEX];
	const file = rookPosition[FILE_INDEX];
	const color = getColor(chessboard[rank][file]);

	//horizontal moves left
	for (let currFile = file - 1; currFile >= 0; currFile--) {
		const square = chessboard[rank][currFile];
		const squareState = getSquareState(square, color);

		if (squareState === squareStates.OCCUPIED_FRIENDLY) {
			rookDefending.push([rank, currFile]);
			break;
		}
	}
	//horizontal moves right
	for (let currFile = file + 1; currFile < FILES; currFile++) {
		const square = chessboard[rank][currFile];
		const squareState = getSquareState(square, color);

		if (squareState === squareStates.OCCUPIED_FRIENDLY) {
			rookDefending.push([rank, currFile]);
			break;
		}
	}
	//vertical moves up
	for (let currRank = rank - 1; currRank >= 0; currRank--) {
		const square = chessboard[currRank][file];
		const squareState = getSquareState(square, color);

		if (squareState === squareStates.OCCUPIED_FRIENDLY) {
			rookDefending.push([currRank, file]);
			break;
		}
	}
	//vertical moves down
	for (let currRank = rank + 1; currRank < RANKS; currRank++) {
		const square = chessboard[currRank][file];
		const squareState = getSquareState(square, color);
		if (squareState === squareStates.OCCUPIED_FRIENDLY) {
			rookDefending.push([currRank, file]);
			break;
		}
	}
	return rookDefending;
};
export const getQueenDefending = (chessboard: string[][], queenPosition: PiecePosition): PiecePosition[] => {
	const queenDefending: PiecePosition[] = [];
	const diagonalMoves = getBishopDefending(chessboard, queenPosition);
	const straightMoves = getRookDefending(chessboard, queenPosition);

	queenDefending.push(...diagonalMoves);
	queenDefending.push(...straightMoves);

	return queenDefending;
};
export const getKingDefending = (chessboard: string[][], kingPosition: PiecePosition): PiecePosition[] => {
	const kingDefending: PiecePosition[] = [];
	const rank = kingPosition[RANK_INDEX];
	const file = kingPosition[FILE_INDEX];
	const color = getColor(chessboard[rank][file]);

	const possibleDirections: PiecePosition[] = [
		[rank + 1, file + 1],
		[rank + 1, file - 1],
		[rank + 1, file],
		[rank - 1, file - 1],
		[rank - 1, file],
		[rank - 1, file + 1],
		[rank, file - 1],
		[rank, file + 1],
	];

	for (let i = 0; i < possibleDirections.length; i++) {
		const squarePosition = possibleDirections[i];
		const squareRank = squarePosition[RANK_INDEX];
		const squareFile = squarePosition[FILE_INDEX];
		if (squareRank < 0 || squareRank >= RANKS || squareFile < 0 || squareFile >= FILES) continue;

		const square = chessboard[squareRank][squareFile];
		const squareState = getSquareState(square, color);
		if (squareState === squareStates.OCCUPIED_FRIENDLY) kingDefending.push([squareRank, squareFile]);
	}

	return kingDefending;
};
