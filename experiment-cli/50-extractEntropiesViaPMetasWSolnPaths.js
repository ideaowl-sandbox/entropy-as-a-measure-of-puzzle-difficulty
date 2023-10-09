const maxActiveProcesses = 18;
// const dataFilename = 'spread-curriculum';
const dataFilename = 'AT-MOST-12-SOLUTIONS-NumReg-6-NumCol-2-MaxMust-2-SampleRate-200000';


let pMetasWsolnPaths = require("./10-filterPuzzlesByNumSolutions/" + dataFilename +".json");
const childProcess = require("child_process");
const fs = require('fs');

// If extracting from windmill puzzles, just extract the pMetasWsolnPaths
if(pMetasWsolnPaths[0].id !== undefined) {
    pMetasWsolnPaths = pMetasWsolnPaths.map(pMeta => pMeta.puzzleSetup)
}


console.log('Before filter: ' + pMetasWsolnPaths.length);
// Only 4x4
pMetasWsolnPaths = pMetasWsolnPaths.filter(pMeta => pMeta.puzzleSetup.size[0] === 4 && pMeta.puzzleSetup.size[1] === 4)
console.log('After filter: ' + pMetasWsolnPaths.length);

let puzzlesLeft = pMetasWsolnPaths.map((pSetup, i) => i);

async function asyncLoop(asyncFns, concurrent = 2) {
    // queue up simultaneous calls 
    let queue = [];
    let ret = [];
    for (let i = 0; i < asyncFns.length; i++) {
        let fn = asyncFns[i];
        // fire the async function, add its promise to the queue, and remove
        // it from queue when complete
        const p = fn(pMetasWsolnPaths[i], i).then(res => {
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

function extractPromise(pMetaWsolnPaths) {
    return new Promise(resolve => {
        // Spin up process
        const sub = childProcess.fork("./50-zzz-child-extractor.js");
        // sending message to subprocess
        sub.send({ pMetaWsolnPaths });
        // listening to message from subprocess
        sub.on("message", (message) => {
            sub.disconnect();
            resolve(message.windmillPuzzleMeta);
        });

    });
}
async function asyncExtract(pMetaWsolnPaths, i) {
    console.log('Extracting puzzle ' + i)
    const result = await extractPromise(pMetaWsolnPaths);
    puzzlesLeft.splice(puzzlesLeft.indexOf(i), 1)
    const percentLeft = puzzlesLeft.length / pMetasWsolnPaths.length;
    console.log('Finished puzzle ' + i + ', ' + puzzlesLeft.length 
        + ' puzzles left (' + (Math.round(percentLeft * 1000)  / 10) 
        + '%) left, puzzles remaining : ' 
        + puzzlesLeft)
    return result;
}



let allSyncExtracts = [];
for (let i = 0; i < pMetasWsolnPaths.length; i++) {
    allSyncExtracts.push(asyncExtract)
}
console.log('=================================================================')
console.log('Extracting from ' + pMetasWsolnPaths.length + ' puzzles with ' + maxActiveProcesses + ' concurrent processes')
console.log('=================================================================')
console.time('puzzlesExtraction');
asyncLoop(allSyncExtracts, maxActiveProcesses);



function allResults(values) {
    fs.writeFileSync("./50-puzzlesWithMeasures/MEASURED-" + dataFilename + "-OUTPUT.json", JSON.stringify(values));
    console.timeEnd('puzzlesExtraction');
}
