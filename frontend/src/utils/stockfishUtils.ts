class StockfishService {
	private engine: Worker | null = null;
	private onMessageHandler: ((message: string) => void) | null = null;

	init(): void {
		if (this.engine) return;

		this.engine = new Worker("/stockfish-17.1-lite-single-03e3232.js");

		this.engine.onmessage = (event: MessageEvent) => {
			if (this.onMessageHandler) {
				this.onMessageHandler(event.data);
			}
		};

		this.engine.postMessage("uci");
		this.engine?.postMessage("setoption name MultiPV value 3");
	}

	sendCommand(command: string): void {
		this.engine?.postMessage(command);
	}

	onMessage(callback: (message: string) => void): void {
		this.onMessageHandler = callback;
	}

	analyze(fen: string) {
		this.engine?.postMessage(`position fen ${fen}`);
		this.engine?.postMessage(`go depth 15`);
		const responses: string[] = [];
		const handleResult = (data: string) => {
			if (data.startsWith("info depth 15")) {
				responses.push(data);
			}
			if (data.startsWith("bestmove")) {
				this.onMessage((data) => {});
				console.log("FINISHED RECEIVING");
				setTimeout(() => {
					console.log(responses);
				}, 5000);
			}
		};

		this.onMessage(handleResult);
	}

	terminate(): void {
		this.engine?.terminate();
		this.engine = null;
	}
}

export const stockfish = new StockfishService();
