//THIS IS A TEMPORARY SOLUTION
import type { GamePosition } from "../types/game.types";
import { DEFAULT_POSITION } from "chess.js";

//pull the game currently in localStorage
const loadGamePositions = (): GamePosition[] => {
	const gamePositions = localStorage.getItem("gamePositions");

	if (gamePositions) {
		const gamePositionsArray: GamePosition[] = JSON.parse(gamePositions);
		console.log("LOADING GAME");
		return gamePositionsArray;
	} else {
		return [
			{
				fen: DEFAULT_POSITION,
				positionFeatures: {evaluation: []},
			},
		];
	}
};

//save game to localStorage
const saveGame = (pgn: string, gamePositions: GamePosition[]) => {
	const pgnString = JSON.stringify(pgn);
	const gamePositionsString = JSON.stringify(gamePositions);

	localStorage.setItem("pgn", pgnString);
	localStorage.setItem("gamePositions", gamePositionsString);
};

const storage = {
	loadGamePositions,
	saveGame,
};

export default storage;
