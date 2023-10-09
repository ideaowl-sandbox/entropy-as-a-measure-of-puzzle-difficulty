const maxActiveProcesses = 18;
// const dataFilename = 'spread-curriculum';
// const dataFilename = 'AT-MOST-12-SOLUTIONS-NumReg-10-NumCol-2-MaxMust-1-SampleRate-50000';
// const dataFilename = 'game-introduction-to-constraints';
const dataFilename = 'spread-curriculum-now-try-with-KL';

let puzzleSetups = require("./data/" + dataFilename +".json");
const childProcess = require("child_process");
const fs = require('fs');

// If extracting from windmill puzzles, just extract the puzzleSetups
if(puzzleSetups[0].id !== undefined) {
    puzzleSetups = puzzleSetups.map(pMeta => pMeta.puzzleSetup)
}

// If extracting from filtered puzzles, just extract the puzzleSetups
if (puzzleSetups[0].solutionEndingPaths !== undefined) {
    puzzleSetups = puzzleSetups.map(pMeta => pMeta.puzzleSetup)
}


console.log('Before filter: ' + puzzleSetups.length);
// // Only 4x4
// puzzleSetups = puzzleSetups.filter(pSetup => pSetup.size[0] === 4 && pSetup.size[1] === 4)
console.log('After filter: ' + puzzleSetups.length);

let puzzlesLeft = puzzleSetups.map((pSetup, i) => i);

async function asyncLoop(asyncFns, concurrent = 2) {
    // queue up simultaneous calls 
    let queue = [];
    let ret = [];
    for (let i = 0; i < asyncFns.length; i++) {
        let fn = asyncFns[i];
        // fire the async function, add its promise to the queue, and remove
        // it from queue when complete
        const p = fn(puzzleSetups[i], i).then(res => {
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

function extractPromise(puzzleSetup) {
    return new Promise(resolve => {
        // Spin up process
        const sub = childProcess.fork("./child-extractor.js");
        // sending message to subprocess
        sub.send({ puzzleSetup });
        // listening to message from subprocess
        sub.on("message", (message) => {
            sub.disconnect();
            resolve(message.windmillPuzzleMeta);
        });

    });
}
async function asyncExtract(puzzleSetup, i) {
    console.log('Extracting puzzle ' + i)
    const result = await extractPromise(puzzleSetup);
    puzzlesLeft.splice(puzzlesLeft.indexOf(i), 1)
    const percentLeft = puzzlesLeft.length / puzzleSetups.length;
    console.log('Finished puzzle ' + i + ', ' + puzzlesLeft.length 
        + ' puzzles left (' + (Math.round(percentLeft * 1000)  / 10) 
        + '%) left, puzzles remaining  '
        // + ': ' + puzzlesLeft
    )
    return result;
}



let allSyncExtracts = [];
for (let i = 0; i < puzzleSetups.length; i++) {
    allSyncExtracts.push(asyncExtract)
}
console.log('=================================================================')
console.log('Extracting from ' + puzzleSetups.length + ' puzzles with ' + maxActiveProcesses + ' concurrent processes')
console.log('=================================================================')
console.time('puzzlesExtraction');
asyncLoop(allSyncExtracts, maxActiveProcesses);



function allResults(values) {
    fs.writeFileSync("./data/" + dataFilename + "-OUTPUT.json", JSON.stringify(values));
    console.timeEnd('puzzlesExtraction');
}
