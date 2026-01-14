import {
	RANKS,
	FILES,
	EMPTY_SQUARE,
	RANK_INDEX,
	FILE_INDEX,
	getMaterialValue,
	getBishopMoves,
	getKnightMoves,
	getRookMoves,
	getKingMoves,
	getQueenMoves,
	getColor,
	getPawnAttacks,
	piecePositionsToSquares,
} from "../featureExtractionUtils";
import type {
	AttackedSquares,
	BishopPair,
	ImbalanceHeuristics,
	MaterialCounter,
	PieceAttackMap,
	PieceDetails,
	PiecePosition,
	PressureMap,
} from "../featureExtraction.types";

export const getAttackedSquares = (attacker: PiecePosition, chessboard: string[][]): AttackedSquares => {
	let squares: PiecePosition[] = [];

	const pieceType = chessboard[attacker[RANK_INDEX]][attacker[FILE_INDEX]].toLowerCase();

	switch (pieceType) {
		case "p":
			squares = getPawnAttacks(chessboard, attacker);
			break;
		case "b":
			squares = getBishopMoves(chessboard, attacker);
			break;
		case "n":
			squares = getKnightMoves(chessboard, attacker);
			break;
		case "r":
			squares = getRookMoves(chessboard, attacker);
			break;
		case "q":
			squares = getQueenMoves(chessboard, attacker);
			break;
		case "k":
			squares = getKingMoves(chessboard, attacker);
			break;
	}

	const attackedSquares: AttackedSquares = {
		pieceType,
		attackerPosition: attacker,
		value: getMaterialValue(pieceType),
		squares,
	};

	return attackedSquares;
};

export const getPieceAttackMap = (chessboard: string[][]): PieceAttackMap => {
	const pieceAttackMap: PieceAttackMap = {
		white: [],
		black: [],
	};

	for (let rank = 0; rank < RANKS; rank++) {
		for (let file = 0; file < FILES; file++) {
			const square = chessboard[rank][file];

			if (square === EMPTY_SQUARE) continue;

			const attacker: PiecePosition = [rank, file];
			const color = getColor(square) as "white" | "black";
			const attackedSquares = getAttackedSquares(attacker, chessboard);

			pieceAttackMap[color].push(attackedSquares);
		}
	}

	return pieceAttackMap;
};

export const getMaterialCount = (chessboard: string[][]): MaterialCounter => {
	const materialCounter: MaterialCounter = {
		white: {
			materialCount: 0,
			p: 0,
			b: 0,
			n: 0,
			r: 0,
			q: 0,
		},
		black: {
			materialCount: 0,
			p: 0,
			b: 0,
			n: 0,
			r: 0,
			q: 0,
		},
	};

	for (let rank = 0; rank < RANKS; rank++) {
		for (let file = 0; file < FILES; file++) {
			if (chessboard[rank][file] === EMPTY_SQUARE) continue;
			if (chessboard[rank][file].toLowerCase() === "k") continue;

			const square = chessboard[rank][file];
			const pieceColor = getColor(square) as "white" | "black";
			const pieceType = square.toLowerCase();
			const pieceValue = getMaterialValue(pieceType);

			materialCounter[pieceColor].materialCount += pieceValue;
			if (!materialCounter[pieceColor][pieceType]) materialCounter[pieceColor][pieceType] = 0;
			materialCounter[pieceColor][pieceType]++;
		}
	}

	return materialCounter;
};

export const getPressureMap = (pieceAttackMap: PieceAttackMap): PressureMap => {
	const pressureMap: PressureMap = Array.from({ length: RANKS }, () =>
		Array.from({ length: FILES }, () => ({
			white: {
				material: 0,
				pieces: [],
			},
			black: {
				material: 0,
				pieces: [],
			},
			whiteMin: -1,
			blackMin: -1,
		}))
	);

	const whitePiecesAttacking = pieceAttackMap.white;
	const blackPiecesAttacking = pieceAttackMap.black;

	whitePiecesAttacking.forEach((attackedSquares) => {
		const squares = attackedSquares.squares;
		const value = attackedSquares.value;
		const type = attackedSquares.pieceType;
		const attackerPosition = attackedSquares.attackerPosition;

		const attacker: PieceDetails = {
			type,
			position: attackerPosition,
		};

		squares.forEach((square: PiecePosition) => {
			const rank = square[RANK_INDEX];
			const file = square[FILE_INDEX];

			pressureMap[rank][file].white.material += value;

			pressureMap[rank][file].white.pieces.push(attacker);

			if (pressureMap[rank][file].whiteMin === -1 || pressureMap[rank][file].whiteMin > value)
				pressureMap[rank][file].whiteMin = value;
		});
	});

	blackPiecesAttacking.forEach((attackedSquares) => {
		const squares = attackedSquares.squares;
		const value = attackedSquares.value;
		const type = attackedSquares.pieceType;
		const attackerPosition = attackedSquares.attackerPosition;

		const attacker: PieceDetails = {
			type,
			position: attackerPosition,
		};

		squares.forEach((square: PiecePosition) => {
			const rank = square[RANK_INDEX];
			const file = square[FILE_INDEX];

			pressureMap[rank][file].black.material += value;
			pressureMap[rank][file].black.pieces.push(attacker);

			if (pressureMap[rank][file].blackMin === -1 || pressureMap[rank][file].blackMin > value)
				pressureMap[rank][file].blackMin = value;
		});
	});

	return pressureMap;
};

export const getBishopPair = (materialCounter: MaterialCounter): BishopPair => {
	const bishopPair = {
		white: false,
		black: false,
	};

	if (materialCounter.white["b"] === 2) bishopPair.white = true;
	if (materialCounter.black["b"] === 2) bishopPair.black = true;

	return bishopPair;
};

export const analyzePieces = (chessboard: string[][]): ImbalanceHeuristics => {
	const attackMap = getPieceAttackMap(chessboard);
	const materialCount = getMaterialCount(chessboard);
	const pressureMap = getPressureMap(attackMap);
	const bishopPair = getBishopPair(materialCount);

	return { attackMap, materialCount, pressureMap, bishopPair };
};

export const logPieceAnalysis = (pieceAnalysis: {
	attackMap: PieceAttackMap;
	materialCount: MaterialCounter;
	pressureMap: PressureMap;
}) => {
	const attackMap = pieceAnalysis.attackMap;
	const materialCount = pieceAnalysis.materialCount;

	console.log("=====PIECE ANALYSIS=====");
	console.log("====White====");
	console.log(`Material Count: ${materialCount.white.materialCount}`);
	console.log(materialCount.white);
	console.log("====Black====");
	console.log(`Material Count: ${materialCount.black.materialCount}`);
	console.log(materialCount.black);
	console.log("=====ATTACKS=====");
	console.log("====White====");
	const whiteAttackedSquares = attackMap.white;
	for (const entry of whiteAttackedSquares) {
		console.log(`Piece: ${entry.pieceType}`);
		console.log(`Value: ${entry.value}`);
		console.log(`Squares: `);
		console.log(piecePositionsToSquares(entry.squares));
	}
	console.log("====Black====");
	const blackAttackedSquares = attackMap.black;
	for (const entry of blackAttackedSquares) {
		console.log(`Piece: ${entry.pieceType}`);
		console.log(`Value: ${entry.value}`);
		console.log(`Squares: `);
		console.log(piecePositionsToSquares(entry.squares));
	}
	console.log("====Pressure Map====");
	const pressureMap = pieceAnalysis.pressureMap;
	console.log(pressureMap);
};
