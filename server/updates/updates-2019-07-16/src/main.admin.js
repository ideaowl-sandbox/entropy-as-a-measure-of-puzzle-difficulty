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

[0].forEach(() => d3.select('#noES6ModuleLoading').style('display', 'none'))

setTimeout(function(){

    d3.select('#updatesSection').selectAll("*").remove();

    
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
        }, {
            "size": [1, 3],
            "startPosition": [0, 0],
            "endPosition": [1, 3, 1],
            "constraints": {
                "cliqueCircles": [
                    [1, 2, 0],
                    [1, 1, 1]
                ],
                "mustCrosses": [
                    [1, 1.5]
                ],
                "brokenJunctions": [
                    [0.5, 2]
                ]
            }
        }, {
            "size": [1, 3],
            "startPosition": [0, 0],
            "endPosition": [1, 3, 1],
            "constraints": {
                "cliqueCircles": [
                    [1, 2, 0],
                    [1, 1, 1]
                ],
                "mustCrosses": [
                    [1, 1.5]
                ],
                "brokenJunctions": [
                    [0, 3],
                    [1, 0],
                    [0, 1.5]
                ]
            }
        },
        {
            "size": [4, 4],
            "startPosition": [0, 0],
            "endPosition": [1, 4, 1],
            "constraints": {
                "cliqueCircles": [
                    [1, 4, 0], [3, 4, 1], [4, 4, 0],
                    [1, 3, 0], [2, 3, 0], [3, 3, 0], [4, 3, 0],
                    [1, 2, 0], [2, 2, 1], [3, 2, 0], [4, 2, 0],
                    [1, 1, 1], [2, 1, 1], [3, 1, 1], [4, 1, 0]
                ],
                "mustCrosses": [
                    [1, 3.5],
                    [1, 3],
                ],
                "brokenJunctions": [
                    [3, 2],
                    [1, 2.5]
                ]
            }
        },
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
        },
        {
            "size": [3, 3],
            "startPosition": [0, 0],
            "endPosition": [0, 3, 1],
            "constraints": {
                "brokenJunctions": [
                    [0, 1],
                    [2, 2],
                    [3, 0],
                    [1.5, 1],
                    [0.5, 3],
                    [1, 1.5]
                ]
            }
        }
        ]
    };


    d3.select('#updatesSection').append('h3')
        .text('Added Constraints');

    d3.select('#updatesSection').append('p')
        .text('Updated the data structure to allow for additional constraints, then added the "Must Cross" and "Broken Junction" constraints. I call the circles that need to be separated "cliqueCircles".');

    d3.select('#updatesSection').append('b').append('p')
        .text('Note: these puzzles below are interactive, click on them, use arrows or WASD to see how the constraints affect gameplay.');

    let options = { targetElement: '#updatesSection', userInterface: false };
    curriculum.witness_curriculum.forEach(d => new WitnessPuzzle(d, Object.assign({ classed: ['medium'] }, options)))


    d3.select('#updatesSection').append('h3')
        .text('Generating Raw Grids');

    d3.select('#updatesSection').append('p')
        .text('Doesn\'t currently do multiple endpoints for now, leaving that functionality for later iterations.');


    let hiddenPuzzle = new WitnessPuzzle(curriculum.witness_curriculum[4], { render: false })

    let puzzleInstanceRunner = new WitnessPuzzle(curriculum.witness_curriculum[0], { render: false });

    let puzzleGrids = generatePuzzleGrids({
        gridSizes: [[2, 2]],
        allStartingPositions: true

    })

    puzzleGrids.forEach(set => set.puzzles.forEach(d => {
        new WitnessPuzzle(d, Object.assign({ classed: ['small'] }, options));
    }))



    d3.select('#updatesSection').append('h3')
        .text('Generate Paths for Solving');

    d3.select('#updatesSection').append('p')
        .text('This example uses a sample single puzzle and runs through all paths to attempt to solve it.');


    puzzleGrids.forEach(set => set.puzzles.forEach((d, i) => {

        if (i !== 3) return;

        d.constraints = {
            "cliqueCircles": [
                [1, 2, 0],
                // [2, 2, 1],
                [2, 1, 1]
            ],
            "brokenJunctions": [
                [1, 1.5]
            ],
            "mustCrosses": [
                [1, 0.5],
            ],
        }

        let pathAttempts = generateNonCrossingPaths(d);

        pathAttempts.forEach(path => {

            let puzzle = new WitnessPuzzle(d, Object.assign({ classed: ['small'] }, options)); //options { render: false }

            puzzle.setMode('playback');
            let solved = puzzle.attemptSolveWithPath(path);
        })

    }))

    d3.select('#updatesSection').append('p')
        .text('Different starting/end points will result in a different number of possible paths to the end.  Changing the starting point from x=1 to x=0 (below) results in 2 more possible paths to take.');


    puzzleGrids.forEach(set => set.puzzles.forEach((d, i) => {

        if (i !== 3) return;

        d.startPosition = [0,0];

        d.constraints = {
            "cliqueCircles": [
                [1, 2, 0],
                // [2, 2, 1],
                [2, 1, 1]
            ],
            "brokenJunctions": [
                [1, 1.5]
            ],
            "mustCrosses": [
                [1, 0.5],
            ],
        }

        let pathAttempts = generateNonCrossingPaths(d);

        pathAttempts.forEach(path => {

            let puzzle = new WitnessPuzzle(d, Object.assign({ classed: ['small'] }, options)); //options { render: false }

            puzzle.setMode('playback');
            let solved = puzzle.attemptSolveWithPath(path);
        })

    }))



    d3.select('#updatesSection').append('h3')
        .text('Generate Constraints for All Possible "cliqueCircles" Combinations');

    d3.select('#updatesSection').append('p')
        .text('For example, here\'s a 3x2 grid puzzle where we create combinations for 3 "cliqueCircles" with 3 colours.');

    d3.select('#updatesSection').append('p')
        .text('Note that these puzzles may or may not be solvable.');

    puzzleGrids = generatePuzzleGrids({
        gridSizes: [[3, 2]],
        allStartingPositions: false

    })

    // puzzleGrids.forEach(set => set.puzzles.forEach(d => {
    //     if (i !== 6) return;
    //     new WitnessPuzzle(d, Object.assign({ classed: ['small'] }, options));
    // }))
    let puzzleSetsByConstraints = null;

    puzzleGrids.forEach(set => set.puzzles.forEach(d => {

        puzzleSetsByConstraints = generatePuzzlesWithConstraints(d);

        puzzleSetsByConstraints.forEach((puzzleSet, i) => {

            if (i !== 6) return;
            let visualize = false;

            d3.select('#updatesSection').append('pre')
                .text(JSON.stringify(puzzleSet.constraints));


            puzzleSet.puzzles.forEach((d, i) => {

                if (puzzleSet.solutionsDistribution === undefined) {
                    puzzleSet.solutionsDistribution = {};
                }

                let numberOfSolutions = 0;

                new WitnessPuzzle(d, Object.assign({ classed: ['small'] }, options));

            });


        })


    }))



    d3.select('#updatesSection').append('h3')
        .text('Attempting to Solve Different "cliqueCircles" Combinations');

    d3.select('#updatesSection').append('p')
        .text('This shows how "constraint sets" are setup, how many puzzles are generated, and the solve rate for them.  I realize the 0, 0 combination is an error, an edge case to address later.');

    d3.select('#updatesSection').append('p')
        .text('The puzzles shown below are specifically ones that only have a unique solution to them.');



    puzzleGrids.forEach(set => set.puzzles.forEach(d => {


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

            if (hasUniqueSolutionPuzzles) {
                puzzleSet.solutionsDistribution[1].forEach(puzzleSetup => {
                    let puzzle = new WitnessPuzzle(puzzleSetup, Object.assign({ classed: ['small'] }, options)); //options { render: false }                
                })
            }

            let showAllGeneratedPuzzles = false;

            if (showAllGeneratedPuzzles) {
                puzzleSet.puzzles.forEach(puzzleSetup => {
                    let puzzle = new WitnessPuzzle(puzzleSetup, Object.assign({ classed: ['small'] }, options)); //options { render: false }                
                })
            }


        })


    }))


    console.timeEnd("Solving all");


    function generatePuzzlesWithConstraints(puzzleSetup) {
        let constraintVars = {
            numCliqueCircles: {},
            numColorOfCliqueCircles: { max: 3 },
        }

        // Setup all occupiablespaces
        let occupiableSpaces = { junctions: [], grids: [] };
        for (let x = 0; x <= puzzleSetup.size[0]; x += 0.5) {
            for (let y = 0; y <= puzzleSetup.size[1]; y += 0.5) {
                if (x >= 1 && x === Math.round(x) && y >= 1 && y === Math.round(y)) {
                    occupiableSpaces.grids.push([x, y]);
                }
                occupiableSpaces.junctions.push([x, y]);
            }
        }

        let puzzleSets = generateCliqueCirclesForPuzzle(puzzleSetup, constraintVars);

        return puzzleSets;


        function generateCliqueCirclesForPuzzle(puzzleSetup, constraintVars) {
            let puzzleSets = [];

            puzzleSetup.constraints = {}

            let numCliqueCirclesLimit = constraintVars.numCliqueCircles.max || (puzzleSetup.size[0] * puzzleSetup.size[1]);
            for (let numCliqueCircles = 0; numCliqueCircles <= numCliqueCirclesLimit; numCliqueCircles++) {
                let numColorOfCliqueCirclesLimit = Math.min(numCliqueCircles, constraintVars.numColorOfCliqueCircles.max || numCliqueCircles);
                for (let numColorOfCliqueCircles = Math.min(numCliqueCircles, 1); numColorOfCliqueCircles <= numColorOfCliqueCirclesLimit; numColorOfCliqueCircles++) {
                    puzzleSets.push({
                        constraints: { numCliqueCircles, numColorOfCliqueCircles },
                        puzzle: puzzleSetup,
                        currGridI: 0, currJunctionI: 0, numUsedColors: 0,
                        solves: 0, solveAttempts: 0
                    });
                }
            }

            for (let puzzleSet of puzzleSets) {
                puzzleSet.puzzles = expandPuzzlesForPuzzleSets(puzzleSet);
            }

            return puzzleSets;

        }


        function expandPuzzlesForPuzzleSets(puzzleSet) {

            let puzzles = [];
            let puzzleSetsToPopulate = [puzzleSet];
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
                                puzzles.push(currPuzzleSetToPopulate.puzzle);
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

            return puzzles;
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
    
