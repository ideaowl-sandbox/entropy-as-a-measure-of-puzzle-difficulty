import WitnessPuzzle from './lib/WitnessPuzzle/WitnessPuzzle.js';
import d3 from './lib/WitnessPuzzle/modules/_dependencies/d3/4.13.0/d3roll.min.js';


let g = {
    cachedGeneratedConstraints: {
        grids: {},
        junctions: {}
    },
    cachedNonCrossingPaths: {

    },
    data: {

    },
    settings: {
        setsGraph: {
            svgSize: 300,
            gridSize: 20,
            xAxisGap: 40,
            yAxisGap: 40
        }
    },


    constraintsInSets: {

    },

    s: {
        puzzleSort: 'Original',
        numSolutionsForSimplerPuzzles: 3,
        uniquePuzzlesIndex: 0,
        puzzlesForTrajectories: [],
        puzzlesForAnalysis: []
    }


};




// let moveAttemptsWithFinalOutcomes = [];
let solvingMoveAttempts = [];

let numPuzzlesGeneratedSoFar = 0;
// let options = ;

[0].forEach(() => d3.select('#noES6ModuleLoading').style('display', 'none'))


function convertWindmillPuzzleMetaToEugenePuzzleMeta(windMillPuzzleMeta) {

    // Note puzzles are assumed to:
    //  - only contain regionConstraints, mustCrosses, cannotCrosses
    //  - no symmetry
    //  - only one entrace/exit

    let eugenePuzzleMeta = {}
    let p = JSON.parse(JSON.stringify(windMillPuzzleMeta))
    eugenePuzzleMeta['size'] = [p['windmillData'].width, p['windmillData'].height];

    let wmStart = p['windmillDataRepr'].filter(d => d.type === 3)[0];
    eugenePuzzleMeta['startPosition'] = [wmStart.i, eugenePuzzleMeta['size'][1] - wmStart.j];

    let wmEnd = p['windmillDataRepr'].filter(d => d.type === 4)[0];
    let endTailPosition = 0;
    if (wmEnd.i === 0) {
        endTailPosition = 4;
    } else if (wmEnd.i === eugenePuzzleMeta['size'][0]) {
        endTailPosition = 2;
    } else if (wmEnd.j === 0) {
        endTailPosition = 1;
    } else if (wmEnd.j === eugenePuzzleMeta['size'][1]) {
        endTailPosition = 3;
    }
    eugenePuzzleMeta['endPosition'] = [wmEnd.i, eugenePuzzleMeta['size'][1] - wmEnd.j, endTailPosition];

    for (let ent of p['windmillDataRepr']) {
        let understoodConstraint = [5, 6, 7].indexOf(ent.type) > -1;
        if (understoodConstraint && eugenePuzzleMeta['constraints'] === undefined) {
            eugenePuzzleMeta['constraints'] = {};
        }

        // Cannot Cross
        if (ent.type === 5) {
            if (eugenePuzzleMeta['constraints']['cannotCrosses'] === undefined) {
                eugenePuzzleMeta['constraints']['cannotCrosses'] = [];
            }
            eugenePuzzleMeta['constraints']['cannotCrosses'].push([
                ent.i + (ent.drawType === 3 ? 0.5 : 0), 
                (eugenePuzzleMeta['size'][1] - ent.j) + (ent.drawType === 4 ? -0.5 : 0),
            ])
        }

        // Must Cross
        if (ent.type === 6) {
            if (eugenePuzzleMeta['constraints']['mustCrosses'] === undefined) {
                eugenePuzzleMeta['constraints']['mustCrosses'] = [];
            }
            eugenePuzzleMeta['constraints']['mustCrosses'].push([
                ent.i + (ent.drawType === 3 ? 0.5 : 0),
                (eugenePuzzleMeta['size'][1] - ent.j) + (ent.drawType === 4 ? -0.5 : 0),
            ])
        }

        if (ent.type === 7) {
            if (eugenePuzzleMeta['constraints']['regionConstraints'] === undefined) {
                eugenePuzzleMeta['constraints']['regionConstraints'] = [];
            }
            eugenePuzzleMeta['constraints']['regionConstraints'].push([
                ent.i + 1, eugenePuzzleMeta['size'][1] - ent.j,
                ent.extras.color - 1
            ])
        }



    }
    

    return eugenePuzzleMeta;
}

