import type { OverallHeuristics, ParsedOverallHeuristics } from "../feature-extraction/featureExtraction.types";
import { parseHeuristics, runAnalysis } from "../feature-extraction/featureExtractionService";

class RulesEngine {
	private previousFen: string | undefined;
	private fen: string | undefined;
	private previousHeuristics: OverallHeuristics | undefined;
	private previousParsedHeuristics: ParsedOverallHeuristics | undefined;
	private heuristics: OverallHeuristics | undefined;
	private parsedHeuristics: ParsedOverallHeuristics | undefined; //for when its more convenient to deal with square rather than PiecePosition

	RulesEngine() {}

	public init(fen: string) {
		try {
			this.heuristics = runAnalysis(fen);
			this.parsedHeuristics = parseHeuristics(this.heuristics);
			this.fen = fen;
		} catch {
			throw Error("Invalid FEN");
		}
	}

	public setPosition(fen: string) {
		if (this.fen === undefined) throw Error("Initialize before calling setPosition");

		try {
			this.previousHeuristics = this.heuristics;
			this.heuristics = runAnalysis(fen);
			this.previousFen = this.fen;
			this.fen = fen;
		} catch {
			throw Error("Invalid FEN");
		}
	}

	public runAnalysis() {
		//this will return the actual analysis results for the game
	}
}
