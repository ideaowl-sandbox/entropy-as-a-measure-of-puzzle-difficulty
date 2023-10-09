
// import WitnessPuzzle from '../server/public/src/lib/WitnessPuzzle/WitnessPuzzle.js';
const WitnessPuzzle = require('../server/public/src/lib/WitnessPuzzle/WitnessPuzzleNode.js');
const {extractAndAddMeasures} = require('./lib/helpers.js');
const {
    performance
} = require('perf_hooks');


// console.log("sub.js is running");
// setTimeout(() => {
//     console.log('sending')
//     // subprocess sending message to parent
//     process.send({ from: "client" });
// }, Math.random() * 2000);


// subprocess listening to message from parent
process.on("message", (message) => {
    const puzzleSetup = message.pMeta.puzzleSetup;
    let startTime = performance.now();
    let puzzleInstCalc = { puzzleSetup, upvotes: message.pMeta.upvotes, solves: message.pMeta.solves };
    puzzleInstCalc.calcPuzzleObj = new WitnessPuzzle(puzzleSetup, { render: false });
    console.log('calculcating measures');
    puzzleInstCalc.calcPuzzleObj.deriveMinSolKLDivergenceEntropyWithPruningAndNdepth(0);
    message.pMeta['ReMUSEn0'] = puzzleInstCalc.calcPuzzleObj._state.puzzle.history.minSolKLDivergenceEntropyWithPruningAndN0
    puzzleInstCalc.calcPuzzleObj.deriveMinSolKLDivergenceEntropyWithPruningAndNdepth(2);
    message.pMeta['ReMUSEn2'] = puzzleInstCalc.calcPuzzleObj._state.puzzle.history.minSolKLDivergenceEntropyWithPruningAndN2

    message.pMeta.milliSecondsToExtract = performance.now() - startTime;
    const puzzleMetaWResults = message.pMeta; 
    process.send({ puzzleMetaWResults });
});

