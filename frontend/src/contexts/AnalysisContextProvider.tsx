import { useState, type ReactNode } from "react";
import { AnalysisContext } from "./AnalysisContext";
import type { AnalysisContextType, GamePosition } from "../types/game.types";
import storage from "../utils/storageUtils";
import { createGameObject } from "../utils/chessUtils";

export const AnalysisContextProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const [pgn, setPgn] = useState("");
	const [gamePositions, setGamePositions] = useState<GamePosition[]>(
		storage.loadGamePositions()
	);

	const loadPgn = (newPgn: string): boolean => {
		try {
			const game = createGameObject(newPgn);

			setGamePositions(game.gamePositions);
			setPgn(game.pgn);

			storage.saveGame(game.pgn, game.gamePositions);

			return true;
		} catch {
			console.log(newPgn);
			console.error("Invalid PGN");
			return false;
		}
	};

	const contextValue: AnalysisContextType = {
		pgn,
		loadPgn,
		gamePositions: gamePositions,
	};

	return (
		<AnalysisContext.Provider value={contextValue}>
			{children}
		</AnalysisContext.Provider>
	);
};
