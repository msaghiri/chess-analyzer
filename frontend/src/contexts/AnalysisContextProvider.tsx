import { useState, type ReactNode } from "react";
import { AnalysisContext } from "./AnalysisContext";
import type { AnalysisContextType, GamePosition } from "../types/game.types";
import storage from "../utils/storageUtils";
import { createGameObject } from "../utils/chessUtils";
import { stockfish } from "../utils/stockfishUtils";

import { useEffect } from "react";

export const AnalysisContextProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const [pgn, setPgn] = useState("");
	const [gamePositions, setGamePositions] = useState<GamePosition[]>(
		storage.loadGamePositions()
	);

	useEffect(() => {
		stockfish.init();
	});

	const loadPgn = (
		newPgn: string,
		onLoad: () => void,
		reportProgressTo?: (progress: number) => void
	): boolean => {
		try {
			const game = createGameObject(newPgn);

			stockfish.analyzeGame(game.gamePositions, reportProgressTo).then(() => {
				setGamePositions(game.gamePositions);
				setPgn(game.pgn);
				storage.saveGame(game.pgn, game.gamePositions);

				onLoad();
			});

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
