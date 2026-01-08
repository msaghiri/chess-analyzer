import { useMemo } from "react";
import type { BoardNav} from "../types/game.types";
import { parseHeuristics, runAnalysis } from "../utils/feature-extraction/featureExtractionService";

export const AnalysisDetails = ({boardInfo} : {boardInfo: BoardNav}) => {
	const fen = boardInfo.currentPosition.fen;

	const heuristics = useMemo(() => {
		if (!fen) return null;

		const rawHeuristics = runAnalysis(fen);
		return parseHeuristics(rawHeuristics);
	}, [fen]);

	const whitePassedPawns = heuristics?.pawnHeuristics.passedPawns.white;

	return (
		<div className="w-96 flex flex-col h-full gap-4">
			<div className="flex-1 bg-gray-800 rounded-xl p-4 border border-gray-700">
				<h2 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-4">Heuristics Analysis</h2>
				<div className="text-white">Passed Pawns:</div>
				{whitePassedPawns?.map((pawn) => (
					<p>{pawn}</p>
				))}
			</div>
		</div>
	);
};
