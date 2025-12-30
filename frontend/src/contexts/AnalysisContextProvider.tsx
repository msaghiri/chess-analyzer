import { useState, type ReactNode } from "react";
import { AnalysisContext } from "./AnalysisContext";
import type { AnalysisContextType, GamePosition } from "../types/game.types";
import { Chess, DEFAULT_POSITION } from "chess.js";

const START_POS_OBJECT: GamePosition = {
	fen: DEFAULT_POSITION,
	positionFeatures: {},
};

export const AnalysisContextProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const [pgn, setPgn] = useState(""); //let's keep this idk if we will need it
	const [gamePositions, setGamePositions] = useState<GamePosition[]>([
		START_POS_OBJECT,
	]);

	const loadPgn = (newPgn: string): boolean => {
		try {
			const game = new Chess();
			game.loadPgn(newPgn);

			const tempArr: GamePosition[] = [START_POS_OBJECT];
			const history = game.history({ verbose: true });

			history.forEach((fen, index) => {
				tempArr[index + 1] = {
					fen: fen.after,
					positionFeatures: {},
				};
			});

			setGamePositions(tempArr);
			setPgn(newPgn);
			return true;
		} catch {
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
