import useAnalysisContext from "../hooks/useAnalysisContext";
import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

const LoadingBar = ({ value }: { value: number }) => {
	return (
		<div className="w-full bg-neutral-500 rounded-full h-2">
			<div
				className="bg-blue-200 h-full rounded-full"
				style={{ width: `${value * 100}%` }}
			></div>
		</div>
	);
};

export const PGNForm = () => {
	const { loadPgn } = useAnalysisContext();

	const [pgn, setPgn] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [progress, setProgress] = useState(0.0);

	const navigate = useNavigate();

	const handleTextarea = (event: ChangeEvent<HTMLTextAreaElement>) => {
		setPgn(event.target.value);
	};

	const handleSetProgress = (newProgress: number) => {
		setProgress(newProgress);
	};

	const handleOnLoad = () => {
		setIsLoading(false);
		navigate("/analysis");
	};

	const handleLoadPgn = () => {
		setIsLoading(true);
		if (pgn.length) {
			loadPgn(pgn, handleOnLoad, handleSetProgress);
		}
	};

	return (
		<div className="w-200 h-150 bg-gray-800 rounded-2xl flex flex-col gap-10 items-center p-10">
			<h2 className="text-white text-4xl">Input PGN</h2>
			<textarea
				className="bg-blue-900 rounded-2xl w-4/5 h-1/2 max-h-1/2 min-h-1/4 p-6 text-white resize-y"
				value={pgn}
				onChange={handleTextarea}
			></textarea>
			<button
				onClick={handleLoadPgn}
				className=" bg-gray-700 text-white w-1/2 h-12 rounded-2xl cursor-pointer transition-all duration-75 hover:bg-blue-500"
			>
				Analyze
			</button>

			{isLoading && <LoadingBar value={progress} />}
		</div>
	);
};
