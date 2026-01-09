import styles from "./AnalysisPage.module.css";
import BoardViewer from "../../components/BoardViewer";
import AnalysisDetails from "../../components/AnalysisDetails/AnalysisDetails";
import { useBoardNavigation } from "../../hooks/boardNavigationHook";

const AnalysisPage = () => {
	const boardNav = useBoardNavigation();

	return (
		<div className={styles.analysisPage}>
			<div className={styles.mainContainer}>
				<main className={styles.boardContainer}>
					<div className={styles.chessboardWrapper}>
						<BoardViewer boardInfo={boardNav} />
					</div>
				</main>

				<AnalysisDetails boardInfo={boardNav} />
			</div>
		</div>
	);
};

export default AnalysisPage;
