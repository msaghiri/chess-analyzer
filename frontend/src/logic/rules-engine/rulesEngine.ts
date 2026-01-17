import type { OverallHeuristics, ParsedOverallHeuristics } from "../feature-extraction/featureExtraction.types";
import { parseHeuristics, runAnalysis } from "../feature-extraction/featureExtractionService";
import type { EnrichedContext } from "./types/context.types";
import { getGamePhase } from "./enrichedContextBuilder";
import type { GamePhase } from "./constants";
import { mergePawnRules, pawnRules } from "./rules/pawnRules";
import type { RuleResult, RuleResults } from "./types/rules.types";
import { imbalanceRules } from "./rules/imbalanceRules";
import { toPlay } from "./rulesEngineUtils";

export class RulesEngine {
	//@ts-expect-error i might need this later
	private previousFen: string | undefined;
	private fen: string | undefined;
	private moveNum: number | undefined;
	//@ts-expect-error i might need this later
	private previousHeuristics: OverallHeuristics | undefined;
	//@ts-expect-error i might need this later
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
			this.moveNum = 0;
			this.isInitialized = true;
		} catch {
			throw Error("Invalid FEN");
		}
	}

	public setPosition(fen: string) {
		if (this.fen === undefined || this.moveNum === undefined) throw Error("Initialize before calling setPosition");

		try {
			this.previousHeuristics = this.heuristics;
			this.previousParsedHeuristics = this.parsedHeuristics;
			this.previousFen = this.fen;
			this.heuristics = runAnalysis(fen);
			this.parsedHeuristics = parseHeuristics(this.heuristics);
			this.fen = fen;
			this.moveNum += 1;
		} catch {
			throw Error("Invalid FEN");
		}
	}

	public getIsInitialized(): boolean {
		return this.isInitialized;
	}

	private buildEnrichedContext(): EnrichedContext {
		if (
			this.fen === undefined ||
			this.heuristics === undefined ||
			this.parsedHeuristics === undefined ||
			this.moveNum === undefined
		)
			throw new Error("Rules engine improperly initialized.");

		const phase: GamePhase = getGamePhase(this.heuristics.imbalanceHeuristics.materialCount, this.moveNum);
		const turn: "white" | "black" = toPlay(this.fen);

		return {
			fen: this.fen,
			heuristics: this.heuristics,
			parsedHeuristics: this.parsedHeuristics,
			gamePhase: phase,
			toPlay: turn,
			moveNum: this.moveNum,
		};
	}

	public runAnalysis(): RuleResults {
		const currentEnrichedContext = this.buildEnrichedContext();

		const pawnRuleResults: RuleResult[] = [];
		pawnRules.forEach((rule) => pawnRuleResults.push(...rule.evaluate(currentEnrichedContext)));
		const mergedPawnRuleResults = mergePawnRules(pawnRuleResults);

		const imbalanceRuleResults: RuleResult[] = [];
		imbalanceRules.forEach((rule) => imbalanceRuleResults.push(...rule.evaluate(currentEnrichedContext)));

		return {
			pawn: mergedPawnRuleResults,
			imbalance: imbalanceRuleResults,
		};
	}
}
