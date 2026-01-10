import styles from "./AnalysisPage.module.css";
import BoardViewer from "../../components/BoardViewer";
import AnalysisDetails from "../../components/AnalysisDetails/AnalysisDetails";
import { useBoardNavigation } from "../../hooks/boardNavigationHook";

const AnalysisPage = () => {
	const boardNav = useBoardNavigation();

	return (
		<div className={styles.analysisPage}>
			<div className={styles.mainContainer}>
				<div className={styles.leftSection}>
					<div className={styles.boardWrapper}>
						<BoardViewer boardInfo={boardNav} />
					</div>
				</div>
				<div className={styles.rightSection}>
					<AnalysisDetails boardInfo={boardNav} />
				</div>
			</div>
		</div>
	);
};

export default AnalysisPage;
