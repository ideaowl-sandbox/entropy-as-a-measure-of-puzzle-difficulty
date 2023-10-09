
const { performance } = require('perf_hooks');
function extractAndAddMeasures(windmillPuzzleMeta) {

  let measures = [
        {   name: 'totalInfoGainTrajectory2',
            val: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.infoGainTrajectoryTotal2
        },
        {   name: 'totalSolutionsFound',
            val: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.totalSolutionsFound
        },
        {   name: 'numVisitedPaths',
            val: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.visitedPaths !== undefined 
                ? windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.visitedPaths.length
                : undefined
        },
        {   name: 'minSolutionEntropy',
            val: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.minSolutionEntropy
        },
        {   name: 'minSolutionEntropy2N0',
            val: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.minSolutionEntropy2N0
        },
        {   name: 'minSolutionEntropy2N1',
            val: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.minSolutionEntropy2N1
        },
        {   name: 'minSolutionEntropy2N2',
            val: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.minSolutionEntropy2N2
        },
        {   name: 'minSolutionEntropy2N2wStraightExits',
            val: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.minSolutionEntropy2N2wStraightExits
        },
        {
            name: 'minSolKLDivergenceEntropy',
            val: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.minSolKLDivergenceEntropy
        },
        {
            name: 'minSolKLDivergenceEntropyWithPruningAndN0',
            val: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.minSolKLDivergenceEntropyWithPruningAndN0
        },
        {
            name: 'minSolKLDivergenceEntropyWithPruningAndN1',
            val: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.minSolKLDivergenceEntropyWithPruningAndN1
        },
        {
            name: 'minSolKLDivergenceEntropyWithPruningAndN2',
            val: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.minSolKLDivergenceEntropyWithPruningAndN2
        },
        {
            name: 'minSolKLDivergenceEntropyWithPruningAndN5',
            val: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.minSolKLDivergenceEntropyWithPruningAndN5
        },
        {   name: 'minSolutionSavedEntropy',
            val: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.minSolutionSavedEntropy
        },
        {   name: 'minSolutionCatEntropy',
            val: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.minSolutionCatEntropy
        },
        {   name: 'numVisitedPathsWithInfoGain',
            val: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.visitedPaths !== undefined
                ? windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.visitedPaths.filter(visitedPath => visitedPath['hasInfoGain']).length
                : undefined
                
        },
        {   name: 'upvotes',
            val: windmillPuzzleMeta.upvotes
        },
        {   name: 'solves',
            val: windmillPuzzleMeta.solves
        },
        {   name: 'playerDiffTotal',
            val: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.trajPlayerDiffTotal
        },
        {   name: 'minLast3SolutionEntropy2N2wStraightExits',
            val: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.minLast3SolutionEntropy2N2wStraightExits
        },
        {   name: 'solnsNumOf',
            val: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.solnsNumOf
        },
        {   name: 'solnsAvgLength',
            val: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.solnsAvgLength
        },
        {   name: 'solnsAvgLengthFromMinLast3',
            val: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.solnsAvgLengthFromMinLast3
        },
        {   name: 'solnsLengthFromMinEntropy',
            val: windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.solnsLengthFromMinEntropy
        }
    ]

    let measureValsByName = {}
    measures.forEach(measureOb => { measureValsByName[measureOb.name] = +measureOb.val })
    const traj = windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.traj;
    return { measures, measureValsByName, traj }
}




