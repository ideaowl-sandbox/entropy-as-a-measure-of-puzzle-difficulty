// Variables to set
const puzzleSetName = 'witness3x4'
const folderOfNathanPuzzles = './' + puzzleSetName +'/'
const fileExtensionsToSearch = '.svg'






function convertNathanPuzzlesIntoEugenePuzzles(inputPuzzlesJSON) {
    let eugenePuzzlesJSON = [];
    for (let inputPuzzleJSON of inputPuzzlesJSON) {
        let eugenePuzzleMeta = {};
        const size = inputPuzzleJSON.dim.split('x').map(d => +d);
        eugenePuzzleMeta['size'] = size;
        eugenePuzzleMeta['startPosition'] = [0, 0]
        eugenePuzzleMeta['endPosition'] = size;
        eugenePuzzleMeta['endPosition'] = JSON.parse(JSON.stringify(size));
        eugenePuzzleMeta['endPosition'].push(1);
        eugenePuzzleMeta['ref'] = inputPuzzleJSON.ref;

        let puzzleColours = ['#0000FF', '#000000'];

        // To add the region constraints
        let boxI = 0;
        for (let x = 0; x < size[0]; x++) {
            for (let y = 0; y < size[1]; y++) {
                let possibleConstraint = inputPuzzleJSON.cc[boxI].split(';');

                // Only region constraints
                if (+possibleConstraint[0] === 1) {
                    // Init structure if necessary
                    if (eugenePuzzleMeta['constraints'] === undefined) {
                        eugenePuzzleMeta['constraints'] = {};
                    }
                    if (eugenePuzzleMeta['constraints']['regionConstraints'] === undefined) {
                        eugenePuzzleMeta['constraints']['regionConstraints'] = [];
                    }

                    // Add colors
                    if (!puzzleColours.includes(possibleConstraint[2])) {
                        puzzleColours.push(possibleConstraint[2]);
                    }

                    // Add actual constraint
                    eugenePuzzleMeta['constraints']['regionConstraints']
                        .push([x+1, y+1, puzzleColours.indexOf(possibleConstraint[2])])
                }

                boxI++;
            }
        }

        eugenePuzzlesJSON.push(eugenePuzzleMeta);
    }
    return eugenePuzzlesJSON;
}




const fs = require('fs');
let filenames = fs.readdirSync(folderOfNathanPuzzles);
filenames = filenames.filter(filename => filename.endsWith(fileExtensionsToSearch));

const nathanPuzzlesJSON = filenames.map(filename => {
    const textContent = fs.readFileSync(folderOfNathanPuzzles + filename, 
        { encoding: 'utf8', flag: 'r' });  
    let nathanPuzzleJSON = JSON.parse(textContent.match(/<!--(.*?)-->/g)[0]
        .replaceAll('<!--', '')
        .replaceAll('-->', '')
        .replaceAll('"cc":{', '"cc":[')   // Nathan's representation isn't strictly JSON
        .replaceAll('},"mc":"', '],"mc":"'));  
    nathanPuzzleJSON['ref'] = filename;
    return nathanPuzzleJSON;
});


const eugenePuzzleJSON = convertNathanPuzzlesIntoEugenePuzzles(nathanPuzzlesJSON);
fs.writeFileSync("./" + puzzleSetName + "-eugeneMeta.json", JSON.stringify(eugenePuzzleJSON));