setTimeout(function(){

    



    let deriveIGT = true;
    d3.queue()
        .defer(d3.json, './data/windmillUnencodedPuzzles-6-contraints-only-with-metrics-and-trajs.json') //windmillUnencodedPuzzles-3-contraints-only
        // .defer(d3.json, './data/puzzlemeta_unique_solutions.json')

    // 
        .awaitAll(function (err, [windmillPuzzles]) {



            d3.select('#updatesSection').selectAll("*").remove();


            let testPuzzles = [
                {
                    "size": [2, 3],
                    "startPosition": [0, 0],
                    "endPosition": [2, 3, 1],
                    "constraints": {
                        "regionConstraints": [
                            [1, 1, 0],
                            [1, 2, 1],
                            [1, 3, 0],
                            [2, 1, 1],
                            [2, 2, 1],
                            [2, 3, 1]
                        ]
                    }
                },
                {
                    "size": [3, 3],
                    "startPosition": [0, 0],
                    "endPosition": [3, 3, 1],
                    "constraints": {
                        "regionConstraints": [
                            [2, 1, 0],
                            [2, 2, 1],
                            [2, 3, 0],
                            [3, 1, 1],
                            [3, 2, 1],
                            [3, 3, 1]
                        ]
                    }
                },
                {
                    "size": [4, 3],
                    "startPosition": [0, 0],
                    "endPosition": [4, 3, 1],
                    "constraints": {
                        "regionConstraints": [
                            [3, 1, 0],
                            [3, 2, 1],
                            [3, 3, 0],
                            [4, 1, 1],
                            [4, 2, 1],
                            [4, 3, 1]
                        ]
                    }
                },
                {
                    "size": [5, 3],
                    "startPosition": [0, 0],
                    "endPosition": [5, 3, 1],
                    "constraints": {
                        "regionConstraints": [
                            [4, 1, 0],
                            [4, 2, 1],
                            [4, 3, 0],
                            [5, 1, 1],
                            [5, 2, 1],
                            [5, 3, 1]
                        ]
                    }
                },
                {
                    "size": [3, 3],
                    "startPosition": [0, 0],
                    "endPosition": [3, 3, 1],
                    "constraints": {
                        "regionConstraints": [
                            [1, 1, 0],
                            [1, 2, 1],
                            [1, 3, 0],
                            [2, 1, 1],
                            [2, 2, 1],
                            [2, 3, 1]
                        ]
                    }
                },
                {
                    "size": [4, 3],
                    "startPosition": [0, 0],
                    "endPosition": [4, 3, 1],
                    "constraints": {
                        "regionConstraints": [
                            [1, 1, 0],
                            [1, 2, 1],
                            [1, 3, 0],
                            [2, 1, 1],
                            [2, 2, 1],
                            [2, 3, 1]
                        ]
                    }
                },
                {
                    "size": [5, 3],
                    "startPosition": [0, 0],
                    "endPosition": [5, 3, 1],
                    "constraints": {
                        "regionConstraints": [
                            [1, 1, 0],
                            [1, 2, 1],
                            [1, 3, 0],
                            [2, 1, 1],
                            [2, 2, 1],
                            [2, 3, 1]
                        ]
                    }
                }

                ,
                {
                    "size": [3, 2],
                    "startPosition": [0, 0],
                    "endPosition": [3, 2, 1],
                    "constraints": {
                        "regionConstraints": [
                            [1, 1, 0],
                            [1, 2, 1],
                            [3, 1, 0],
                            [3, 2, 1],
                        ]
                    }
                },
                {
                    "size": [3, 3],
                    "startPosition": [0, 0],
                    "endPosition": [3, 3, 1],
                    "constraints": {
                        "regionConstraints": [
                            [1, 1, 0],
                            [1, 2, 1],
                            [3, 1, 0],
                            [3, 2, 1],
                        ]
                    }
                },
                {
                    "size": [3, 4],
                    "startPosition": [0, 0],
                    "endPosition": [3, 4, 1],
                    "constraints": {
                        "regionConstraints": [
                            [1, 1, 0],
                            [1, 2, 1],
                            [3, 1, 0],
                            [3, 2, 1],
                        ]
                    }
                },
                {
                    "size": [3, 5],
                    "startPosition": [0, 0],
                    "endPosition": [3, 5, 1],
                    "constraints": {
                        "regionConstraints": [
                            [1, 1, 0],
                            [1, 2, 1],
                            [3, 1, 0],
                            [3, 2, 1],
                        ]
                    }
                }


                ,
                {
                    "size": [1, 2],
                    "startPosition": [0, 0],
                    "endPosition": [1, 2, 1],
                    "constraints": {
                        "regionConstraints": [
                            [1, 1, 0],
                            [1, 2, 1]
                        ]
                    }
                },
                {
                    "size": [2, 2],
                    "startPosition": [0, 0],
                    "endPosition": [2, 2, 1],
                    "constraints": {
                        "regionConstraints": [
                            [1, 1, 0],
                            [1, 2, 1]
                        ]
                    }
                },
                {
                    "size": [3, 2],
                    "startPosition": [0, 0],
                    "endPosition": [3, 2, 1],
                    "constraints": {
                        "regionConstraints": [
                            [1, 1, 0],
                            [1, 2, 1]
                        ]
                    }
                },
                {
                    "size": [4, 2],
                    "startPosition": [0, 0],
                    "endPosition": [4, 2, 1],
                    "constraints": {
                        "regionConstraints": [
                            [1, 1, 0],
                            [1, 2, 1]
                        ]
                    }
                },
                {
                    "size": [5, 2],
                    "startPosition": [0, 0],
                    "endPosition": [5, 2, 1],
                    "constraints": {
                        "regionConstraints": [
                            [1, 1, 0],
                            [1, 2, 1]
                        ]
                    }
                }

            ]




            // // let simpleWindmillMeta = { "windmillData": { "num": 1, "width": 2, "height": 3, "storeWidth": 5, "storeHeight": 7, "entities": [{ "type": null, "color": null, "orientation": null, "shape": null, "count": 3, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 3, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 3, "triangle_count": null }, { "type": 5, "color": null, "orientation": null, "shape": null, "count": null, "triangle_count": null }, { "type": 4, "color": null, "orientation": null, "shape": null, "count": null, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": null, "triangle_count": null }, { "type": 7, "color": 1, "orientation": null, "shape": null, "count": null, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 19, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 19, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 19, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 19, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 19, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 19, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 19, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 19, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 19, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 19, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 19, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 19, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 19, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 19, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 19, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 19, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 19, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 19, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 19, "triangle_count": null }, { "type": 7, "color": 2, "orientation": null, "shape": null, "count": null, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 3, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 3, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 3, "triangle_count": null }, { "type": 3, "color": null, "orientation": null, "shape": null, "count": null, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 2, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 2, "triangle_count": null }, { "type": 6, "color": null, "orientation": null, "shape": null, "count": null, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": null, "triangle_count": null }], "symmetry": 1 }, "windmillDataRepr": [{ "type": 2, "i": 0, "j": 0, "drawType": 2, "extras": { "color": null } }, { "type": 2, "i": 0, "j": 0, "drawType": 4, "extras": { "color": null } }, { "type": 2, "i": 0, "j": 1, "drawType": 2, "extras": { "color": null } }, { "type": 2, "i": 0, "j": 1, "drawType": 4, "extras": { "color": null } }, { "type": 2, "i": 0, "j": 2, "drawType": 2, "extras": { "color": null } }, { "type": 2, "i": 0, "j": 2, "drawType": 4, "extras": { "color": null } }, { "type": 3, "i": 0, "j": 3, "drawType": 2, "extras": { "color": null } }, { "type": 2, "i": 0, "j": 0, "drawType": 3, "extras": { "color": null } }, { "type": 7, "i": 0, "j": 0, "drawType": 1, "extras": { "color": 1 } }, { "type": 2, "i": 0, "j": 1, "drawType": 3, "extras": { "color": null } }, { "type": 2, "i": 0, "j": 1, "drawType": 1, "extras": { "color": null } }, { "type": 2, "i": 0, "j": 2, "drawType": 3, "extras": { "color": null } }, { "type": 7, "i": 0, "j": 2, "drawType": 1, "extras": { "color": 2 } }, { "type": 2, "i": 0, "j": 3, "drawType": 3, "extras": { "color": null } }, { "type": 2, "i": 1, "j": 0, "drawType": 2, "extras": { "color": null } }, { "type": 2, "i": 1, "j": 0, "drawType": 4, "extras": { "color": null } }, { "type": 2, "i": 1, "j": 1, "drawType": 2, "extras": { "color": null } }, { "type": 2, "i": 1, "j": 1, "drawType": 4, "extras": { "color": null } }, { "type": 2, "i": 1, "j": 2, "drawType": 2, "extras": { "color": null } }, { "type": 2, "i": 1, "j": 2, "drawType": 4, "extras": { "color": null } }, { "type": 2, "i": 1, "j": 3, "drawType": 2, "extras": { "color": null } }, { "type": 5, "i": 1, "j": 0, "drawType": 3, "extras": { "color": null } }, { "type": 2, "i": 1, "j": 0, "drawType": 1, "extras": { "color": null } }, { "type": 2, "i": 1, "j": 1, "drawType": 3, "extras": { "color": null } }, { "type": 2, "i": 1, "j": 1, "drawType": 1, "extras": { "color": null } }, { "type": 2, "i": 1, "j": 2, "drawType": 3, "extras": { "color": null } }, { "type": 2, "i": 1, "j": 2, "drawType": 1, "extras": { "color": null } }, { "type": 6, "i": 1, "j": 3, "drawType": 3, "extras": { "color": null } }, { "type": 4, "i": 2, "j": 0, "drawType": 2, "extras": { "horizontal": 1, "vertical": 0, "color": null } }, { "type": 2, "i": 2, "j": 0, "drawType": 4, "extras": { "color": null } }, { "type": 2, "i": 2, "j": 1, "drawType": 2, "extras": { "color": null } }, { "type": 2, "i": 2, "j": 1, "drawType": 4, "extras": { "color": null } }, { "type": 2, "i": 2, "j": 2, "drawType": 2, "extras": { "color": null } }, { "type": 2, "i": 2, "j": 2, "drawType": 4, "extras": { "color": null } }, { "type": 2, "i": 2, "j": 3, "drawType": 2, "extras": { "color": null } }] };
            // let simpleWindmillMeta = { "windmillData": { "num": 1, "width": 2, "height": 3, "storeWidth": 5, "storeHeight": 7, "entities": [{ "type": 6, "color": null, "orientation": null, "shape": null, "count": null, "triangle_count": null }, { "type": 5, "color": null, "orientation": null, "shape": null, "count": null, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 2, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 2, "triangle_count": null }, { "type": 4, "color": null, "orientation": null, "shape": null, "count": null, "triangle_count": null }, { "type": 6, "color": null, "orientation": null, "shape": null, "count": null, "triangle_count": null }, { "type": 7, "color": 1, "orientation": null, "shape": null, "count": null, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 8, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 8, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 8, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 8, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 8, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 8, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 8, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 8, "triangle_count": null }, { "type": 5, "color": null, "orientation": null, "shape": null, "count": null, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 10, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 10, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 10, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 10, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 10, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 10, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 10, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 10, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 10, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 10, "triangle_count": null }, { "type": 7, "color": 2, "orientation": null, "shape": null, "count": null, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 3, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 3, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 3, "triangle_count": null }, { "type": 3, "color": null, "orientation": null, "shape": null, "count": null, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 2, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": 2, "triangle_count": null }, { "type": 6, "color": null, "orientation": null, "shape": null, "count": null, "triangle_count": null }, { "type": null, "color": null, "orientation": null, "shape": null, "count": null, "triangle_count": null }], "symmetry": 1 }, "windmillDataRepr": [{ "type": 6, "i": 0, "j": 0, "drawType": 2, "extras": { "color": null } }, { "type": 6, "i": 0, "j": 0, "drawType": 4, "extras": { "color": null } }, { "type": 2, "i": 0, "j": 1, "drawType": 2, "extras": { "color": null } }, { "type": 5, "i": 0, "j": 1, "drawType": 4, "extras": { "color": null } }, { "type": 2, "i": 0, "j": 2, "drawType": 2, "extras": { "color": null } }, { "type": 2, "i": 0, "j": 2, "drawType": 4, "extras": { "color": null } }, { "type": 3, "i": 0, "j": 3, "drawType": 2, "extras": { "color": null } }, { "type": 5, "i": 0, "j": 0, "drawType": 3, "extras": { "color": null } }, { "type": 7, "i": 0, "j": 0, "drawType": 1, "extras": { "color": 1 } }, { "type": 2, "i": 0, "j": 1, "drawType": 3, "extras": { "color": null } }, { "type": 2, "i": 0, "j": 1, "drawType": 1, "extras": { "color": null } }, { "type": 2, "i": 0, "j": 2, "drawType": 3, "extras": { "color": null } }, { "type": 7, "i": 0, "j": 2, "drawType": 1, "extras": { "color": 2 } }, { "type": 2, "i": 0, "j": 3, "drawType": 3, "extras": { "color": null } }, { "type": 2, "i": 1, "j": 0, "drawType": 2, "extras": { "color": null } }, { "type": 2, "i": 1, "j": 0, "drawType": 4, "extras": { "color": null } }, { "type": 2, "i": 1, "j": 1, "drawType": 2, "extras": { "color": null } }, { "type": 2, "i": 1, "j": 1, "drawType": 4, "extras": { "color": null } }, { "type": 2, "i": 1, "j": 2, "drawType": 2, "extras": { "color": null } }, { "type": 2, "i": 1, "j": 2, "drawType": 4, "extras": { "color": null } }, { "type": 2, "i": 1, "j": 3, "drawType": 2, "extras": { "color": null } }, { "type": 2, "i": 1, "j": 0, "drawType": 3, "extras": { "color": null } }, { "type": 2, "i": 1, "j": 0, "drawType": 1, "extras": { "color": null } }, { "type": 2, "i": 1, "j": 1, "drawType": 3, "extras": { "color": null } }, { "type": 2, "i": 1, "j": 1, "drawType": 1, "extras": { "color": null } }, { "type": 2, "i": 1, "j": 2, "drawType": 3, "extras": { "color": null } }, { "type": 2, "i": 1, "j": 2, "drawType": 1, "extras": { "color": null } }, { "type": 6, "i": 1, "j": 3, "drawType": 3, "extras": { "color": null } }, { "type": 4, "i": 2, "j": 0, "drawType": 2, "extras": { "horizontal": 1, "vertical": 0, "color": null } }, { "type": 2, "i": 2, "j": 0, "drawType": 4, "extras": { "color": null } }, { "type": 2, "i": 2, "j": 1, "drawType": 2, "extras": { "color": null } }, { "type": 2, "i": 2, "j": 1, "drawType": 4, "extras": { "color": null } }, { "type": 2, "i": 2, "j": 2, "drawType": 2, "extras": { "color": null } }, { "type": 2, "i": 2, "j": 2, "drawType": 4, "extras": { "color": null } }, { "type": 2, "i": 2, "j": 3, "drawType": 2, "extras": { "color": null } }] }

            // let simplePuzzleMeta = {
            //     '_id': 'simplePuzzleMeta',
            //     setup: convertWindmillPuzzleMetaToEugenePuzzleMeta(simpleWindmillMeta)
            // }


            let drawAbleWindmillPuzzles = windmillPuzzles
                .filter(pMeta => pMeta.totalSolutionsFound > 0)
                // .filter((pMeta, i) => i < 6)
                // .filter(pMeta => pMeta.windmillData.width === 3 && pMeta.windmillData.height === 3)



                // .filter(pMeta => pMeta.windmillData.width <= 4 && pMeta.windmillData.height <= 4 && (pMeta.windmillData.width > 1 || pMeta.windmillData.height > 1))
                // .filter(pMeta => pMeta.windmillData.width === 4 && pMeta.windmillData.height === 4)
                // .filter(pMeta => pMeta.id === 'k6f389g' 
                //     || pMeta.id === '77146v8'
                //     || pMeta.id === 'kwbtem0'
                //     || pMeta.id === 'vpv7638'
                //     || pMeta.creatorName === 'nathanst');
            

            // console.log(simplePuzzleMeta);


            

            let puzzleBlocksSection = d3.select('#updatesSection').append('div')
                .classed('puzzleBlocksSection', true)
                // .style('height', '380px')
                // .style('width', '200px')
                // .style('overflow', 'hidden')
                // .style('position', 'absolute')
                // .style('top', '300px')
                ;

            function quickDraw(drawAbleWindmillPuzzles, derive) {

                let puzzlesToDraw = drawAbleWindmillPuzzles;

                let puzzleMetaBlocks = puzzleBlocksSection.selectAll('.puzzleMetaBlocks')
                    .data(puzzlesToDraw, d => d.id);

                let puzzleMetaBlocksEntered = puzzleMetaBlocks
                    .enter()
                    .append('div')
                    .classed('puzzleMetaBlocks', true)
                    .style('background-color', (pMeta) => pMeta.creatorName === 'nathanst' ? 'rgba(255,0,0,0.05)' : 'rgba(0,0,0,0)')
                    .classed('isNathans', (pMeta) => pMeta.creatorName === 'nathanst')
                    .style('display', 'block');

                puzzleMetaBlocksEntered
                    .each(function (windmillPuzzleMeta) {

                        let puzzleSetup = puzzlesToDraw[0].creatorName === undefined ? windmillPuzzleMeta.puzzleSetup :convertWindmillPuzzleMetaToEugenePuzzleMeta(windmillPuzzleMeta);

                        let isMustCross = puzzleSetup.constraints !== undefined && puzzleSetup.constraints.mustCrosses !== undefined;
                        d3.select(this).classed('isMustCross', isMustCross);

                        if (derive !== undefined && derive === true) { //windmillPuzzleMeta.totalInfoGainTrajectory2 === undefined

                            windmillPuzzleMeta.puzzleSetup = puzzleSetup;
                            windmillPuzzleMeta.calcPuzzleObj = new WitnessPuzzle(puzzleSetup, { render: false });
                            windmillPuzzleMeta.calcPuzzleObj.deriveInfoGainTrajectory();
                            windmillPuzzleMeta.measures = [
                                { 
                                    name: 'totalInfoGainTrajectory2',
                                    val: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.infoGainTrajectoryTotal2
                                },
                                {
                                    name: 'totalSolutionsFound',
                                    val: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.totalSolutionsFound
                                },
                                {
                                    name: 'numVisitedPaths',
                                    val: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.visitedPaths.length
                                },
                                {
                                    name: 'numVisitedPathsWithInfoGain',
                                    val: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.visitedPaths
                                        .filter(visitedPath => visitedPath['hasInfoGain']).length
                                },
                                {
                                    name: 'upvotes',
                                    val: windmillPuzzleMeta.upvotes
                                },
                                {
                                    name: 'solves',
                                    val: windmillPuzzleMeta.solves
                                },
                                {
                                    name: 'playerDiffTotal',
                                    val: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.trajPlayerDiffTotal
                                },
                            ]
                            // Turn values into hash
                            windmillPuzzleMeta.measures.push({
                                name: '-nothing-value-',
                                val: 1
                            })
                            windmillPuzzleMeta.measureValsByName = {}
                            // get this as a hash;
                            windmillPuzzleMeta.measures.forEach(measureOb => { windmillPuzzleMeta.measureValsByName[measureOb.name] = +measureOb.val })
                            windmillPuzzleMeta.trajs = windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.traj;

                            console.log('obtained trajectory')
                        }


                        new WitnessPuzzle(puzzleSetup, Object.assign({ classed: ['medium'] }, { targetElement: this, userInterface: false }))

                        let metaInfo = d3.select(this)
                            .append('div')
                            .style('display', 'block')
                            // .style('position', 'absolute')
                            .style('font-size', '12px')
                            .style('width', '200px')
                            .style('margin-top', '-30px')
                            .classed('metaInfo', true);

                        metaInfo.append('div')
                            .style('display', 'inline-block')
                            .text('@windmill')
                            .style('cursor', 'pointer')
                            .style('margin-right', '10px')
                            .on('click', function () {
                                window.open('https://windmill.thefifthmatt.com/' + windmillPuzzleMeta.id, '_blank');
                            })

                        metaInfo.append('div')
                            .classed('isMeta', true)
                            .classed('upvotes', true)
                            .style('display', 'inline-block')
                            .text('up: ' + windmillPuzzleMeta.upvotes)
                            .style('margin-right', '10px')
                            .on('click', function () {
                                quickDraw(puzzlesToDraw.sort((a, b) => +b.upvotes - +a.upvotes))
                                d3.selectAll('.upvotes').classed('isSorted', true);
                            })

                        metaInfo.append('div')
                            .classed('isMeta', true)
                            .classed('solves', true)
                            .style('display', 'inline-block')
                            .text('solves: ' + +windmillPuzzleMeta.solves)
                            .on('click', function () {
                                quickDraw(puzzlesToDraw.sort((a, b) => +b.solves - +a.solves))
                                d3.selectAll('.solves').classed('isSorted', true);
                            })

                        metaInfo.append('div')
                            .classed('isMeta', true)
                            .classed('upvotes_solves', true)
                            .style('display', 'inline-block')
                            .style('margin-right', '10px')
                            .text('up/solves: ' + (+windmillPuzzleMeta.upvotes/+windmillPuzzleMeta.solves).toPrecision(2))
                            .on('click', function () {
                                quickDraw(puzzlesToDraw.sort((a, b) => (+b.upvotes/+b.solves) - (+a.upvotes/a.solves)))
                                d3.selectAll('.upvotes_solves').classed('isSorted', true);
                            })


                        metaInfo.append('div')
                            .classed('isMeta', true)
                            .classed('solns', true)
                            .style('display', 'inline-block')
                            .style('margin-right', '10px')
                            .text('solns: ' + (+windmillPuzzleMeta.totalSolutionsFound))
                            .on('click', function () {
                                quickDraw(puzzlesToDraw.sort((a, b) => (+b.totalSolutionsFound) - (+a.totalSolutionsFound)))
                                d3.selectAll('.solns').classed('isSorted', true);
                            })

                        metaInfo.append('div')
                            .classed('isMeta', true)
                            .classed('playerDiffTotal', true)
                            .style('display', 'inline-block')
                            .style('margin-right', '10px')
                            .text('playerDiffTotal: ' + (+windmillPuzzleMeta.measureValsByName.playerDiffTotal).toPrecision(4))
                            .on('click', function () {
                                quickDraw(puzzlesToDraw.sort((a, b) => (+b.measureValsByName.playerDiffTotal) - (+a.measureValsByName.playerDiffTotal)))
                                d3.selectAll('.playerDiffTotal').classed('isSorted', true);
                            })

                        metaInfo.append('div')
                            .classed('isMeta', true)
                            .classed('playerDiffTotal_solns', true)
                            .style('display', 'inline-block')
                            .style('margin-right', '10px')
                            .text('playerDiffTotal/solns: ' + (+windmillPuzzleMeta.measureValsByName.playerDiffTotal / +windmillPuzzleMeta.measureValsByName.totalSolutionsFound).toPrecision(4))
                            .on('click', function () {
                                quickDraw(puzzlesToDraw.sort((a, b) => (+b.measureValsByName.playerDiffTotal / +b.measureValsByName.totalSolutionsFound) - (+a.measureValsByName.playerDiffTotal / +a.measureValsByName.totalSolutionsFound)))
                                d3.selectAll('.playerDiffTotal_solns').classed('isSorted', true);
                            })

                        metaInfo.append('div')
                            .classed('isMeta', true)
                            .classed('igt2_solns', true)
                            .style('display', 'inline-block')
                            .style('margin-right', '10px')
                            .text('igt2/solns: ' + (+windmillPuzzleMeta.measureValsByName.totalInfoGainTrajectory2 / +windmillPuzzleMeta.totalSolutionsFound).toPrecision(4))
                            .on('click', function () {
                                quickDraw(puzzlesToDraw.sort((a, b) => (+b.measureValsByName.totalInfoGainTrajectory2 / +b.totalSolutionsFound) - (+a.measureValsByName.totalInfoGainTrajectory2 / +a.totalSolutionsFound)))
                                d3.selectAll('.igt2_solns').classed('isSorted', true);
                            })

                        // metaInfo.append('div')
                        //     .classed('isMeta', true)
                        //     .classed('igt2_solns_2', true)
                        //     .style('display', 'inline-block')
                        //     .style('margin-right', '10px')
                        //     .text('igt2/solns^2: ' + (+windmillPuzzleMeta.measureValsByName.totalInfoGainTrajectory2 / Math.pow(+windmillPuzzleMeta.totalSolutionsFound, 2)).toPrecision(4))
                        //     .on('click', function () {
                        //         quickDraw(puzzlesToDraw.sort((a, b) => (+b.measureValsByName.totalInfoGainTrajectory2 / Math.pow(+b.totalSolutionsFound, 2)) - (+a.measureValsByName.totalInfoGainTrajectory2 / Math.pow(+a.totalSolutionsFound,2))))
                        //         d3.selectAll('.igt2_solns_2').classed('isSorted', true);
                        //     })

                        metaInfo.append('div')
                            .classed('isMeta', true)
                            .classed('totalInfoGainTrajectory2', true)
                            .style('display', 'inline-block')
                            .style('margin-right', '10px')
                            .text('totalInfoGainTrajectory2: ' + (windmillPuzzleMeta.measureValsByName.totalInfoGainTrajectory2).toPrecision(4))
                            .on('click', function () {
                                quickDraw(puzzlesToDraw.sort((a, b) => (+b.measureValsByName.totalInfoGainTrajectory2) - (+a.measureValsByName.totalInfoGainTrajectory2)))
                                d3.selectAll('.totalInfoGainTrajectory2').classed('isSorted', true);
                            })

                        metaInfo.append('div')
                            .classed('isMeta', true)
                            .classed('totalSolutionsFound', true)
                            .style('display', 'inline-block')
                            .style('margin-right', '10px')
                            .text('totalSolutionsFound: ' + (windmillPuzzleMeta.measureValsByName.totalSolutionsFound).toPrecision(4))
                            .on('click', function () {
                                quickDraw(puzzlesToDraw.sort((a, b) => (+b.measureValsByName.totalSolutionsFound) - (+a.measureValsByName.totalSolutionsFound)))
                                d3.selectAll('.totalSolutionsFound').classed('isSorted', true);
                            })

                        metaInfo.append('div')
                            .classed('isMeta', true)
                            .classed('numVisitedPaths', true)
                            .style('display', 'inline-block')
                            .style('margin-right', '10px')
                            .text('numVisitedPaths: ' + (windmillPuzzleMeta.measureValsByName.numVisitedPaths))
                            .on('click', function () {
                                quickDraw(puzzlesToDraw.sort((a, b) => (+b.measureValsByName.numVisitedPaths) - (+a.measureValsByName.numVisitedPaths)))
                                d3.selectAll('.totalSolutionsFound').classed('isSorted', true);
                            })

                        metaInfo.append('div')
                            .classed('isMeta', true)
                            .classed('numVisitedPathsWithInfoGain', true)
                            .style('display', 'inline-block')
                            .style('margin-right', '10px')
                            .text('numVisitedPathsWithInfoGain: ' + (windmillPuzzleMeta.measureValsByName.numVisitedPathsWithInfoGain))
                            .on('click', function () {
                                quickDraw(puzzlesToDraw.sort((a, b) => (+b.measureValsByName.numVisitedPathsWithInfoGain) - (+a.measureValsByName.numVisitedPathsWithInfoGain)))
                                d3.selectAll('.numVisitedPathsWithInfoGain').classed('isSorted', true);
                            })



                        metaInfo.append('div')
                            .classed('isMeta', true)
                            .classed('hideMustCrosses', true)
                            .style('display', 'inline-block')
                            .style('margin-right', '10px')
                            .text('toggleMustCrosses')
                            .on('click', function () {
                                let isAnyHidden = !d3.selectAll('.isMustCross.hideMe').empty();
                                console.log(isAnyHidden);
                                d3.selectAll('.hideMustCrosses').classed('isSorted', true);
                                quickDraw(puzzlesToDraw);
                                d3.selectAll('.isMustCross').classed('hideMe', !isAnyHidden);
                            })

                    })


                puzzleMetaBlocks = puzzleMetaBlocks.merge(puzzleMetaBlocksEntered);

                puzzleMetaBlocks.order();

                puzzleMetaBlocksEntered
                    .append('div')
                    .classed('trajectoriesContainer', true)
                    .each(function(pMeta) {
                        drawTrajectories(pMeta, this);
                    })

                d3.selectAll('.isMeta').classed('isSorted', false);

            }





            function drawTrajectories(pMeta, container) {
                let trajContainer = d3.select(container);
                // set the dimensions and margins of the graph
                var margin = { top: 10, right: 30, bottom: 30, left: 60 },
                    width = 600 - margin.left - margin.right,
                    height = 300 - margin.top - margin.bottom;

                // append the svg object to the body of the page
                var svg = d3.select(container)
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom + 80)
                    .style('position', 'absolute')
                    .style('left', '250px')
                    .style('top', '0px')
                    // .style('overflow', 'visible')
                    .append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");

                // let history = pMeta.calcPuzzleObj._state.puzzle.history;
                let trajKeys = Object.keys(pMeta.trajs);
                
                // Add X axis --> it is a date format history.traj
                var x = d3.scaleLinear()
                    .domain([0, 30])
                    .range([0, width]);
                svg.append("g")
                    .classed('xAxis', true)
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(x));

                // Add Y axis
                var y = d3.scaleLinear()
                    .domain([0, 200])
                    .range([height, 0]);
                svg.append("g")
                    .call(d3.axisLeft(y));


                for (let normalized of [false, true]) {


                    for (let trajKey of trajKeys) {
                        // Add the line
                        svg.append("path")
                            .datum(pMeta.trajs[trajKey])
                            .attr("fill", "none")
                            .attr("stroke", ['gray', 'blue', 'green', 'red'][trajKeys.indexOf(trajKey)])
                            .attr('opacity', normalized ? 1 : 0.3)
                            .attr("stroke-width", 1.5)
                            .attr("d", d3.line()
                                .x(function (d, i) { return ((trajKey === 'playerDiff' ? pMeta.trajs[trajKeys[0]].length + 1 : 0) + i) * 10 })
                                .y(function (d) { return y(normalized ? (d / pMeta.measureValsByName.totalSolutionsFound) : d) })
                            )

                        svg.append('text')
                            .attr("fill", ['gray', 'blue', 'green', 'red'][trajKeys.indexOf(trajKey)])
                            .attr('x', () =>  ((trajKey === 'playerDiff' ? pMeta.trajs[trajKeys[0]].length + 1 : 0) ) * 10 )
                            .attr('y', trajKeys.indexOf(trajKey) * 15 + 300)
                            .text(trajKey);

    
                    }


                }


                
            }            




            let puzzlesToDeriveAndDraw = drawAbleWindmillPuzzles; // .filter((d, i) => i < 8)
            let purePuzzlesMeta = testPuzzles.map(puzzleSetup => ({ puzzleSetup }));
            
            if (purePuzzlesMeta !== undefined && purePuzzlesMeta.length !== 0) {
                puzzlesToDeriveAndDraw = purePuzzlesMeta;
            }


            console.time('drawAndGetTrajectories');
            quickDraw(puzzlesToDeriveAndDraw, deriveIGT); //.filter((d,i)=>i < 7)
            console.timeEnd('drawAndGetTrajectories');
            console.log(puzzlesToDeriveAndDraw);



            if (deriveIGT) {

                puzzlesToDeriveAndDraw.forEach(d => delete d.calcPuzzleObj)
                console.log(puzzlesToDeriveAndDraw);

                download(JSON.stringify(puzzlesToDeriveAndDraw), 'windmillUnencodedPuzzles-4-contraints-only-with-derived-igt.json', 'application/json')

            }

            // Function to download data to a file
            function download(data, filename, type) {
                var file = new Blob([data], { type: type });
                if (window.navigator.msSaveOrOpenBlob) // IE10+
                    window.navigator.msSaveOrOpenBlob(file, filename);
                else { // Others
                    var a = document.createElement("a"),
                        url = URL.createObjectURL(file);
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(function () {
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                    }, 0);
                }
            }






































            function drawPaths(drawAbleWindmillPuzzles, derive) {

                let previousMoveSetHash = {}

                d3.select('.igtSection').selectAll('*').remove();

                let puzzleMetaBlocks = d3.select('.igtSection').selectAll('.puzzleMetaBlocks')
                    .data(drawAbleWindmillPuzzles.map(d => { return { puzzleSetup: convertWindmillPuzzleMetaToEugenePuzzleMeta(d) } }), d => d.id);

                let puzzleMetaBlocksEntered = puzzleMetaBlocks
                    .enter()
                    .append('div')
                    .classed('puzzleMetaBlocks', true)
                    .style('display', 'block');

                puzzleMetaBlocksEntered
                    .each(function (windmillPuzzleMeta, puzzleI) {

                        if (puzzleI === 4 || puzzleI === 8) {
                            previousMoveSetHash = {}
                        }

                        let puzzleSetup = windmillPuzzleMeta.puzzleSetup// convertWindmillPuzzleMetaToEugenePuzzleMeta(windmillPuzzleMeta);

                        let isMustCross = puzzleSetup.constraints !== undefined && puzzleSetup.constraints.mustCrosses !== undefined;
                        d3.select(this).classed('isMustCross', isMustCross);

                        if (derive !== undefined && derive === true) { //windmillPuzzleMeta.totalInfoGainTrajectory2 === undefined

                            windmillPuzzleMeta.calcPuzzleObj = new WitnessPuzzle(puzzleSetup, { render: false });
                            windmillPuzzleMeta.calcPuzzleObj.deriveInfoGainTrajectory();
                            windmillPuzzleMeta.totalInfoGainTrajectory2 = windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.infoGainTrajectoryTotal2;
                            windmillPuzzleMeta.totalSolutionsFound = windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.totalSolutionsFound;
                            console.log('obtained trajectory')
                        }

                        new WitnessPuzzle(puzzleSetup, Object.assign({ classed: ['medium'] }, { targetElement: this, userInterface: false }))

                        let metaInfo = d3.select(this)
                            .append('div')
                            .style('display', 'inline-block')
                            // .style('position', 'left')
                            .style('position', 'absolute')
                            .style('font-size', '12px')
                            .style('width', '200px')
                            .style('margin-top', '200px')
                            .style('margin-left', '-200px')
                            .classed('metaInfo', true);

                        metaInfo.append('div')
                            .classed('isMeta', true)
                            .classed('igt2', true)
                            .style('display', 'inline-block')
                            .style('margin-right', '10px')
                            .text('igt2: ' + (windmillPuzzleMeta.totalInfoGainTrajectory2).toPrecision(4))
                            .on('click', function () {
                                quickDraw(drawAbleWindmillPuzzles.sort((a, b) => (+b.totalInfoGainTrajectory2) - (+a.totalInfoGainTrajectory2)))
                                d3.selectAll('.igt2').classed('isSorted', true);
                            })

                        metaInfo.append('div')
                            .classed('isMeta', true)
                            .classed('solns', true)
                            .style('display', 'inline-block')
                            .style('margin-right', '10px')
                            .text('solns: ' + (+windmillPuzzleMeta.totalSolutionsFound))
                            .on('click', function () {
                                quickDraw(drawAbleWindmillPuzzles.sort((a, b) => (+b.totalSolutionsFound) - (+a.totalSolutionsFound)))
                                d3.selectAll('.solns').classed('isSorted', true);
                            })

                        metaInfo.append('div')
                            .classed('isMeta', true)
                            .classed('igt2_solns', true)
                            .style('display', 'inline-block')
                            .style('margin-right', '10px')
                            .text('igt2/solns: ' + (+windmillPuzzleMeta.totalInfoGainTrajectory2 / +windmillPuzzleMeta.totalSolutionsFound).toPrecision(4))
                            .on('click', function () {
                                quickDraw(drawAbleWindmillPuzzles.sort((a, b) => (+b.totalInfoGainTrajectory2 / +b.totalSolutionsFound) - (+a.totalInfoGainTrajectory2 / +a.totalSolutionsFound)))
                                d3.selectAll('.igt2_solns').classed('isSorted', true);
                            })

                        metaInfo.append('div')
                            .classed('isMeta', true)
                            .classed('igt2_solns_2', true)
                            .style('display', 'inline-block')
                            .style('margin-right', '10px')
                            .text('igt2/solns^2: ' + (+windmillPuzzleMeta.totalInfoGainTrajectory2 / Math.pow(+windmillPuzzleMeta.totalSolutionsFound, 2)).toPrecision(4))
                            .on('click', function () {
                                quickDraw(drawAbleWindmillPuzzles.sort((a, b) => (+b.totalInfoGainTrajectory2 / Math.pow(+b.totalSolutionsFound, 2)) - (+a.totalInfoGainTrajectory2 / Math.pow(+a.totalSolutionsFound, 2))))
                                d3.selectAll('.igt2_solns_2').classed('isSorted', true);
                            })


                        let infoGainPathsSection = d3.select(this)
                            .append('div')
                            .style('display', 'inline-block')
                            // .style('position', 'absolute')
                            .style('font-size', '12px')
                            .style('width', 'calc(100vw - 300px)')
                            // .style('margin-top', '-30px')
                            .classed('infoGainPathsSection', true)
                            .each(function () {

                                // let pathsWithInfoGain2 = windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.pathsWithInfoGain2;
                                let visitedPaths = windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.visitedPaths;

                                d3.select(this).selectAll('.infoGainPathDiv')
                                    // .data(pathsWithInfoGain2)
                                    .data(visitedPaths)
                                    .enter()
                                    .append('div')
                                    .classed('infoGainPathDiv', true)
                                    .style('display', 'inline-block')
                                    .style('width', '120px')

                                    .each(function (visitedPath, i) {

                                        let currPuzzle = new WitnessPuzzle(puzzleSetup, Object.assign({ classed: ['small'] }, { targetElement: this, userInterface: false }))

                                        for (let move of visitedPath.moves) {
                                            currPuzzle.attemptMove(move);
                                        }

                                        let hash = JSON.stringify(visitedPath.moves);


                                        // if (previousMoveSetHash[hash] !== undefined) {
                                        //     d3.select(this)
                                        //         .style('opacity', 0.3);
                                        // } else {
                                        //     previousMoveSetHash[hash] = true;
                                        // }
                                        d3.select(this)
                                            .style('opacity', () => visitedPath['hasInfoGain'] ? 1 : 0.3);

                                    })


                            });



                    })


                puzzleMetaBlocks = puzzleMetaBlocks.merge(puzzleMetaBlocksEntered);

                puzzleMetaBlocks.order();


                d3.selectAll('.isMeta').classed('isSorted', false);

            }

            // let deriveIGT = true
            // testPuzzles = drawAbleWindmillPuzzles;
            
            // testPuzzles.map((tp, i) => {
            //     tp.id = i;
            //     return tp
            // })



            // drawPaths(drawAbleWindmillPuzzles, deriveIGT); 













        })








    function draw() {
        analyzeAndDrawAllTrajectories()
        // drawSingleConstraintDifferencePairs()
        // drawSetsGraph()
        // drawUniquePuzzles()
        // drawTrajectories()


    }


    function modelUpdate({action, data}) {
        if (action === 'diffPairs control update') {
            g.s.numSolutionsForSimplerPuzzles = data.value;
        }

        if (action === 'show different unique puzzles') {

            if (data + g.s.uniquePuzzlesIndex > 35708 || data + g.s.uniquePuzzlesIndex < 0) {

                if (data + g.s.uniquePuzzlesIndex > 35708) {
                    g.s.uniquePuzzlesIndex = 0;
                }
                if (data + g.s.uniquePuzzlesIndex < 0) {
                    if (data === -1000) g.s.uniquePuzzlesIndex = 35000;
                    if (data === -100) g.s.uniquePuzzlesIndex = 35708;
                }

            } else {
                g.s.uniquePuzzlesIndex = data + g.s.uniquePuzzlesIndex;
            }

        }

        if (action === 'show trajectory') {
            g.s.puzzlesForTrajectories.push(data);
        }

        if (action === 'analyze and draw') {
            g.s.puzzlesForAnalysis = data;
        }

        if (action === 'sortPuzzles') {
            g.s.puzzleSort = data;
        }


        draw();
    }

    function analyzeAndDrawAllTrajectories() {

        let analysisContainer = d3.select('.analysisContainer');

        if (g.s.puzzleSort === 'Original') {
            g.s.puzzleSortV = 'sortOriginalOrder'
        }

        if (g.s.puzzleSort === 'By Info Gain Trajectory Orig') {
            g.s.puzzleSortV = 'totalInfoGainTrajectory';
        }

        if (g.s.puzzleSort === 'IGT 2') {
            g.s.puzzleSortV = 'totalInfoGainTrajectory2';
        }

        if (g.s.puzzleSort === 'By Possible Moves (1-step lookahead)') {
            g.s.puzzleSortV = 'totalTrajectory';
        }

        if (g.s.puzzleSort === 'By Total Entropy') {
            g.s.puzzleSortV = 'totalEntropy';
        }


        let sortedData = g.s.puzzlesForAnalysis.sort((a, b) => {
            
            return a[g.s.puzzleSortV] - b[g.s.puzzleSortV];


        });
        
        let puzzleTrajectories = analysisContainer.selectAll('.analysisContainerDiv')
            .data(sortedData, d => d._id);


        let trajectoriesDiv = puzzleTrajectories.enter()
            .append('div')
            .classed('analysisContainerDiv', true)

        trajectoriesDiv.append('div')
            .attr('class', (d, i) => 'analysisDiv_' + i)
            .classed('puzzleTrajectoriesContent', true)
            .each(function(puzzleMeta) {
                // debugger;
                puzzleMeta.calcPuzzleObj = new WitnessPuzzle(puzzleMeta.setup, { render: false });

                let puzzleSetup = JSON.parse(JSON.stringify(puzzleMeta.setup));
                if (puzzleSetup.constraints !== undefined) {
                    delete puzzleSetup.constraints;
                }
                if (g.cachedNonCrossingPaths[JSON.stringify(puzzleSetup)] === undefined) {
                    // Get outcomes for moveAttemptsSets
                    let calcPuzzleObj = new WitnessPuzzle(puzzleSetup, { render: false });
                    g.cachedNonCrossingPaths[JSON.stringify(puzzleSetup)] = calcPuzzleObj.generateNonCrossingPaths();
                    // delete calcPuzzleObj;
                }
                solvingMoveAttempts = g.cachedNonCrossingPaths[JSON.stringify(puzzleSetup)];


                let moveAttemptsWithFinalOutcomes = [];

                for (let moveAttempts of solvingMoveAttempts) {
                    puzzleMeta.calcPuzzleObj.restartPuzzle();
                    for (let move of moveAttempts) {
                        let outcome = puzzleMeta.calcPuzzleObj.attemptMove(move, { stopAtFailure: true });
                        if (outcome && outcome.notPossibleToSolve) {
                            moveAttemptsWithFinalOutcomes.push({ moveAttempts, solvesPuzzle: false });
                            break;
                        }
                        if (puzzleMeta.calcPuzzleObj._state.puzzle.__generated.isEndGame ) {
                            moveAttemptsWithFinalOutcomes.push({ moveAttempts, solvesPuzzle: puzzleMeta.calcPuzzleObj._state.solved });
                            break;
                        }
                    }
                }

                puzzleMeta.calcPuzzleObj.deriveTrajectory();
                puzzleMeta.calcPuzzleObj.deriveInfoGainTrajectory();
                puzzleMeta.calcPuzzleObj.deriveEntropyTrajectory(moveAttemptsWithFinalOutcomes);

                puzzleMeta.totalTrajectory = puzzleMeta.calcPuzzleObj._state.puzzle.history.trajectoryTotal;
                puzzleMeta.totalEntropy = puzzleMeta.calcPuzzleObj._state.puzzle.history.entropyTotal;
                puzzleMeta.totalInfoGainTrajectory = puzzleMeta.calcPuzzleObj._state.puzzle.history.infoGainTrajectoryTotal;
                puzzleMeta.totalInfoGainTrajectory2 = puzzleMeta.calcPuzzleObj._state.puzzle.history.infoGainTrajectoryTotal2;

                puzzleMeta.visualPuzzleObj = new WitnessPuzzle(puzzleMeta.setup, Object.assign({ classed: ['medium'] }, { targetElement: this, userInterface: false }))
                puzzleMeta.visualPuzzleObj.setMode('playback');
            })

        trajectoriesDiv.append('div')
            .classed('puzzleTrajectoriesContent', true)
            .classed('puzzleTrajectoriesSVGContainer', true)


        // for (let i = 0; i < g.s.puzzlesForAnalysis.length; i++) {
        //     let puzzleMeta = g.s.puzzlesForAnalysis[i];
        //     if (puzzleMeta.calcPuzzleObj === undefined) {
        //         puzzleMeta.calcPuzzleObj = new WitnessPuzzle(puzzleMeta.setup, { render: false });
        //         puzzleMeta.calcPuzzleObj.deriveTrajectory();
        //         puzzleMeta.calcPuzzleObj.deriveEntropyTrajectory(moveAttemptsWithFinalOutcomes);
        //         puzzleMeta.visualPuzzleObj = new WitnessPuzzle(puzzleMeta.setup, Object.assign({ classed: ['medium'] }, { targetSelection: '.analysisDiv_' + i, userInterface: false }))
        //     }
        // }

        trajectoriesDiv.each(function (d) {
            let currDiv = d3.select(this).select('.puzzleTrajectoriesSVGContainer');
            let height = 150;
            let currSVG = currDiv.append('svg').attr('width', 200).attr('height', height);
            currSVG.append('path')
                .attr('fill', 'none')
                .attr('stroke-width', '2')
                .attr('stroke', 'blue')
                .attr('d', 'M0 ' + height + ' ' + d.calcPuzzleObj._state.puzzle.history.trajectory.map((traj, i) => "L" + (i * 7) + " " + (height - traj * 0.8)).join(''))

            currSVG = currDiv.append('svg').attr('width', 200).attr('height', height);
            currSVG.append('path')
                .attr('fill', 'none')
                .attr('stroke-width', '2')
                .attr('stroke', 'blue')
                .attr('d', 'M0 ' + height + ' ' + d.calcPuzzleObj._state.puzzle.history.infoGainTrajectory.map((traj, i) => "L" + (i * 7) + " " + (height - traj * 0.8 * 3)).join(''))

            currSVG.append('path')
                .attr('fill', 'none')
                .attr('stroke-width', '2')
                .attr('stroke', 'red')
                .attr('d', 'M0 ' + height + ' ' + d.calcPuzzleObj._state.puzzle.history.infoGainTrajectory2.map((traj, i) => "L" + (i * 7) + " " + (height - traj * 0.8 * 3)).join(''))

            currSVG.append('text')
                .attr('x', 0)
                .attr('y', 15)
                .style('font-size', '12')
                .text('IGT')

            currSVG.append('text')
                .attr('x', 0)
                .attr('y', 25)
                .style('font-size', '8')
                .style('fill', 'blue')
                .text(d.calcPuzzleObj._state.puzzle.history.infoGainTrajectoryTotal)

            currSVG.append('text')
                .attr('x', 0)
                .attr('y', 35)
                .style('font-size', '8')
                .style('fill', 'red')
                .text(d.calcPuzzleObj._state.puzzle.history.infoGainTrajectoryTotal2)




            currSVG = currDiv.append('svg').attr('width', 200).attr('height', height);
            currSVG.append('path')
                .attr('fill', 'none')
                .attr('stroke-width', '2')
                .attr('stroke', 'blue')
                .attr('d', 'M0 ' + height + ' ' + d.calcPuzzleObj._state.puzzle.history.entropyTrajectory.map((traj, i) => "L" + (i * 7) + " " + (height - traj * 10)).join(''))

            currSVG = currDiv.append('svg').attr('width', 200).attr('height', height);
            currSVG
                .selectAll('.individualPathEntropyTrajectories')
                .data(d.calcPuzzleObj._state.puzzle.history.moveAttemptsWithFinalOutcomes)
                .enter()
                .append('path')
                .attr('fill', 'none')
                .attr('class', (d, i) => 'pathLine_' + i)
                .classed('pathlines', true)
                .classed('pathlinesEntropyTrajectories', true)
                .style('stroke-width', (moveAttemptsObj) => moveAttemptsObj.solvesPuzzle ? 4 : 1)
                .style('stroke', (moveAttemptsObj) => moveAttemptsObj.solvesPuzzle ? 'green' : 'blue')
                .style('opacity', (moveAttemptsObj) => moveAttemptsObj.solvesPuzzle ? 1 : 0.2)
                .attr('d', (moveAttemptsObj, j ) => {
                    return 'M0 ' + height + ' ' + moveAttemptsObj.entropyTrajectory.map((traj, i) => "L" + (i * 7) + " " + (height - traj * 200)).join('')
                })


            currSVG = currDiv.append('svg').attr('width', 200).attr('height', height);
            currSVG
                .selectAll('.individualPathSelectors')
                .data(d.calcPuzzleObj._state.puzzle.history.moveAttemptsWithFinalOutcomes) // .sort((a, b) => (a.moveAttempts.length - b.moveAttempts.length) )
                .enter()
                .append('line')
                .attr('class', (d, i) => 'pathLine_' + i)
                .classed('pathlines', true)
                .classed('individualPathSelectors', true)
                // .attr('fill', 'none')
                .style('stroke-width', (moveAttemptsObj) => 2)
                .style('stroke', (moveAttemptsObj) => moveAttemptsObj.solvesPuzzle ? 'green' : 'blue')
                .style('opacity', (moveAttemptsObj) => moveAttemptsObj.solvesPuzzle ? 1 : 0.2)
                .attr('shape-rendering', 'crispEdges')
                .attr('x1', (moveAttemptsObj, j) => (j * 3))
                .attr('x2', (moveAttemptsObj, j) => (j * 3))
                .attr('y1', (moveAttemptsObj, j) => height)
                .attr('y2', (moveAttemptsObj, j) => height - (moveAttemptsObj.moveAttempts.length * 5))
                .on('mouseover', (moveAttemptsObj, i, a) => {
                    d.visualPuzzleObj.restartPuzzle();
                    for (let move of moveAttemptsObj.moveAttempts) {
                        d.visualPuzzleObj.attemptMove(move, { stopAtHitCannotCross: true })
                    }
                    currDiv.selectAll('.pathlinesEntropyTrajectories')
                        .style('opacity', 0);
                    currDiv.selectAll('.pathLine_' + i)
                        .style('opacity', 1);
                })
                .on('mouseleave', (moveAttemptsObj, i, a) => {
                    d.visualPuzzleObj.restartPuzzle();
                    currDiv.selectAll('.pathLine_' + i)
                        .style('opacity', moveAttemptsObj.solvesPuzzle ? 1 : 0.2);
                    currDiv.selectAll('.pathlinesEntropyTrajectories')
                        .style('opacity', moveAttemptsObj.solvesPuzzle ? 1 : 0.2);
                })


        })



        puzzleTrajectories = puzzleTrajectories.merge(trajectoriesDiv);

        puzzleTrajectories
            // .transition()
            // .duration(1500)
            .style('margin-top', (d, i) => {
                return i * 220
            })
            // .style('display', (d, i, a) => {
            //     if (a.length - 1 !== i) {
            //         if (d[g.s.puzzleSortV] !== d3.select(a[i + 1]).datum()[g.s.puzzleSortV]) {
            //             return 'block !important'
            //         }
            //     }
            //     return 'inline-block';

            // })
            .order();

        d3.selectAll('.spacingDivs').remove();
        puzzleTrajectories.each(function (d,i,a) {
            let isHidingGraphs = !d3.selectAll('.analysisContainerDiv.hideGraphs').empty();
            if (isHidingGraphs) {
                if (i !== 0) {
                    if (d[g.s.puzzleSortV] !== d3.select(a[i + -1]).datum()[g.s.puzzleSortV]) {

                        let newElement = document.createElement("div");
                        newElement.classList.add("spacingDivs");
                        this.parentNode.insertBefore(newElement, this)

                        // d3.select(this).node().parentNode.insertBefore(
                        //     return this.insertBefore
                        //     document.createElement("div").classList.add("spacingDivs"), 
                        //     d3.select(this).node()
                        // )

                        // append('div')
                        //     .classed('spacingDivs', true)
                    }
                }
            }

        })

    }

    function drawTrajectories() {

        let puzzleTrajectoriesSection = d3.select('.puzzleTrajectorySection');



        let puzzleTrajectories = puzzleTrajectoriesSection.selectAll('.puzzleTrajectoriesDiv')
            .data(g.s.puzzlesForTrajectories, d => d._id);

        let trajectoriesDiv = puzzleTrajectories.enter()
            .append('div')
            .classed('puzzleTrajectoriesDiv', true)        

        trajectoriesDiv.append('div')
            .attr('class', (d, i) => 'puzzleTrajectoryDiv-' + i)
            .classed('puzzleTrajectoriesContent', true)

        trajectoriesDiv.append('div')
            .classed('puzzleTrajectoriesContent', true)
            .classed('puzzleTrajectoriesSVGContainer', true)
            

        for (let i = 0; i < g.s.puzzlesForTrajectories.length; i++) {
            let puzzleMeta = g.s.puzzlesForTrajectories[i];
            if (puzzleMeta.calcPuzzleObj === undefined) {
                puzzleMeta.calcPuzzleObj = new WitnessPuzzle(puzzleMeta.setup, {render: false});
                puzzleMeta.calcPuzzleObj.deriveTrajectory();
                // puzzleMeta.calcPuzzleObj.deriveEntropyTrajectory(moveAttemptsWithFinalOutcomes);
                puzzleMeta.visualPuzzleObj = new WitnessPuzzle(puzzleMeta.setup, Object.assign({ classed: ['small'] }, { targetSelection: '.' + 'puzzleTrajectoryDiv-' + i, userInterface: false }))
            }
        }

        trajectoriesDiv.each(function(d){
            let currDiv = d3.select(this).select('.puzzleTrajectoriesSVGContainer');
            let currSVG = currDiv.append('svg').attr('width', 200).attr('height', 100);
            let height = 100;
            currSVG.append('path')
                .attr('fill', 'none')
                .attr('stroke-width', '2')
                .attr('stroke', 'blue')
                .attr('d', 'M0 ' + height + ' ' + d.calcPuzzleObj._state.puzzle.history.trajectory.map((traj, i) => "L" + (i * 7) + " " + (height - traj * 0.8)).join('') )

        })

        console.log(g.s.puzzlesForTrajectories)



        
        
    }

    function drawUniquePuzzles() {

        d3.select('.uniquePuzzlesShownIndex')
            .text('Up to 100 puzzles from index ' + g.s.uniquePuzzlesIndex)

        let options = { targetSelection: '.uniquePuzzlesSection', userInterface: false };
        
        d3.select('.uniquePuzzlesSection').selectAll('*').remove();

        g.data.puzzleMetaUniqueSolutions
            .filter((d,i)=>{
                return i >= g.s.uniquePuzzlesIndex && i < g.s.uniquePuzzlesIndex + 100;
                })
            .forEach((d,i)=>{

                let puzzleDiv = d3.select('.uniquePuzzlesSection').append('div')
                    .classed('puzzleDiv', true)
                    .classed('puzzleDiv-'+i, true)
                let puzzle = new WitnessPuzzle(d.setup, Object.assign({ classed: ['small'] }, { targetSelection: '.' + 'puzzleDiv-' + i, userInterface: false })); //options { render: false }    
                puzzleDiv.append('p').text('Trajectory')
                    .on('click', function (e,j) {
                        console.log('puzzle number', i);
                        modelUpdate({
                            action: 'show trajectory',
                            data: d
                        })
                    });


                // if (g.s.puzzlesForTrajectories.length === 0) {
                //     modelUpdate({
                //         action: 'show trajectory',
                //         data: d
                //     })
                // }                    
            })
    }


    function drawSingleConstraintDifferencePairs() {

        let diffPairsID = 'diffPairs', diffPairsDiv;

        if (d3.select('#' + diffPairsID).empty()) {

            let validSimplerPuzzleNumSolutionPaths = {};

            g.data.complexSimplerSets.forEach(d=> {
                if (validSimplerPuzzleNumSolutionPaths[d.simplerPuzzle.solutions] === undefined) {
                    validSimplerPuzzleNumSolutionPaths[d.simplerPuzzle.solutions] = 1;
                } else {
                    validSimplerPuzzleNumSolutionPaths[d.simplerPuzzle.solutions] += 1;
                }
            })

            console.log(validSimplerPuzzleNumSolutionPaths);

            d3.select('#updatesSection').append('h3')
                .text('Adding One Constraint Results in Single-Solution Puzzles');

            diffPairsDiv = d3.select('#updatesSection')
                .append('div')
                .attr('id', diffPairsID);

            // Metrics Dropdown
            diffPairsDiv.append('div').text('Simpler Puzzles with __ Possible Solutions').style('margin-bottom', '2px')
            diffPairsDiv.append('select')
                .classed('diffPairsSelect', true)
                .on('change', function () {
                    modelUpdate({
                        action: 'diffPairs control update',
                        data: {
                            target: 'diffPairs',
                            value: this.value
                        }
                    })
                })
                .selectAll('.diffPairsOptions')
                .data(Object.keys(validSimplerPuzzleNumSolutionPaths), d => d)
                .enter()
                .append('option')
                .classed('diffPairsOptions', true)
                .attr('value', d => d)
                .text(d => d);

            diffPairsDiv.append('div').attr('id', 'diffPairsContainer');

        }

        diffPairsDiv = d3.select('#' + diffPairsID);
        diffPairsDiv.selectAll('.diffPairsOptions').property('selected', d => d === g.s.numSolutionsForSimplerPuzzles);

        let diffPairsContainerDiv = diffPairsDiv.select('#diffPairsContainer');

        diffPairsContainerDiv.selectAll('*').remove();
        let maxShown = 80;
        let selectedSets = g.data.complexSimplerSets
            .filter(d => {
                maxShown -= 1;

                return maxShown > 0 && d.simplerPuzzle.solutions === +g.s.numSolutionsForSimplerPuzzles;
            })
            .forEach((d,i) => {
                let diffPairsBox = diffPairsContainerDiv.append('div')
                    .classed('diffPairsBox', true)
                    .attr('id', 'diffPairs-'+i);
                let diffPairsBoxSimpler = diffPairsBox.append('div')
                    .attr('id', 'diffPairs-' + i + '-simpler')
                    .classed('diffPairs', true)
                    .classed('diffPairsSimpler', true);
                let diffPairsBoxComplex = diffPairsBox.append('div')
                    .attr('id', 'diffPairs-' + i + '-complex')
                    .classed('diffPairs', true)
                    .classed('diffPairsComplex', true);
                let simplerPuzzle = new WitnessPuzzle(d.simplerPuzzle.setup, Object.assign({ classed: ['small'] }, { targetSelection: '#diffPairs-' + i + '-simpler', userInterface: false })); //options { render: false }    
                let complexPuzzle = new WitnessPuzzle(d.complexPuzzle.setup, Object.assign({ classed: ['small'] }, { targetSelection: '#diffPairs-' + i + '-complex', userInterface: false })); //options { render: false }    
                diffPairsBoxSimpler.append('p').text(g.s.numSolutionsForSimplerPuzzles + ' solution' + (g.s.numSolutionsForSimplerPuzzles > 1 ? 's': ''));
                diffPairsBoxComplex.append('p').text('1 solution');

            })

    }

    function drawSetsGraph() {

        let graphID = 'setsGraph', graphDiv;

        if (d3.select('#' + graphID).empty()) {

            d3.select('#updatesSection').append('h3')
                .text('Solvability of Puzzles');

            d3.select('#updatesSection')
                .append('div')
                .attr('id', graphID + 'Overlay')
                .style('position', 'absolute')
                .style('width', '300')
                .style('length', '300')
                .style('background-color', '#fff')
                .style('border', '1px solid black')
                .style('padding', '12px')
                .style('display', 'none');

            graphDiv = d3.select('#updatesSection')
                .append('div')
                .attr('id', graphID);

            // Grid Size Dropdown
            graphDiv.append('div').text('Grid Size').style('margin-bottom', '2px')
            let gridSizeSelect = graphDiv.append('div').style('margin-bottom', '15px').append('select')
                .classed('gridSizeSelect', true)
                .on('change', function(){
                    modelUpdate({action: 'setsGraph control update', 
                                data: {
                                    target: 'gridSize',
                                    value: this.value
                                }})
                })
                .selectAll('.gridSizeOptions')
                .data(Object.keys(g.constraintsInSets), d=>d)
                .enter()
                .append('option')
                .classed('gridSizeOptions', true)
                .attr('value', d=>d)
                .text(d=>d);

            // Metrics Dropdown
            graphDiv.append('select')
                .classed('metricSelect', true)
                .on('change', function(){
                    modelUpdate({action: 'setsGraph control update', 
                                data: {
                                    target: 'metric',
                                    value: this.value
                                }})
                })
                .selectAll('.metricOptions')
                .data(['Solvability', 'Unique Solutions'], d=>d)
                .enter()
                .append('option')
                .classed('metricOptions', true)
                .attr('value', d=>d)
                .text(d=>d);

            // Metric Type Radio
            let metricTypeDiv = graphDiv
                .selectAll('.metricTypeDiv')
                .data(['%', 'Totals'], d=>d)
                .enter()
                .append('div')
                .classed('metricTypeDiv', true);
                
            metricTypeDiv
                .append('input')
                .attr('type', 'radio')
                .attr('name', 'metricType')
                .classed('metricTypeRadio', true)
                .on('change', function(){
                    modelUpdate({action: 'setsGraph control update', 
                                data: {
                                    target: 'metricType',
                                    value: this.value
                                }})
                })
                .attr('id',  d => 'metricType_' + d)
                .attr('value', d=>d);

            metricTypeDiv
                .append('label')
                .classed('metricTypeLabel', true)
                .attr('for',   d => 'metricType_' + d)
                .text(d=>d);

            function createSetsGraphSelects(svgContainerDiv, graphName, availableConstraints) {
                let setsGraphOptions = svgContainerDiv.append('select')
                    .classed(graphName+'Select', true)
                    .on('change', function(){
                        modelUpdate({action: 'setsGraph control update', 
                                    data: {
                                        target: graphName === 'setsGraphX' ? 'x' : 'y',
                                        value: this.value
                                    }})
                    })
                    .selectAll('.'+graphName+'Options')
                    .data(availableConstraints, d=>d)

                setsGraphOptions.enter()
                    .append('option')
                    .classed(graphName + 'Options', true)
                    .attr('value', d=>d)
                    .attr('selected', d=> {
                        if ((graphName === 'setsGraphX' && d === 'numRegionConstraints') 
                            || (graphName === 'setsGraphY' && d === 'numColorOfRegionConstraints')) {
                                return true;
                            }
                    })
                    .text(d=>d)
            }


            let svgContainerDiv = graphDiv.append('div').classed('svgContainer', true);

            createSetsGraphSelects(svgContainerDiv, 'setsGraphY', Object.keys(g.constraintsInSets[g.s.setsGraph.gridSize]).filter(d=> d!== 'numRegionConstraints'))
            createSetsGraphSelects(svgContainerDiv, 'setsGraphX', ['numRegionConstraints']);

            svgContainerDiv
                .append('svg')
                .classed('setsChartSVG', true)
                .attr('width', g.settings.setsGraph.svgSize)
                .attr('height', g.settings.setsGraph.svgSize)
            
        }

        graphDiv = d3.select('#updatesSection');

        graphDiv.selectAll('.gridSizeOptions').property('selected', d => d === g.s.setsGraph.gridSize);
        graphDiv.selectAll('.metricOptions').property('selected', d => d === g.s.setsGraph.metric);
        graphDiv.selectAll('.metricTypeRadio').property('checked', d => d === g.s.setsGraph.metricType);
        graphDiv.selectAll('.setsGraphX').property('selected', d => d === g.s.setsGraph.x);
        graphDiv.selectAll('.setsGraphY').property('selected', d => d === g.s.setsGraph.y);

        let svg = graphDiv.select('.setsChartSVG');

        let selectedSets = g.data.puzzleSetsSolved.filter(set => {
            let allConstraintsFound = 
                set.constraints[g.s.setsGraph.x] !== undefined 
                && set.constraints[g.s.setsGraph.y] !== undefined;
            let noZeros = allConstraintsFound 
                && set.constraints[g.s.setsGraph.x] !== 0 
                && set.constraints[g.s.setsGraph.y] !== 0;
            let crossingConstraints = g.s.setsGraph.y === 'numColorOfRegionConstraints' 
                && Object.keys(set.constraints).indexOf('numMustCrosses') > -1;
            return JSON.stringify(set.size) === g.s.setsGraph.gridSize 
                && allConstraintsFound && noZeros && !crossingConstraints;
        })

        let gridG = svg.selectAll('.gridG')
            .data(selectedSets, d=>JSON.stringify(d.constraints));

        let gridGEntered = gridG.enter()
            .append('g')
            .classed('gridG', true)
            .attr('transform', d=> {
                return 'translate(' + (g.settings.setsGraph.xAxisGap + d.constraints[g.s.setsGraph.x] * g.settings.setsGraph.gridSize) + ' '
                 + (g.settings.setsGraph.svgSize - g.settings.setsGraph.yAxisGap - d.constraints[g.s.setsGraph.y] * g.settings.setsGraph.gridSize) + ')'
            })
            .on('click', function(d){
                console.log(d);
            })
            .on('mouseenter', function(d) {
                let overlayDiv = d3.select('#' + graphID + 'Overlay');
                overlayDiv.selectAll('*').remove();

                if (g.s.setsGraph.metric === 'Solvability') {
                    overlayDiv.append('div')
                        .text(d.solves + ' solvable puzzles, out of...')
                        .style('font-weight', g.s.setsGraph.metricType === 'Totals' ? 'bold' : 'normal')
                        
                    overlayDiv.append('div')
                        .text(d.numPuzzles + ' puzzles generated, for a solve rate of  ')

                    overlayDiv.append('div')
                        .text(Math.round(d.solves / d.numPuzzles * 100000) / 1000 + '%')
                        .style('font-weight', g.s.setsGraph.metricType === '%' ? 'bold' : 'normal')
                }

                if (g.s.setsGraph.metric === 'Unique Solutions') {
                    if (d.solutionsDistributions[1] === undefined) {
                        overlayDiv.append('div')
                            .text(0 + ' Unique Solutions, out of...')
                            .style('font-weight', g.s.setsGraph.metricType === 'Totals' ? 'bold' : 'normal')
                    } else {
                        overlayDiv.append('div')
                            .text(d.solutionsDistributions[1] + ' Unique Solutions, out of...')
                            .style('font-weight', g.s.setsGraph.metricType === 'Totals' ? 'bold' : 'normal')
                    }
                        
                    overlayDiv.append('div')
                        .text(d.numPuzzles + ' puzzles generated, for a unique sol\'n rate of  ')

                    overlayDiv.append('div')
                        .text(Math.round((d.solutionsDistributions[1] === undefined ? 0 : d.solutionsDistributions[1]) / d.numPuzzles * 100000) / 1000 + '%')
                        .style('font-weight', g.s.setsGraph.metricType === '%' ? 'bold' : 'normal')
                }

                overlayDiv.append('br')
                overlayDiv.append('div')
                    .text(g.s.setsGraph.x + ': ' + d.constraints[g.s.setsGraph.x])
                overlayDiv.append('div')
                    .text(g.s.setsGraph.y + ': ' + d.constraints[g.s.setsGraph.y])

                let solutionsDistributions = Object.entries(d.solutionsDistributions);
                let maxVal = solutionsDistributions.reduce((currMax, currVal)=>Math.max(currMax, currVal[1]), 0)

                let barchartWidthScale = d3.scaleLinear().domain([0, maxVal]).range([0, 150]);

                overlayDiv.append('br')
                overlayDiv.append('div')
                    .text('Distribution of Puzzles by # of Solutions per Puzzle')

                let distributionDiv = overlayDiv
                    .append('div')
                    .classed('distributionsDiv', true)
                    .selectAll('.distributionDiv')
                    .data(solutionsDistributions)
                    .enter()
                    .append('div')
                    .classed('distributionDiv', true)
                    .style('height', '8px');

                distributionDiv.append('div')
                    .classed('distributionTitle', true)
                    .text(d=>d[0]);

                distributionDiv.append('div')
                    .classed('distributionBar', true)
                    .style('height', '7px')
                    .style('width', d=> barchartWidthScale(d[1]))
                    .style('background-color', 'blue');

                distributionDiv.append('div')
                    .classed('distributionBarText', true)
                    .text(d=> d[1]);

                overlayDiv.style('display', 'block')
            })
            .on('mousemove', function(){
                d3.select('#' + graphID + 'Overlay')
                    .style('top', Math.max(d3.event.pageY - 200, 15))
                    .style('left', 10 + d3.event.pageX);
            })
            .on('mouseleave',  function(){
                d3.select('#' + graphID + 'Overlay')
                    .style('display', 'none');
            });


        let gridValMax = 1;
        if (g.s.setsGraph.metricType !== '%') {
            gridValMax = selectedSets.reduce((maxSoFar, currSet)=> {
                    let currSetMax = 0;

                    if (g.s.setsGraph.metric === 'Unique Solutions') {
                        if (currSet.solutionsDistributions !== undefined 
                            && currSet.solutionsDistributions[1] !== undefined) {
                            currSetMax = currSet.solutionsDistributions[1];
                        }
                    } else if (g.s.setsGraph.metric === 'Solvability') {
                        currSetMax = currSet.solves;
                    } 
                    return Math.max(maxSoFar, currSetMax);
                },0)
        }
        
        let gridColorScale = d3.scaleLinear().domain([0, gridValMax])
                .range(['white', 'blue']);

        gridGEntered
            .append('rect')
            .attr('width', g.settings.setsGraph.gridSize)
            .attr('height', g.settings.setsGraph.gridSize)
            .classed('gridGMainRect', true)
            .style('stroke-width', 1)
            .style('stroke', '#333')

        gridG.exit()
            .remove();

        gridG = gridG.merge(gridGEntered);
        
        gridG.each(function(currGridG) {

            gridG.select('.gridGMainRect')
                .style('fill', set => {
                    if (g.s.setsGraph.metric === 'Solvability') {
                        if (set.solves === 0) return '#777';
                        if (g.s.setsGraph.metricType === '%' && set.solves === set.numPuzzles) return '#F4F';
                        return (g.s.setsGraph.metricType === '%' ? gridColorScale(set.solves / set.numPuzzles) : gridColorScale(set.solves))
                    } else if (g.s.setsGraph.metric === 'Unique Solutions') {
                        if (set.solutionsDistributions === undefined || set.solutionsDistributions[1] === undefined) {
                            return '#777';
                        }                   
                        return (g.s.setsGraph.metricType === '%' ? gridColorScale(set.solutionsDistributions[1] / set.numPuzzles) : gridColorScale(set.solutionsDistributions[1]))
                    }
                });


        })


        console.log(selectedSets);

        console.log(g.constraintsInSets);
    }


    return;

}, 200)
    
