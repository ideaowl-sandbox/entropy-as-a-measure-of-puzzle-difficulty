import WitnessPuzzle from './lib/WitnessPuzzle/WitnessPuzzle.js';
import d3 from './lib/WitnessPuzzle/modules/_dependencies/d3/4.13.0/d3roll.min.js';

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

[0].forEach(() => d3.select('#noES6ModuleLoading').style('display', 'none'))

setTimeout(function(){

    d3.select('#updatesSection').selectAll("*").remove();

    let options = { targetElement: '#updatesSection', userInterface: false };

    let curriculum = {
        "witness_curriculum": [{
            "size": [1, 2],
            "startPosition": [0, 0],
            "endPosition": [1, 2, 1],
            "constraints": {
                "cliqueCircles": [
                    [1, 2, 0],
                    [1, 1, 1]
                ],
                "mustCrosses": [
                    [0, 1.5]
                    // [1, 1.5]
                ],
                "brokenJunctions": [
                    [1, 1.5]
                ]
            }
        }]
    }
    

    let puzzleInstanceRunner = new WitnessPuzzle(curriculum.witness_curriculum[0], { render: false });


    // puzzleGrids.forEach(set => set.puzzles.forEach(d => {
    //     if (i !== 6) return;
    //     new WitnessPuzzle(d, Object.assign({ classed: ['small'] }, options));
    // }))

    d3.select('#updatesSection').append('h3')
        .text('This Puzzle Should be Solvable');

    let puzzle = new WitnessPuzzle(
        {
            "size": [4, 4],
            "startPosition": [3, 2],
            "endPosition": [1, 4, 1],
            "constraints": {
                "cliqueCircles": [
                    [1, 4, 0], [3, 4, 1], [4, 4, 0],
                    [1, 3, 0], [2, 3, 1], [3, 3, 0], [4, 3, 0],
                    [1, 2, 0], [2, 2, 1], [3, 2, 0], [4, 2, 0],
                    [1, 1, 1], [2, 1, 1], [3, 1, 1]
                ],
                "mustCrosses": [
                    [4, 0.5],
                    [1, 3],
                ],
                "brokenJunctions": [
                    [1.5, 1],
                    [3, 1.5]
                ]
            }
        }
    , Object.assign({ classed: ['large'] }, options)); //options { render: false }                


    // d3.select('#updatesSection').append('p')
    //     .text('This shows how "constraint sets" are setup, how many puzzles are generated, and the solve rate for them.  I realize the 0, 0 combination is an error, an edge case to address later.');

    // d3.select('#updatesSection').append('p')
    //     .text('The puzzles shown below are specifically ones that only have a unique solution to them.');

    let showAll = true;
    let showMultipleConstraintCombinations = false;
    let showSelectiveConstraintCombinations = false;
    let showExactConstraintCombinations = true;

    

    let gridSize = [2, 1];


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

        d3.select('#updatesSection').append('h3')
            .text('Multiple Combinations of Constraints');

        puzzleGrids.forEach(set => set.puzzles.forEach(d => {
    
            // puzzleSetsByConstraints = generatePuzzlesWithConstraints(d);
            puzzleSetsByConstraints = generatePuzzlesWithConstraints(d, {
                numCliqueCircles: { },
                numColorOfCliqueCircles: { max: 3 },
                numMustCrosses: { max: 2 },
                numBrokenJunctions: { max: 1 }
            });
            let pathAttempts = generateNonCrossingPaths(d);
    
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
    
                d3.select('#updatesSection').append('pre')
                    .text(setText);
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

    if (showAll || showSelectiveConstraintCombinations) {
        d3.select('#updatesSection').append('h3')
            .text('Selective Combinations of Constraints');
    
    
    
        gridSize = [2, 1];
    
    
        puzzleGrids = generatePuzzleGrids({
            gridSizes: [gridSize],
            allStartingPositions: false
        })
    
        // Setup all occupiablespaces
        occupiableSpaces = { junctions: [], grids: [] };
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
    
    
        puzzleGrids.forEach(set => set.puzzles.forEach(d => {
    
            puzzleSetsByConstraints = generatePuzzlesWithConstraints(d, {
                // numCliqueCircles: { max: 1},
                // numColorOfCliqueCircles: { max: 3 },
                // numMustCrosses: { max: 2 },
                numBrokenJunctions: { max: 2 }
            });
    
            let pathAttempts = generateNonCrossingPaths(d);
    
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
    
                d3.select('#updatesSection').append('pre')
                    .text(setText);
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
                                .text('      ' + numSolutions + ' Solutions, ' + puzzleSet.solutionsDistribution[numSolutions].length + ' such puzzles.');
    
    
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

    if (showAll || showExactConstraintCombinations) {
        d3.select('#updatesSection').append('h3')
            .text('Exact Combinations of Constraints');



        gridSize = [3, 3];


        puzzleGrids = generatePuzzleGrids({
            gridSizes: [gridSize],
            allStartingPositions: false
        })

        // Setup all occupiablespaces
        occupiableSpaces = { junctions: [], grids: [] };
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


        puzzleGrids.forEach(set => set.puzzles.forEach(d => {

            puzzleSetsByConstraints = generatePuzzlesWithConstraints(d, {
                numCliqueCircles: { exactly: 5 },
                numColorOfCliqueCircles: { exactly: 3 },
                // numMustCrosses: { max: 2 },
                // numBrokenJunctions: { exactly: 1}
            });

            let pathAttempts = generateNonCrossingPaths(d);

            console.log('attempting to solve puzzles');

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

                d3.select('#updatesSection').append('pre')
                    .text(setText);
                console.log(puzzleSet);

                let showPuzzles = true;
                let onlyShowUniquePuzzles = true;
                let showByDistribution = true;


                if (showPuzzles) {
                    if (showByDistribution && puzzleSet.solutionsDistribution !== undefined) {
                        let solutionSplits = Object.keys(puzzleSet.solutionsDistribution);
                        for (let i = 0; i < solutionSplits.length; i++) {
                            let numSolutions = solutionSplits[i];

                            d3.select('#updatesSection').append('pre')
                                .text('      ' + numSolutions + ' Solutions, ' + puzzleSet.solutionsDistribution[numSolutions].length + ' such puzzles.');


                            if (onlyShowUniquePuzzles) {
                                if (+numSolutions !== 1) continue;
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

            console.log('puzzles solved!');
        }))

    }




    console.log("Done solving");

    

    console.log("Done solving");


    function generatePuzzlesWithConstraints(puzzleSetup, constraintVars) {

        let puzzleSets = generatePuzzleSetsFromPuzzle(puzzleSetup);
        puzzleSets = generateCliqueCirclesForPuzzle(puzzleSets, puzzleSetup, constraintVars);
        puzzleSets = generateMustCrossSets(puzzleSets, puzzleSetup, constraintVars);
        puzzleSets = generateBrokenJunctionSets(puzzleSets, puzzleSetup, constraintVars);

        console.log('generated combinations of sets, expanding next...');


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


        function generateBrokenJunctionSets(puzzleSets, puzzleSetup, constraintVars) {
            let newPuzzleSets = [];

            if (constraintVars.numBrokenJunctions === undefined) return puzzleSets;

            let numBrokenJunctionsLimitWOOtherConstraints = occupiableSpaces.junctions.length - 2;
            if (constraintVars.numBrokenJunctions.max !== undefined) numBrokenJunctionsLimitWOOtherConstraints = constraintVars.numBrokenJunctions.exactly || Math.min(numBrokenJunctionsLimitWOOtherConstraints, constraintVars.numBrokenJunctions.max);

            for (let i = 0; i < puzzleSets.length; i++) {
                let sourcePuzzleSet = puzzleSets[i];
                newPuzzleSets.push(puzzleSets[i]);
                let numBrokenJunctionsLimit = numBrokenJunctionsLimitWOOtherConstraints;
                if (sourcePuzzleSet.constraints.numMustCrosses !== undefined) numBrokenJunctionsLimit = Math.min(numBrokenJunctionsLimit, occupiableSpaces.junctions.length - 2 - sourcePuzzleSet.constraints.numMustCrosses)
                for (let numBrokenJunctions = constraintVars.numBrokenJunctions.exactly || 1; numBrokenJunctions <= numBrokenJunctionsLimit; numBrokenJunctions++) {
                    let newPuzzleSet = JSON.parse(JSON.stringify(puzzleSets[i]));
                    newPuzzleSet.constraints['numBrokenJunctions'] = numBrokenJunctions;
                    newPuzzleSets.push(newPuzzleSet);
                }
            }
            return newPuzzleSets;

        }


        function generateCliqueCirclesForPuzzle(puzzleSets, puzzleSetup, constraintVars) {
            let newPuzzleSets = [];

            if (constraintVars.numCliqueCircles === undefined) return puzzleSets;

            let numCliqueCirclesLimit = (puzzleSetup.size[0] * puzzleSetup.size[1]);
            if (constraintVars.numCliqueCircles.max !== undefined) numCliqueCirclesLimit = Math.min(numCliqueCirclesLimit, constraintVars.numCliqueCircles.max);
            if (constraintVars.numCliqueCircles.exactly) numCliqueCirclesLimit = constraintVars.numCliqueCircles.exactly;

            let startingNumCliqueCircles = 0;
            if (constraintVars.numCliqueCircles.exactly) startingNumCliqueCircles = constraintVars.numCliqueCircles.exactly;

            for (let numCliqueCircles = startingNumCliqueCircles; numCliqueCircles <= numCliqueCirclesLimit; numCliqueCircles++) {
                let numColorOfCliqueCirclesLimit = constraintVars.numColorOfCliqueCircles.exactly || Math.min(numCliqueCircles, constraintVars.numColorOfCliqueCircles.max || numCliqueCircles);
                for (let numColorOfCliqueCircles = constraintVars.numColorOfCliqueCircles.exactly || Math.min(numCliqueCircles, 1); numColorOfCliqueCircles <= numColorOfCliqueCirclesLimit; numColorOfCliqueCircles++) {
                    let newPuzzleSet = JSON.parse(JSON.stringify(puzzleSets[0]));
                    newPuzzleSet.constraints['numCliqueCircles'] = numCliqueCircles;
                    newPuzzleSet.constraints['numColorOfCliqueCircles'] = numColorOfCliqueCircles;
                    newPuzzleSets.push(newPuzzleSet);
                }
            }

            return newPuzzleSets;

        }

        function generatePuzzleSetsFromPuzzle(puzzleSetup, constraintVars) {

            puzzleSetup.constraints = {}

            let puzzleSets = [{
                constraints: {},
                // constraints: { numCliqueCircles, numColorOfCliqueCircles },
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
                    console.log('puzzle generated from set!');
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
                numBrokenJunctions: puzzleSet.constraints.numBrokenJunctions || 0,
            };
            let puzzleConstraintNames = {
                numMustCrosses: 'mustCrosses',
                numBrokenJunctions: 'brokenJunctions',
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

            let timeStartToGenerateConstraints = performance.now();

            let count = 0;
            // debugger;
            while (puzzleSetsToPopulate.length > 0) {
                count++;
                let puzzleSetToPopulate = puzzleSetsToPopulate.pop(); //currPuzzleSetToPopulate.occupiableSpaces.currGridI

                if (puzzleSetToPopulate.constraints.numMustCrosses || puzzleSetToPopulate.constraints.numBrokenJunctions) {

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
                timeToGenerate: performance.now() - timeStartToGenerateConstraints
            }

            return constraints;
        }
        
        function expandGridConstraints(puzzleSet) {
            
            let constraints = [];
            
            let puzzleSetOnlyWithGridConstraints = JSON.parse(JSON.stringify(puzzleSet));

            let gridConstraints = {
                numCliqueCircles: puzzleSet.constraints.numCliqueCircles || 0,
                numColorOfCliqueCircles: puzzleSet.constraints.numColorOfCliqueCircles || 0,
            };

            let gridConstraintsHash = JSON.stringify(gridConstraints);

            puzzleSetOnlyWithGridConstraints.constraints = gridConstraints;
            
            let puzzleSetsToPopulate = [puzzleSetOnlyWithGridConstraints];
            // debugger;
            if (g.cachedGeneratedConstraints.grids[gridConstraintsHash] !== undefined) {
                g.cachedGeneratedConstraints.grids[gridConstraintsHash].retrievedCount += 1;
                return g.cachedGeneratedConstraints.grids[gridConstraintsHash].constraints;
            }

            let timeStartToGenerateConstraints = performance.now();

            let count = 0;
            // debugger;
            while (puzzleSetsToPopulate.length > 0) {
                count++;
                let puzzleSetToPopulate = puzzleSetsToPopulate.pop(); //currPuzzleSetToPopulate.occupiableSpaces.currGridI

                if (puzzleSetToPopulate.constraints.numCliqueCircles) {

                    for (let i = puzzleSetToPopulate.currGridI; i < occupiableSpaces.grids.length; i++) {

                        let maxColorIForGivenConstraints = 1;

                        if (puzzleSetToPopulate.puzzle.constraints !== undefined && puzzleSetToPopulate.puzzle.constraints.cliqueCircles !== undefined) {
                            maxColorIForGivenConstraints = puzzleSetToPopulate.puzzle.constraints.cliqueCircles.length + 1;
                        }

                        for (let sqColor = 0;
                            sqColor < Math.min(maxColorIForGivenConstraints, puzzleSetToPopulate.constraints.numColorOfCliqueCircles, puzzleSetToPopulate.numUsedColors + 1);
                            sqColor++) {
                            // && currPuzzleSetToPopulate.constraints.numColorOfCliqueCircles === 0
                            let currPuzzleSetToPopulate = JSON.parse(JSON.stringify(puzzleSetToPopulate));

                            let xy = occupiableSpaces.grids[i];
                            if (currPuzzleSetToPopulate.puzzle.constraints.cliqueCircles === undefined) {
                                currPuzzleSetToPopulate.puzzle.constraints.cliqueCircles = [];
                            }
                            currPuzzleSetToPopulate.numUsedColors = Math.max(sqColor + 1, currPuzzleSetToPopulate.numUsedColors);
                            currPuzzleSetToPopulate.puzzle.constraints.cliqueCircles.push([xy[0], xy[1], sqColor]);
                            currPuzzleSetToPopulate.constraints.numCliqueCircles--;
                            currPuzzleSetToPopulate.currGridI = i + 1;
                            if (currPuzzleSetToPopulate.constraints.numCliqueCircles === 0
                                && currPuzzleSetToPopulate.numUsedColors === currPuzzleSetToPopulate.constraints.numColorOfCliqueCircles) {
                                currPuzzleSetToPopulate.constraints.numCliqueCircles = undefined;
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
                timeToGenerate: performance.now() - timeStartToGenerateConstraints
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
    
