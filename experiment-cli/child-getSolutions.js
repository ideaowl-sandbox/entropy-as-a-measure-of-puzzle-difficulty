
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

    let windmillPuzzleMeta = { puzzleSetup };
    windmillPuzzleMeta.calcPuzzleObj = new WitnessPuzzle(puzzleSetup, { render: false });
    console.log('getting solutions');
    windmillPuzzleMeta.solutions = windmillPuzzleMeta.calcPuzzleObj.extractSolutions();
    windmillPuzzleMeta.calcPuzzleObj = undefined;
    process.send({ windmillPuzzleMeta });
});