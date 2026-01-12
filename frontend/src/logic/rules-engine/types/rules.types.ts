import type { PiecePosition, square } from "../../feature-extraction/featureExtraction.types";
import type { EnrichedContext } from "./context.types";

export type RuleCategory = "pawn" | "imbalance"; //for now

export interface Rule {
	id: string;
	displayName: string;
	category: RuleCategory;
	evaluate: (enrichedContext: EnrichedContext) => RuleResult[];
}

export interface RuleResult {
	ruleId: string;
	ruleName: string;
	severity: "critical" | "significant" | "minor" | "positive";
	color: "white" | "black";
	messages: string[];
	affectedSquares: PiecePosition[];
	parsedAffectedSquares: square[];
}
