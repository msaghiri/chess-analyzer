import type { OverallHeuristics, ParsedOverallHeuristics } from "../../feature-extraction/featureExtraction.types";
import type { GamePhase } from "../constants";

export interface EnrichedContext {
	fen: string;
	heuristics: OverallHeuristics;
	parsedHeuristics: ParsedOverallHeuristics;
	gamePhase: GamePhase;
	toPlay: "white" | "black";
	moveNum: number;
}