function generateAllNonCrossingPaths(puzzleSetup) {
    let self = this;

    if (puzzleSetup.constraints !== undefined) {
        delete puzzleSetup.constraints;
    }

    let nonCrossingPaths = [];
    let goalTerminatingPaths = [];
    let moveAttempts = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    let startPathToExplore = { moves: [], pathSoFar: [], crossedHash: {} };
    startPathToExplore.crossedHash[puzzleSetup.startPosition.join(' ')] = true;
    startPathToExplore.pathSoFar.push(puzzleSetup.startPosition);
    //puzzleSetup.startPosition.join(' ')

    let pathsToExplore = [startPathToExplore];

    while (pathsToExplore.length > 0) {
        let pathToExplore = pathsToExplore.pop();

        let pathsToExploreFromHere = [];

        ////////////////////////////////////////////
        //  Look for dead end
        ////////////////////////////////////////////
        let deadEndWOConsideringConstraints = true;
        let potentialPathToExplore = JSON.parse(JSON.stringify(pathToExplore));
        let lastPosition = potentialPathToExplore.pathSoFar[potentialPathToExplore.pathSoFar.length - 1];
        for (let j = 0; j < moveAttempts.length; j++) {
            let possibleX = lastPosition[0] + moveAttempts[j][0];
            let possibleY = lastPosition[1] + moveAttempts[j][1];
            let possiblePositionHash = [possibleX, possibleY].join(' ');

            let possibleMoveWithinBorders = possibleX >= 0 && possibleX <= puzzleSetup.size[0]
                && possibleY >= 0 && possibleY <= puzzleSetup.size[1];

            if (possibleMoveWithinBorders && pathToExplore.crossedHash[possiblePositionHash] === undefined) {
                deadEndWOConsideringConstraints = false;
                break;
            }
        }
        if (deadEndWOConsideringConstraints) {
            nonCrossingPaths.push(potentialPathToExplore.moves);
            continue
        }
        ////////////////////////////////////////////

        for (let i = 0; i < moveAttempts.length; i++) {
            let potentialPathToExplore = JSON.parse(JSON.stringify(pathToExplore));
            let lastPosition = potentialPathToExplore.pathSoFar[potentialPathToExplore.pathSoFar.length - 1];
            let newX = lastPosition[0] + moveAttempts[i][0];
            let newY = lastPosition[1] + moveAttempts[i][1];
            let newPosition = [newX, newY];
            let newPositionHash = newPosition.join(' ');

            let gotToTheEnd = newX === puzzleSetup.endPosition[0] && newY === puzzleSetup.endPosition[1];

            let withinBorders = newX >= 0 && newX <= puzzleSetup.size[0]
                && newY >= 0 && newY <= puzzleSetup.size[1];


            if (gotToTheEnd) {
                potentialPathToExplore.moves.push(moveAttempts[i]);
                nonCrossingPaths.push(potentialPathToExplore.moves);
                goalTerminatingPaths.push(potentialPathToExplore.moves);
            } else {


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

    return {
        allEndingPaths: { endingPaths: nonCrossingPaths },
        goalTerminatingPaths: { endingPaths: goalTerminatingPaths }
    };

}



function convertWindmillPuzzleMetaToEugenePuzzleMeta(windMillPuzzleMeta) {

    // Note puzzles are assumed to:
    //  - only contain regionConstraints, mustCrosses, cannotCrosses
    //  - no symmetry
    //  - only one entrace/exit

    let eugenePuzzleMeta = {}
    let p = JSON.parse(JSON.stringify(windMillPuzzleMeta))
    eugenePuzzleMeta['size'] = [p['windmillData'].width, p['windmillData'].height];

    if (p['windmillDataRepr'] === null) { 
        return null;
    }

    const wmStarts = p['windmillDataRepr'].filter(d => d.type === 3);
    if (wmStarts.length > 1) return null // only want single start puzzles
    let wmStart = p['windmillDataRepr'].filter(d => d.type === 3)[0];
    eugenePuzzleMeta['startPosition'] = [wmStart.i, eugenePuzzleMeta['size'][1] - wmStart.j];

    const wmEnds = p['windmillDataRepr'].filter(d => d.type === 4);
    if (wmEnds.length > 1) return null // only want single end puzzles
    let wmEnd = wmEnds[0];
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


        // if the constraint contains an unaccountable constraint
        let unaccountedConstraint = [0,8,9,10, 11].indexOf(ent.type) > -1;
        if (unaccountedConstraint) {
            return null;
        }

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

        // if (ent.type === 11) {
        //     if (eugenePuzzleMeta['constraints']['triangles'] === undefined) {
        //         eugenePuzzleMeta['constraints']['triangles'] = [];
        //     }
        //     eugenePuzzleMeta['constraints']['triangles'].push([
        //         ent.i + 1, eugenePuzzleMeta['size'][1] - ent.j,
        //         ent.extras.count
        //     ])
        // }



    }


    return eugenePuzzleMeta;
}

function generatePuzzlesWithConstraints(puzzleSetup, occupiableSpaces, g, samplePerNum, maxPuzzlesToGenerate, constraintVars) {

    let puzzleSets = generatePuzzleSetsFromPuzzle(puzzleSetup);
    puzzleSets = generateRegionConstraintsForPuzzle(puzzleSets, puzzleSetup, constraintVars);
    puzzleSets = generateMustCrossSets(puzzleSets, puzzleSetup, constraintVars);
    puzzleSets = generateBrokenJunctionSets(puzzleSets, puzzleSetup, constraintVars);
    let actualPuzzlesAdded = 0;

    console.log('generated combinations of sets, expanding next...');


    for (let puzzleSet of puzzleSets) {
        if (actualPuzzlesAdded >= maxPuzzlesToGenerate) break;
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
        let numPuzzles = 0;

        // console.log(puzzleSet.constraints)
        // console.log({ junctionConstraints, gridConstraints})
        // debugger;

        if (gridConstraints.length === 0) gridConstraints = [{}];
        if (junctionConstraints.length === 0) junctionConstraints = [{}];

        for (let i = 0; i < gridConstraints.length; i++) {
            for (let j = 0; j < junctionConstraints.length; j++) {
                let newPuzzle = JSON.parse(JSON.stringify(puzzleSet.puzzle));
                newPuzzle.constraints = Object.assign({}, gridConstraints[i], junctionConstraints[j]);
                numPuzzles++;
                // console.log('puzzle generated from set!');

                if (numPuzzles % samplePerNum === 0) {
                    if (actualPuzzlesAdded >= maxPuzzlesToGenerate) return puzzles;
                    actualPuzzlesAdded++
                    console.log(actualPuzzlesAdded + '/' + maxPuzzlesToGenerate + ' added from ' + numPuzzles + ' puzzles')
                    puzzles.push(newPuzzle);
                }
                
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

        let timeStartToGenerateConstraints = performance.now();

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
            timeToGenerate: performance.now() - timeStartToGenerateConstraints
        }

        return constraints;
    }
}



module.exports = { extractAndAddMeasures, generateAllNonCrossingPaths, generatePuzzlesWithConstraints, convertWindmillPuzzleMetaToEugenePuzzleMeta }