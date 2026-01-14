import type { PiecePosition, square } from "../../feature-extraction/featureExtraction.types";
import type { EnrichedContext } from "./context.types";

export type RuleCategory = "pawn" | "imbalance"; //for now

export interface Rule {
	id: string;
	displayName: string;
	category: RuleCategory;
	evaluate: (enrichedContext: EnrichedContext) => RuleResult[];
}

export type Severity = "critical" | "significant" | "minor" | "positive" | "neutral";

export interface RuleResult {
	ruleId: string;
	ruleName: string;
	severity: Severity;
	color: "white" | "black" | "neutral";
	messages: string[];
	affectedSquares: PiecePosition[];
	parsedAffectedSquares: square[];
}

export interface RuleResults {
	pawn: RuleResult[];
	imbalance: RuleResult[];
}
