import { createContext } from "react";
import type { AnalysisContextType } from "../types/game.types";

export const AnalysisContext = createContext<AnalysisContextType>({
	pgn: "",
	loadPgn: () => false,
	gamePositions: [],
});
