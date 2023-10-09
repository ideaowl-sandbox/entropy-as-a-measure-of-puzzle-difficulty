const loadOrCreatePuzzles = 'create';
const maxActiveProcesses = 18;
const fs = require('fs');

const { generateAllNonCrossingPaths, generatePuzzlesWithConstraints } = require('./lib/helpers.js');

const basePuzzle = {"size":[4,4], "startPosition": [0,0], "endPosition": [4,4,2]}
const baseConstraints = { "mustCrosses": [], "regionConstraints": [] }

const endingPathsFilename = "./ending4by4gridpaths/start-" 
    + basePuzzle.startPosition[0] + '-'
    + basePuzzle.startPosition[1] + '-end-'
    + basePuzzle.endPosition[0] + '-'
    + basePuzzle.endPosition[1] + '-'
    + basePuzzle.endPosition[2]
    + "-ENDINGPATHS.json"

let endingPaths = []

if (fs.existsSync(endingPathsFilename)) {
    endingPaths = require(endingPathsFilename);
} else {
    endingPaths = generateAllNonCrossingPaths(basePuzzle).goalTerminatingPaths.endingPaths;
    fs.writeFileSync(endingPathsFilename, JSON.stringify(endingPaths));
}



let gridSize = [4, 4];

let g = {
    cachedGeneratedConstraints: {
        grids: {},
        junctions: {}
    }
};

// Setup all occupiablespaces
let occupiableSpaces = { junctions: [], grids: [] };
for (let x = 0; x <= gridSize[0]; x += 0.5) {
    for (let y = 0; y <= gridSize[1]; y += 0.5) {
        if (x >= 1 && x === Math.round(x) && y >= 1 && y === Math.round(y)) {
            occupiableSpaces.grids.push([x, y]);
        }
        if (x === Math.round(x) || y === Math.round(y)) {
            occupiableSpaces.junctions.push([x, y]);
        }
    }
}

const constraintVars = {
    numRegionConstraints: { exactly: 10 },
    numColorOfRegionConstraints: { exactly: 2 },
    numMustCrosses: { max: 1 },
    numBrokenJunctions: { max: 0 }
}

const samplePerNum = 50000; // must be at least 1
const maxPuzzlesToGenerate = 20000;

const generatedPuzzleSets = generatePuzzlesWithConstraints(basePuzzle, occupiableSpaces, g, samplePerNum, maxPuzzlesToGenerate, constraintVars);

const generatedFilename = './00-generatedPuzzles/RAW-RANDOMPUZZLES-' 
    + 'NumReg-' + constraintVars.numRegionConstraints.exactly + '-'
    + 'NumCol-' + constraintVars.numColorOfRegionConstraints.exactly + '-'
    + 'MaxMust-' + constraintVars.numMustCrosses.max + '-'
    + 'SampleRate-' + samplePerNum
    + '.json';

let puzzleSetPuzzles = [];
generatedPuzzleSets.forEach(gPuzz => puzzleSetPuzzles.push(gPuzz.puzzles));
const generatedPuzzles = [].concat.apply([], puzzleSetPuzzles)

console.log(generatedPuzzles.length + ' puzzles saved to ' + generatedFilename)

fs.writeFileSync(generatedFilename, JSON.stringify(generatedPuzzles));
