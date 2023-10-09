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

    drawnEndingPathExample: false,

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


            let drawAbleWindmillPuzzles = windmillPuzzles
                .filter(pMeta => pMeta.totalSolutionsFound > 0)


            

            let puzzleBlocksSection = d3.select('#pathInfoGain').append('div')
                .classed('puzzleBlocksSection', true)
                // .style('height', '380px')
                // .style('width', '200px')
                // .style('overflow', 'hidden')
                // .style('position', 'absolute')
                // .style('top', '300px')
                ;

            

            function quickDraw(drawAbleWindmillPuzzles, derive) {

                let puzzlesToDraw = drawAbleWindmillPuzzles;


                katex.render(
                    '\\text{Binary Entropy:} \\;\\;\\;\\;\\;\\;\\;\\; ' 
                    + 'B(q) = - (q log_{2}(q) + (1 - q) log_{2}(1 - q)) \\newline', 
                    d3.select('#formulaBinaryEntropy').node(), {
                    throwOnError: false
                });
                katex.render(
                    '\\text{Entropy:} \\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\, '
                    + 'H(Goal) = B(\\frac{p}{p + n}) \\newline', 
                    d3.select('#formulaEntropy').node(), {
                    throwOnError: false
                });
                katex.render(
                    '\\text{Information Gain:} \\;\\;\\;\\;\\; '
                    + 'Gain(A) = B(\\frac{p}{p + n}) - Remainder(A) \\newline',
                    d3.select('#formulaInfoGain').node(), {
                    throwOnError: false
                });
                katex.render(
                    'Remainder(A) = \\sum_{k=1}^{d} \\frac{p_k+n_k}{p + n} B(\\frac{p_k}{p_k + n_k})',
                    d3.select('#formulaRemainder').node(), {
                    throwOnError: false
                });




                let puzzleMetaBlocks = puzzleBlocksSection.selectAll('.puzzleMetaBlocks')
                    .data(puzzlesToDraw, d => d.id);

                let puzzleMetaBlocksEntered = puzzleMetaBlocks
                    .enter()
                    .append('div')
                    .classed('puzzleMetaBlocks', true)
                    .style('display', 'block');

                puzzleMetaBlocksEntered
                    .each(function (windmillPuzzleMeta, puzzleIndex) {

                        let puzzleSetup = puzzlesToDraw[0].creatorName === undefined ? windmillPuzzleMeta.puzzleSetup :convertWindmillPuzzleMetaToEugenePuzzleMeta(windmillPuzzleMeta);

                        let isMustCross = puzzleSetup.constraints !== undefined && puzzleSetup.constraints.mustCrosses !== undefined;
                        d3.select(this).classed('isMustCross', isMustCross);

                        if (derive !== undefined && derive === true) { //windmillPuzzleMeta.totalInfoGainTrajectory2 === undefined

                            windmillPuzzleMeta.puzzleSetup = puzzleSetup;
                            windmillPuzzleMeta.endingPaths = [];
                            windmillPuzzleMeta.calcPuzzleObj = new WitnessPuzzle(puzzleSetup, {render: false });

                            windmillPuzzleMeta.calcPuzzleObj.activateLivePathInfoGainDerivation();

                            if (g.drawnEndingPathExample === false) {

                                new WitnessPuzzle(puzzleSetup, Object.assign({ classed: ['medium'] }, { targetElement: d3.select('#endingPaths').node(), userInterface: false })); //options { render: false }
                                
                                d3.select('#endingPaths').append('div')
                                    .classed('discussionText', true)
                                    .style('margin-bottom', '30px')
                                    .text('Instead of looking '
                                + ' at entropy or information gain based on actions and knowing the '
                                + ' outcome the action, here we use final outcomes that any player '
                                + ' can get to.  In this example, there are 64 outcomes - dead ends or reaching'
                                + ' the end of the puzzle, regardless of whether it\'s solved or not:')

                                windmillPuzzleMeta.calcPuzzleObj._state.puzzle.pathInfoGain.allEndingPaths.forEach(path => {
                                    let puzzle = new WitnessPuzzle(puzzleSetup, Object.assign({ classed: ['micro'] }, { targetElement: d3.select('#endingPaths').node(), userInterface: false })); //options { render: false }
                                    puzzle.setMode('playback');
                                    puzzle.attemptSolveWithPath(path, {stopAtFailure: false});
                                });
                                g.drawnEndingPathExample = true;
                            }

                            let thisDiv = this;

                            d3.select(this).append('h3')
                                .text('Puzzle #' + (puzzleIndex+1))
                                .style('margin-top', '40px')

                            function renderInfoGain(puzzleObj) {
                                console.log('move', thisDiv, puzzleObj);
                                let history = puzzleObj._state.puzzle.history;
                                let currPathInfoGain = puzzleObj._state.puzzle.pathInfoGain.currStatus;
                                
                                d3.select(thisDiv).selectAll('.infoGainStats')
                                    .style('margin-bottom', '10px')
                                    .text('Total paths: ' 
                                    + currPathInfoGain.totalPaths +', Wins: '
                                    + currPathInfoGain.wins)


                                let formulaPuzzleFillValues1Text = '';
                                let formulaPuzzleFillValues2Text = '';
                                d3.select(thisDiv).selectAll('.directionDiv')
                                    .classed('invalidMove', true)
                                    .each(function(dirn) {
                                        let currDirDiv = this;
                                        d3.select(this).select('.directionPaths').selectAll('*').remove()
                                        d3.select(this).select('.directionInfoGain').selectAll('*').remove()
                                        Object.values(currPathInfoGain.possibleSnakeHashes).filter(v => JSON.stringify(v.infogain.dir) === JSON.stringify(dirn.dir)) 
                                        .forEach(possibleSnakeHash => {
                                            d3.select(currDirDiv).classed('invalidMove', false);

                                            formulaPuzzleFillValues1Text += '\\frac{' 
                                                + possibleSnakeHash.infogain.weightNumerator +'}{'
                                                + possibleSnakeHash.infogain.weightDenominator+'} '
                                                +'B(\\frac{' 
                                                + possibleSnakeHash.infogain.partialRemainderNumerator + '}{'
                                                + possibleSnakeHash.infogain.partialRemainderDenominator+'})+'

                                            formulaPuzzleFillValues2Text += '\\frac{'
                                                + possibleSnakeHash.infogain.weightNumerator + '}{'
                                                + possibleSnakeHash.infogain.weightDenominator + '} '
                                                + (Math.round(possibleSnakeHash.infogain.partialEntropy * 1000) / 1000) + '+'

                                            let infoGainSection = d3.select(currDirDiv).select('.directionInfoGain');
                                            infoGainSection.append('div')
                                                .text('wins: ' + possibleSnakeHash.infogain.partialRemainderNumerator);
                                            infoGainSection.append('div')
                                                .text('total: ' + possibleSnakeHash.infogain.partialRemainderDenominator);
                                            infoGainSection.append('div')
                                                .text('only showing 10');
                                            d3.select(currDirDiv).select('.directionPaths').style('width', 75 * possibleSnakeHash.endingPaths + 'px')
                                            d3.select(currDirDiv).select('.directionPaths')
                                                .selectAll('.nextPathPuzzles')
                                                .data(possibleSnakeHash.endingPaths)
                                                .enter()
                                                .append('div')
                                                .classed('nextPathPuzzles', true)
                                                .each(function(endingPath, i) {
                                                    if (i > 9) return;
                                                    let puzzle = new WitnessPuzzle(puzzleSetup, Object.assign({ classed: ['micro'] }, { targetElement: this, userInterface: false })); //options { render: false }
                                                    puzzle.setMode('playback');
                                                    puzzle.attemptSolveWithPath(endingPath.path, { stopAtFailure: false });
                                                })
                                        })
                                })

                                katex.render(
                                    '\\text{Information Gain:} \\;\\;\\;\\;\\; '
                                    + 'Gain(A) = B(\\frac{p}{p + n}) - [\\sum_{k=1}^{d} \\frac{p_k+n_k}{p + n} B(\\frac{p_k}{p_k + n_k})] \\newline',
                                    d3.select(thisDiv).select('.formulaPuzzleStart').node(), {
                                    throwOnError: false
                                });

                                formulaPuzzleFillValues1Text = formulaPuzzleFillValues1Text.slice(0,-1)
                                katex.render(
                                    '\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\; '
                                    + '= B(\\frac{' + currPathInfoGain.wins + '}{'                                          
                                        + currPathInfoGain.totalPaths  
                                        + '}) - [' 
                                        + formulaPuzzleFillValues1Text
                                    + ']',
                                    d3.select(thisDiv).select('.formulaPuzzleFillValues1').node(), {
                                    throwOnError: false
                                });

                                formulaPuzzleFillValues2Text = formulaPuzzleFillValues2Text.slice(0, -1)
                                katex.render(
                                    '\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\; '
                                    + '= ' + (Math.round(currPathInfoGain.entropy * 1000) / 1000) + ' - ['
                                    + formulaPuzzleFillValues2Text + ']'
                                    + '= ' + (Math.round(currPathInfoGain.entropy * 1000) / 1000) 
                                    + ' - ' + (Math.round(currPathInfoGain.remainder * 1000) / 1000) 
                                    + '',
                                    d3.select(thisDiv).select('.formulaPuzzleFillValues2').node(), {
                                    throwOnError: false
                                });

                                katex.render(
                                    '\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\; '
                                    + '= ' + (Math.round(currPathInfoGain.infoGain * 1000) / 1000) ,
                                    d3.select(thisDiv).select('.formulaPuzzleFillValues3').node(), {
                                    throwOnError: false
                                });
                                
                                
                                ;
                            }

                            let livePuzzleContainer = d3.select(this).append('div').classed('livePuzzleContainer', true);

                            let puzzleDiv = livePuzzleContainer.append('div').classed('puzzleDiv', true);
                            let directionsDiv = livePuzzleContainer.append('div').classed('directionsDiv', true);

                            let directions = [
                                { name: 'Up', dir: [0, 1]},
                                { name: 'Right', dir: [1, 0] },
                                { name: 'Down', dir: [0, -1] },
                                { name: 'Left', dir: [-1, 0] },
                            ]

                            let directionDiv = directionsDiv
                                .selectAll('.directionDiv')
                                .data(directions)
                                .enter()
                                .append('div')
                                .classed('directionDiv', true);
                            
                            let directionName = directionDiv.append('div').classed('directionName', true).text(d=>d.name);

                            let directionInfoGain = directionDiv.append('div').classed('directionInfoGain', true);
                            let directionPaths = directionDiv.append('div').classed('directionPaths', true);

                            let pathInfoGain = JSON.parse(JSON.stringify(windmillPuzzleMeta.calcPuzzleObj._state.puzzle.pathInfoGain));
                            
                            windmillPuzzleMeta.livePuzzleObj = new WitnessPuzzle(puzzleSetup, 
                                { targetElement: puzzleDiv.node(), moveCB: renderInfoGain, pathInfoGain: pathInfoGain });
                            

                            livePuzzleContainer.append('div')
                                .classed('infoGainStats', true);

                            livePuzzleContainer.append('div')
                                .classed('formulaPuzzleStart', true)
                                .classed('formula', true);

                            livePuzzleContainer.append('div')
                                .classed('formulaPuzzleFillValues1', true)
                                .classed('formula', true);

                            livePuzzleContainer.append('div')
                                .classed('formulaPuzzleFillValues2', true)
                                .classed('formula', true);
                            livePuzzleContainer.append('div')
                                .classed('formulaPuzzleFillValues3', true)
                                .classed('formula', true);

                            // let nonCrossingPaths = windmillPuzzleMeta.calcPuzzleObj.generateAllNonCrossingPathsIncludingNotTerminatingAtEnd(); //windmillPuzzleMeta.calcPuzzleObj

                            // console.log(nonCrossingPaths);

                            // nonCrossingPaths.forEach(path => {

                                
                            //     windmillPuzzleMeta.endingPaths.push({path, solved})
                            // })


                            // windmillPuzzleMeta.calcPuzzleObj.deriveInfoGainTrajectoryWithEndsInMind(windmillPuzzleMeta.endingPaths);

                            renderInfoGain(windmillPuzzleMeta.livePuzzleObj)

                            console.log(windmillPuzzleMeta);
                            console.log('obtained trajectory')
                        }




                        

                    })


            }





            let puzzlesToDeriveAndDraw = drawAbleWindmillPuzzles; // .filter((d, i) => i < 8)
            let purePuzzlesMeta = testPuzzles.filter((d,i)=>i === 0 || i === 2 || i === 5).map(puzzleSetup => ({ puzzleSetup }));
            
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

                //download(JSON.stringify(puzzlesToDeriveAndDraw), 'windmillUnencodedPuzzles-4-contraints-only-with-derived-igt.json', 'application/json')

            }









        })








    function draw() {
        analyzeAndDrawAllTrajectories()
        // drawSingleConstraintDifferencePairs()
        // drawSetsGraph()
        // drawUniquePuzzles()
        // drawTrajectories()


    }


    return;

}, 200)
    
