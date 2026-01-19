import type { BoardNav, EvaluationObject } from "../../types/game.types";
import { Repeat2, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import styles from "./AnalysisDetails.module.css";
import { getMode, modes } from "./../../modes/modes";
import type { RuleResult, RuleResults } from "../../logic/rules-engine/types/rules.types";
import { useState } from "react";

/* -------------------------------- STOCKFISH ------------------------------- */
const StockfishLine = ({ index, line, isFirstLine }: { index: number; line: string[]; isFirstLine: boolean }) => (
	<p className={styles.stockfishLine}>
		{index + 1}.{" "}
		{line.map((move, i) => {
			const isBestMove = isFirstLine && i === 0;
			return (
				<span key={i} className={isBestMove ? styles.bestMove : ""}>
					{move}
					{i < line.length - 1 ? " " : ""}
				</span>
			);
		})}
		{"..."}
	</p>
);

const StockfishLines = ({ evaluations }: { evaluations: EvaluationObject[] }) => (
	<div className={styles.stockfishLines}>
		{evaluations.map((evalItem, index) => (
			<StockfishLine key={index} index={index} line={evalItem.line} isFirstLine={index === 0} />
		))}
	</div>
);

const StockfishLinesMobile = ({ evaluations }: { evaluations: EvaluationObject[] }) => {
	if (evaluations.length === 0) return <></>;
	const item = evaluations[0].line;
	return (
		<div className={styles.mobileStockfishLines}>
			<StockfishLine key={0} index={0} line={item} isFirstLine={true} />
		</div>
	);
};
const StockfishSection = ({ score, evaluations }: { score: string; evaluations: EvaluationObject[] }) => (
	<section className={styles.stockfishSection}>
		<h1 className={styles.stockfishEvaluation}>{score}</h1>
		<StockfishLines evaluations={evaluations} />
		<StockfishLinesMobile evaluations={evaluations} />
	</section>
);

const formatEval = (rawEvaluationObject: EvaluationObject, activeColor: string): string => {
	if (!rawEvaluationObject || !activeColor) {
		if (activeColor && activeColor === "w") {
			return "-#";
		}
		return "#";
	}

	if (rawEvaluationObject.mateIn !== null) {
		if (rawEvaluationObject.mateIn === 0) return "#";

		const displayMate = activeColor === "w" ? rawEvaluationObject.mateIn : rawEvaluationObject.mateIn * -1;
		const sign = displayMate > 0 ? "+" : "-";

		return `${sign}M${Math.abs(displayMate)}`;
	} else {
		const rawScore = rawEvaluationObject.evaluation;
		const displayScore = activeColor === "w" ? rawScore : rawScore * -1;

		return `${displayScore.toFixed(1)}`;
	}
};

/* --------------------------- NAVIGATION CONTROLS -------------------------- */
const NavigationControls = ({
	onPrev,
	onNext,
	flipBoard,
}: {
	onPrev: () => void;
	onNext: () => void;
	flipBoard: () => void;
}) => (
	<div className={styles.buttonsContainer}>
		<button className={styles.navigateButton} onClick={flipBoard}>
			<Repeat2 size={30} />
		</button>
		<button className={styles.navigateButton} onClick={onPrev}>
			<ChevronLeft size={30} />
		</button>
		<button className={styles.navigateButton} onClick={onNext}>
			<ChevronRight size={30} />
		</button>
	</div>
);

const ModeNavigation = ({
	currentMode,
	nextMode,
	prevMode,
}: {
	currentMode: string;
	nextMode: () => void;
	prevMode: () => void;
}) => {
	return (
		<div className={styles.modeNavigationContainer}>
			<button className={styles.modeButton} onClick={prevMode}>
				<ChevronLeft size={30} />
			</button>

			<h1 className={styles.modeHeader}>{currentMode}</h1>

			<button className={styles.modeButton} onClick={nextMode}>
				<ChevronRight size={30} />
			</button>
		</div>
	);
};

/* --------------------------- HEURISTICS SECTION --------------------------- */

const SingleRule = ({
	rule,
	setExpanded,
	expanded,
	index,
}: {
	rule: RuleResult;
	setExpanded: (i: number) => void;
	expanded: boolean;
	index: number;
}) => {
	const ruleName = rule.ruleName;
	const ruleMessages = rule.messages;
	const ruleCategory = rule.severity;

	const handleExpansion = () => {
		if (expanded) {
			setExpanded(-1);
		} else {
			setExpanded(index);
		}
	};

	return (
		<div
			data-category={ruleCategory}
			className={`${styles.ruleContainer} ${expanded ? styles.ruleContainerExpanded : ""}`}
		>
			<div className={styles.ruleContainerHeader}>
				<h1 className={styles.ruleName}>{ruleName}</h1>
				<button className={styles.expandButton} onClick={handleExpansion}>
					<ChevronDown />
				</button>
			</div>
			<div className={styles.ruleContainerBody}>
				{ruleMessages.map((m) => (
					<p className={styles.actualRule}>● {m}</p>
				))}
			</div>
		</div>
	);
};

const DisplayRules = ({ ruleResults }: { ruleResults: RuleResult[] }) => {
	const [expanded, setExpanded] = useState(-1);

	const handleSetExpanded = (i: number) => {
		setExpanded(i);
	};

	return (
		<div className={styles.heuristicsContainer}>
			{ruleResults.map((rule, index) => (
				<SingleRule
					rule={rule}
					key={index}
					index={index}
					setExpanded={handleSetExpanded}
					expanded={index === expanded}
				/>
			))}
		</div>
	);
};

const HeuristicsSection = ({ ruleResults, currentMode }: { ruleResults: RuleResults; currentMode: string }) => {
	const pawnRuleResults = ruleResults.pawn;
	const imbalanceRuleResults = ruleResults.imbalance;

	return (
		<>
			{currentMode === getMode(modes.PAWNS) && <DisplayRules ruleResults={pawnRuleResults} />}
			{currentMode === getMode(modes.IMBALANCES) && <DisplayRules ruleResults={imbalanceRuleResults} />}
		</>
	);
};

/* ----------------------------- MAIN COMPONENT ----------------------------- */
const AnalysisDetails = ({ boardInfo }: { boardInfo: BoardNav }) => {
	const idx = boardInfo.currentPosition.index;
	const activeColor = boardInfo.currentPosition.fen.split(" ")[1];
	const currentEvalData = boardInfo.gamePositions[idx].evaluation;
	const currentRuleResults = boardInfo.gamePositions[idx].ruleResults;

	const displayScore = formatEval(currentEvalData[0], activeColor);

	const currentMode = getMode(boardInfo.currentMode);

	return (
		<div className={styles.sidebar}>
			<StockfishSection score={displayScore} evaluations={currentEvalData} />
			<ModeNavigation currentMode={currentMode} nextMode={boardInfo.nextMode} prevMode={boardInfo.prevMode} />
			<HeuristicsSection ruleResults={currentRuleResults} currentMode={currentMode} />

			<NavigationControls onPrev={boardInfo.prevMove} onNext={boardInfo.nextMove} flipBoard={boardInfo.flipBoard} />
		</div>
	);
};

export default AnalysisDetails;
