const maxActiveProcesses = 18;
// const dataFilename = 'spread-curriculum';
const puzzleSetupsFilename = '5x5';
const outputDataFilename = 'OUTPUT-' + puzzleSetupsFilename;
// const puzzleSetupsFilename = 'windmill-2023-04-05-INPUT-from-Node-TESTBED-EXAMPLES-KL-entropy-with-pruning';




// let puzzleSetups = require("./pure-puzzlesetup-data/" + puzzleSetupsFilename +".json");
// const childProcess = require("child_process");
// const fs = require('fs');

// console.log('Before filter: ' + puzzleSetups.length);

// // puzzleSetups = puzzleSetups.filter((p,i)=> i > 10 && i < 14)
// let latestWindmillPuzzles = puzzleSetups.map(puzzleSetup => { return {puzzleSetup} });

// console.log('After filter: ' + puzzleSetups.length);







// Need to convert to get puzzlesetup
const { convertWindmillPuzzleMetaToEugenePuzzleMeta } = require('./lib/helpers.js');

let latestWindmillPuzzles = require("../windmill/decode_attempts/windmillUnencodedPuzzles-all-regardless-of-constraints.json");
const childProcess = require("child_process");
const fs = require('fs');

// If extracting from windmill puzzles, just extract the latestWindmillPuzzles
if (latestWindmillPuzzles[0].id !== undefined) {
    latestWindmillPuzzles.forEach(pMeta => { pMeta.puzzleSetup = convertWindmillPuzzleMetaToEugenePuzzleMeta(pMeta) })
}

latestWindmillPuzzles = latestWindmillPuzzles.filter(pMeta => pMeta.puzzleSetup !== null)

console.log('Before filter: ' + latestWindmillPuzzles.length);

// Only 4x4
latestWindmillPuzzles = latestWindmillPuzzles.filter(pMeta => pMeta.puzzleSetup.size[0] === 5 && pMeta.puzzleSetup.size[1] === 5 && pMeta.solves > 0)
latestWindmillPuzzles = latestWindmillPuzzles.filter(pMeta => pMeta.puzzleSetup.constraints !== undefined && pMeta.puzzleSetup.constraints.triangles === undefined)




// // Only 4x4
// latestWindmillPuzzles = latestWindmillPuzzles.filter(pMeta => pMeta.puzzleSetup.size[0] === 4 && pMeta.puzzleSetup.size[1] === 4 && pMeta.solves > 0)
// // Only triangle constraints included
// latestWindmillPuzzles = latestWindmillPuzzles.filter(pMeta => pMeta.puzzleSetup.constraints !== undefined && pMeta.puzzleSetup.constraints.triangles !== undefined)
// latestWindmillPuzzles = latestWindmillPuzzles.filter((pMeta,i) => i > 112);
// latestWindmillPuzzles = latestWindmillPuzzles.filter((pMeta,i) => i < 3);
latestWindmillPuzzles = latestWindmillPuzzles.filter((pMeta,i) => i < 260 || i > 265);

console.log('After filter: ' + latestWindmillPuzzles.length);

let upvotes = latestWindmillPuzzles.map(pMeta => pMeta.upvotes);
const sum = upvotes.reduce((a, b) => a + b, 0);
const avg = (sum / upvotes.length) || 0;
console.log({sum, avg});

// fs.writeFileSync("./pure-puzzlesetup-data/windmillTrianglePMetas.json", JSON.stringify(latestWindmillPuzzles));
// return;

let puzzlesLeft = latestWindmillPuzzles.map((pSetup, i) => i);

async function asyncLoop(asyncFns, concurrent = 2) {
    // queue up simultaneous calls 
    let queue = [];
    let ret = [];
    for (let i = 0; i < asyncFns.length; i++) {
        let fn = asyncFns[i];
        // fire the async function, add its promise to the queue, and remove
        // it from queue when complete
        const p = fn(latestWindmillPuzzles[i], i).then(res => {
            queue.splice(queue.indexOf(p), 1);
            ret[ret.indexOf(p)] = res;
            return res;
        });
        queue.push(p);
        ret.push(p);
        // if max concurrent, wait for one to finish
        if (queue.length >= concurrent) {
            await Promise.race(queue);
        }
    }
    // wait for the rest of the calls to finish
    await Promise.all(queue).then((values) => allResults(ret))
};

function extractPromise(pMeta) {
    return new Promise(resolve => {
        // Spin up process
        const sub = childProcess.fork("./pure-windmill-zzz-child-extractor.js");
        // sending message to subprocess
        sub.send({ pMeta });
        // listening to message from subprocess
        sub.on("message", (message) => {
            sub.disconnect();
            resolve(message.puzzleMetaWResults);
        });

    });
}
async function asyncExtract(pMeta, i) {
    console.log('Extracting puzzle ' + i)
    const result = await extractPromise(pMeta);
    puzzlesLeft.splice(puzzlesLeft.indexOf(i), 1)
    const percentLeft = puzzlesLeft.length / latestWindmillPuzzles.length;
    console.log('Finished puzzle ' + i + ', ' + puzzlesLeft.length 
        + ' puzzles left (' + (Math.round(percentLeft * 1000)  / 10) 
        + '%) left, puzzles remaining : ' 
        + (puzzlesLeft.length > 100 ? '> 100' : puzzlesLeft))
    return result;
}



let allSyncExtracts = [];
for (let i = 0; i < latestWindmillPuzzles.length; i++) {
    allSyncExtracts.push(asyncExtract)
}
console.log('=================================================================')
console.log('Extracting from ' + latestWindmillPuzzles.length + ' puzzles with ' + maxActiveProcesses + ' concurrent processes')
console.log('=================================================================')
console.time('puzzlesExtraction');
asyncLoop(allSyncExtracts, maxActiveProcesses);



function allResults(values) {
    console.log('************* All results received, writing to file *************');
    fs.writeFileSync("./pure-puzzlesetup-data/" + outputDataFilename + ".json", JSON.stringify(values));
    console.timeEnd('puzzlesExtraction');
}
