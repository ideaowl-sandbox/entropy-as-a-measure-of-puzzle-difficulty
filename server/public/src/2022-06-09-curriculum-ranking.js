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


            let curriculum = [
                {
                    "size": [1, 2],
                    "startPosition": [0, 1],
                    "endPosition": [1, 1, 2],
                    "constraints": {
                        "regionConstraints": [
                            [1, 2, 0],
                            [1, 1, 1]
                        ]
                    }
                }, 

                {
                    "size": [1, 2],
                    "startPosition": [0, 0],
                    "endPosition": [1, 2, 1],
                    "constraints": {
                        "regionConstraints": [
                            [1, 2, 0],
                            [1, 1, 1]
                        ]
                    }
                },
                {
                    "size": [1, 3],
                    "startPosition": [0, 0],
                    "endPosition": [1, 3, 1],
                    "constraints": {
                        "regionConstraints": [
                            [1, 3, 0],
                            [1, 2, 0],
                            [1, 1, 1]
                        ]
                    }
                },
                // {
                //     "size": [2, 2],
                //     "startPosition": [0, 0],
                //     "endPosition": [2, 2, 1],
                //     "constraints": {
                //         "regionConstraints": [
                //             [1, 2, 0], [2, 2, 0],
                //             [1, 1, 0], [2, 1, 1]
                //         ]
                //     }
                // },
                {
                    "size": [3, 3],
                    "startPosition": [0, 0],
                    "endPosition": [3, 3, 1],
                    "constraints": {
                        "regionConstraints": [
                            [1, 3, 0], [2, 3, 0], [3, 3, 0],
                            [1, 2, 0], [2, 2, 1], [3, 2, 0],
                            [1, 1, 1], [2, 1, 1], [3, 1, 1]
                        ]
                    }
                },
                // {
                //     "size": [3, 3],
                //     "startPosition": [0, 0],
                //     "endPosition": [0, 1, 4],
                //     "constraints": {
                //         "regionConstraints": [
                //             [1, 3, 0], [2, 3, 0], [3, 3, 0],
                //             [1, 2, 0], [2, 2, 1], [3, 2, 0],
                //             [1, 1, 1], [2, 1, 1], [3, 1, 1]
                //         ]
                //     }
                // },
                // {
                //     "size": [4, 4],
                //     "startPosition": [0, 0],
                //     "endPosition": [1, 4, 1],
                //     "constraints": {
                //         "regionConstraints": [
                //             [1, 4, 0], [3, 4, 1], [4, 4, 0],
                //             [1, 3, 0], [2, 3, 0], [3, 3, 0], [4, 3, 0],
                //             [1, 2, 0], [2, 2, 1], [3, 2, 0], [4, 2, 0],
                //             [1, 1, 1], [2, 1, 1], [3, 1, 1], [4, 1, 0]
                //         ]
                //     }
                // },
                // {
                //     "size": [4, 4],
                //     "startPosition": [0, 0],
                //     "endPosition": [4, 2, 2],
                //     "constraints": {
                //         "regionConstraints": [
                //             [1, 4, 0], [2, 4, 0], [3, 4, 1], [4, 4, 0],
                //             [2, 3, 0], [3, 3, 0], [4, 3, 0],
                //             [1, 2, 0], [2, 2, 1], [3, 2, 0], [4, 2, 0],
                //             [1, 1, 1], [2, 1, 1], [3, 1, 1], [4, 1, 0]
                //         ]
                //     }
                // },
                // {
                //     "size": [4, 4],
                //     "startPosition": [0, 0],
                //     "endPosition": [3, 0, 3],
                //     "constraints": {
                //         "regionConstraints": [
                //             [2, 4, 0], [3, 4, 1], [4, 4, 0],
                //             [1, 3, 0], [4, 3, 0],
                //             [1, 2, 0], [2, 2, 1], [3, 2, 0],
                //             [1, 1, 1], [2, 1, 1], [3, 1, 1], [4, 1, 0]
                //         ]
                //     }
                // }
            ];



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

                            windmillPuzzleMeta.calcPuzzleObj.activateLivePathInfoGainDerivation({});
                            windmillPuzzleMeta.calcPuzzleObj.generatePathInfoGainOutcomes();

                            windmillPuzzleMeta.calcPuzzleObj.deriveInfoGainTrajectory();
                            // windmillPuzzleMeta.calcPuzzleObj.deriveAllPossibleInfoGain();
                            // console.log(windmillPuzzleMeta.calcPuzzleObj);
                            // debugger;

                            var pathInfoGainOutcomes = windmillPuzzleMeta.calcPuzzleObj._state.puzzle.pathInfoGainOutcomes;
                            var puzzleHistory = windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history;
                            

                            let thisDiv = this;




                            if (puzzleIndex === 0) {
                                // windmillPuzzleMeta.calcPuzzleObj._state.puzzle.entropyChart

                                // Plotly.newPlot("entropyChart",  {
                                //     "data": [
                                //         {
                                //             "x": windmillPuzzleMeta.calcPuzzleObj._state.puzzle.entropyChart.x,
                                //             "y": windmillPuzzleMeta.calcPuzzleObj._state.puzzle.entropyChart.values,
                                //         }
                                //     ],
                                //     "layout": { 
                                //         "width": 600, 
                                //         "height": 400,
                                //         xaxis: { title: { text: 'Probability of Winning' } },
                                //         yaxis: { title: { text: 'Binary Entropy' } },
                                //         title: {text: 'Binary Entropy'}
                                //     }
                                // })

                            }


                            d3.select(this).append('h3')
                                .text('Puzzle #' + (puzzleIndex+1))
                                .style('margin-top', '40px')

                            function renderInfoGain(puzzleObj) {
                                console.log('move', thisDiv, puzzleObj);
                                let history = puzzleObj._state.puzzle.history;
                                let allEndingInfoGain = puzzleObj._state.puzzle.pathInfoGain.allEndingPaths.currStatus;
                                let goalTerminatingInfoGain = puzzleObj._state.puzzle.pathInfoGain.goalTerminatingPaths.currStatus;
                                d3.select(thisDiv).selectAll('.infoGainStats')
                                    .style('margin-bottom', '10px')
                                    .text('Total paths: ' 
                                    + allEndingInfoGain.totalPaths 
                                    + ', Terminating paths: '
                                    + goalTerminatingInfoGain.totalPaths 
                                    +', Wins: '
                                    + allEndingInfoGain.wins)

                                let formulaPuzzleFillValues1Text = '';
                                let formulaPuzzleFillValues2Text = '';
                                let binaryEntropyFormulaAll = {}
                                let binaryEntropyFormulaTAll = {}

                                let stateOnlyDeadEnds = goalTerminatingInfoGain.totalPaths === 0;

                                binaryEntropyFormulaAll['state'] = 'B(\\frac{'
                                    + allEndingInfoGain.wins + '}{'
                                    + allEndingInfoGain.totalPaths + '}) = '
                                    + (Math.round(allEndingInfoGain.entropy * 1000) / 1000)

                                if (stateOnlyDeadEnds) {
                                    binaryEntropyFormulaTAll['state'] = 'B(deadends) = ?'
                                } else {
                                    binaryEntropyFormulaTAll['state'] = 'B(\\frac{'
                                        + goalTerminatingInfoGain.wins + '}{'
                                        + goalTerminatingInfoGain.totalPaths + '}) = '
                                        + (Math.round(goalTerminatingInfoGain.entropy * 1000) / 1000)
                                }

                                let currdirections = [
                                    { name: 'up', dir: [0, 1] },
                                    { name: 'right', dir: [1, 0] },
                                    { name: 'down', dir: [0, -1] },
                                    { name: 'left', dir: [-1, 0] },
                                ];

                                let forwardLegalActions = '';
                                let winnableActions = '';
                                currdirections.forEach(dirn => {
                                    history.possibleMoveOutcomes.forEach(possibleMoveOutcome => {
                                        if (JSON.stringify(possibleMoveOutcome.dir) === JSON.stringify(dirn.dir)) {
                                            let isForwardLegal = possibleMoveOutcome.outcome.isForwardLegal;
                                            forwardLegalActions += isForwardLegal ? 'a_{' + dirn.name + '}, ' : ''
                                            let canLeadToWin = possibleMoveOutcome.canLeadToWin || false;
                                            winnableActions += canLeadToWin ? 'a_{' + dirn.name + '}, ' : ''
                                        }
                                    })
                                })
                                if (forwardLegalActions.length > 0) {
                                    forwardLegalActions = forwardLegalActions.slice(0, -2)
                                }
                                if (winnableActions.length > 0) {
                                    winnableActions = winnableActions.slice(0, -2)
                                } else {
                                    winnableActions = 'none'
                                }

                                let reasonedActionDirections = history
                                    .nextMovesCalculations
                                    .slice(-1).pop()
                                    .possibleOutcomes.reasonedMoves.map(move => {
                                        return currdirections
                                            .filter(currDirn => JSON.stringify(currDirn.dir) === JSON.stringify(move.dir))
                                            [0].name
                                    }); 
                                    
                                reasonedActionDirections = reasonedActionDirections
                                    .map(dirName => 'a_{' + dirName + '}')
                                    .join(',');

                                if (reasonedActionDirections.length === 0) {
                                    reasonedActionDirections = 'none'
                                }

                                

                                d3.select(thisDiv).selectAll('.directionDiv')
                                    .classed('invalidMove', true)
                                    .each(function(dirn) {
                                        let currDirDiv = this;
                                        d3.select(this).select('.directionPaths').selectAll('*').remove()
                                        d3.select(this).select('.directionInfoGain').selectAll('*').remove()

                                        let goalTerminatingPossibleSnakeHash = Object.values(
                                            goalTerminatingInfoGain.possibleSnakeHashes)
                                            .filter(v => JSON.stringify(v.infogain.dir) === JSON.stringify(dirn.dir)) ;

                                        if (goalTerminatingPossibleSnakeHash.length > 0) {
                                            goalTerminatingPossibleSnakeHash = goalTerminatingPossibleSnakeHash[0];
                                        }

                                        Object.values(goalTerminatingInfoGain.possibleSnakeHashes).filter(v => JSON.stringify(v.infogain.dir) === JSON.stringify(dirn.dir))
                                            .forEach(possibleSnakeHash => {
                                                console.log(possibleSnakeHash);
                                                let onlyDeadEnds = possibleSnakeHash.endingPaths === undefined;

                                                if (onlyDeadEnds) {
                                                    binaryEntropyFormulaTAll[dirn.name] = 'B(deadends) = ?'
                                                } else {
                                                    binaryEntropyFormulaTAll[dirn.name] = 'B(\\frac{'
                                                        + possibleSnakeHash.infogain.partialRemainderNumerator + '}{'
                                                        + possibleSnakeHash.infogain.partialRemainderDenominator + '}) = '
                                                        + (Math.round(possibleSnakeHash.infogain.partialEntropy * 1000) / 1000)
                                                }
                                            })


                                        Object.values(allEndingInfoGain.possibleSnakeHashes).filter(v => JSON.stringify(v.infogain.dir) === JSON.stringify(dirn.dir)) 
                                        .forEach(possibleSnakeHash => {
                                            d3.select(currDirDiv).classed('invalidMove', false);
                                            
                                            binaryEntropyFormulaAll[dirn.name] = 'B(\\frac{' 
                                                + possibleSnakeHash.infogain.partialRemainderNumerator +'}{'
                                                + possibleSnakeHash.infogain.partialRemainderDenominator +'}) = ' 
                                                + (Math.round(possibleSnakeHash.infogain.partialEntropy * 1000) / 1000)

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
                                                .text('total paths: ' + possibleSnakeHash.infogain.partialRemainderDenominator);
                                            infoGainSection.append('div')
                                                .text('terminating: ' + goalTerminatingPossibleSnakeHash.infogain.partialRemainderDenominator);
                                            // infoGainSection.append('div')
                                            //     .text('only showing 10');
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


// oracle's knowledge


                                katex.render(
                                    '\\text{Information Gain (Textbook):}\\newline',
                                    d3.select(thisDiv).select('.textbookInfoGainFormulaPuzzleStart').node(), {
                                    throwOnError: false
                                });

                                katex.render(
                                    'Gain(A) = B(\\frac{p}{p + n}) - [\\sum_{k=1}^{d} \\frac{p_k+n_k}{p + n} B(\\frac{p_k}{p_k + n_k})] \\newline',
                                    d3.select(thisDiv).select('.textbookInfoGainFormulaPuzzleFormula').node(), {
                                    throwOnError: false
                                });

                                formulaPuzzleFillValues1Text = formulaPuzzleFillValues1Text.slice(0,-1)
                                katex.render(
                                    '\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\; '
                                    + '= B(\\frac{' + allEndingInfoGain.wins + '}{'                                          
                                        + allEndingInfoGain.totalPaths  
                                        + '}) - [' 
                                        + formulaPuzzleFillValues1Text
                                    + ']',
                                    d3.select(thisDiv).select('.textbookInfoGainFormulaPuzzleFillValues1').node(), {
                                    throwOnError: false
                                });

                                formulaPuzzleFillValues2Text = formulaPuzzleFillValues2Text.slice(0, -1)
                                katex.render(
                                    '\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\; '
                                    + '= ' + (Math.round(allEndingInfoGain.entropy * 1000) / 1000) + ' - ['
                                    + formulaPuzzleFillValues2Text + ']'
                                    + '= ' + (Math.round(allEndingInfoGain.entropy * 1000) / 1000) 
                                    + ' - ' + (Math.round(allEndingInfoGain.remainder * 1000) / 1000) 
                                    + '',
                                    d3.select(thisDiv).select('.textbookInfoGainFormulaPuzzleFillValues2').node(), {
                                    throwOnError: false
                                });

                                katex.render(
                                    '\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\; '
                                    + '= ' + (Math.round(allEndingInfoGain.infoGain * 1000) / 1000) ,
                                    d3.select(thisDiv).select('.textbookInfoGainFormulaPuzzleFillValues3').node(), {
                                    throwOnError: false
                                });
                                





                                


                                

                                katex.render(
                                    '\\text{Weighted Info Gain by Action:}\\newline',
                                    d3.select(thisDiv).select('.weightedInfoGainFormulaPuzzleStart').node(), {
                                    throwOnError: false
                                });

                                katex.render(
                                    'Gain(s, a_{reasoning}) = B(\\frac{p}{p + n}) - [\\sum_{k=1}^{d} \\frac{p_k+n_k}{p + n} B(\\frac{p_k}{p_k + n_k})] \\newline',
                                    d3.select(thisDiv).select('.weightedInfoGainFormulaPuzzleFormula').node(), {
                                    throwOnError: false
                                });

                                formulaPuzzleFillValues1Text = formulaPuzzleFillValues1Text.slice(0, -1)
                                katex.render(
                                    '\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\; '
                                    + '= B(\\frac{' + allEndingInfoGain.wins + '}{'
                                    + allEndingInfoGain.totalPaths
                                    + '}) - ['
                                    + formulaPuzzleFillValues1Text
                                    + ']',
                                    d3.select(thisDiv).select('.weightedInfoGainFormulaPuzzleFillValues1').node(), {
                                    throwOnError: false
                                });

                                formulaPuzzleFillValues2Text = formulaPuzzleFillValues2Text.slice(0, -1)
                                katex.render(
                                    '\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\; '
                                    + '= ' + (Math.round(allEndingInfoGain.entropy * 1000) / 1000) + ' - ['
                                    + formulaPuzzleFillValues2Text + ']'
                                    + '= ' + (Math.round(allEndingInfoGain.entropy * 1000) / 1000)
                                    + ' - ' + (Math.round(allEndingInfoGain.remainder * 1000) / 1000)
                                    + '',
                                    d3.select(thisDiv).select('.weightedInfoGainFormulaPuzzleFillValues2').node(), {
                                    throwOnError: false
                                });

                                katex.render(
                                    '\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\;\\; '
                                    + '= ' + (Math.round(allEndingInfoGain.infoGain * 1000) / 1000),
                                    d3.select(thisDiv).select('.weightedInfoGainFormulaPuzzleFillValues3').node(), {
                                    throwOnError: false
                                });














                                let directions = [
                                    { name: 'up', dir: [0, 1], spacing: '\\;\\;\\;\\,' },
                                    { name: 'right', dir: [1, 0], spacing: '\\:' },
                                    { name: 'down', dir: [0, -1], spacing: '\\:' },
                                    { name: 'left', dir: [-1, 0], spacing: '\\;\\,\\,' },
                                ]






                                katex.render(
                                    '\\text{Binary Entropy Values (All Paths):}\\newline',
                                    d3.select(thisDiv).select('.binaryEntropyFormulaTitle').node(), {
                                    throwOnError: false
                                });

                                d3.select(thisDiv).selectAll('.binaryEntropyFormulaState')
                                    .style('visibility', binaryEntropyFormulaAll['state'] === undefined ? 'hidden' : 'visible')
                                katex.render(
                                    'B(s) = B(\\frac{p}{p + n}) = ' + binaryEntropyFormulaAll['state'],
                                    d3.select(thisDiv).select('.binaryEntropyFormulaState').node(), {
                                    throwOnError: false
                                });

                                directions.forEach(dirn => {

                                    d3.select(thisDiv).selectAll('.binaryEntropyFormulaAction' + dirn.name)
                                        .style('visibility', binaryEntropyFormulaAll[dirn.name] === undefined ? 'hidden' : 'visible')
                                    katex.render(
                                        'B(N(s,a_{' + dirn.name + '})) ' + dirn.spacing + ' = ' + binaryEntropyFormulaAll[dirn.name],
                                        d3.select(thisDiv).select('.binaryEntropyFormulaAction' + dirn.name).node(), {
                                        throwOnError: false
                                    });

                                });



                                



                                katex.render(
                                    '\\text{Binary Entropy Values (Terminating):}\\newline',
                                    d3.select(thisDiv).select('.binaryEntropyFormulaTTitle').node(), {
                                    throwOnError: false
                                });

                                d3.select(thisDiv).selectAll('.binaryEntropyFormulaTState')
                                    .style('visibility', binaryEntropyFormulaTAll['state'] === undefined ? 'hidden':'visible')
                                katex.render(
                                    'B(s) = B(\\frac{p}{p + n}) = ' + binaryEntropyFormulaTAll['state'],
                                    d3.select(thisDiv).select('.binaryEntropyFormulaTState').node(), {
                                    throwOnError: false
                                });

                                directions.forEach(dirn => {

                                    d3.select(thisDiv).selectAll('.binaryEntropyFormulaTAction' + dirn.name)
                                        .style('visibility', binaryEntropyFormulaTAll[dirn.name] === undefined ? 'hidden' : 'visible')
                                    katex.render(
                                        'B(N(s,a_{' + dirn.name + '})) ' + dirn.spacing + ' = ' + binaryEntropyFormulaTAll[dirn.name],
                                        d3.select(thisDiv).select('.binaryEntropyFormulaTAction' + dirn.name).node(), {
                                        throwOnError: false
                                    });

                                });






                                katex.render(
                                    '\\text{Actions with Reasoning Modules:}\\newline',
                                    d3.select(thisDiv).select('.reasoningFormulaTitle').node(), {
                                    throwOnError: false
                                });

                                d3.select(thisDiv).selectAll('.reasoningFormulaState')
                                    .style('visibility', binaryEntropyFormulaAll['state'] === undefined ? 'hidden' : 'visible')
                                katex.render(
                                    'L(s) = \\text{all actions} = [a_{up}, a_{right}, a_{down}, a_{left}]\\newline '
                                    + ' \\phi(s) = \\text{forward and legal} = [' + forwardLegalActions +'] \\newline ' 
                                    + 'R(\\phi(s)) = \\text{best based on local reasoning} = ' + reasonedActionDirections +' \\newline '
                                    + 'W(\\phi(s)) = \\text{leads to a win (considers paths)} = ' + winnableActions + ' \\newline ',
                                    d3.select(thisDiv).select('.reasoningFormulaState').node(), {
                                    throwOnError: false
                                });

                                // directions.forEach(dirn => {

                                //     d3.select(thisDiv).selectAll('.reasoningFormulaAction' + dirn.name)
                                //         .style('visibility', binaryEntropyFormulaAll[dirn.name] === undefined ? 'hidden' : 'visible')
                                //     katex.render(
                                //         'B(N(s,a_{' + dirn.name + '})) ' + dirn.spacing + ' = ' + binaryEntropyFormulaAll[dirn.name],
                                //         d3.select(thisDiv).select('.reasoningFormulaAction' + dirn.name).node(), {
                                //         throwOnError: false
                                //     });

                                // });






                                


                                katex.render(
                                    '\\text{End-Path-Based Information Gain Outcomes:}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomesTitle').node(), {
                                    throwOnError: false
                                });

                                katex.render(
                                    '\\text{epb1) Binary Puzzle Entropy}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-0-0').node(), {
                                    throwOnError: false
                                });

                                katex.render(
                                    'B(start)',
                                    d3.select(thisDiv).select('.pathOutcomes-0-3').node(), {
                                    throwOnError: false
                                });

                                katex.render(
                                    '\\text{' + (Math.round(pathInfoGainOutcomes.puzzleEntropy * 1000) / 1000)+'}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-0-1').node(), {
                                    throwOnError: false
                                });

                                katex.render(
                                    '\\text{' + (Math.round(pathInfoGainOutcomes.puzzleEntropy / puzzleHistory.totalSolutionsFound * 1000) / 1000) + '}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-0-2').node(), {
                                    throwOnError: false
                                });


                                

                                katex.render(
                                    '\\text{epb2) bIG only at Start}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-1-0').node(), {
                                    throwOnError: false
                                });

                                katex.render(
                                    'B(start) - Remainder(A)',
                                    d3.select(thisDiv).select('.pathOutcomes-1-3').node(), {
                                    throwOnError: false
                                });
                                katex.render(
                                    '\\text{' + (Math.round(pathInfoGainOutcomes.puzzleInfoGain * 1000) / 1000) + '}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-1-1').node(), {
                                    throwOnError: false
                                });
                                katex.render(
                                    '\\text{' + (Math.round(pathInfoGainOutcomes.puzzleInfoGain / puzzleHistory.totalSolutionsFound * 1000) / 1000) + '}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-1-2').node(), {
                                    throwOnError: false
                                });







                                katex.render(
                                    '\\text{epb3) $\\sum$bIG at all States (' + pathInfoGainOutcomes.summedIGatAllStates.states +')}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-2-0').node(), {
                                    throwOnError: false
                                });

                                katex.render(
                                    '',
                                    d3.select(thisDiv).select('.pathOutcomes-2-3').node(), {
                                    throwOnError: false
                                });
                                katex.render(
                                    '\\text{' + (Math.round(pathInfoGainOutcomes.summedIGatAllStates.score * 1000) / 1000) + '}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-2-1').node(), {
                                    throwOnError: false
                                });
                                katex.render(
                                    '\\text{' + (Math.round(pathInfoGainOutcomes.summedIGatAllStates.score / puzzleHistory.totalSolutionsFound * 1000) / 1000) + '}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-2-2').node(), {
                                    throwOnError: false
                                });
                               







                                katex.render(
                                    '\\text{epb4) $\\sum$bIG down Winnable States (' + pathInfoGainOutcomes.summedIGdownWinnableStates.states+')}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-3-0').node(), {
                                    throwOnError: false
                                });

                                katex.render(
                                    '',
                                    d3.select(thisDiv).select('.pathOutcomes-3-3').node(), {
                                    throwOnError: false
                                });
                                katex.render(
                                    '\\text{' + (Math.round(pathInfoGainOutcomes.summedIGdownWinnableStates.score * 1000) / 1000) + '}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-3-1').node(), {
                                    throwOnError: false
                                });
                                katex.render(
                                    '\\text{' + (Math.round(pathInfoGainOutcomes.summedIGdownWinnableStates.score / puzzleHistory.totalSolutionsFound * 1000) / 1000) + '}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-3-2').node(), {
                                    throwOnError: false
                                });





                                


                                katex.render(
                                    '\\text{epb5) $\\sum$bIG for states with Reasoned Actions down Winnable States (' + pathInfoGainOutcomes.summedIGforStatesWithReasonedDownWinnableStates.states +')}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-4-0').node(), {
                                    throwOnError: false
                                });

                                katex.render(
                                    '',
                                    d3.select(thisDiv).select('.pathOutcomes-4-3').node(), {
                                    throwOnError: false
                                });
                                katex.render(
                                    '\\text{' + (Math.round(pathInfoGainOutcomes.summedIGforStatesWithReasonedDownWinnableStates.score * 1000) / 1000) + '}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-4-1').node(), {
                                    throwOnError: false
                                });
                                katex.render(
                                    '\\text{' + (Math.round(pathInfoGainOutcomes.summedIGforStatesWithReasonedDownWinnableStates.score / puzzleHistory.totalSolutionsFound * 1000) / 1000) + '}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-4-2').node(), {
                                    throwOnError: false
                                });









                                katex.render(
                                    '\\text{epb6) $\\sum$bIG for states with Not-Immediately-Repeating Reasoned Actions down Winnable States}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-5-0').node(), {
                                    throwOnError: false
                                });

                                katex.render(
                                    '',
                                    d3.select(thisDiv).select('.pathOutcomes-5-3').node(), {
                                    throwOnError: false
                                });





                                katex.render(
                                    '\\text{epb7) $\\sum$bIG down Reasoned-Pruned States (' + pathInfoGainOutcomes.summedIGdownReasonedPrunedStates.states +')}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-6-0').node(), {
                                    throwOnError: false
                                });

                                katex.render(
                                    '',
                                    d3.select(thisDiv).select('.pathOutcomes-6-3').node(), {
                                    throwOnError: false
                                });

                                katex.render(
                                    '\\text{' + (Math.round(pathInfoGainOutcomes.summedIGdownReasonedPrunedStates.score * 1000) / 1000) + '}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-6-1').node(), {
                                    throwOnError: false
                                });

                                katex.render(
                                    '\\text{' + (Math.round(pathInfoGainOutcomes.summedIGdownReasonedPrunedStates.score / puzzleHistory.totalSolutionsFound * 1000) / 1000) + '}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-6-2').node(), {
                                    throwOnError: false
                                });












                                katex.render(
                                    '\\text{p8) ---}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-7-0').node(), {
                                    throwOnError: false
                                });

                                katex.render(
                                    '',
                                    d3.select(thisDiv).select('.pathOutcomes-7-3').node(), {
                                    throwOnError: false
                                });







                                katex.render(
                                    '\\text{epb9) $\\sum$bIG for states with Not-Immediately-Repeating Reasoned Actions down Reasoned-Pruned States}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-8-0').node(), {
                                    throwOnError: false
                                });

                                katex.render(
                                    '',
                                    d3.select(thisDiv).select('.pathOutcomes-8-3').node(), {
                                    throwOnError: false
                                });







                                katex.render(
                                    '\\text{epb10) $\\sum s\'$bIG for states with Reasoned Actions down Winnable States (' + pathInfoGainOutcomes.summedstateIGforStatesWithReasonedDownWinnableStates.states +')}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-9-0').node(), {
                                    throwOnError: false
                                });

                                katex.render(
                                    '',
                                    d3.select(thisDiv).select('.pathOutcomes-9-3').node(), {
                                    throwOnError: false
                                });


                                katex.render(
                                    '\\text{' + (Math.round(pathInfoGainOutcomes.summedstateIGforStatesWithReasonedDownWinnableStates.score * 1000) / 1000) + '}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-9-1').node(), {
                                    throwOnError: false
                                });


                                katex.render(
                                    '\\text{' + (Math.round(pathInfoGainOutcomes.summedstateIGforStatesWithReasonedDownWinnableStates.score * 1000) / 1000) + '}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-9-2').node(), {
                                    throwOnError: false
                                });








                                katex.render(
                                    '\\text{epb11) $\\sum s\'$bIG for states with Not-Immediately-Repeating Reasoned Actions down Winnable States}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-10-0').node(), {
                                    throwOnError: false
                                });

                                katex.render(
                                    '',
                                    d3.select(thisDiv).select('.pathOutcomes-10-3').node(), {
                                    throwOnError: false
                                });





                                katex.render(
                                    '\\text{epb12) $\\sum s\'$bIG down Reasoned-Pruned States (' + pathInfoGainOutcomes.summedstateIGdownReasonedPrunedStates.states +')}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-11-0').node(), {
                                    throwOnError: false
                                });

                                katex.render(
                                    '',
                                    d3.select(thisDiv).select('.pathOutcomes-11-3').node(), {
                                    throwOnError: false
                                });


                                katex.render(
                                    '\\text{' + (Math.round(pathInfoGainOutcomes.summedstateIGdownReasonedPrunedStates.score * 1000) / 1000) + '}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-11-1').node(), {
                                    throwOnError: false
                                });

                                katex.render(
                                    '\\text{' + (Math.round(pathInfoGainOutcomes.summedstateIGdownReasonedPrunedStates.score / puzzleHistory.totalSolutionsFound * 1000) / 1000) + '}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-11-2').node(), {
                                    throwOnError: false
                                });







                                katex.render(
                                    '\\text{epb13) $\\sum s\'$bIG for states with Not-Immediately-Repeating Reasoned Actions down Reasoned-Pruned States}\\newline',
                                    d3.select(thisDiv).select('.pathOutcomes-12-0').node(), {
                                    throwOnError: false
                                });

                                katex.render(
                                    '',
                                    d3.select(thisDiv).select('.pathOutcomes-12-3').node(), {
                                    throwOnError: false
                                });







                                katex.render(
                                    '\\text{No-End-Knowledge Information Gain Outcomes:}\\newline',
                                    d3.select(thisDiv).select('.nekOutcomesTitle').node(), {
                                    throwOnError: false
                                });

                                katex.render(
                                    '\\text{nek1) $\\sum s\'$bIG down Reasoned-Pruned States}\\newline',
                                    d3.select(thisDiv).select('.nekOutcomes-0-0').node(), {
                                    throwOnError: false
                                });

                                katex.render(
                                    '',
                                    d3.select(thisDiv).select('.nekOutcomes-0-3').node(), {
                                    throwOnError: false
                                });

                                katex.render(
                                    '\\text{' + (Math.round(puzzleHistory.infoGainTrajectoryTotal2 * 1000) / 1000) + '}\\newline',
                                    d3.select(thisDiv).select('.nekOutcomes-0-1').node(), {
                                    throwOnError: false
                                });
                                katex.render(
                                    '\\text{' + (Math.round(puzzleHistory.infoGainTrajectoryTotal2 / puzzleHistory.totalSolutionsFound * 1000) / 1000) + '}\\newline',
                                    d3.select(thisDiv).select('.nekOutcomes-0-2').node(), {
                                    throwOnError: false
                                });






                            }







                            let livePuzzleContainer = d3.select(this).append('div').classed('livePuzzleContainer', true);

                            let puzzleDiv = livePuzzleContainer.append('div').classed('puzzleDiv', true);
                            let directionsDiv = livePuzzleContainer.append('div').classed('directionsDiv', true);




                            let directions = [
                                { name: 'up', dir: [0, 1] },
                                { name: 'right', dir: [1, 0] },
                                { name: 'down', dir: [0, -1] },
                                { name: 'left', dir: [-1, 0] },
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

                            let formulaSections = livePuzzleContainer.append('div')
                                .classed('formulaSections', true);






                            let formulaSectionBinaryEntropyT = formulaSections.append('div')
                                .classed('binaryEntropyFormulaT', true)
                                .classed('formulaSection', true);

                            formulaSectionBinaryEntropyT.append('div')
                                .classed('binaryEntropyFormulaTTitle', true)
                                .classed('formula', true);

                            formulaSectionBinaryEntropyT.append('div')
                                .classed('binaryEntropyFormulaTState', true)
                                .classed('formula', true);

                            formulaSectionBinaryEntropyT.append('div')
                                .classed('binaryEntropyFormulaTActionup', true)
                                .classed('formula', true);

                            formulaSectionBinaryEntropyT.append('div')
                                .classed('binaryEntropyFormulaTActionright', true)
                                .classed('formula', true);

                            formulaSectionBinaryEntropyT.append('div')
                                .classed('binaryEntropyFormulaTActiondown', true)
                                .classed('formula', true);

                            formulaSectionBinaryEntropyT.append('div')
                                .classed('binaryEntropyFormulaTActionleft', true)
                                .classed('formula', true);         





                            let formulaSectionBinaryEntropy = formulaSections.append('div')
                                .classed('binaryEntropyFormula', true)
                                .classed('formulaSection', true);

                            formulaSectionBinaryEntropy.append('div')
                                .classed('binaryEntropyFormulaTitle', true)
                                .classed('formula', true);

                            formulaSectionBinaryEntropy.append('div')
                                .classed('binaryEntropyFormulaState', true)
                                .classed('formula', true);

                            formulaSectionBinaryEntropy.append('div')
                                .classed('binaryEntropyFormulaActionup', true)
                                .classed('formula', true);

                            formulaSectionBinaryEntropy.append('div')
                                .classed('binaryEntropyFormulaActionright', true)
                                .classed('formula', true);

                            formulaSectionBinaryEntropy.append('div')
                                .classed('binaryEntropyFormulaActiondown', true)
                                .classed('formula', true);

                            formulaSectionBinaryEntropy.append('div')
                                .classed('binaryEntropyFormulaActionleft', true)
                                .classed('formula', true);





                            let formulaSectionContainer = formulaSections.append('div')
                                .classed('textbookInfoGainFormula', true)
                                .classed('formulaSection', true);

                            formulaSectionContainer.append('div')
                                .classed('textbookInfoGainFormulaPuzzleStart', true)
                                .classed('formula', true);

                            formulaSectionContainer.append('div')
                                .classed('textbookInfoGainFormulaPuzzleFormula', true)
                                .classed('formula', true);

                            formulaSectionContainer.append('div')
                                .classed('textbookInfoGainFormulaPuzzleFillValues1', true)
                                .classed('formula', true);

                            formulaSectionContainer.append('div')
                                .classed('textbookInfoGainFormulaPuzzleFillValues2', true)
                                .classed('formula', true);
                            formulaSectionContainer.append('div')
                                .classed('textbookInfoGainFormulaPuzzleFillValues3', true)
                                .classed('formula', true);



                            formulaSections.append('br')






                            let formulaSectionReasoning = formulaSections.append('div')
                                .classed('reasoningFormula', true)
                                .classed('formulaSection', true);

                            formulaSectionReasoning.append('div')
                                .classed('reasoningFormulaTitle', true)
                                .classed('formula', true);

                            formulaSectionReasoning.append('div')
                                .classed('reasoningFormulaState', true)
                                .classed('formula', true);

                            formulaSectionReasoning.append('div')
                                .classed('reasoningFormulaActionup', true)
                                .classed('formula', true);

                            formulaSectionReasoning.append('div')
                                .classed('reasoningFormulaActionright', true)
                                .classed('formula', true);

                            formulaSectionReasoning.append('div')
                                .classed('reasoningFormulaActiondown', true)
                                .classed('formula', true);

                            formulaSectionReasoning.append('div')
                                .classed('reasoningFormulaActionleft', true)
                                .classed('formula', true);







                            let formulaSectionWeightedInfoGainContainer = formulaSections.append('div')
                                .classed('weightedInfoGainFormula', true)
                                .style('display', 'none')
                                .classed('formulaSection', true);

                            formulaSectionWeightedInfoGainContainer.append('div')
                                .classed('weightedInfoGainFormulaPuzzleStart', true)
                                .classed('formula', true);

                            formulaSectionWeightedInfoGainContainer.append('div')
                                .classed('weightedInfoGainFormulaPuzzleFormula', true)
                                .classed('formula', true);

                            formulaSectionWeightedInfoGainContainer.append('div')
                                .classed('weightedInfoGainFormulaPuzzleFillValues1', true)
                                .classed('formula', true);

                            formulaSectionWeightedInfoGainContainer.append('div')
                                .classed('weightedInfoGainFormulaPuzzleFillValues2', true)
                                .classed('formula', true);
                            formulaSectionWeightedInfoGainContainer.append('div')
                                .classed('weightedInfoGainFormulaPuzzleFillValues3', true)
                                .classed('formula', true);





                            let outcomesSectionReasoning = formulaSections.append('div')
                                .classed('pathOutcomesSection', true)
                                .classed('formulaSection', true);

                            outcomesSectionReasoning.append('div')
                                .classed('formula', true)
                                .classed('pathOutcomesTitle', true);

                            let outcomesTable = outcomesSectionReasoning
                                .append('table')
                                .classed('pathOutcomesTable', true);

                            let columnsNum = 3;

                            let outcomesHeadingRow = outcomesTable.append('tr');

                            for (let i = 0; i < columnsNum+1; i++) {
                                let header;
                                switch(i) {
                                    case 0:
                                        header = 'Outcome type';
                                    break;
                                    case 1:
                                        header = 'Value';
                                        break;
                                    case 2:
                                        header = 'Normalized by # Solutions';
                                        break;
                                    case 3:
                                        header = 'Notes';
                                        break;

                                }
                                outcomesHeadingRow.append('th')
                                    .text(header)
                            }
                            
                            for (let i = 0; i < 13; i++) {
                                let tr = outcomesTable.append('tr');
                                for (let j = 0; j < columnsNum + 1; j++) {
                                    let td = tr.append('td');
                                    td.classed('pathOutcomes-'+i+'-'+j, true)
                                    // td.text(i +',' + j);
                                }
                            }








                            outcomesSectionReasoning.append('div')
                                .classed('formula', true)
                                .classed('nekOutcomesTitle', true);

                            let nekOutcomesTable = outcomesSectionReasoning
                                .append('table')
                                .classed('nekPathOutcomesTable', true);

                            columnsNum = 3;

                            let nekOutcomesHeadingRow = nekOutcomesTable.append('tr');

                            for (let i = 0; i < columnsNum + 1; i++) {
                                let header;
                                switch (i) {
                                    case 0:
                                        header = 'Outcome type';
                                        break;
                                    case 1:
                                        header = 'Value';
                                        break;
                                    case 2:
                                        header = 'Normalized by # Solutions';
                                        break;
                                    case 3:
                                        header = 'Notes';
                                        break;

                                }
                                nekOutcomesHeadingRow.append('th')
                                    .text(header)
                            }

                            for (let i = 0; i < 13; i++) {
                                let tr = nekOutcomesTable.append('tr');
                                for (let j = 0; j < columnsNum + 1; j++) {
                                    let td = tr.append('td');
                                    td.classed('nekOutcomes-' + i + '-' + j, true)
                                    // td.text(i + ',' + j);
                                }
                            }






                            // let nonCrossingPaths = windmillPuzzleMeta.calcPuzzleObj.generateAllNonCrossingPathsIncludingNotTerminatingAtEnd(); //windmillPuzzleMeta.calcPuzzleObj

                            // console.log(nonCrossingPaths);

                            // nonCrossingPaths.forEach(path => {

                                
                            //     windmillPuzzleMeta.endingPaths.push({path, solved})
                            // })


                            // windmillPuzzleMeta.calcPuzzleObj.deriveInfoGainTrajectoryWithEndsInMind(windmillPuzzleMeta.endingPaths);

                            renderInfoGain(windmillPuzzleMeta.livePuzzleObj)
                            // debugger;

                            console.log(windmillPuzzleMeta);
                            console.log('obtained trajectory')
                        }




                        

                    })


            }





            let puzzlesToDeriveAndDraw = drawAbleWindmillPuzzles; // .filter((d, i) => i < 8)      || i === 2 || i === 5
            let purePuzzlesMeta = curriculum.map(puzzleSetup => ({ puzzleSetup })); //testPuzzles.filter((d, i, a) => i === 0 || i === 2 || i === 5 || i === a.length - 1).map(puzzleSetup => ({ puzzleSetup }));
            
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
    
