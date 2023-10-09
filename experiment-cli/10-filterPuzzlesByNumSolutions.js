const maxActiveProcesses = 18;
const atMostNSolutions = 12;
// const dataFilename = 'spread-curriculum';
const dataFilename = 'NumReg-6-NumCol-2-MaxMust-2-SampleRate-200000'
//'NumReg-10-NumCol-2-MaxMust-1-SampleRate-50000';
const endingPathsFilename = './ending4by4gridpaths/start-0-0-end-4-4-2-ENDINGPATHS.json'

let puzzleSetups = require("./00-generatedPuzzles/RAW-RANDOMPUZZLES-" + dataFilename +".json");
let endingPaths = require(endingPathsFilename);
const childProcess = require("child_process");
const fs = require('fs');



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
        const sub = childProcess.fork("./10-zzz-child-filterPuzzleForNumSolutions.js");
        // sending message to subprocess
        sub.send({ puzzleSetup, endingPaths, atMostNSolutions });
        // listening to message from subprocess
        sub.on("message", (message) => {
            sub.disconnect();
            resolve(message.puzzleMeta);
        });

    });
}
async function asyncExtract(puzzleSetup, i) {
    console.log('Checking puzzle ' + i)
    const result = await extractPromise(puzzleSetup);
    puzzlesLeft.splice(puzzlesLeft.indexOf(i), 1)
    const percentLeft = puzzlesLeft.length / puzzleSetups.length;
    console.log('Finished checking puzzle ' + i + ', ' + puzzlesLeft.length 
        + ' puzzles left (' + (Math.round(percentLeft * 1000)  / 10) 
        + '%) left')
    return result;
}



let allSyncExtracts = [];
for (let i = 0; i < puzzleSetups.length; i++) {
    allSyncExtracts.push(asyncExtract)
}

console.log('=================================================================')
console.log('Checking for solutions for ' + puzzleSetups.length + ' puzzles with ' + maxActiveProcesses + ' concurrent processes')
console.log('=================================================================')
console.time('puzzlesExtraction');
asyncLoop(allSyncExtracts, maxActiveProcesses);



function allResults(values) {
    const filteredPuzzleSetups = values.filter(d => d.atMostSolutions > 0 && d.atMostSolutions !== atMostNSolutions);
    console.log('Num of passing puzzles: ' + filteredPuzzleSetups.length);
    console.log('Num of all puzzles: ' + values.length);
    fs.writeFileSync("./10-filteredPuzzles/AT-MOST-" + atMostNSolutions + "-SOLUTIONS-" + dataFilename + ".json", JSON.stringify(filteredPuzzleSetups));
    console.timeEnd('puzzlesExtraction');
}
