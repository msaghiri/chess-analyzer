import { Chess, DEFAULT_POSITION } from "chess.js";
import type { GamePosition, ChessGame} from "../types/game.types";

export const START_POSITION: GamePosition = {
	fen: DEFAULT_POSITION,
	evaluation: [],
};

export const createGameObject = (pgn: string): ChessGame => {
	const game = new Chess();
	game.loadPgn(pgn);
	console.log("Loaded");
	const tempArr: GamePosition[] = [START_POSITION];
	const history = game.history({ verbose: true });
	history.forEach((fen, index) => {
		tempArr[index + 1] = {
			fen: fen.after,
			evaluation: []
		};
	});

	return {
		gamePositions: tempArr,
		pgn: pgn,
	};
};