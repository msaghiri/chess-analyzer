import { useState, type ReactNode } from "react";
import { AnalysisContext } from "./AnalysisContext";
import type { AnalysisContextType, GamePosition } from "../types/game.types";
import storage from "../utils/storageUtils";
import { createGameObject } from "../utils/chessUtils";
import { stockfish } from "../utils/stockfishUtils";

//import { useEffect } from "react";
import { RulesEngine } from "../logic/rules-engine/rulesEngine";

export const AnalysisContextProvider = ({ children }: { children: ReactNode }) => {
	const [pgn, setPgn] = useState("");
	const [gamePositions, setGamePositions] = useState<GamePosition[]>(storage.loadGamePositions());

	const loadPgn = (newPgn: string, onLoad: () => void, reportProgressTo?: (progress: number) => void): boolean => {
		try {
			const game = createGameObject(newPgn);

			stockfish.init();

			stockfish.analyzeGame(game.gamePositions, reportProgressTo).then(() => {
				stockfish.terminate();

				const engine = new RulesEngine();

				for (let i = 0; i < game.gamePositions.length; i++) {
					const fen = game.gamePositions[i].fen;
					if (!engine.getIsInitialized()) {
						engine.init(fen);
					} else {
						engine.setPosition(fen);
					}

					const currentPositionRuleResults = engine.runAnalysis();
					game.gamePositions[i].ruleResults = currentPositionRuleResults;
				}

				setGamePositions(game.gamePositions);
				setPgn(game.pgn);
				storage.saveGame(game.pgn, game.gamePositions); //using local storage for now?

				onLoad();
			});

			return true;
		} catch {
			throw new Error("Invalid PGN");
		}
	};

	const contextValue: AnalysisContextType = {
		pgn,
		loadPgn,
		gamePositions: gamePositions,
	};

	return <AnalysisContext.Provider value={contextValue}>{children}</AnalysisContext.Provider>;
};
