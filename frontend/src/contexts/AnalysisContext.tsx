import { createContext } from "react";
import { useState } from "react";

interface GamePosition{
    fen : string;
    positionFeatures : {}; //later
};

interface AnalysisContextType{
    pgn : string;
    loadPgn: (pgn : string) => void;
    gamePositions: GamePosition[];
};

export const AnalysisContext = createContext<AnalysisContextType>({
    pgn: "",
    loadPgn: ()=>{},
    gamePositions: []
}); 

export const AnalysisContextProvider = ({children} : {children : React.ReactNode}) => {
    const [pgn, setPgn] = useState("");

    const loadPgn = (newPgn : string) => {
        setPgn(newPgn);
    }


    const contextValue = {
        pgn,
        loadPgn,
        gamePositions: []
    }

    return (<AnalysisContext.Provider value={contextValue}>
        {children}
    </AnalysisContext.Provider>);
}