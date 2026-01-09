import { useMemo, useState } from "react";
import type { BoardNav } from "../../types/game.types";
//import { parseHeuristics, runAnalysis } from "../../utils/feature-extraction/featureExtractionService";
//import type { square } from "../../utils/feature-extraction/featureExtraction.types";

import { LeftChevron, RightChevron } from "../Icons";

import styles from "./AnalysisDetails.module.css";

const NavigateButton = ({ role, handleOnClick }: { role: "prev" | "next"; handleOnClick: () => void }) => {
	return (
		<button className={styles.navigateButton} onClick={handleOnClick}>
			{role === "prev" ? <LeftChevron className={`${styles.icon}`} /> : <RightChevron className={`${styles.icon}`} />}
		</button>
	);
};

const AnalysisDetails = ({ boardInfo }: { boardInfo: BoardNav }) => {
	/*const heuristics = useMemo(() => {
		if (!fen) return null;

		const rawHeuristics = runAnalysis(fen);
		return parseHeuristics(rawHeuristics);
	}, [fen]);*/

	//const whitePassedPawns = heuristics?.pawnHeuristics.passedPawns.white;

	/*(const sampleHeuristic = {
		title: "Backwards Pawns",
		squares: ["e4", "c5", "d6"] as square[],
	};*/

	const idx = boardInfo.currentPosition.index;
	const evaluation = boardInfo.gamePositions[idx].evaluation;
	const rawEvaluationScore = evaluation[0].evaluation;
	const displayScore = rawEvaluationScore / 100;

	return (
		<div className={`${styles.sidebar}`}>
			<div className={`${styles.stockfishSection}`}>
				<h1 className={`${styles.stockfishEvaluation}`}>{displayScore}</h1>
				<div className={`${styles.stockfishLines}`}>
					<p className={`${styles.stockfishLine}`}>
						1. <span className={`${styles.bold}`}>e4e5</span> d4d5 nf3 nc6...
					</p>
					<p className={`${styles.stockfishLine}`}>2. e4e5 d4d5 nf3 nc6...</p>
					<p className={`${styles.stockfishLine}`}>3. e4e5 d4d5 nf3 nc6...</p>
				</div>
			</div>
			<div className={`${styles.heuristicsContainer}`}></div>
			<div className={`${styles.buttonsContainer}`}>
				<NavigateButton role="prev" handleOnClick={boardInfo.prevMove} />
				<NavigateButton role="next" handleOnClick={boardInfo.nextMove} />
			</div>
		</div>
	);
};

export default AnalysisDetails;
