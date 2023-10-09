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
                {
                    "size": [2, 2],
                    "startPosition": [0, 0],
                    "endPosition": [2, 2, 1],
                    "constraints": {
                        "regionConstraints": [
                            [1, 2, 0], [2, 2, 0],
                            [1, 1, 0], [2, 1, 1]
                        ]
                    }
                },
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
                {
                    "size": [3, 3],
                    "startPosition": [0, 0],
                    "endPosition": [0, 1, 4],
                    "constraints": {
                        "regionConstraints": [
                            [1, 3, 0], [2, 3, 0], [3, 3, 0],
                            [1, 2, 0], [2, 2, 1], [3, 2, 0],
                            [1, 1, 1], [2, 1, 1], [3, 1, 1]
                        ]
                    }
                },
                {
                    "size": [4, 4],
                    "startPosition": [0, 0],
                    "endPosition": [1, 4, 1],
                    "constraints": {
                        "regionConstraints": [
                            [1, 4, 0], [3, 4, 1], [4, 4, 0],
                            [1, 3, 0], [2, 3, 0], [3, 3, 0], [4, 3, 0],
                            [1, 2, 0], [2, 2, 1], [3, 2, 0], [4, 2, 0],
                            [1, 1, 1], [2, 1, 1], [3, 1, 1], [4, 1, 0]
                        ]
                    }
                },
                {
                    "size": [4, 4],
                    "startPosition": [0, 0],
                    "endPosition": [4, 2, 2],
                    "constraints": {
                        "regionConstraints": [
                            [1, 4, 0], [2, 4, 0], [3, 4, 1], [4, 4, 0],
                            [2, 3, 0], [3, 3, 0], [4, 3, 0],
                            [1, 2, 0], [2, 2, 1], [3, 2, 0], [4, 2, 0],
                            [1, 1, 1], [2, 1, 1], [3, 1, 1], [4, 1, 0]
                        ]
                    }
                },
                {
                    "size": [4, 4],
                    "startPosition": [0, 0],
                    "endPosition": [3, 0, 3],
                    "constraints": {
                        "regionConstraints": [
                            [2, 4, 0], [3, 4, 1], [4, 4, 0],
                            [1, 3, 0], [4, 3, 0],
                            [1, 2, 0], [2, 2, 1], [3, 2, 0],
                            [1, 1, 1], [2, 1, 1], [3, 1, 1], [4, 1, 0]
                        ]
                    }
                }
            ];



            let drawAbleWindmillPuzzles = windmillPuzzles
                .filter(pMeta => pMeta.totalSolutionsFound > 0)



            let curriculumBlocksSection = d3.select('#pathInfoGain').append('div')
                .classed('curriculumBlocksSection', true);
            

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





                let puzzleMetaBlocks = puzzleBlocksSection.selectAll('.puzzleMetaBlocks')
                    .data(puzzlesToDraw, d => JSON.stringify(d.puzzleSetup));

                let puzzleMetaBlocksEntered = puzzleMetaBlocks
                    .enter()
                    .append('div')
                    .classed('puzzleMetaBlocks', true)
                    .style('display', 'block');

                puzzleMetaBlocksEntered
                    .each(function (windmillPuzzleMeta, puzzleIndex) {

                        let puzzleSetup = puzzlesToDraw[0].creatorName === undefined ? windmillPuzzleMeta.puzzleSetup : convertWindmillPuzzleMetaToEugenePuzzleMeta(windmillPuzzleMeta);

                        

                        let orderedDivs = curriculumBlocksSection.append('div')
                            .classed('orderedDiv', true);
                        let orderedPuzzles = new WitnessPuzzle(puzzleSetup, Object.assign({ classed: ['medium'] }, {
                            targetElement: orderedDivs.node(), userInterface: false
                        }));
                        


                        let isMustCross = puzzleSetup.constraints !== undefined && puzzleSetup.constraints.mustCrosses !== undefined;
                        d3.select(this).classed('isMustCross', isMustCross);

                        if (derive !== undefined && derive === true) { //windmillPuzzleMeta.totalInfoGainTrajectory2 === undefined

                            windmillPuzzleMeta.puzzleSetup = puzzleSetup;
                            windmillPuzzleMeta.endingPaths = [];
                            windmillPuzzleMeta.calcPuzzleObj = new WitnessPuzzle(puzzleSetup, {render: false });

                            // windmillPuzzleMeta.calcPuzzleObj.activateLivePathInfoGainDerivation({});
                            // windmillPuzzleMeta.calcPuzzleObj.generatePathInfoGainOutcomes();

                            // windmillPuzzleMeta.calcPuzzleObj.deriveInfoGainTrajectory();
                            windmillPuzzleMeta.calcPuzzleObj.deriveAllPossibleInfoGain(); 
                            
                            // console.log(windmillPuzzleMeta.calcPuzzleObj);
                            // debugger;

                            var pathInfoGainOutcomes = windmillPuzzleMeta.calcPuzzleObj._state.puzzle.pathInfoGainOutcomes;
                            var puzzleHistory = windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history;

                            puzzlesToDraw[puzzleIndex]['solutionsInfoGain'] = puzzleHistory.allPossibleInfoGain;
                            
                            // debugger;
                            

                            let thisDiv = this;



                            // d3.select(this).append('h3')
                            //     .text('Puzzle #' + (puzzleIndex+1))
                            //     .style('margin-top', '40px')

                            function renderInfoGain(puzzleObj) {
                                console.log('move', thisDiv, puzzleObj);
                                let history = puzzleObj._state.puzzle.history;
                                let allEndingInfoGain = puzzleObj._state.puzzle.pathInfoGain.allEndingPaths.currStatus;
                                let allPossibleInfoGain = history.allPossibleInfoGain;
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

                                        // Object.values(goalTerminatingInfoGain.possibleSnakeHashes).filter(v => JSON.stringify(v.infogain.dir) === JSON.stringify(dirn.dir))
                                        //     .forEach(possibleSnakeHash => {
                                        //         console.log(possibleSnakeHash);
                                        //         let onlyDeadEnds = possibleSnakeHash.endingPaths === undefined;

                                        //         if (onlyDeadEnds) {
                                        //             binaryEntropyFormulaTAll[dirn.name] = 'B(deadends) = ?'
                                        //         } else {
                                        //             binaryEntropyFormulaTAll[dirn.name] = 'B(\\frac{'
                                        //                 + possibleSnakeHash.infogain.partialRemainderNumerator + '}{'
                                        //                 + possibleSnakeHash.infogain.partialRemainderDenominator + '}) = '
                                        //                 + (Math.round(possibleSnakeHash.infogain.partialEntropy * 1000) / 1000)
                                        //         }
                                        //     })

                                        Object.values(allEndingInfoGain.possibleSnakeHashes).filter(v => JSON.stringify(v.infogain.dir) === JSON.stringify(dirn.dir)) 
                                        .forEach(possibleSnakeHash => {
                                            d3.select(currDirDiv).classed('invalidMove', false);
                                            
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
                                                    console.log(endingPath, allPossibleInfoGain);
                                                    let puzzle = new WitnessPuzzle(puzzleSetup, Object.assign({ classed: ['micro'] }, { targetElement: this, userInterface: false })); //options { render: false }
                                                    puzzle.setMode('playback');
                                                    puzzle.attemptSolveWithPath(endingPath.path, { stopAtFailure: false });
                                                    d3.select(this).append('div')
                                                        .classed('entropyLink', true)
                                                        .text('entropy')
                                                        .on('click', function() {
                                                            
                                                            let path = allPossibleInfoGain.bySnakePositions[JSON.stringify(endingPath.path)];

                                                            console.log(path);

                                                            d3.select(thisDiv)
                                                                .select('.routeEntropyOutcomes')
                                                                .html(Object.entries(path.entropy).map(([key, val]) => key + ':' + (Math.round(val * 100) / 100)).join('<br>'))


                                                            let routeEntropyDiv = d3.select(thisDiv).select('.routeEntropy');
                                                            routeEntropyDiv.selectAll('.routeEntropyPuzzle').remove();
                                                            
                                                            routeEntropyDiv.selectAll('.routeEntropyPuzzle')
                                                                .data(path.trajectories)
                                                                .enter()
                                                                .append('div')
                                                                .classed('routeEntropyPuzzle', true)
                                                                .each(function(trajectory) {
                                                                    let puzzle = new WitnessPuzzle(puzzleSetup, Object.assign({ classed: ['small'] }, { targetElement: this, userInterface: false })); //options { render: false }
                                                                    puzzle.setMode('playback');
                                                                    puzzle.attemptSolveWithPath(trajectory.moves, { stopAtFailure: false });

                                                                    d3.select(this).append('div').html(Object.entries(trajectory.moveEntropy).map(([key,val]) => key + ':' + (Math.round(val * 100) / 100) ).join('<br>'));

                                                                    d3.select(this).append('p').text(' ')
                                                                    d3.select(this).append('div').html(Object.entries(trajectory.possibleOutcomes).map(([key, val]) => key + ':' + val).join('<br>'));

                                                                    // debugger;
                                                                })
                                                            // for (let i = 0; i < path.trajectories.length; i++) {

                                                            // }
                                                            // console.log(path)
                                                            // debugger;
                                                        })
                                                })
                                        })
                                })







                            }







                            let livePuzzleContainer = d3.select(this).append('div').classed('livePuzzleContainer', true);

                            let puzzleDiv = livePuzzleContainer.append('div').classed('puzzleDiv', true);
                            let directionsDiv = livePuzzleContainer.append('div').classed('directionsDiv', true);


                            let solutionsDiv = livePuzzleContainer.append('div').classed('solutionsDiv', true);

                            // solutionsDiv.selectAll('.solutionDiv')
                            //     .data(puzzlesToDraw[puzzleIndex]['solutionsInfoGain'].winPaths.filter((winPath, winI) => winI <= puzzlesToDraw[puzzleIndex]['solutionsInfoGain'].minIForLogicAllLeafs))
                            // .enter()
                            // .append('div')
                            // .classed('solutionDiv', true)
                            // .each(function(d, solutionI, a){
                            //     let solutionPuzzle = new WitnessPuzzle(puzzleSetup,
                            //         {
                            //             classed: ['small'], targetElement: this, userInterface: false
                            //         });

                            //     d3.select(this).append('div')
                            //         .classed('solutionText', true)
                            //         .text('Min Sol\'n Entropy: ' + Math.round(d.entropy.logicAllLeafs * 1000) / 1000 )

                            //     solutionPuzzle.setMode('playback');
                            //     solutionPuzzle.attemptSolveWithPath(d.endingPath, { stopAtFailure: false });
                                
                            //     let trajectorySteps = d3.select(this).append('div')
                            //         .classed('trajectorySteps', true)


                            //     trajectorySteps
                            //         .selectAll('.trajectoryStep')
                            //         .data(d.trajectories)
                            //         .enter()
                            //         .append('div')
                            //         .classed('trajectoryStep', true)
                            //         .classed('hasEntropy', (traj) => traj.moveEntropy.logicAllLeafs > 0)
                            //         .each(function(traj, trajI) {
                            //             let trajPuzzle = new WitnessPuzzle(puzzleSetup,
                            //                 {
                            //                     classed: ['micro'], targetElement: this, userInterface: false
                            //                 });
                            //             trajPuzzle.setMode('playback');
                            //             trajPuzzle.attemptSolveWithPath(traj.moves, { stopAtFailure: false });
                            //             d3.select(this).append('div')
                            //                 .classed('trajText', true)
                            //                 .text('ent: ' + Math.round(traj.moveEntropy.logicAllLeafs * 100) / 100)
                            //         });


    
                            // })




                            // let directions = [
                            //     { name: 'up', dir: [0, 1] },
                            //     { name: 'right', dir: [1, 0] },
                            //     { name: 'down', dir: [0, -1] },
                            //     { name: 'left', dir: [-1, 0] },
                            // ]

                            // let directionDiv = directionsDiv
                            //     .selectAll('.directionDiv')
                            //     .data(directions)
                            //     .enter()
                            //     .append('div')
                            //     .classed('directionDiv', true);
                            
                            // let directionName = directionDiv.append('div').classed('directionName', true).text(d=>d.name);

                            // let directionInfoGain = directionDiv.append('div').classed('directionInfoGain', true);
                            // let directionPaths = directionDiv.append('div').classed('directionPaths', true);

                            // let pathInfoGain = JSON.parse(JSON.stringify(windmillPuzzleMeta.calcPuzzleObj._state.puzzle.pathInfoGain));
                            // let allPossibleInfoGain = JSON.parse(JSON.stringify(windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.allPossibleInfoGain));

                            windmillPuzzleMeta.livePuzzleObj = new WitnessPuzzle(puzzleSetup, 
                                {
                                    classed: ['medium'], targetElement: puzzleDiv.node(), moveCB: () => { },  //renderInfoGain
                                    pathInfoGain: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.pathInfoGain, 
                                    allPossibleInfoGain: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.allPossibleInfoGain });


                            livePuzzleContainer.append('div')
                                .classed('infoGainStats', true);

                            livePuzzleContainer.append('div')
                                .classed('routeEntropyOutcomes', true);

                            livePuzzleContainer.append('div')
                                .classed('routeEntropy', true);



                            // renderInfoGain(windmillPuzzleMeta.livePuzzleObj)
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
    
