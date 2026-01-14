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
	getBishopDefending,
	getKnightDefending,
	getRookDefending,
	getQueenDefending,
	getKingDefending,
} from "../featureExtractionUtils";
import type {
	AttackedSquares,
	BishopPair,
	DefendedSquares,
	ImbalanceHeuristics,
	MaterialCounter,
	PieceAttackMap,
	PieceDefenseMap,
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

export const getDefendedSquares = (defender: PiecePosition, chessboard: string[][]): DefendedSquares => {
	let squares: PiecePosition[] = [];

	const pieceType = chessboard[defender[RANK_INDEX]][defender[FILE_INDEX]].toLowerCase();

	switch (pieceType) {
		case "p":
			squares = getPawnAttacks(chessboard, defender);
			break;
		case "b":
			squares = getBishopDefending(chessboard, defender);
			break;
		case "n":
			squares = getKnightDefending(chessboard, defender);
			break;
		case "r":
			squares = getRookDefending(chessboard, defender);
			break;
		case "q":
			squares = getQueenDefending(chessboard, defender);
			break;
		case "k":
			squares = getKingDefending(chessboard, defender);
			break;
	}

	const defendedSquares: DefendedSquares = {
		pieceType,
		defenderPosition: defender,
		value: getMaterialValue(pieceType),
		squares,
	};

	return defendedSquares;
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

export const getPieceDefenseMap = (chessboard: string[][]): PieceDefenseMap => {
	const PieceDefenseMap: PieceDefenseMap = {
		white: [],
		black: [],
	};

	for (let rank = 0; rank < RANKS; rank++) {
		for (let file = 0; file < FILES; file++) {
			const square = chessboard[rank][file];

			if (square === EMPTY_SQUARE || square === "p" || square === "P") continue;

			const defender: PiecePosition = [rank, file];
			const color = getColor(square) as "white" | "black";
			const attackedSquares = getDefendedSquares(defender, chessboard);

			PieceDefenseMap[color].push(attackedSquares);
		}
	}

	return PieceDefenseMap;
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

export const getPressureMap = (pieceAttackMap: PieceAttackMap, pieceDefenseMap: PieceDefenseMap): PressureMap => {
	const pressureMap: PressureMap = Array.from({ length: RANKS }, () =>
		Array.from({ length: FILES }, () => ({
			white: { material: 0, pieces: [] },
			black: { material: 0, pieces: [] },
			whiteMin: -1,
			blackMin: -1,
		}))
	);

	const addInfluenceToMap = (influenceMap: PieceAttackMap | PieceDefenseMap) => {
		const colors: ("white" | "black")[] = ["white", "black"];

		colors.forEach((color) => {
			influenceMap[color].forEach((entry: AttackedSquares | DefendedSquares) => {
				const { squares, value, pieceType } = entry;

				const position = "attackerPosition" in entry ? entry.attackerPosition : entry.defenderPosition;

				const influencer: PieceDetails = {
					type: pieceType,
					position: position,
				};

				squares.forEach((square: PiecePosition) => {
					const rank = square[RANK_INDEX];
					const file = square[FILE_INDEX];
					const cell = pressureMap[rank][file][color];

					cell.material += value;
					cell.pieces.push(influencer);

					const minKey = color === "white" ? "whiteMin" : "blackMin";
					if (pressureMap[rank][file][minKey] === -1 || pressureMap[rank][file][minKey] > value) {
						pressureMap[rank][file][minKey] = value;
					}
				});
			});
		});
	};

	addInfluenceToMap(pieceAttackMap);
	addInfluenceToMap(pieceDefenseMap);

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
	const defenseMap = getPieceDefenseMap(chessboard);
	const materialCount = getMaterialCount(chessboard);
	const pressureMap = getPressureMap(attackMap, defenseMap);
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
