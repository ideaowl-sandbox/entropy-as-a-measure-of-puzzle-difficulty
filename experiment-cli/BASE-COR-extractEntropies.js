const maxActiveProcesses = 18;
// const dataFilename = 'spread-curriculum';
const outputDataFilename = 'windmill-2023-08-15-OUTPUT-from-Node-KL-entropy-with-pruning-notboxedinfixed';
const latestWindmillPuzzlesFilename = 'windmillUnencodedPuzzles-from-Windmill-from-2022-11-29';
// const latestWindmillPuzzlesFilename = 'windmill-2023-04-05-INPUT-from-Node-TESTBED-EXAMPLES-KL-entropy-with-pruning';




// Need to convert to get puzzlesetup
const { convertWindmillPuzzleMetaToEugenePuzzleMeta } = require('./lib/helpers.js');

let latestWindmillPuzzles = require("./BASE-COR-data/" + latestWindmillPuzzlesFilename +".json");
const childProcess = require("child_process");
const fs = require('fs');

// If extracting from windmill puzzles, just extract the latestWindmillPuzzles
if(latestWindmillPuzzles[0].id !== undefined) {
    latestWindmillPuzzles.forEach(pMeta => { pMeta.puzzleSetup = convertWindmillPuzzleMetaToEugenePuzzleMeta(pMeta) })
}

console.log('Before filter: ' + latestWindmillPuzzles.length);
// Only 4x4
latestWindmillPuzzles = latestWindmillPuzzles.filter(pMeta => (pMeta.puzzleSetup !== null) ? pMeta.puzzleSetup.size[0] === 4 && pMeta.puzzleSetup.size[1] === 4 && pMeta.solves > 0 : false)

// latestWindmillPuzzles = latestWindmillPuzzles.filter((p,i)=> i > 10 && i < 14)

console.log('After filter: ' + latestWindmillPuzzles.length);


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
        const sub = childProcess.fork("./BASE-COR-zzz-child-extractor.js");
        // sending message to subprocess
        sub.send({ pMeta });
        // listening to message from subprocess
        sub.on("message", (message) => {
            sub.disconnect();
            resolve(message.windmillPuzzleMeta);
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
        + puzzlesLeft)
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
    fs.writeFileSync("./BASE-COR-data/" + outputDataFilename + ".json", JSON.stringify(values));
    console.timeEnd('puzzlesExtraction');
}
