import type { OverallHeuristics, ParsedOverallHeuristics } from "../feature-extraction/featureExtraction.types";
import { parseHeuristics, runAnalysis } from "../feature-extraction/featureExtractionService";
import type { EnrichedContext } from "./types/context.types";
import { getGamePhase } from "./enrichedContextBuilder";
import type { GamePhase } from "./constants";
import { pawnRules } from "./rules/pawnRules";
import type { RuleResult, RuleResults } from "./types/rules.types";
import { imbalanceRules } from "./rules/imbalanceRules";
import { toPlay } from "./rulesEngineUtils";

export class RulesEngine {
	private previousFen: string | undefined;
	private fen: string | undefined;
	private previousHeuristics: OverallHeuristics | undefined;
	private previousParsedHeuristics: ParsedOverallHeuristics | undefined;
	private heuristics: OverallHeuristics | undefined;
	private parsedHeuristics: ParsedOverallHeuristics | undefined; //for when its more convenient to deal with square rather than PiecePosition

	private isInitialized = false;

	constructor() {}

	public init(fen: string) {
		try {
			this.heuristics = runAnalysis(fen);
			this.parsedHeuristics = parseHeuristics(this.heuristics);
			this.fen = fen;
			this.isInitialized = true;
		} catch {
			throw Error("Invalid FEN");
		}
	}

	public setPosition(fen: string) {
		if (this.fen === undefined) throw Error("Initialize before calling setPosition");

		try {
			this.previousHeuristics = this.heuristics;
			this.previousParsedHeuristics = this.parsedHeuristics;
			this.previousFen = this.fen;
			this.heuristics = runAnalysis(fen);
			this.parsedHeuristics = parseHeuristics(this.heuristics);
			this.fen = fen;
		} catch {
			throw Error("Invalid FEN");
		}
	}

	public getIsInitialized(): boolean {
		return this.isInitialized;
	}

	private buildEnrichedContext(): EnrichedContext {
		if (this.fen === undefined || this.heuristics === undefined || this.parsedHeuristics === undefined)
			throw new Error("Rules engine improperly initialized.");

		const phase: GamePhase = getGamePhase(this.heuristics.imbalanceHeuristics.materialCount);
		const turn: "white" | "black" = toPlay(this.fen);

		return {
			fen: this.fen,
			heuristics: this.heuristics,
			parsedHeuristics: this.parsedHeuristics,
			gamePhase: phase,
			toPlay: turn,
		};
	}

	public runAnalysis(): RuleResults {
		const currentEnrichedContext = this.buildEnrichedContext();

		const pawnRuleResults: RuleResult[] = [];
		pawnRules.forEach((rule) => pawnRuleResults.push(...rule.evaluate(currentEnrichedContext)));

		const imbalanceRuleResults: RuleResult[] = [];
		imbalanceRules.forEach((rule) => imbalanceRuleResults.push(...rule.evaluate(currentEnrichedContext)));

		return {
			pawn: pawnRuleResults,
			imbalance: imbalanceRuleResults,
		};
	}
}
