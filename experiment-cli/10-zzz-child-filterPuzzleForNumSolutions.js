
// import WitnessPuzzle from '../server/public/src/lib/WitnessPuzzle/WitnessPuzzle.js';
const WitnessPuzzle = require('../server/public/src/lib/WitnessPuzzle/WitnessPuzzleNode.js');
const extractAndAddMeasures = require('./lib/helpers.js');


// console.log("sub.js is running");
// setTimeout(() => {
//     console.log('sending')
//     // subprocess sending message to parent
//     process.send({ from: "client" });
// }, Math.random() * 2000);


// subprocess listening to message from parent
process.on("message", (message) => {
    const puzzleSetup = message.puzzleSetup;
    const endingPaths = message.endingPaths;
    const atMostNSolutions = message.atMostNSolutions;

    let puzzleMeta = { puzzleSetup, atMostSolutions: 0, solutionEndingPaths: [] };
    puzzleMeta.calcPuzzleObj = new WitnessPuzzle(puzzleSetup, { render: false });

    for (let endingPath of endingPaths) {
        puzzleMeta.calcPuzzleObj.setNewPuzzle(puzzleSetup, {render: false});
        const solved = puzzleMeta.calcPuzzleObj.attemptSolveWithPath(endingPath);
        if (solved) {
            puzzleMeta.atMostSolutions++;
            puzzleMeta.solutionEndingPaths.push(endingPath)
        }

        if (puzzleMeta.atMostSolutions >= atMostNSolutions) {
            break;
        }
    }

    if (puzzleMeta.atMostSolutions > 0 && puzzleMeta.atMostSolutions < atMostNSolutions) {
        console.log('WINNER WINNER CHICKEN DINNER!!! ' + puzzleMeta.atMostSolutions + ' solution(s)')
    }

    puzzleMeta.calcPuzzleObj = undefined;
    process.send({ puzzleMeta });
});
