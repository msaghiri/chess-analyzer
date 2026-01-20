import useAnalysisContext from "../../hooks/useAnalysisContext";
import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PGNForm.module.css";

const SAMPLE_PGN = `
[Event "Live Chess"]
[Site "Chess.com"]
[Date "2026.01.19"]
[Round "-"]
[White "MagnusCarlsen"]
[Black "vi_pranav"]
[Result "1-0"]
[CurrentPosition "1r1r2k1/5p2/2n1q3/4pN2/3b3Q/4BBP1/5PK1/7R b - - 3 37"]
[Timezone "UTC"]
[ECO "C70"]
[ECOUrl "https://www.chess.com/openings/Ruy-Lopez-Opening-Morphy-Defense-Cozio-Defense-5.c3-d6-6.d4-Bd7"]
[UTCDate "2026.01.19"]
[UTCTime "18:45:15"]
[WhiteElo "3291"]
[BlackElo "3210"]
[TimeControl "180"]
[Termination "MagnusCarlsen won by resignation"]
[StartTime "18:45:15"]
[EndDate "2026.01.19"]
[EndTime "18:50:49"]
[Link "https://www.chess.com/analysis/game/live/148223138954/analysis"]
[WhiteUrl "https://images.chesscomfiles.com/uploads/v1/user/3889224.121e2094.50x50o.c9e2d3e54344.jpg"]
[WhiteCountry "104"]
[WhiteTitle "GM"]
[BlackUrl "https://images.chesscomfiles.com/uploads/v1/user/93593240.10fc5f09.50x50o.02d52e3a567a.jpg"]
[BlackCountry "69"]
[BlackTitle "GM"]

1. e4 {[%clk 0:03:00]} 1... e5 {[%clk 0:03:00]} 2. Nf3 {[%clk 0:02:59.1]} 2...
Nc6 {[%clk 0:02:59.5]} 3. Bb5 {[%clk 0:02:57.6]} 3... a6 {[%clk 0:02:59]} 4. Ba4
{[%clk 0:02:56.6]} 4... Nge7 {[%clk 0:02:58.4]} 5. c3 {[%clk 0:02:55.3]} 5... d6
{[%clk 0:02:56.8]} 6. d4 {[%clk 0:02:54.5]} 6... Bd7 {[%clk 0:02:56.2]} 7. O-O
{[%clk 0:02:53.6]} 7... Ng6 {[%clk 0:02:54.7]} 8. Re1 {[%clk 0:02:52.9]} 8...
Be7 {[%clk 0:02:52.5]} 9. h3 {[%clk 0:02:50.9]} 9... O-O {[%clk 0:02:51.5]} 10.
Be3 {[%clk 0:02:44.4]} 10... Qe8 {[%clk 0:02:49.6]} 11. Bc2 {[%clk 0:02:40]}
11... b5 $6 {[%clk 0:02:45.9]} 12. Nbd2 {[%clk 0:02:39.2]} 12... Rb8 $6 {[%clk
0:02:44.7]} 13. d5 {[%clk 0:02:35.9]} 13... Nd8 {[%clk 0:02:43]} 14. a4 $6 {[%clk
0:02:34.6]} 14... b4 $2 {[%clk 0:02:41.6]} 15. a5 {[%clk 0:02:31.5]} 15... c5 $6
{[%clk 0:02:32.1]} 16. dxc6 $6 {[%clk 0:02:25.1]} 16... Nxc6 $6 {[%clk 0:02:29.6]}
17. Nc4 {[%clk 0:02:23.8]} 17... bxc3 {[%clk 0:02:16.5]} 18. bxc3 {[%clk
0:02:23.4]} 18... Qc8 $6 {[%clk 0:02:12.7]} 19. Nb6 {[%clk 0:02:09.1]} 19... Qd8
{[%clk 0:02:04.3]} 20. Nxd7 {[%clk 0:02:06.7]} 20... Qxd7 {[%clk 0:02:02.7]} 21.
Qd3 {[%clk 0:02:06.5]} 21... Qc8 {[%clk 0:01:52.1]} 22. g3 $2 {[%clk 0:01:56.1]}
22... Bd8 {[%clk 0:01:38.7]} 23. h4 {[%clk 0:01:54.7]} 23... Bxa5 {[%clk
0:01:27.3]} 24. h5 {[%clk 0:01:53.2]} 24... Nge7 $6 {[%clk 0:01:26.1]} 25. h6 $1
{[%clk 0:01:52.2]} 25... Rd8 $6 {[%clk 0:01:23]} 26. hxg7 {[%clk 0:01:49.3]}
26... Kxg7 {[%clk 0:01:02.2]} 27. Kg2 {[%clk 0:01:47]} 27... h5 {[%clk
0:00:47.7]} 28. Rh1 {[%clk 0:01:45.5]} 28... Qg4 $6 {[%clk 0:00:46.4]} 29. Bd1
{[%clk 0:01:33.3]} 29... Qg6 {[%clk 0:00:36.4]} 30. Nh4 {[%clk 0:01:31.5]} 30...
Qe6 {[%clk 0:00:35.7]} 31. Bxh5 {[%clk 0:01:29.4]} 31... d5 {[%clk 0:00:34.8]}
32. Bf3 {[%clk 0:01:05.6]} 32... Bxc3 $6 {[%clk 0:00:33.7]} 33. Rxa6 {[%clk
0:00:56.7]} 33... dxe4 {[%clk 0:00:27.3]} 34. Qxe4 {[%clk 0:00:55.3]} 34... Bd4
{[%clk 0:00:26.9]} 35. Rxc6 {[%clk 0:00:42.4]} 35... Nxc6 $6 {[%clk 0:00:23.8]}
36. Nf5+ {[%clk 0:00:41.5]} 36... Kg8 {[%clk 0:00:22.6]} 37. Qh4 {[%clk
0:00:37]} 1-0

`;

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

const PGNLoadSampleButton = ({ handleLoad }: { handleLoad: () => void }) => {
	return (
		<button className={styles.pgnLoadSampleButton} onClick={handleLoad}>
			Try with a sample game!
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
		if (isLoading) return;

		if (pgn.trim().length) {
			setIsLoading(true);
			try {
				loadPgn(pgn.trim(), handleOnLoad, handleSetProgress);
			} catch {
				setIsLoading(false);
			}
		}
	};

	const handleLoadSamplePGN = () => {
		if (isLoading) return;

		setIsLoading(true);
		try {
			loadPgn(SAMPLE_PGN.trim(), handleOnLoad, handleSetProgress);
		} catch {
			setIsLoading(false);
		}
	};

	return (
		<div className={styles.pgnFormContainer}>
			<h2 className={styles.pgnHeader}>Input PGN</h2>
			<textarea className={styles.pgnTextArea} value={pgn} onChange={handleTextarea}></textarea>
			{isLoading ? <LoadingBar value={progress} /> : <PGNLoadButton handleLoadPgn={handleLoadPgn} />}
			{!isLoading && <PGNLoadSampleButton handleLoad={handleLoadSamplePGN} />}
		</div>
	);
};
