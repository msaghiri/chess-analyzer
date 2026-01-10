import { PGNForm } from "../../components/PGNForm/PGNForm";
import styles from "./InputPGNPage.module.css";

const InputPGNPage = () => {
	return (
		<div className={styles.pageContainer}>
			<PGNForm />
		</div>
	);
};

export default InputPGNPage;
