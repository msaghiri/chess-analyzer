import useAnalysisContext from "../../hooks/useAnalysisContext";
import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PGNForm.module.css";

const LoadingBar = ({ value }: { value: number }) => {
	const dynamicLoadingStyle = {
		width: `calc(${value} * 100%)`,
	};

	return (
		<div className={styles.pgnLoadingBar}>
			<div className={styles.filledPortion} style={dynamicLoadingStyle}></div>
		</div>
	);
};

const PGNLoadButton = ({ handleLoadPgn }: { handleLoadPgn: () => void }) => {
	return (
		<button className={styles.pgnLoadButton} onClick={handleLoadPgn}>
			Analyze
		</button>
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
		if (pgn.trim().length) {
			setIsLoading(true);
			try {
				loadPgn(pgn.trim(), handleOnLoad, handleSetProgress);
			} catch {
				setIsLoading(false);
			}
		}
	};

	return (
		<div className={styles.pgnFormContainer}>
			<h2 className={styles.pgnHeader}>Input PGN</h2>
			<textarea className={styles.pgnTextArea} value={pgn} onChange={handleTextarea}></textarea>
			{isLoading ? <LoadingBar value={progress} /> : <PGNLoadButton handleLoadPgn={handleLoadPgn} />}
		</div>
	);
};
