
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
    const puzzleSetup = message.pMetaWsolnPaths.puzzleSetup;
    const solutionEndingPaths = message.pMetaWsolnPaths.solutionEndingPaths;
    let startTime = performance.now();
    let windmillPuzzleMeta = { puzzleSetup };
    windmillPuzzleMeta.calcPuzzleObj = new WitnessPuzzle(puzzleSetup, { render: false });
    console.log('calculcating measures');
    for (let solutionEndingPath of solutionEndingPaths) {
        windmillPuzzleMeta.calcPuzzleObj.deriveOnlyMinSolutionEntropiesWithSolutionPaths(solutionEndingPath);
    }
    const { measures, measureValsByName, traj } = extractAndAddMeasures(windmillPuzzleMeta);
    windmillPuzzleMeta.measures = measures;
    windmillPuzzleMeta.measureValsByName = measureValsByName;
    windmillPuzzleMeta.traj = traj;
    windmillPuzzleMeta.milliSecondsToExtract = performance.now() - startTime;
    windmillPuzzleMeta.calcPuzzleObj = undefined;
    process.send({ windmillPuzzleMeta });
});
