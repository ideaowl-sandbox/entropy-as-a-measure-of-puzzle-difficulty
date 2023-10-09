import WitnessPuzzle from './lib/WitnessPuzzle/WitnessPuzzleNode.js';
var mongoose = require('mongoose');
// import d3 from './lib/WitnessPuzzle/modules/_dependencies/d3/4.13.0/d3roll.min.js';

// Adding constraints can make it easier or harder
// Removing constraints thus can also do the same (like the empty squares)

// Too many combinations: 
// - adding a few combinations on an existing puzzle with existing constraints already

// Paths from 0,0 to size, size
// 1x1 = 2
// 1x2 = 4
// 2x2 = 12
// 3x2 = 38
// 3x3 = 184
// 4x3 = 976
// 4x4 = 8512
// 4x5 = 79384
// 5x5 = ?

// Number of directly connected squares as a proxy for ease
// What makes it hard?  
// Number of separted groups?

let g = {
    cachedGeneratedConstraints: {
        grids: {},
        junctions: {}
    }

};

let numPuzzlesGeneratedSoFar = 0;

// [0].forEach(() => d3.select('#noES6ModuleLoading').style('display', 'none'))

setTimeout(function(){

    // d3.select('#updatesSection').selectAll("*").remove();

    let options = { targetElement: '#updatesSection', userInterface: false };

    let curriculum = {
        "witness_curriculum": [{
            "size": [1, 2],
            "startPosition": [0, 0],
            "endPosition": [1, 2, 1],
            "constraints": {
                "regionConstraints": [
                    [1, 2, 0],
                    [1, 1, 1]
                ],
                "mustCrosses": [
                    [0, 1.5]
                    // [1, 1.5]
                ],
                "cannotCrosses": [
                    [1, 1.5]
                ]
            }
        }]
    }
    

    let puzzleInstanceRunner = new WitnessPuzzle(curriculum.witness_curriculum[0], { render: false });


    let showAll = false;
    let showMultipleConstraintCombinations = true;
    let showSelectiveConstraintCombinations = false;
    let showExactConstraintCombinations = false;

    

    let gridSize = [3, 3];


    let puzzleGrids = generatePuzzleGrids({
        gridSizes: [gridSize],
        allStartingPositions: false
    })

    let puzzleSetsByConstraints = null;

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


    if (showAll || showMultipleConstraintCombinations) {

        // d3.select('#updatesSection').append('h3')
        //     .text('Multiple Combinations of Constraints');

        puzzleGrids.forEach(set => set.puzzles.forEach(d => {
    
            // // puzzleSetsByConstraints = generatePuzzlesWithConstraints(d);
            // // 103k puzzles
            // puzzleSetsByConstraints = generatePuzzlesWithConstraints(d, {
            //     numRegionConstraints: { max: 9 },
            //     numColorOfRegionConstraints: { max: 5 },
            //     // numMustCrosses: { max: 2 },
            //     // numCannotCrosses: { max: 1 }
            // });

            // let pathAttempts = generateNonCrossingPaths(d);

            puzzleSetsByConstraints = generatePuzzlesWithConstraints(d, {
                numRegionConstraints: { exactly: 2 },
                numColorOfRegionConstraints: { exactly: 2 },
                numMustCrosses: { max: 3 },
                // numCannotCrosses: { max: 1 }
            });

            // console.log(pathAttempts);

            return;

            pathAttempts = generateNonCrossingPaths(d);
    

            puzzleSetsByConstraints.forEach((puzzleSet, i) => {
    
                let visualize = false;
    
                // d3.select('#updatesSection').append('pre')
                //     .text(JSON.stringify(puzzleSet.constraints));
    
    
                puzzleSet.puzzles.forEach((d, i) => {
    
                    if (puzzleSet.solutionsDistribution === undefined) {
                        puzzleSet.solutionsDistribution = {};
                    }
    
                    let numberOfSolutions = 0;
    
                    pathAttempts.forEach(path => {
                        let puzzle = puzzleInstanceRunner.setNewPuzzle(d, { render: false }); //options { render: false }                
                        puzzle.setMode('playback');
                        let solved = puzzle.attemptSolveWithPath(path);
                        puzzleSet.solves += solved ? 1 : 0;
                        numberOfSolutions += solved ? 1 : 0;
                        puzzleSet.solveAttempts += 1;
                    })
    
                    if (puzzleSet.solutionsDistribution[numberOfSolutions] === undefined) {
                        puzzleSet.solutionsDistribution[numberOfSolutions] = [];
                    }
    
                    puzzleSet.solutionsDistribution[numberOfSolutions].push(d);
                });
    
                puzzleSet.solveRate = Math.floor(puzzleSet.solves / puzzleSet.solveAttempts * 10000) / 100;
    
                let setText = JSON.stringify(puzzleSet.constraints) + ' --> Solve rate: ' + puzzleSet.solveRate + "\n";
    
                let hasUniqueSolutionPuzzles = false;
    
                if (puzzleSet.solutionsDistribution !== undefined) {
                    if (puzzleSet.solutionsDistribution[1] !== undefined) {
                        setText += ' ' + puzzleSet.solutionsDistribution[1].length + ' puzzles with a unique solutions, out of '
                        hasUniqueSolutionPuzzles = true;
                    }
                }
    
                setText += puzzleSet.puzzles.length + ' puzzles, each with ' + (puzzleSet.solveAttempts / puzzleSet.puzzles.length) + ' possible paths to solve.';
    
                // d3.select('#updatesSection').append('pre')
                //     .text(setText);
                console.log(puzzleSet);
    
                let showPuzzles = true;
                let onlyShowUniquePuzzles = false;
                let showByDistribution = true;
    
    
                if (showPuzzles) {
                    if (showByDistribution && puzzleSet.solutionsDistribution !== undefined) {
                        let solutionSplits = Object.keys(puzzleSet.solutionsDistribution);
                        for (let i = 0; i < solutionSplits.length; i++) {
                            let numSolutions = solutionSplits[i];
    
                            d3.select('#updatesSection').append('pre')
                                .text('      ' + numSolutions + ' Solutions, ' + puzzleSet.solutionsDistribution[numSolutions].length + ' such puzzles.' );
    
    
                            if (onlyShowUniquePuzzles) {
                                if (numSolutions !== 1) continue;
                            }
    
                            puzzleSet.solutionsDistribution[numSolutions].forEach(puzzleSetup => {
                                let puzzle = new WitnessPuzzle(puzzleSetup, Object.assign({ classed: ['small'] }, options)); //options { render: false }                
                            })
    
                        }
    
    
                    } else {
    
                        puzzleSet.puzzles.forEach(puzzleSetup => {
                            let puzzle = new WitnessPuzzle(puzzleSetup, Object.assign({ classed: ['small'] }, options)); //options { render: false }                
                        })
                    }
    
                }
    
    
            })
    
    
        }))

    }


    console.log("Done solving");

    function generatePuzzlesWithConstraints(puzzleSetup, constraintVars) {

        let puzzleSets = generatePuzzleSetsFromPuzzle(puzzleSetup);
        puzzleSets = generateRegionConstraintsForPuzzle(puzzleSets, puzzleSetup, constraintVars);
        puzzleSets = generateMustCrossSets(puzzleSets, puzzleSetup, constraintVars);
        puzzleSets = generateCannotCrossSets(puzzleSets, puzzleSetup, constraintVars);

        console.log('generated combinations of sets, expanding next...');

        console.log('number of puzzle sets to expand', puzzleSets.length);
        
        let startDate = new Date();
        for (let puzzleSet of puzzleSets) {
            puzzleSet.puzzles = expandPuzzlesForPuzzleSets(puzzleSet);
        }

        console.log('...sets expanded!');

        return puzzleSets;




        function generateMustCrossSets(puzzleSets, puzzleSetup, constraintVars) {
            let newPuzzleSets = [];

            if (constraintVars.numMustCrosses === undefined) return puzzleSets;

            let numMustCrossesLimit = occupiableSpaces.junctions.length - 2;
            if (constraintVars.numMustCrosses.max !== undefined) numMustCrossesLimit = constraintVars.numMustCrosses.exactly || Math.min(numMustCrossesLimit, constraintVars.numMustCrosses.max);

            for (let i = 0; i < puzzleSets.length; i++) {
                let sourcePuzzleSet = puzzleSets[i];
                newPuzzleSets.push(puzzleSets[i]);
                for (let numMustCrosses = constraintVars.numMustCrosses.exactly || 1; numMustCrosses <= numMustCrossesLimit; numMustCrosses++) {
                    let newPuzzleSet = JSON.parse(JSON.stringify(puzzleSets[i]));
                    newPuzzleSet.constraints['numMustCrosses'] = numMustCrosses;
                    newPuzzleSets.push(newPuzzleSet);
                }
            }
            return newPuzzleSets;

        }


        function generateCannotCrossSets(puzzleSets, puzzleSetup, constraintVars) {
            let newPuzzleSets = [];

            if (constraintVars.numCannotCrosses === undefined) return puzzleSets;

            let numCannotCrossesLimitWOOtherConstraints = occupiableSpaces.junctions.length - 2;
            if (constraintVars.numCannotCrosses.max !== undefined) numCannotCrossesLimitWOOtherConstraints = constraintVars.numCannotCrosses.exactly || Math.min(numCannotCrossesLimitWOOtherConstraints, constraintVars.numCannotCrosses.max);

            for (let i = 0; i < puzzleSets.length; i++) {
                let sourcePuzzleSet = puzzleSets[i];
                newPuzzleSets.push(puzzleSets[i]);
                let numCannotCrossesLimit = numCannotCrossesLimitWOOtherConstraints;
                if (sourcePuzzleSet.constraints.numMustCrosses !== undefined) numCannotCrossesLimit = Math.min(numCannotCrossesLimit, occupiableSpaces.junctions.length - 2 - sourcePuzzleSet.constraints.numMustCrosses)
                for (let numCannotCrosses = constraintVars.numCannotCrosses.exactly || 1; numCannotCrosses <= numCannotCrossesLimit; numCannotCrosses++) {
                    let newPuzzleSet = JSON.parse(JSON.stringify(puzzleSets[i]));
                    newPuzzleSet.constraints['numCannotCrosses'] = numCannotCrosses;
                    newPuzzleSets.push(newPuzzleSet);
                }
            }
            return newPuzzleSets;

        }


        function generateRegionConstraintsForPuzzle(puzzleSets, puzzleSetup, constraintVars) {
            let newPuzzleSets = [];

            if (constraintVars.numRegionConstraints === undefined) return puzzleSets;

            let numRegionConstraintsLimit = (puzzleSetup.size[0] * puzzleSetup.size[1]);
            if (constraintVars.numRegionConstraints.max !== undefined) numRegionConstraintsLimit = Math.min(numRegionConstraintsLimit, constraintVars.numRegionConstraints.max);
            if (constraintVars.numRegionConstraints.exactly) numRegionConstraintsLimit = constraintVars.numRegionConstraints.exactly;

            let startingNumRegionConstraints = 0;
            if (constraintVars.numRegionConstraints.exactly) startingNumRegionConstraints = constraintVars.numRegionConstraints.exactly;

            for (let numRegionConstraints = startingNumRegionConstraints; numRegionConstraints <= numRegionConstraintsLimit; numRegionConstraints++) {
                let numColorOfRegionConstraintsLimit = constraintVars.numColorOfRegionConstraints.exactly || Math.min(numRegionConstraints, constraintVars.numColorOfRegionConstraints.max || numRegionConstraints);
                for (let numColorOfRegionConstraints = constraintVars.numColorOfRegionConstraints.exactly || Math.min(numRegionConstraints, 1); numColorOfRegionConstraints <= numColorOfRegionConstraintsLimit; numColorOfRegionConstraints++) {
                    let newPuzzleSet = JSON.parse(JSON.stringify(puzzleSets[0]));
                    newPuzzleSet.constraints['numRegionConstraints'] = numRegionConstraints;
                    newPuzzleSet.constraints['numColorOfRegionConstraints'] = numColorOfRegionConstraints;
                    newPuzzleSets.push(newPuzzleSet);
                }
            }

            return newPuzzleSets;

        }

        function generatePuzzleSetsFromPuzzle(puzzleSetup, constraintVars) {

            puzzleSetup.constraints = {}

            let puzzleSets = [{
                constraints: {},
                // constraints: { numRegionConstraints, numColorOfRegionConstraints },
                puzzle: puzzleSetup,
                currGridI: 0, currJunctionI: 0, numUsedColors: 0,
                solves: 0, solveAttempts: 0
            }]
            // puzzleSets.push();

            return puzzleSets
        }


        function expandPuzzlesForPuzzleSets(puzzleSet) {

            let gridConstraints = expandGridConstraints(puzzleSet);
            let junctionConstraints = expandJunctionConstraints(puzzleSet);
            let puzzles = [];

            // console.log(puzzleSet.constraints)
            // console.log({ junctionConstraints, gridConstraints})
            // debugger;

            if (gridConstraints.length === 0) gridConstraints = [{}];
            if (junctionConstraints.length === 0) junctionConstraints = [{}];

            for (let i = 0; i < gridConstraints.length; i++) {
                for (let j = 0; j < junctionConstraints.length; j++) {
                    let newPuzzle = JSON.parse(JSON.stringify(puzzleSet.puzzle));
                    newPuzzle.constraints = Object.assign({}, gridConstraints[i], junctionConstraints[j]);
                    numPuzzlesGeneratedSoFar += 1;

                    if (numPuzzlesGeneratedSoFar % 100000 === 0) {
                        console.log(numPuzzlesGeneratedSoFar)
                        console.log(Math.round(new Date().getTime() - startDate.getTime())/1000)
                    }
                    // if (numPuzzlesGeneratedSoFar % 1000000 === 0) {
                    //     debugger;
                    // }
                    puzzles.push(newPuzzle);
                }
            }

            // debugger;
            return puzzles;

        }

        function expandJunctionConstraints(puzzleSet) {

            let constraints = [];
            let puzzleSetOnlyWithJunctionConstraints = JSON.parse(JSON.stringify(puzzleSet));

            let junctionConstraints = {
                numMustCrosses: puzzleSet.constraints.numMustCrosses || 0,
                numCannotCrosses: puzzleSet.constraints.numCannotCrosses || 0,
            };
            let puzzleConstraintNames = {
                numMustCrosses: 'mustCrosses',
                numCannotCrosses: 'cannotCrosses',
            }
            // debugger;

            puzzleSetOnlyWithJunctionConstraints.constraints = junctionConstraints;

            let puzzleSetsToPopulate = [puzzleSetOnlyWithJunctionConstraints];

            let junctionConstraintsHash = JSON.stringify(junctionConstraints);

            if (g.cachedGeneratedConstraints.junctions[junctionConstraintsHash] !== undefined) {
                g.cachedGeneratedConstraints.junctions[junctionConstraintsHash].retrievedCount += 1;
                return g.cachedGeneratedConstraints.junctions[junctionConstraintsHash].constraints;
            }
            
            let junctionTypes = Object.keys(junctionConstraints);

            // let timeStartToGenerateConstraints = performance.now();

            let count = 0;
            // debugger;
            while (puzzleSetsToPopulate.length > 0) {
                count++;
                let puzzleSetToPopulate = puzzleSetsToPopulate.pop(); //currPuzzleSetToPopulate.occupiableSpaces.currGridI

                if (puzzleSetToPopulate.constraints.numMustCrosses || puzzleSetToPopulate.constraints.numCannotCrosses) {

                    for (let i = puzzleSetToPopulate.currJunctionI; i < occupiableSpaces.junctions.length; i++) {

                        for (let j = 0; j < junctionTypes.length; j++) {
                            let junctionConstraint = junctionTypes[j];

                            if (puzzleSetToPopulate.constraints[junctionConstraint] === 0) {
                                delete puzzleSetToPopulate.constraints[junctionConstraint];
                            }

                        }

                        // For different junction constraints

                        for (let j = 0; j < junctionTypes.length; j++) {
                            let junctionConstraint = junctionTypes[j];

                            let currPuzzleSetToPopulate = JSON.parse(JSON.stringify(puzzleSetToPopulate));

                            if (currPuzzleSetToPopulate.constraints[junctionConstraint] === undefined) {
                                continue;
                            }

                            let xy = occupiableSpaces.junctions[i];

                            let junctionIsStartOrEndPoint = (xy[0] === currPuzzleSetToPopulate.puzzle.startPosition[0]
                                && xy[1] === currPuzzleSetToPopulate.puzzle.startPosition[1])
                                || (xy[0] === currPuzzleSetToPopulate.puzzle.endPosition[0]
                                    && xy[1] === currPuzzleSetToPopulate.puzzle.endPosition[1]);

                            if (junctionIsStartOrEndPoint) {
                                currPuzzleSetToPopulate.currJunctionI = i + 1;
                                continue;
                            }

                            if (currPuzzleSetToPopulate.puzzle.constraints[puzzleConstraintNames[junctionConstraint]] === undefined) {
                                currPuzzleSetToPopulate.puzzle.constraints[puzzleConstraintNames[junctionConstraint]] = [];
                            }

                            currPuzzleSetToPopulate.puzzle.constraints[puzzleConstraintNames[junctionConstraint]].push([xy[0], xy[1]]);

                            currPuzzleSetToPopulate.constraints[junctionConstraint] -= 1;
                            currPuzzleSetToPopulate.currJunctionI = i + 1;
                            if (currPuzzleSetToPopulate.constraints[junctionConstraint] === 0) {
                                delete currPuzzleSetToPopulate.constraints[junctionConstraint];
                            }
                            if (Object.keys(currPuzzleSetToPopulate.constraints).length === 0) {
                                constraints.push(currPuzzleSetToPopulate.puzzle.constraints);
                            } else {
                                puzzleSetsToPopulate.push(currPuzzleSetToPopulate);
                            }

                        }



                    }

                }

                // if (count > 1000) {
                //     debugger;
                //     puzzleSetsToPopulate = []
                // }
            }

            g.cachedGeneratedConstraints.junctions[junctionConstraintsHash] = {
                constraints,
                retrievedCount: 0,
                // timeToGenerate: performance.now() - timeStartToGenerateConstraints
            }

            return constraints;
        }
        
        function expandGridConstraints(puzzleSet) {
            
            let constraints = [];
            
            let puzzleSetOnlyWithGridConstraints = JSON.parse(JSON.stringify(puzzleSet));

            let gridConstraints = {
                numRegionConstraints: puzzleSet.constraints.numRegionConstraints || 0,
                numColorOfRegionConstraints: puzzleSet.constraints.numColorOfRegionConstraints || 0,
            };

            let gridConstraintsHash = JSON.stringify(gridConstraints);

            puzzleSetOnlyWithGridConstraints.constraints = gridConstraints;
            
            let puzzleSetsToPopulate = [puzzleSetOnlyWithGridConstraints];
            // debugger;
            if (g.cachedGeneratedConstraints.grids[gridConstraintsHash] !== undefined) {
                g.cachedGeneratedConstraints.grids[gridConstraintsHash].retrievedCount += 1;
                return g.cachedGeneratedConstraints.grids[gridConstraintsHash].constraints;
            }

            // let timeStartToGenerateConstraints = performance.now();

            let count = 0;
            // debugger;
            while (puzzleSetsToPopulate.length > 0) {
                count++;
                let puzzleSetToPopulate = puzzleSetsToPopulate.pop(); //currPuzzleSetToPopulate.occupiableSpaces.currGridI

                if (puzzleSetToPopulate.constraints.numRegionConstraints) {

                    for (let i = puzzleSetToPopulate.currGridI; i < occupiableSpaces.grids.length; i++) {

                        let maxColorIForGivenConstraints = 1;

                        if (puzzleSetToPopulate.puzzle.constraints !== undefined && puzzleSetToPopulate.puzzle.constraints.regionConstraints !== undefined) {
                            maxColorIForGivenConstraints = puzzleSetToPopulate.puzzle.constraints.regionConstraints.length + 1;
                        }

                        for (let sqColor = 0;
                            sqColor < Math.min(maxColorIForGivenConstraints, puzzleSetToPopulate.constraints.numColorOfRegionConstraints, puzzleSetToPopulate.numUsedColors + 1);
                            sqColor++) {
                            // && currPuzzleSetToPopulate.constraints.numColorOfRegionConstraints === 0
                            let currPuzzleSetToPopulate = JSON.parse(JSON.stringify(puzzleSetToPopulate));

                            let xy = occupiableSpaces.grids[i];
                            if (currPuzzleSetToPopulate.puzzle.constraints.regionConstraints === undefined) {
                                currPuzzleSetToPopulate.puzzle.constraints.regionConstraints = [];
                            }
                            currPuzzleSetToPopulate.numUsedColors = Math.max(sqColor + 1, currPuzzleSetToPopulate.numUsedColors);
                            currPuzzleSetToPopulate.puzzle.constraints.regionConstraints.push([xy[0], xy[1], sqColor]);
                            currPuzzleSetToPopulate.constraints.numRegionConstraints--;
                            currPuzzleSetToPopulate.currGridI = i + 1;
                            if (currPuzzleSetToPopulate.constraints.numRegionConstraints === 0
                                && currPuzzleSetToPopulate.numUsedColors === currPuzzleSetToPopulate.constraints.numColorOfRegionConstraints) {
                                currPuzzleSetToPopulate.constraints.numRegionConstraints = undefined;
                                constraints.push(currPuzzleSetToPopulate.puzzle.constraints);
                            } else {
                                puzzleSetsToPopulate.push(currPuzzleSetToPopulate);
                            }
                        }
                    }

                }

                // if (count > 1000) {
                //     debugger;
                //     puzzleSetsToPopulate = []
                // }
            }    

            g.cachedGeneratedConstraints.grids[gridConstraintsHash] = {
                constraints,
                retrievedCount: 0,
                // timeToGenerate: performance.now() - timeStartToGenerateConstraints
            }

            return constraints;        
        }
    }


    function generateNonCrossingPaths(puzzleSetup) {
        let nonCrossingPaths = []
        let moveAttempts = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        let startPathToExplore = { moves: [], pathSoFar: [], crossedHash: {} };
        startPathToExplore.crossedHash[puzzleSetup.startPosition.join(' ')] = true;
        startPathToExplore.pathSoFar.push(puzzleSetup.startPosition);
        //puzzleSetup.startPosition.join(' ')

        let pathsToExplore = [startPathToExplore];

        while (pathsToExplore.length > 0) {
            let pathToExplore = pathsToExplore.pop();

            let pathsToExploreFromHere = [];
            for (let i = 0; i < moveAttempts.length; i++) {
                let potentialPathToExplore = JSON.parse(JSON.stringify(pathToExplore));
                let lastPosition = potentialPathToExplore.pathSoFar[potentialPathToExplore.pathSoFar.length - 1];
                let newX = lastPosition[0] + moveAttempts[i][0];
                let newY = lastPosition[1] + moveAttempts[i][1];
                let newPosition = [newX, newY];
                let newPositionHash = newPosition.join(' ');


                let gotToTheEnd = newX === puzzleSetup.endPosition[0] && newY === puzzleSetup.endPosition[1];
                if (gotToTheEnd) {
                    potentialPathToExplore.moves.push(moveAttempts[i]);
                    nonCrossingPaths.push(potentialPathToExplore.moves);
                } else {

                    let withinBorders = newX >= 0 && newX <= puzzleSetup.size[0]
                        && newY >= 0 && newY <= puzzleSetup.size[1];

                    if (withinBorders && pathToExplore.crossedHash[newPositionHash] === undefined) {
                        potentialPathToExplore.moves.push(moveAttempts[i]);
                        potentialPathToExplore.pathSoFar.push(newPosition);
                        potentialPathToExplore.crossedHash[newPositionHash] = true;
                        pathsToExploreFromHere.push(potentialPathToExplore);
                    }
                }
            }

            for (let i = pathsToExploreFromHere.length - 1; i >= 0; i--) {
                pathsToExplore.push(pathsToExploreFromHere[i]);
            }

        }

        return nonCrossingPaths;

    }


    function generatePuzzleGrids({
        gridSizes,
        allStartingPositions = true,
        allEndingPositions = true } = {}) {

        let puzzleSets = [];

        for (let puzzleSetGridSize of gridSizes) {

            let puzzleSet = {
                gridSize: puzzleSetGridSize,
                allStartingPositions,
                allEndingPositions, puzzles: []
            }


            // {
            //     "size": [3, 3],
            //     "startPosition": [0, 0],
            //     "endPosition": [0, 1, 4],
            //     "filledSquares": [
            //         [1, 3, 0], [2, 3, 0], [3, 3, 0],
            //         [1, 2, 0], [2, 2, 1], [3, 2, 0],
            //         [1, 1, 1], [2, 1, 1], [3, 1, 1]
            //     ]
            // },            

            let currPuzzleTemplate = { size: puzzleSetGridSize }
            if (!allStartingPositions) {
                let currPuzzle = JSON.parse(JSON.stringify(currPuzzleTemplate));
                currPuzzle.startPosition = [0, 0];
                currPuzzle.endPosition = [puzzleSetGridSize[0], puzzleSetGridSize[1], 1];
                puzzleSet.puzzles.push(currPuzzle);
            } else {
                for (let x = 0; x <= puzzleSetGridSize[0]; x++) {
                    for (let y = 0; y <= puzzleSetGridSize[1]; y++) {
                        let currPuzzle = JSON.parse(JSON.stringify(currPuzzleTemplate));
                        if ([x, y].join(' ') !== puzzleSetGridSize.join(' ')) {
                            currPuzzle.startPosition = [x, y];
                            currPuzzle.endPosition = [puzzleSetGridSize[0], puzzleSetGridSize[1], 1];
                            puzzleSet.puzzles.push(currPuzzle);
                        }
                    }
                }
            }

            puzzleSets.push(puzzleSet);

        }

        return puzzleSets;

    }


// let newPuzzleObj = new WitnessPuzzle(curriculum.witness_curriculum[0], options);
// let newPuzzleObjs = new WitnessPuzzle(curriculum.witness_curriculum[1], options);
// let newPuzzleObjss = new WitnessPuzzle(curriculum.witness_curriculum[2], options);
// let newPuzzleObjsss = new WitnessPuzzle(curriculum.witness_curriculum[3], options);
// newPuzzleObj.loadHistory(solveAttempt.history);








}, 200)
    
