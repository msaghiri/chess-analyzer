import { Chess, DEFAULT_POSITION } from "chess.js";
import { useState } from "react";


interface PositionObject {
    fen : string,
    index : number
};

export const usingBoardNavigation = () => {
    const [currentPosition, setCurrentPosition] = useState<PositionObject>({
        fen: DEFAULT_POSITION,
        index: 0
    });

    const gameFens : string[] = [];
    gameFens[0] = DEFAULT_POSITION;

    const game = new Chess();
    const loadPgn = (pgn : string) : boolean  => {
        try{
            game.loadPgn(pgn);
            const gameHistory = game.history({verbose: true});
            gameHistory.forEach((move, index) => {
                gameFens[index+1] = move.after;
            });

            console.log(gameFens);

            return true;
        }catch(e){
            return false;
        }
    }

    const nextMove = () => {
        if(currentPosition.index < gameFens.length - 1){
            const newPosition : PositionObject = {
                fen: gameFens[currentPosition.index+1],
                index: currentPosition.index + 1
            }; 
            setCurrentPosition(newPosition);
        }else{
            const newPosition : PositionObject = {
                fen: gameFens[0],
                index: 0
            };
            setCurrentPosition(newPosition);
        }
    }

    const prevMove = () => {
        if(currentPosition.index > 0){
            const newPosition : PositionObject = {
                fen: gameFens[currentPosition.index-1],
                index: currentPosition.index - 1
            }
            setCurrentPosition(newPosition);
        }else{
            const newPosition : PositionObject = {
                fen: gameFens[gameFens.length-1],
                index: gameFens.length-1
            }
            setCurrentPosition(newPosition);
        }
    }

    return {loadPgn, currentPosition, nextMove, prevMove};
}

