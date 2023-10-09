
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

    let windmillPuzzleMetaCalc = { puzzleSetup, upvotes: message.pMeta.upvotes, solves: message.pMeta.solves };
    windmillPuzzleMetaCalc.calcPuzzleObj = new WitnessPuzzle(puzzleSetup, { render: false });
    console.log('calculcating measures');

    windmillPuzzleMetaCalc.calcPuzzleObj.deriveInfoGainTrajectory();
    windmillPuzzleMetaCalc.calcPuzzleObj.setOption('doNotStopOrRestartAtEnd', true);
    windmillPuzzleMetaCalc.calcPuzzleObj.deriveMinSolKLDivergenceEntropyWithPruningAndNdepth(0);
    windmillPuzzleMetaCalc.calcPuzzleObj.deriveMinSolKLDivergenceEntropyWithPruningAndNdepth(1);
    windmillPuzzleMetaCalc.calcPuzzleObj.deriveMinSolKLDivergenceEntropyWithPruningAndNdepth(2);
    windmillPuzzleMetaCalc.calcPuzzleObj.deriveMinSolKLDivergenceEntropyWithPruningAndNdepth(5);
    // windmillPuzzleMetaCalc.calcPuzzleObj.deriveMinSolKLDivergenceEntropyWithPruningAndNdepth(100);

    const { measures, measureValsByName, traj } = extractAndAddMeasures(windmillPuzzleMetaCalc);

    message.pMeta.measures = measures;
    message.pMeta.measureValsByName = measureValsByName;
    message.pMeta.traj = traj;
    message.pMeta.milliSecondsToExtract = performance.now() - startTime;
    const puzzleMetaWResults = message.pMeta;
    process.send({ puzzleMetaWResults });


    // console.log('calculcating measures');
    // puzzleInstCalc.calcPuzzleObj.deriveMinSolKLDivergenceEntropyWithPruningAndNdepth(0);
    // message.pMeta['ReMUSEn0'] = puzzleInstCalc.calcPuzzleObj._state.puzzle.history.minSolKLDivergenceEntropyWithPruningAndN0
    // puzzleInstCalc.calcPuzzleObj.deriveMinSolKLDivergenceEntropyWithPruningAndNdepth(2);
    // message.pMeta['ReMUSEn2'] = puzzleInstCalc.calcPuzzleObj._state.puzzle.history.minSolKLDivergenceEntropyWithPruningAndN2

});

