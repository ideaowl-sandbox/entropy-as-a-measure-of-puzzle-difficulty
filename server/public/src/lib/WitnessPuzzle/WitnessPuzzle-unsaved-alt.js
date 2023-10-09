'use strict'

import WitnessPuzzle_Visualization from './modules/visualization/WitnessPuzzle_Visualization.js';

class WitnessPuzzle {
    constructor(puzzleSetup, options) {
        let self = this;
        let puzzle = self.__setupSelfVariables(puzzleSetup, options);

        if (options !== undefined || (options.render !== undefined && options.render)) {
            self.render(puzzle);
        }

        return self;
    }

    __setupSelfVariables(puzzleSetup, options) {
        let self = this;
        
        // Dealing with events
        self.__events = {
            triggers: {},
            trigger: (event, params) => {
                if( self.__events.triggers[event] ) {
                    for(let i in self.__events.triggers[event] )
                        self.__events.triggers[event][i](params);
                }
            }
        };
        self.on = function(event,callback) {
            if(!self.__events.triggers[event])
                self.__events.triggers[event] = [];
            self.__events.triggers[event].push( callback );
        }        

        self.setNewPuzzle(puzzleSetup, options);

    }

    getExternalID(id) {
        let self = this;
        if (self._state.externalID !== undefined) {
            return self._state.externalID;
        } else {
            return undefined;
        }
    }

    setExternalID(id) {
        let self = this;
        console.log(id);
        let idAlreadyExists = self._state.externalID !== undefined;
        if (idAlreadyExists) {
            if (id !== self._state.externalID) {
                console.error('puzzle\'s unique id is not the same');
                return;
            }
        } else {
            self._state.externalID = id;
        }
    }
    
    setMode(mode) {
        let self = this;
        self._state.mode = mode;
        self._settings.options.promptUserToActivate = false;
        if (mode !== 'replayable') {
            self.deactivate();
        } else {
            self.activate();
        }
    }

    activate(opts) {
        let self = this;
        self._state.active = true;
        console.log(self._settings.id);
        if (self._state.puzzle.history.firstActivatedTime === null) {
            self._state.puzzle.history.firstActivatedTime = new Date().getTime();
        }
        self._settings.options.promptUserToActivate = false;
        self.modules.visualization.render();
        if (opts !== undefined) {
            self.enableInput(false, {forDuration: opts.disableInputForDuration})
        }
    }

    deactivate() {
        let self = this;
        self._state.active = false;
        if (!self._state.puzzle.savedHistory) {
            self._state.puzzle.savedHistory = JSON.parse(JSON.stringify(self._state.puzzle.history));
        }
        // self.modules.visualization.render();
    }    

    loadHistory(history) {
        let self = this;
        self._state.puzzle.savedHistory = history;
        self.__replayHistory({speed: 0})
    }

    reset() {
        let self = this;
        self._state.puzzle.history = {
            firstActivatedTime: null,
            moveAttempts: [],
            lastSnakePosition: JSON.parse(JSON.stringify(self._state.puzzle.setup.startPosition)),
            snakePositions: [JSON.parse(JSON.stringify(self._state.puzzle.setup.startPosition))],
            nextMovesCalculations: []

        }
        if (self.modules.visualization !== null) {
            self.modules.visualization.render();
        }
    }


    addSkipPulse(reason, opts) {
        let self = this;
        self._state.puzzle.history.skipPulses.push({
            reason,
            opts,
            skipPulseTimeFromStart: new Date().getTime() - self._state.puzzle.history.firstActivatedTime
        })
    }

    __createVisualization(params) {
        let self = this;
        self._state.hasVisualization = true;
        self.modules.visualization = new WitnessPuzzle_Visualization(self, params);
    }

    // getData() {
    //     let self = this;
    //     return self._data;
    // }

    render(params) {
        let self = this;
        if (!self._state.hasVisualization) {
            self.__createVisualization(params);
        }
    }

    // Entropy of Boolean random variable
    B(q) {
        if (q === 1 || q === 0) return 0;
        return -1 * (q * Math.log2(q) + (1-q) * Math.log2((1-q)));
    }


    // Entropy of random variable
    H(qs) {
        let hTotal = 0;
        for (let q of qs) {
            if (q === 1 || q === 0) continue;
            hTotal += (q * Math.log2(q))
        }
        return -1 * hTotal;
    }


    HofCurrState() {

    }


    generateAllNonCrossingPaths() {
        let self = this;
        let puzzleSetup = JSON.parse(JSON.stringify(self._state.puzzle.setup));

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

        // if (keep) {
        //     self._state.puzzle.pathInfoGain = {
        //         allEndingPaths: nonCrossingPaths
        //     }
        // }

        return { 
            allEndingPaths: { endingPaths: nonCrossingPaths} ,
            goalTerminatingPaths: { endingPaths: goalTerminatingPaths} 
        };

    }



    generateNonCrossingPaths() {
        let self = this;
        let puzzleSetup = JSON.parse(JSON.stringify(self._state.puzzle.setup));

        if (puzzleSetup.constraints !== undefined) {
            delete puzzleSetup.constraints;
        }


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


    deriveEntropyTrajectory(moveAttemptsWithFinalOutcomes) {
        let self = this;
        self.restartPuzzle();//reset();
        let history = self._state.puzzle.history;

        // Fill out the tree
        let clonedMoveAttemptsWithFinalOutcomes = JSON.parse(JSON.stringify(moveAttemptsWithFinalOutcomes));
        for (let moveAttemptsWithFinalOutcome of clonedMoveAttemptsWithFinalOutcomes) {
            self.entropyTree(moveAttemptsWithFinalOutcome);
        }
        
        // Calculate entropies for all paths
        clonedMoveAttemptsWithFinalOutcomes = JSON.parse(JSON.stringify(moveAttemptsWithFinalOutcomes));
        clonedMoveAttemptsWithFinalOutcomes = self.__sumEntropyTrajectoryForPaths(clonedMoveAttemptsWithFinalOutcomes);
        history.moveAttemptsWithFinalOutcomes = clonedMoveAttemptsWithFinalOutcomes;
        let entropyTrajectory = [];
        clonedMoveAttemptsWithFinalOutcomes.forEach(moveAttemptsObj=> {
            // console.log(moveAttemptsObj.moveAttempts.length - moveAttemptsObj.entropyTrajectory.length)


            for (let i = 0; i < moveAttemptsObj.entropyTrajectory.length; i++) {
                if (entropyTrajectory[i] === undefined) {
                    entropyTrajectory.push(moveAttemptsObj.entropyTrajectory[i]);
                } else {
                    entropyTrajectory[i] += moveAttemptsObj.entropyTrajectory[i];
                }
            }
        })
        history.entropyTrajectory = entropyTrajectory;
    }

    __sumEntropyTrajectoryForPaths(moveAttemptsWithFinalOutcomes) {
        let self = this;
        let history = self._state.puzzle.history;

        for (let moveAttemptsWithFinalOutcome of moveAttemptsWithFinalOutcomes) {
            let tree = self.entropyTree();
            let entropyTrajectory = [];
            let currBranch = tree

            for (let i = 0; i < moveAttemptsWithFinalOutcome.moveAttempts.length - 1; i++) {
                let move = moveAttemptsWithFinalOutcome.moveAttempts[i];
                let numPaths = currBranch.numSolvablePathsFromHere + currBranch.numUnsolvablePathsFromHere;
                currBranch = currBranch.nodes[JSON.stringify(move)];
                let nextMoves = Object.keys(currBranch.nodes);

                if (nextMoves.length > 0) {
                    let entropy = 0;
                    nextMoves.forEach(nextMove => {
                        let nextBranch = currBranch.nodes[nextMove];
                        let nextNumPaths = nextBranch.numSolvablePathsFromHere + nextBranch.numUnsolvablePathsFromHere;
                        entropy += nextNumPaths / numPaths * self.B(nextBranch.numSolvablePathsFromHere / nextNumPaths);
                    })
                    entropyTrajectory.push(entropy);
                } else {
                    if (currBranch.isAFinalMove) {
                        console.log('last')
                        break;
                    } else {
                        debugger;
                    }
                }


            }
            moveAttemptsWithFinalOutcome.entropyTrajectory = entropyTrajectory;
            moveAttemptsWithFinalOutcome.entropyTotal = d3.sum(entropyTrajectory);
            

        }
        history.entropyTotal = moveAttemptsWithFinalOutcomes.reduce((sum, mvObj) => mvObj.entropyTotal + sum, 0);

        return moveAttemptsWithFinalOutcomes;

    }

    activateLivePathInfoGainDerivation() {
        let self = this;
        self._state.puzzle.pathInfoGain = self.generateAllNonCrossingPaths();
        let pathInfoGainObjs = self._state.puzzle.pathInfoGain;


        // Note that this is a one-off way to create a chart of entropy values
        // and has nothing to do with the path infogain derivation.
        let entropyChart = {split: 10000, delta: 0.1, values: [], x: []};
        entropyChart.delta = 1 / entropyChart.split;
        for (let i = 0; i < entropyChart.split; i++) {
            let probability = i * entropyChart.delta;
            entropyChart.values.push(self.B(probability));
            entropyChart.x.push(probability * 100);
        }
        self._state.puzzle.entropyChart = entropyChart;



        for (let [endingPathsName, pathInfoGainObj] of Object.entries(pathInfoGainObjs)) {


            pathInfoGainObj.isEndingSnake = {}

            let generatePathResults = function (endingPath) {
                self.restartPuzzle();
                let solved = self.attemptSolveWithPath(endingPath, { stopAtFailure: false });
                let endSnakePositions = JSON.stringify(self._state.puzzle.history.snakePositions);
                pathInfoGainObj.isEndingSnake[endSnakePositions] = true;
                return {
                    path: endingPath,
                    snakePositions: JSON.parse(endSnakePositions),
                    solved
                }
            }

            // Now get the outcome
            pathInfoGainObj.endingPathResults = pathInfoGainObj.endingPaths.map(generatePathResults);

            pathInfoGainObj.endingPathsBySnakePositionHash = self.createEndingPathLeadingHashes(pathInfoGainObj.endingPathResults);
            // debugger;

        }
        

    }

    createEndingPathLeadingHashes(endingPaths) {

        let self = this;
        let endingsBySnakePositionsHash = {};
        endingPaths.forEach((endingPath) => {
            let snakeSoFar = [];
            endingPath.leadingHashes = [];
            for (let i = 0; i < endingPath.snakePositions.length; i++) {
                snakeSoFar.push(endingPath.snakePositions[i]);
                let leadingHash = JSON.stringify(snakeSoFar);
                endingPath.leadingHashes.push(leadingHash);

                if (endingsBySnakePositionsHash[leadingHash] === undefined) {
                    endingsBySnakePositionsHash[leadingHash] = {
                        endingPaths: [],
                        wins: 0, losses: 0
                    }
                }

                endingsBySnakePositionsHash[leadingHash].endingPaths.push(endingPath);
                endingsBySnakePositionsHash[leadingHash].wins += endingPath.solved === false ? 0 : 1;
                endingsBySnakePositionsHash[leadingHash].losses += endingPath.solved === false ? 1 : 0;
            }
        })
        // console.log(endingsBySnakePositionsHash);
        
        for (let [hash, endingPathObj] of Object.entries(endingsBySnakePositionsHash)) {
            endingPathObj.total = endingPathObj.wins + endingPathObj.losses
            endingPathObj.winRatio = endingPathObj.wins / endingPathObj.total;
            endingPathObj.remainderPart = self.B(endingPathObj.winRatio);
        }

        return endingsBySnakePositionsHash;
    }

    generatePathInfoGainOutcomes() {
        let self = this;
        self.restartPuzzle();
        let history = self._state.puzzle.history;
        let allEndingPathsInfoGain = self._state.puzzle.pathInfoGain.allEndingPaths;



        self._state.puzzle['pathInfoGainOutcomes'] = {
            puzzleEntropy: JSON.parse(JSON.stringify(allEndingPathsInfoGain.currStatus.entropy)),
            puzzleInfoGain: JSON.parse(JSON.stringify(allEndingPathsInfoGain.currStatus.infoGain)),
            summedIGatAllStates: {states: 0, score: 0, positions: []},
            summedIGdownWinnableStates: { states: 0, score: 0, positions: [] },
            summedIGforStatesWithReasonedDownWinnableStates: { states: 0, score: 0, positions: [] },
            summedIGdownReasonedPrunedStates: { states: 0, score: 0, positions: [] },
            summedstateIGforStatesWithReasonedDownWinnableStates: { states: 0, score: 0, positions: [] },
            summedstateIGdownReasonedPrunedStates: { states: 0, score: 0, positions: [] }
        }

        let pathInfoGainOutcomes = self._state.puzzle['pathInfoGainOutcomes'];



        let dirns = [
            { name: 'up', dir: [0, 1] },
            { name: 'right', dir: [1, 0] },
            { name: 'down', dir: [0, -1] },
            { name: 'left', dir: [-1, 0] },
        ];

        let movesStack = [[]];

        while(true) {
            
            // Get moves to make
            let currMoveStack = movesStack.pop();

            // Restart puzzle and make moves
            self.restartPuzzle();

            // Unless it's the first no-move one, attempt moves
            if (currMoveStack.length !== 0) {
                for (let i = 0; i < currMoveStack.length; i++) {
                    self.attemptMove(currMoveStack[i]);
                }
            }

            // Get value at state
            if (isNaN(allEndingPathsInfoGain.currStatus.infoGain)) {
                debugger;
            }
            pathInfoGainOutcomes.summedIGatAllStates.score += allEndingPathsInfoGain.currStatus.infoGain;
            pathInfoGainOutcomes.summedIGatAllStates.states += 1;
            pathInfoGainOutcomes.summedIGatAllStates.positions.push(JSON.stringify(history.snakePositions));

            // Check all forward legal directions and add new direction to move in
            dirns.forEach(dirn => {
                history.possibleMoveOutcomes.forEach(possibleMoveOutcome => {
                    if (JSON.stringify(possibleMoveOutcome.dir) === JSON.stringify(dirn.dir)) {
                        let isForwardLegal = possibleMoveOutcome.outcome.isForwardLegal;
                        if (isForwardLegal && !possibleMoveOutcome.outcome.atEnd) {
                            let newMoveStack = JSON.parse(JSON.stringify(currMoveStack));
                            newMoveStack.push(dirn.dir);
                            movesStack.push(newMoveStack);
                        }
                        // forwardLegalActions += isForwardLegal ? 'a_{' + dirn.name + '}, ' : ''
                        // let canLeadToWin = possibleMoveOutcome.canLeadToWin || false;
                        // winnableActions += canLeadToWin ? 'a_{' + dirn.name + '}, ' : ''
                    }
                })
            })

            if (movesStack.length === 0) {
                break;
            }

        }








        //////////////////////////////////////
        // Winnable States
        //////////////////////////////////////


        movesStack = [[]];

        while (true) {

            // Get moves to make
            let currMoveStack = movesStack.pop();

            // Restart puzzle and make moves
            self.restartPuzzle();

            // Unless it's the first no-move one, attempt moves
            if (currMoveStack.length !== 0) {
                for (let i = 0; i < currMoveStack.length; i++) {
                    self.attemptMove(currMoveStack[i]);
                }
            }

            // Get value at state
            if (isNaN(allEndingPathsInfoGain.currStatus.infoGain)) {
                debugger;
            }
            pathInfoGainOutcomes.summedIGdownWinnableStates.score += allEndingPathsInfoGain.currStatus.infoGain;
            pathInfoGainOutcomes.summedIGdownWinnableStates.states += 1;
            pathInfoGainOutcomes.summedIGdownWinnableStates.positions.push(JSON.stringify(history.snakePositions));

            // Check all forward legal directions and add new direction to move in
            dirns.forEach(dirn => {
                history.possibleMoveOutcomes.forEach(possibleMoveOutcome => {
                    if (JSON.stringify(possibleMoveOutcome.dir) === JSON.stringify(dirn.dir)) {
                        let isForwardLegal = possibleMoveOutcome.outcome.isForwardLegal;
                        let canLeadToWin = possibleMoveOutcome.canLeadToWin || false;
                        if (isForwardLegal && canLeadToWin && !possibleMoveOutcome.outcome.atEnd) {
                            let newMoveStack = JSON.parse(JSON.stringify(currMoveStack));
                            newMoveStack.push(dirn.dir);
                            movesStack.push(newMoveStack);
                        }
                        // forwardLegalActions += isForwardLegal ? 'a_{' + dirn.name + '}, ' : ''
                        // winnableActions += canLeadToWin ? 'a_{' + dirn.name + '}, ' : ''
                    }
                })
            })

            if (movesStack.length === 0) {
                break;
            }

        }









        //////////////////////////////////////
        // summedIGforStatesWithReasonedDownWinnableStates
        //////////////////////////////////////


        movesStack = [[]];

        while (true) {

            // Get moves to make
            let currMoveStack = movesStack.pop();

            // Restart puzzle and make moves
            self.restartPuzzle();

            // Unless it's the first no-move one, attempt moves
            if (currMoveStack.length !== 0) {
                for (let i = 0; i < currMoveStack.length; i++) {
                    self.attemptMove([currMoveStack[i][0], currMoveStack[i][1]]);
                }

                if (currMoveStack[currMoveStack.length - 1]) {
                    pathInfoGainOutcomes.summedIGforStatesWithReasonedDownWinnableStates.score += allEndingPathsInfoGain.currStatus.infoGain;
                    pathInfoGainOutcomes.summedIGforStatesWithReasonedDownWinnableStates.states += 1;
                    pathInfoGainOutcomes.summedIGforStatesWithReasonedDownWinnableStates.positions.push(JSON.stringify(history.snakePositions));
                }
            }
           
            

            // Check all forward legal directions and add new direction to move in
            dirns.forEach(dirn => {
                history.possibleMoveOutcomes.forEach(possibleMoveOutcome => {
                    if (JSON.stringify(possibleMoveOutcome.dir) === JSON.stringify(dirn.dir)) {
                        let isForwardLegal = possibleMoveOutcome.outcome.isForwardLegal;
                        let canLeadToWin = possibleMoveOutcome.canLeadToWin || false;
                        if (isForwardLegal && canLeadToWin && !possibleMoveOutcome.outcome.atEnd) {
                            let outcomesSummary = history.nextMovesCalculations[history.nextMovesCalculations.length - 1];
                            let matchedDirection = false;
                            if (outcomesSummary.possibleOutcomes.reasonedMoves.length !== 0) {
                                for (let j = 0; j < outcomesSummary.possibleOutcomes.reasonedMoves.length; j++) {
                                    if (JSON.stringify(outcomesSummary.possibleOutcomes.reasonedMoves[j]) 
                                        === JSON.stringify(dirn.dir)) {
                                        matchedDirection = true;
                                        break;
                                        }
                                }
                            }
                            let newMoveStack = JSON.parse(JSON.stringify(currMoveStack));
                            newMoveStack.push([dirn.dir[0], dirn.dir[1], matchedDirection]);
                            movesStack.push(newMoveStack);
                        }
                        // forwardLegalActions += isForwardLegal ? 'a_{' + dirn.name + '}, ' : ''
                        // winnableActions += canLeadToWin ? 'a_{' + dirn.name + '}, ' : ''
                    }
                })
            })

            if (movesStack.length === 0) {
                break;
            }

        }
        




        //////////////////////////////////////
        // summedIGdownReasonedPrunedStates
        //////////////////////////////////////


        movesStack = [[]];

        while (true) {

            // Get moves to make
            let currMoveStack = movesStack.pop();

            if (currMoveStack === undefined) break;

            // Restart puzzle and make moves
            self.restartPuzzle();

            // Unless it's the first no-move one, attempt moves
            if (currMoveStack.length !== 0) {
                for (let i = 0; i < currMoveStack.length; i++) {
                    self.attemptMove([currMoveStack[i][0], currMoveStack[i][1]]);
                }

                // if (currMoveStack[currMoveStack.length - 1]) {
                    pathInfoGainOutcomes.summedIGdownReasonedPrunedStates.score += allEndingPathsInfoGain.currStatus.infoGain;
                    pathInfoGainOutcomes.summedIGdownReasonedPrunedStates.states += 1;
                    pathInfoGainOutcomes.summedIGdownReasonedPrunedStates.positions.push(JSON.stringify(history.snakePositions));
                // }
            }


            // Check if even possible to move.  If not, just exit, not new 
            // paths created.
            let outcomesSummary = history.nextMovesCalculations[history.nextMovesCalculations.length - 1];
            let possibleToMove = outcomesSummary.possibleOutcomes.mustMove === 1
                || (outcomesSummary.possibleOutcomes.mustMove === 0 && (outcomesSummary.possibleOutcomes.couldMove > 0));
            if (!possibleToMove) continue;
            

            // Check all forward legal directions and add new direction to move in
            dirns.forEach(dirn => {
                history.possibleMoveOutcomes.forEach(possibleMoveOutcome => {
                    // Once we match the correct direction
                    if (JSON.stringify(possibleMoveOutcome.dir) === JSON.stringify(dirn.dir)) {

                        // If the move hits the end, then don't continue
                        if (possibleMoveOutcome.outcome.atEnd) return;

                        // Should only be one
                        if (outcomesSummary.possibleOutcomes.mustMove === 1) {

                            if (possibleMoveOutcome.mustMove) {
                                let newMoveStack = JSON.parse(JSON.stringify(currMoveStack));
                                newMoveStack.push([dirn.dir[0], dirn.dir[1], true]);
                                movesStack.push(newMoveStack);
                            }

                            return;
                        } else if (possibleMoveOutcome.couldMove) {

                            let newMoveStack = JSON.parse(JSON.stringify(currMoveStack));
                            newMoveStack.push([dirn.dir[0], dirn.dir[1], false]);
                            movesStack.push(newMoveStack);
                        }

                        // forwardLegalActions += isForwardLegal ? 'a_{' + dirn.name + '}, ' : ''
                        // winnableActions += canLeadToWin ? 'a_{' + dirn.name + '}, ' : ''
                    }
                })
            })

            if (movesStack.length === 0) {
                break;
            }

        }



        //////////////////////////////////////
        // summedstateIGforStatesWithReasonedDownWinnableStates
        //////////////////////////////////////


        movesStack = [[]];

        while (true) {

            // Get moves to make
            let currMoveStack = movesStack.pop();

            // Restart puzzle and make moves
            self.restartPuzzle();


            // Unless it's the first no-move one, attempt moves
            if (currMoveStack.length !== 0) {
                for (let i = 0; i < currMoveStack.length; i++) {
                    self.attemptMove([currMoveStack[i][0], currMoveStack[i][1]]);
                }

                if (currMoveStack[currMoveStack.length - 1]) {
                    pathInfoGainOutcomes.summedstateIGforStatesWithReasonedDownWinnableStates.score += allEndingPathsInfoGain.currStatus.previousStateInfoGain;
                    pathInfoGainOutcomes.summedstateIGforStatesWithReasonedDownWinnableStates.states += 1;
                    pathInfoGainOutcomes.summedstateIGforStatesWithReasonedDownWinnableStates.positions.push(JSON.stringify(history.snakePositions));
                }
            }



            // Check all forward legal directions and add new direction to move in
            dirns.forEach(dirn => {
                history.possibleMoveOutcomes.forEach(possibleMoveOutcome => {
                    if (JSON.stringify(possibleMoveOutcome.dir) === JSON.stringify(dirn.dir)) {
                        let isForwardLegal = possibleMoveOutcome.outcome.isForwardLegal;
                        let canLeadToWin = possibleMoveOutcome.canLeadToWin || false;
                        if (isForwardLegal && canLeadToWin && !possibleMoveOutcome.outcome.atEnd) {
                            let outcomesSummary = history.nextMovesCalculations[history.nextMovesCalculations.length - 1];
                            let matchedDirection = false;
                            if (outcomesSummary.possibleOutcomes.reasonedMoves.length !== 0) {
                                for (let j = 0; j < outcomesSummary.possibleOutcomes.reasonedMoves.length; j++) {
                                    if (JSON.stringify(outcomesSummary.possibleOutcomes.reasonedMoves[j])
                                        === JSON.stringify(dirn.dir)) {
                                        matchedDirection = true;
                                        break;
                                    }
                                }
                            }
                            let newMoveStack = JSON.parse(JSON.stringify(currMoveStack));
                            newMoveStack.push([dirn.dir[0], dirn.dir[1], matchedDirection]);
                            movesStack.push(newMoveStack);
                        }
                        // forwardLegalActions += isForwardLegal ? 'a_{' + dirn.name + '}, ' : ''
                        // winnableActions += canLeadToWin ? 'a_{' + dirn.name + '}, ' : ''
                    }
                })
            })

            if (movesStack.length === 0) {
                break;
            }

        }





        //////////////////////////////////////
        // summedstateIGdownReasonedPrunedStates
        //////////////////////////////////////


        movesStack = [[]];

        while (true) {

            // Get moves to make
            let currMoveStack = movesStack.pop();

            if (currMoveStack === undefined) break;

            // Restart puzzle and make moves
            self.restartPuzzle();

            // Unless it's the first no-move one, attempt moves
            if (currMoveStack.length !== 0) {
                for (let i = 0; i < currMoveStack.length; i++) {
                    self.attemptMove([currMoveStack[i][0], currMoveStack[i][1]]);
                }

                // if (currMoveStack[currMoveStack.length - 1]) {
                pathInfoGainOutcomes.summedstateIGdownReasonedPrunedStates.score += allEndingPathsInfoGain.currStatus.previousStateInfoGain;
                pathInfoGainOutcomes.summedstateIGdownReasonedPrunedStates.states += 1;
                pathInfoGainOutcomes.summedstateIGdownReasonedPrunedStates.positions.push(JSON.stringify(history.snakePositions));
                // }
            }


            // Check if even possible to move.  If not, just exit, not new 
            // paths created.
            let outcomesSummary = history.nextMovesCalculations[history.nextMovesCalculations.length - 1];
            let possibleToMove = outcomesSummary.possibleOutcomes.mustMove === 1
                || (outcomesSummary.possibleOutcomes.mustMove === 0 && (outcomesSummary.possibleOutcomes.couldMove > 0));
            if (!possibleToMove) continue;


            // Check all forward legal directions and add new direction to move in
            dirns.forEach(dirn => {
                history.possibleMoveOutcomes.forEach(possibleMoveOutcome => {
                    // Once we match the correct direction
                    if (JSON.stringify(possibleMoveOutcome.dir) === JSON.stringify(dirn.dir)) {

                        // If the move hits the end, then don't continue
                        if (possibleMoveOutcome.outcome.atEnd) return;

                        // Should only be one
                        if (outcomesSummary.possibleOutcomes.mustMove === 1) {

                            if (possibleMoveOutcome.mustMove) {
                                let newMoveStack = JSON.parse(JSON.stringify(currMoveStack));
                                newMoveStack.push([dirn.dir[0], dirn.dir[1], true]);
                                movesStack.push(newMoveStack);
                            }

                            return;
                        } else if (possibleMoveOutcome.couldMove) {

                            let newMoveStack = JSON.parse(JSON.stringify(currMoveStack));
                            newMoveStack.push([dirn.dir[0], dirn.dir[1], false]);
                            movesStack.push(newMoveStack);
                        }

                        // forwardLegalActions += isForwardLegal ? 'a_{' + dirn.name + '}, ' : ''
                        // winnableActions += canLeadToWin ? 'a_{' + dirn.name + '}, ' : ''
                    }
                })
            })

            if (movesStack.length === 0) {
                break;
            }

        }











        console.log(pathInfoGainOutcomes);
        // debugger;

        



    }


    updateCurrPathInfoGain() {
        let self = this;
        let history = self._state.puzzle.history;

        let isAtStart = history.snakePositions.length === 1;

        let outcomesSummary = history.nextMovesCalculations[history.nextMovesCalculations.length - 1];
        
        let numLegalWOConstraints = outcomesSummary.possibleOutcomes.legalWOConstraints2;

        for (let [pathInfoGainType, pathInfoGain] of Object.entries(self._state.puzzle.pathInfoGain)) {

            if (!pathInfoGain.isEndingSnake[JSON.stringify(history.snakePositions)] && numLegalWOConstraints > 0) {

                let possibleSnakeHash = {};

                // Get ending path for next possible moves
                history.possibleMoveOutcomes.filter(d => d.legalWOConstraints2 && d.outcome.crossesPreviousSnakePosition === false)
                    .forEach(possibleMove => {
                        let clonedCurrSnake = JSON.parse(JSON.stringify(history.snakePositions));
                        let lastSnakePosn = clonedCurrSnake[clonedCurrSnake.length - 1];
                        clonedCurrSnake.push([lastSnakePosn[0] + possibleMove.dir[0], lastSnakePosn[1] + possibleMove.dir[1]]);
                        let currPossSnake = JSON.stringify(clonedCurrSnake);
                        possibleSnakeHash[currPossSnake] = pathInfoGain.endingPathsBySnakePositionHash[currPossSnake];
                        // No ending path from here
                        if (possibleSnakeHash[currPossSnake] === undefined) {
                            possibleSnakeHash[currPossSnake] = {
                                wins: 0,
                                losses: 0,
                                total: 0,
                                winRatio: 0.5,
                                remainderPart: 0,
                                infogain: {
                                    partialEntropy: 1,
                                    partialRemainder: 0.5,
                                    partialRemainderNumerator: 1,
                                    partialRemainderDenominator: 2,
                                    weight: 0,
                                    weightNumerator: 0,
                                    weightDenominator: 1
                                }
                            }
                        }
                    })
                let totalPathsByPossibleMoves = Object.values(possibleSnakeHash).reduce(
                    (prev, curr) => prev + curr.total, 0
                );
                let totalWinsByPossibleMoves = Object.values(possibleSnakeHash).reduce(
                    (prev, curr) => prev + curr.wins, 0
                );

                // Path exists
                let endingPathsFound = pathInfoGain.endingPathsBySnakePositionHash[JSON.stringify(history.snakePositions)] !== undefined;

                // Get total possible moves from existing point
                let totalPathsByCurrPath = endingPathsFound ? pathInfoGain.endingPathsBySnakePositionHash[JSON.stringify(history.snakePositions)].total : 0; 

                // Check that total possible next paths match up from current path to next moves
                if (totalPathsByCurrPath !== totalPathsByPossibleMoves) {
                    console.error('total moves from current path, "' + JSON.stringify(history.snakePositions)
                        + '" of ' + totalPathsByCurrPath
                        + ' is not the same as ones from next moves at '
                        + totalPathsByPossibleMoves)
                }


                // Calculate the information gain
                let totalRemainder = 0;
                history.possibleMoveOutcomes.filter(d => d.legalWOConstraints2 && d.outcome.crossesPreviousSnakePosition === false)
                    .forEach(possibleMove => {
                        let clonedCurrSnake = JSON.parse(JSON.stringify(history.snakePositions));
                        let lastSnakePosn = clonedCurrSnake[clonedCurrSnake.length - 1];
                        clonedCurrSnake.push([lastSnakePosn[0] + possibleMove.dir[0], lastSnakePosn[1] + possibleMove.dir[1]]);
                        let currPossSnake = JSON.stringify(clonedCurrSnake);

                        possibleSnakeHash[currPossSnake].infogain = {
                            weightNumerator: possibleSnakeHash[currPossSnake].total,
                            weightDenominator: totalPathsByCurrPath,
                            weight: 0,
                            partialRemainderNumerator: possibleSnakeHash[currPossSnake].wins,
                            partialRemainderDenominator: possibleSnakeHash[currPossSnake].total,
                            partialRemainder: 0,
                            dir: possibleMove.dir
                        }
                        possibleSnakeHash[currPossSnake].infogain.weight =
                            possibleSnakeHash[currPossSnake].infogain.weightNumerator / possibleSnakeHash[currPossSnake].infogain.weightDenominator;
                        possibleSnakeHash[currPossSnake].infogain.partialEntropy =
                            self.B(possibleSnakeHash[currPossSnake].infogain.partialRemainderNumerator / possibleSnakeHash[currPossSnake].infogain.partialRemainderDenominator);
                        possibleSnakeHash[currPossSnake].infogain.partialRemainder =
                            possibleSnakeHash[currPossSnake].infogain.weight * possibleSnakeHash[currPossSnake].infogain.partialEntropy


                        totalRemainder += possibleSnakeHash[currPossSnake].infogain.partialRemainder;
                    })

                
                let previousStateEntropy = 0;

                if (!isAtStart && pathInfoGainType === 'allEndingPaths') {
                    let previousPosition = JSON.parse(JSON.stringify(history.snakePositions));
                    previousPosition.pop();
                    let previousPositionEndingPaths = pathInfoGain.endingPathsBySnakePositionHash[JSON.stringify(previousPosition)];

                    if (previousPositionEndingPaths === undefined) {
                        console.log(JSON.stringify(previousPosition));
                        debugger;
                    }

                    previousStateEntropy = self.B(previousPositionEndingPaths.wins / previousPositionEndingPaths.total);
                }

                pathInfoGain.currStatus = {
                    wins: totalWinsByPossibleMoves,
                    totalPaths: totalPathsByPossibleMoves,
                    entropy: self.B(totalWinsByPossibleMoves / totalPathsByPossibleMoves),
                    remainder: totalRemainder,
                    possibleSnakeHashes: possibleSnakeHash
                }
                
                pathInfoGain.currStatus.infoGain = pathInfoGain.currStatus.entropy - pathInfoGain.currStatus.remainder;
                if (pathInfoGainType === 'allEndingPaths') {
                    pathInfoGain.currStatus.previousStateEntropy = previousStateEntropy;
                    pathInfoGain.currStatus.previousStateInfoGain = pathInfoGain.currStatus.entropy - pathInfoGain.currStatus.previousStateEntropy;
                }
                // console.log(pathInfoGain.currStatus)

            }
        }
    }



    // Initially tried to go down the path of looping through 
    // each point

    // deriveAllPossibleInfoGain() {
    //     let self = this;
    //     self.restartPuzzle(); //reset();
    //     let history = self._state.puzzle.history;
    //     history.allInfoGainTrajectory = [0];
    //     history.allInfoGainTraj = {
    //         possibleActions: [0],
    //         forwardLegalActions: [0],
    //         actionsActuallyTaken: [0]
    //     };
    //     history.totalSolutionsFound = 0;
    //     history.infoGainTrajectory = [0];
    //     history.infoGainTrajectory2 = [0];
    //     history.pathsWithInfoGain2 = [];
    //     history.visitedPaths = [];
    //     history.visitedEndPaths = [];

    //     let moveAttemptsStack = [{
    //         moves: []
    //     }];
    //     while (moveAttemptsStack.length > 0) {

    //         let currMoveObj = moveAttemptsStack.pop();
    //         self.restartPuzzle();

    //         // Go through every move that is on the stack.
    //         // When this algorithm first starts, there 
    //         // are no moves to make.
    //         for (let move of currMoveObj.moves) {
    //             self.attemptMove(move);
    //         }

    //         // Add an extra 0 for the history.allInfoGainTraj[key] array (where 
    //         // key = possibleActions, forwardLegalActions, acttionsActuallyTaken)
    //         // so that the values can be updated
    //         while (currMoveObj.moves.length > history.allInfoGainTraj.possibleActions.length - 1) {
    //             for (let key of Object.keys(history.allInfoGainTraj)) {
    //                 history.allInfoGainTraj[key].push(0);
    //             }
    //         }

    //         // Get the summary of outcomes that are possible from
    //         // the next moves calculations
    //         let outcomesSummary = history.nextMovesCalculations[history.nextMovesCalculations.length - 1];

    //         // Update all the trajectory outcomes.
    //         // Unlike the deriveInfoGainTrajectory, all actions are actually taken, 
    //         // except the ones that end up with a win
    //         history.allInfoGainTraj.possibleActions[currMoveObj.moves.length] += 4;
    //         history.allInfoGainTraj.forwardLegalActions[currMoveObj.moves.length] += outcomesSummary.possibleOutcomes.legalWOConstraints2;
    //         history.allInfoGainTraj.actionsActuallyTaken[currMoveObj.moves.length] +=
    //             (history.isSolved) ? 0 : 1
    //             // (!outcomesSummary.puzzleSolvableConsideringHistory || history.isSolved)
    //             //     ? 0
    //             //     : (outcomesSummary.possibleOutcomes.bothCannotAndMustMove > 0 || outcomesSummary.possibleOutcomes.mustMove > 1)
    //             //         ? 0
    //             //         : (outcomesSummary.possibleOutcomes.mustMove === 1 ? 1 : outcomesSummary.possibleOutcomes.couldMove)


    //         // Remainder is not going to be 0
    //         let remainder = 0;
    //         let numLegalWOConstraints = outcomesSummary.possibleOutcomes.legalWOConstraints2;

    //         // As long as legal moves exist, 
    //         // calculate the information gain.
    //         if (numLegalWOConstraints > 0) {


    //             history.possibleMoveOutcomes.filter(d => d.legalWOConstraints2)
    //                 .forEach(possibleMove => {
    //                     debugger;
    //                     let moveEntropy = self.B(possibleMove.couldMove ? 0.5 : 1);
    //                     remainder += 1 / numLegalWOConstraints * moveEntropy;
    //                 })


    //             if (history.infoGainTrajectory2[currMoveObj.moves.length] === undefined) {
    //                 history.infoGainTrajectory2.push(0);
    //             }
    //             history.infoGainTrajectory2[currMoveObj.moves.length] += (1 - remainder);

    //             // Some info gain exists
    //             if (remainder !== 1) {

    //                 let pathWithInfoGain2 = {
    //                     moves: currMoveObj.moves,
    //                     numLegalWOConstraints,
    //                     possibleMoveOutcomes: history.possibleMoveOutcomes
    //                 }
    //                 history.pathsWithInfoGain2.push(pathWithInfoGain2);
    //             }

    //             let visitedPaths = {
    //                 moves: currMoveObj.moves,
    //                 numLegalWOConstraints,
    //                 possibleMoveOutcomes: history.possibleMoveOutcomes,
    //                 hasInfoGain: remainder !== 1,
    //                 noMoreMoves: !outcomesSummary.puzzleSolvableConsideringHistory,
    //                 solved: history.isSolved
    //             }

    //             history.visitedPaths.push(visitedPaths);

    //             if (visitedPaths.noMoreMoves || history.isSolved) {
    //                 history.visitedEndPaths.push(visitedPaths)
    //             }

    //         } else {
    //             let visitedPaths = {
    //                 moves: currMoveObj.moves,
    //                 hasInfoGain: false,
    //                 noMoreMoves: true,
    //                 solved: history.isSolved
    //             }
    //             history.visitedPaths.push(visitedPaths);

    //             if (visitedPaths.noMoreMoves || history.isSolved) {
    //                 history.visitedEndPaths.push(visitedPaths)
    //             }
    //         }


    //         // If not solvable don't add to it
    //         if (history.isSolved) {
    //             history.totalSolutionsFound += 1;
    //         }

    //         if (!outcomesSummary.puzzleSolvableConsideringHistory || history.isSolved) {
    //             continue;
    //         } else {
    //             let legalNextMoves = [];

    //             if (outcomesSummary.possibleOutcomes.mustMove === 1) {
    //                 legalNextMoves.push(history.possibleMoveOutcomes.filter(d => d.mustMove)[0])
    //             } else {
    //                 history.possibleMoveOutcomes.filter(d => d.couldMove).forEach(legalNextMove => legalNextMoves.push(legalNextMove))
    //             }



    //             // Add possible moves to stack
    //             for (let legalNextMove of legalNextMoves) {
    //                 let newMoveAttemptObj = JSON.parse(JSON.stringify(currMoveObj));
    //                 if (history.allInfoGainTrajectory[newMoveAttemptObj.moves.length] === undefined) {
    //                     history.allInfoGainTrajectory.push(0);
    //                 }
    //                 history.allInfoGainTrajectory[newMoveAttemptObj.moves.length] += 1;
    //                 newMoveAttemptObj.moves.push(legalNextMove.dir);
    //                 moveAttemptsStack.push(newMoveAttemptObj);
    //             }
    //         }

    //     }


    //     history.allInfoGainTraj['playerDiff'] = history.allInfoGainTraj.actionsActuallyTaken.map((d, i) =>
    //         history.allInfoGainTraj['forwardLegalActions'][i] - d
    //     );
    //     history.allInfoGainTrajPlayerDiffTotal = d3.sum(history.allInfoGainTraj['playerDiff']);

    //     history.infoGainTrajectoryTotal = d3.sum(history.infoGainTrajectory);
    //     history.infoGainTrajectoryTotal2 = d3.sum(history.infoGainTrajectory2);
    // }


    deriveInfoGainTrajectory() {
        let self = this;
        self.restartPuzzle(); //reset();
        let history = self._state.puzzle.history;
        history.trajectory = [0];
        history.traj = {
            possibleActions: [0],
            forwardLegalActions: [0],
            actionsActuallyTaken: [0]
        };
        history.totalSolutionsFound = 0;
        history.infoGainTrajectory = [0];
        history.infoGainTrajectory2 = [0];
        history.pathsWithInfoGain2 = [];
        history.visitedPaths = [];
        history.visitedEndPaths = [];

        let moveAttemptsStack = [{
            moves: []
        }];
        while (moveAttemptsStack.length > 0) {

            let currMoveObj = moveAttemptsStack.pop(); 
            self.restartPuzzle(); 

            while (currMoveObj.moves.length > history.traj.possibleActions.length - 1) {
                for (let key of Object.keys(history.traj)) {
                    history.traj[key].push(0);
                }
            }

            for (let move of currMoveObj.moves) {
                self.attemptMove(move);           
            }

            let outcomesSummary = history.nextMovesCalculations[history.nextMovesCalculations.length - 1];

            history.traj.possibleActions[currMoveObj.moves.length] += 4;
            history.traj.forwardLegalActions[currMoveObj.moves.length] += outcomesSummary.possibleOutcomes.legalWOConstraints2;
            history.traj.actionsActuallyTaken[currMoveObj.moves.length] += 
                (!outcomesSummary.puzzleSolvableConsideringHistory || history.isSolved) 
                    ? 0
                    : (outcomesSummary.possibleOutcomes.bothCannotAndMustMove > 0 || outcomesSummary.possibleOutcomes.mustMove > 1)
                        ? 0 
                        : (outcomesSummary.possibleOutcomes.mustMove === 1 ? 1 : outcomesSummary.possibleOutcomes.couldMove)

            let remainder = 0;
            let numLegalWOConstraints = outcomesSummary.possibleOutcomes.legalWOConstraints;
            if (numLegalWOConstraints > 0) {
                history.possibleMoveOutcomes.filter(d => d.legalWOConstraints)
                    .forEach(possibleMove => {
                        remainder += 1 / numLegalWOConstraints * self.B(possibleMove.couldMove ? 0.5 : 1)
                    })
                if (history.infoGainTrajectory[currMoveObj.moves.length] === undefined) {
                    history.infoGainTrajectory.push(0);
                }
                history.infoGainTrajectory[currMoveObj.moves.length] += (1 - remainder);
            }


            remainder = 0;
            numLegalWOConstraints = outcomesSummary.possibleOutcomes.legalWOConstraints2;
            if (numLegalWOConstraints > 0) {


                history.possibleMoveOutcomes.filter(d => d.legalWOConstraints2)
                    .forEach(possibleMove => {
                        let moveEntropy = self.B(possibleMove.couldMove ? 0.5 : 1);
                        remainder += 1 / numLegalWOConstraints * moveEntropy;
                    })


                if (history.infoGainTrajectory2[currMoveObj.moves.length] === undefined) {
                    history.infoGainTrajectory2.push(0);
                }
                history.infoGainTrajectory2[currMoveObj.moves.length] += (1 - remainder);

                // Some info gain exists
                if (remainder !== 1) {

                    let pathWithInfoGain2 = {
                        moves: currMoveObj.moves,
                        numLegalWOConstraints,
                        possibleMoveOutcomes: history.possibleMoveOutcomes
                    }
                    history.pathsWithInfoGain2.push(pathWithInfoGain2);
                }

                let visitedPaths = {
                    moves: currMoveObj.moves,
                    numLegalWOConstraints,
                    possibleMoveOutcomes: history.possibleMoveOutcomes,
                    hasInfoGain: remainder !== 1,
                    noMoreMoves: !outcomesSummary.puzzleSolvableConsideringHistory ,
                    solved: history.isSolved
                }

                history.visitedPaths.push(visitedPaths);

                if (visitedPaths.noMoreMoves || history.isSolved) {
                    history.visitedEndPaths.push(visitedPaths)
                }

            } else {
                let visitedPaths = {
                    moves: currMoveObj.moves,
                    hasInfoGain: false,
                    noMoreMoves: true,
                    solved: history.isSolved
                }
                history.visitedPaths.push(visitedPaths);

                if (visitedPaths.noMoreMoves || history.isSolved) {
                    history.visitedEndPaths.push(visitedPaths)
                }
            }


            // If not solvable don't add to it
            if (history.isSolved) {
                history.totalSolutionsFound += 1;
            }

            if (!outcomesSummary.puzzleSolvableConsideringHistory || history.isSolved) {
                continue;
            } else {
                let legalNextMoves = [];

                if (outcomesSummary.possibleOutcomes.mustMove === 1) {
                    legalNextMoves.push(history.possibleMoveOutcomes.filter(d => d.mustMove)[0])
                } else {
                    history.possibleMoveOutcomes.filter(d => d.couldMove).forEach(legalNextMove => legalNextMoves.push(legalNextMove))
                }



                // Add possible moves to stack
                for (let legalNextMove of legalNextMoves) {
                    let newMoveAttemptObj = JSON.parse(JSON.stringify(currMoveObj));
                    if (history.trajectory[newMoveAttemptObj.moves.length] === undefined) {
                        history.trajectory.push(0);
                    }
                    history.trajectory[newMoveAttemptObj.moves.length] += 1;
                    newMoveAttemptObj.moves.push(legalNextMove.dir);
                    moveAttemptsStack.push(newMoveAttemptObj);
                }
            }

        }
        

        history.traj['playerDiff'] = history.traj.actionsActuallyTaken.map((d, i) =>
            history.traj['forwardLegalActions'][i] - d
        );
        history.trajPlayerDiffTotal = d3.sum(history.traj['playerDiff']);

        history.infoGainTrajectoryTotal = d3.sum(history.infoGainTrajectory);
        history.infoGainTrajectoryTotal2 = d3.sum(history.infoGainTrajectory2);
    }









    deriveTrajectory() {
        let self = this;
        self.restartPuzzle();
        let history = self._state.puzzle.history;
        history.trajectory = [0];
        let moveAttemptsStack = [{
            moves: []
        }];
        while (moveAttemptsStack.length > 0 ) {

            // let currMove = null;
            // // If not the first time, then run through the stack
            // if (!isFirst) {
                
            // }

            let currMoveObj = moveAttemptsStack.shift();
            self.restartPuzzle();
            for (let move of currMoveObj.moves) {
                self.attemptMove(move);
            }

            // If not solvable don't add to it
            let outcomesSummary = history.nextMovesCalculations[history.nextMovesCalculations.length - 1];
            if (!outcomesSummary.puzzleSolvableConsideringHistory || history.isSolved) {
                continue;
            } else {
                let legalNextMoves = [];
                if (outcomesSummary.possibleOutcomes.mustMove === 1) {
                    legalNextMoves.push(history.possibleMoveOutcomes.filter(d => d.mustMove)[0])
                } else {
                    history.possibleMoveOutcomes.filter(d => d.couldMove).forEach(legalNextMove => legalNextMoves.push(legalNextMove))
                }
                for (let legalNextMove of legalNextMoves) {
                    let newMoveAttemptObj = JSON.parse(JSON.stringify(currMoveObj));
                    if (history.trajectory[newMoveAttemptObj.moves.length] === undefined) {
                        history.trajectory.push(0);
                    }
                    history.trajectory[newMoveAttemptObj.moves.length] += 1;
                    newMoveAttemptObj.moves.push(legalNextMove.dir);
                    moveAttemptsStack.push(newMoveAttemptObj);
                }
            }

        }
        history.trajectoryTotal = d3.sum(history.trajectory);
    }

    userQuits() {
        let self = this;
        self._state.puzzle.history.userQuit = true;
        self._state.puzzle.history.endsTimeFromStart = new Date().getTime() - self._state.puzzle.history.firstActivatedTime;
        self.__events.trigger('userQuit', self);
    }

    enableInput(enable = true, { forDuration, cbf }) {
        let self = this;
        self._state.inputEnabled = enable;
        self._state.reenableInputTimer = false;
        if (forDuration && enable === false) {
            self._state.reenableInputTimer = setTimeout(function(){
                self._state.inputEnabled = true;
                if (cbf !== undefined) cbf();
            }, forDuration)
        }
    }

    restartPuzzle(opts) {
        let self = this;
        self.attemptMove([0, 0], opts);
    }

    setNewPuzzle(puzzleSetup, options) {
        let self = this;

        let puzzle = {
            setup: puzzleSetup
        }

        // Setting options
        let defaultOptions = {
            targetSelection: 'body',
            renderImmediateLookAhead: false,
            performImmediateLookAhead: true,
        }

        if (options !== undefined) {
            defaultOptions =  Object.assign(defaultOptions, options);
        }

        if (defaultOptions.render === undefined) defaultOptions.render = true;

        // Generate
        puzzle.__generated = {
            squares: [],
            gridlines: [],
            isEndGame: false
        };

        puzzle.history = {
            firstActivatedTime: null,
            endsTimeFromStart: null,
            numResets: 0,
            attemptErrors: 0,
            isSolved: false,
            userQuit: false,
            skipPulses: [],
            moveAttempts: [],
            lastSnakePosition: JSON.parse(JSON.stringify(puzzle.setup.startPosition)),
            snakePositions: [JSON.parse(JSON.stringify(puzzle.setup.startPosition))],
            nextMovesCalculations: [],
            possibleMoveOutcomes: []
        };

        if (options.pathInfoGain !== undefined) {
            puzzle.pathInfoGain = options.pathInfoGain;
        }

        self._settings = {
            options: defaultOptions,
            id: self.__generateRandomID(10)
        }
        self._state = {
            puzzle: puzzle,
            active: false,
            solved: false,
            inputEnabled: true,
            playback: {
                status: 'inactive',
                timeouts: []
            }
        }
        // self._data = { puzzles: [puzzle] };
        self.modules = {
            visualization: null
        };

        self.calculateImmediateNextMoves({validAddedNewPosition: true});

        if (self._state.puzzle.pathInfoGain !== undefined
            && self._state.puzzle.pathInfoGain.allEndingPaths.endingPathsBySnakePositionHash !== undefined
            && self._state.puzzle.pathInfoGain.goalTerminatingPaths.endingPathsBySnakePositionHash !== undefined) {
            self.updateCurrPathInfoGain();
        }

        if (self._settings.options.render) {

            let expandedFullCannotCrosses = [];
            if (puzzle.setup.constraints && puzzle.setup.constraints.cannotCrosses) {

                let fullCannotCrosses = puzzle.setup.constraints.cannotCrosses.filter(d => d[0] === parseInt(d[0]) && d[1] === parseInt(d[1]))

                fullCannotCrosses.forEach(d => {
                    for (let dir of [[0, 1], [0, -1], [-1, 0], [1, 0]]) {
                        let newX = dir[0] + d[0];
                        let newY = dir[1] + d[1];
                        if (newX >= 0 && newX <= puzzle.setup.size[0] && newY >= 0 && newY <= puzzle.setup.size[1]) {
                            // expandedFullCannotCrosses.push([newX, newY]);
                        }
                    }
                    expandedFullCannotCrosses.push([d[0], d[1]]);
                })
            }
            expandedFullCannotCrosses = expandedFullCannotCrosses.map((d) => d[0] + ' ' + d[1]);


            // vertical lines
            // Generate gridline [x1 y1 x2 y2]
            for (let x = 0; x <= puzzle.setup.size[0]; x++) {
                // puzzle.__generated.gridlines.push([x, 0, x, puzzle.setup.size[1]])
                let startY = null;
                let yBreaks = [];
                if (puzzle.setup.constraints && puzzle.setup.constraints.cannotCrosses) {
                    yBreaks = puzzle.setup.constraints.cannotCrosses.filter(d => d[0] === x && d[1] !== parseInt(d[1]));
                }
                for (let y = 0; y <= puzzle.setup.size[1]; y++) {
                    let isAtCannotCross = expandedFullCannotCrosses.indexOf(x + ' ' + y) > -1;
                    let hasInBetweenBreak = yBreaks.filter(d => d[1] > y && d[1] < y + 1).length > 0;
                    if (!isAtCannotCross) {
                        if (startY === null) {
                            startY = y;
                        }
                        if (hasInBetweenBreak) {
                            puzzle.__generated.gridlines.push([x, startY, x, y + 0.3])
                            startY = y + 0.7;
                        }
                        // Add line at the end of y
                        if (y === puzzle.setup.size[1]) {
                            puzzle.__generated.gridlines.push([x, startY, x, y])
                        }
                    } else {
                        // Add line if this junction is broken
                        if (startY !== null) {
                            puzzle.__generated.gridlines.push([x, startY, x, y - 1])
                            startY = null;
                        }
                    }

                }
            }
            // vertical lines
            // Generate gridline [x1 y1 x2 y2]
            for (let y = 0; y <= puzzle.setup.size[1]; y++) {
                // puzzle.__generated.gridlines.push([x, 0, x, puzzle.setup.size[1]])
                let startX = null;
                let xBreaks = [];
                if (puzzle.setup.constraints && puzzle.setup.constraints.cannotCrosses) {
                    xBreaks = puzzle.setup.constraints.cannotCrosses.filter(d => d[1] === y && d[0] !== parseInt(d[0]));
                }
                for (let x = 0; x <= puzzle.setup.size[0]; x++) {
                    let isAtCannotCross = expandedFullCannotCrosses.indexOf(x + ' ' + y) > -1;
                    let hasInBetweenBreak = xBreaks.filter(d => d[0] > x && d[0] < x + 1).length > 0;
                    if (!isAtCannotCross) {
                        if (startX === null) {
                            startX = x;
                        }
                        if (hasInBetweenBreak) {
                            puzzle.__generated.gridlines.push([startX, y, x + 0.3, y])
                            startX = x + 0.7;
                        }
                        // Add line at the end of y
                        if (x === puzzle.setup.size[0]) {
                            puzzle.__generated.gridlines.push([startX, y, x, y])
                        }
                    } else {
                        // Add line if this junction is broken
                        if (startX !== null) {
                            puzzle.__generated.gridlines.push([startX, y, x - 1, y])
                            startX = null;
                        }
                    }

                }
            }
        }      
        
        return self;
    }


    attemptSolveWithPath(moves, options) {
        let self = this;
        self.restartPuzzle();
        for (let i = 0; i < moves.length; i++) {
            let outcome = self.attemptMove(moves[i], options);
            // if (outcome && outcome.hitCannotCross) {
            //     self._state.inputEnabled = false;
            //     console.log('CANNOT SOLVE');
            //     return false;
            // }
        }
        
        return (self._state.solved ? self._state.puzzle.history.snakePositions.length : false);
    }


    calculateImmediateNextMoves({validAddedNewPosition}) {
        
        let self = this;


        let history = self._state.puzzle.history;

        //validAddedNewPosition


        if (validAddedNewPosition && history.nextMovesCalculations.length > 0) {
            let moveCausesStillSolvable = self.__moveAllowsPuzzleToStillBeSolvable(history.lastSnakePosition);
            let puzzleLastMoveOutcomes = history.nextMovesCalculations[history.nextMovesCalculations.length - 1];
            puzzleLastMoveOutcomes['lastMoveMadeMakesPuzzleStillSolvable'] = moveCausesStillSolvable;
        }

        // if (history.moveAttempts.length === 0) {
        //     history.lastSnakePosition = JSON.parse(JSON.stringify(self._state.puzzle.setup.startPosition));
        //     history.snakePositions = [JSON.parse(JSON.stringify(self._state.puzzle.setup.startPosition))];
        // } 

        let testDirections = [[0,1],[1,0],[0,-1],[-1,0]];

        // Get new positions
        let positionsOutcomesToCalculate = testDirections.map(dir=>{
            return {position: [
                history.lastSnakePosition[0] + dir[0],
                history.lastSnakePosition[1] + dir[1]],
            dir: dir,
            xChange: dir[0] !== 0}
        }).filter(positionOutcomeObj=>!self.__positionIsRetractingMove(positionOutcomeObj.position));

        // 3 outcomes per potential move
        // 1) cannot move into that position
        // 2) must move into that position or cause a fail
        // 3) can move into that position, won't cause a fail

        let possibleOutcomes = {
            cannotMove: 0,
            mustMove: 0,
            couldMove: 0,
            bothCannotAndMustMove: 0,
            legalWOConstraints: 0,
            legalWOConstraints2: 0,
            reasonedMoves: []
        };
        
        history.possibleMoveOutcomes = positionsOutcomesToCalculate.map(positionOutcomeObj => {
            let position = positionOutcomeObj.position;

            positionOutcomeObj['outcome'] = self.__positionOutcomes(position);

            positionOutcomeObj['cannotMove'] = 
                positionOutcomeObj['outcome'].isOutOfBounds || 
                positionOutcomeObj['outcome'].crossesPreviousSnakePosition ||
                positionOutcomeObj['outcome'].violatesCannotCrossFull || 
                positionOutcomeObj['outcome'].violatesCannotCrossPart 

            positionOutcomeObj['legalWOConstraints'] = (!positionOutcomeObj['outcome'].crossesPreviousSnakePosition
                && !positionOutcomeObj['outcome'].isOutOfBounds);

            positionOutcomeObj['legalWOConstraints2'] = (!positionOutcomeObj['outcome'].crossesPreviousSnakePosition
                && !positionOutcomeObj['outcome'].isOutOfBounds && !positionOutcomeObj['outcome'].violatesCannotCrossFull);

            positionOutcomeObj['mustMove'] = positionOutcomeObj['outcome'].fulfillsMustCross
                || positionOutcomeObj['outcome'].fulfillsImmediateRegionConstraints;

            positionOutcomeObj['couldMove'] = !positionOutcomeObj['mustMove'] && !positionOutcomeObj['cannotMove'];
            positionOutcomeObj['bothCannotAndMustMove'] = positionOutcomeObj['mustMove'] && positionOutcomeObj['cannotMove'];
                // positionOutcomeObj['outcome'].isOutOfBounds || 
                // positionOutcomeObj['outcome'].violatesCannotCrossFull || 
                // positionOutcomeObj['outcome'].violatesCannotCrossPart 
            
            if (self._state.puzzle.pathInfoGain !== undefined && self._state.puzzle.pathInfoGain.goalTerminatingPaths.endingPathsBySnakePositionHash !== undefined) {
                let newSnakeStr = JSON.stringify(
                    (JSON.parse(JSON.stringify(history.snakePositions)).concat([[positionOutcomeObj.position[0], positionOutcomeObj.position[1]]])));
                let pathResultsBySnakeHash = self._state.puzzle.pathInfoGain.goalTerminatingPaths.endingPathsBySnakePositionHash;
                let moveCanLeadToWin = pathResultsBySnakeHash[newSnakeStr] !== undefined && pathResultsBySnakeHash[newSnakeStr].wins > 0;
                positionOutcomeObj.canLeadToWin = moveCanLeadToWin;
            }

            possibleOutcomes['cannotMove'] += positionOutcomeObj['cannotMove'] ? 1 : 0;
            possibleOutcomes['couldMove'] += positionOutcomeObj['couldMove'] ? 1 : 0;
            possibleOutcomes['mustMove'] += positionOutcomeObj['mustMove'] ? 1 : 0;
            possibleOutcomes['bothCannotAndMustMove'] += positionOutcomeObj['bothCannotAndMustMove'] ? 1 : 0;
            
            possibleOutcomes['legalWOConstraints'] += positionOutcomeObj['legalWOConstraints'] ? 1 : 0;
            possibleOutcomes['legalWOConstraints2'] += positionOutcomeObj['legalWOConstraints2'] ? 1 : 0;

            // console.log('legal', possibleOutcomes['legalWOConstraints'], possibleOutcomes['legalWOConstraints2'])
            

            return positionOutcomeObj;
        })


        if (validAddedNewPosition) {

            let lastMoveMadeMakesPuzzleStillSolvable = true;
            
            if (history.nextMovesCalculations.length > 0) {
                lastMoveMadeMakesPuzzleStillSolvable = history.nextMovesCalculations[history.nextMovesCalculations.length - 1].lastMoveMadeMakesPuzzleStillSolvable;
            }



            let solvableWithTheseMoves = lastMoveMadeMakesPuzzleStillSolvable
                    && possibleOutcomes.mustMove < 2 
                    && possibleOutcomes.bothCannotAndMustMove === 0
                    && 
                    (possibleOutcomes.mustMove === 1 
                    || (possibleOutcomes.mustMove === 0 && possibleOutcomes.couldMove > 0));

            if (possibleOutcomes.mustMove === 1) {
                possibleOutcomes.reasonedMoves.push(history.possibleMoveOutcomes
                    .filter(possibleMoveOutcome => possibleMoveOutcome.mustMove)[0])
            } 

            // else if (possibleOutcomes.mustMove === 0 && possibleOutcomes.couldMove > 0 
            //            && possibleOutcomes.couldMove > 1) {
            //     possibleOutcomes.reasonedMoves = history.possibleMoveOutcomes
            //         .filter(possibleMoveOutcome => possibleMoveOutcome.couldMove)
            // }

            // if on grid edge and is solvable, fully check 
            if (solvableWithTheseMoves && 
                (history.lastSnakePosition.indexOf(0) > -1 
                || self._state.puzzle.setup.size[0] === history.lastSnakePosition[0]
                || self._state.puzzle.setup.size[1] === history.lastSnakePosition[1])) {

                // console.log('yesssss check on edge')
                solvableWithTheseMoves = self.__gameCheckSplitRegionsSolvable();
                
            }

            history.nextMovesCalculations.push({
                possibleOutcomes,
                solvableWithTheseMoves
            })

            let solvableConsideringHistory = history.nextMovesCalculations.length === 1 ? history.nextMovesCalculations[0].solvableWithTheseMoves : history.nextMovesCalculations[history.nextMovesCalculations.length - 2].puzzleSolvableConsideringHistory;

            if (solvableWithTheseMoves === false) solvableConsideringHistory = false;

            history.nextMovesCalculations[history.nextMovesCalculations.length - 1].puzzleSolvableConsideringHistory = solvableConsideringHistory;

            // console.log(history.nextMovesCalculations[history.nextMovesCalculations.length - 1]);

        }

        // debugger;


        // Outcomes per lookahead (all potential moves considered)
        // 1) none of the moves are possible except for retraction
        // 2) one of the moves must be made to prevent failure <-- more than 1 must moves
        // 3) no move from here will prevent failure



    }


    __positionOutcomes(newPosition) {
        let self = this;
        let outcomes = {
            position: newPosition,
            isOutOfBounds: self.__positionIsOutOfBounds(newPosition),
            isRetractingMove: self.__positionIsRetractingMove(newPosition),
            crossesPreviousSnakePosition: self.__positionCrossesPreviousSnakePosition(newPosition),
            violatesCannotCrossFull: self.__positionViolatesCannotCrossFull(newPosition),
            violatesCannotCrossPart: self.__positionViolatesCannotCrossPart(newPosition),
            fulfillsMustCross: self.__positionFulfillsMustCross(newPosition),
            fulfillsImmediateRegionConstraints: self.__positionFulfillsImmediateRegionConstraints(newPosition),
            atEnd: newPosition[0] === self._state.puzzle.setup.endPosition[0]
                && newPosition[1] === self._state.puzzle.setup.endPosition[1]
        }
        outcomes['isForwardLegal'] = !outcomes.isOutOfBounds 
            && !outcomes.isRetractingMove
            && !outcomes.crossesPreviousSnakePosition
        return outcomes;
    }

    __moveAllowsPuzzleToStillBeSolvable(newPosition) {
        let self = this;
        let history = self._state.puzzle.history;

        let puzzleLastMoveOutcomes = history.nextMovesCalculations[history.nextMovesCalculations.length - 1];

        let puzzleStillSolvable = puzzleLastMoveOutcomes.puzzleSolvableConsideringHistory;

        // If previously determined that the puzzle isn't solvable, no need to figure out 
        // which move was made to cause failure or maintain solvability.
        if (puzzleStillSolvable === false) return false;

        //  If there's a must-move, check that the new position is the mustmove, then return true/false
        if (puzzleLastMoveOutcomes.possibleOutcomes.mustMove > 0)  {
            let newPositionIsMustMove = history.possibleMoveOutcomes.filter(positionOutcomeObj=>
                positionOutcomeObj.position.join(' ') === newPosition.join(' ') 
                && positionOutcomeObj.mustMove).length > 0;
            return newPositionIsMustMove;
        }

        // The new move is a could move
        let newPositionIsCouldMove = history.possibleMoveOutcomes.filter(positionOutcomeObj=>
                positionOutcomeObj.position.join(' ') === newPosition.join(' ') 
                && positionOutcomeObj.couldMove).length > 0;
        return newPositionIsCouldMove;

    }
    __positionIsOutOfBounds(newPosition) {
        let self = this;
        return (newPosition[0] < 0 || newPosition[0] > self._state.puzzle.setup.size[0]
            || newPosition[1] < 0 || newPosition[1] > self._state.puzzle.setup.size[1]) 
    }
    __positionIsRetractingMove(newPosition) {
        let self = this;
        let history = self._state.puzzle.history;
        return (history.snakePositions.length > 1 
            && history.snakePositions[history.snakePositions.length-2].join(' ') === newPosition.join(' '))     
    }
    __positionCrossesPreviousSnakePosition(newPosition) {
        let self = this;
        let history = self._state.puzzle.history;
        return (history.snakePositions.filter(d => JSON.stringify(d) === JSON.stringify(newPosition)).length > 0)     
    }
    __positionViolatesCannotCrossFull(newPosition) {
        let self = this;
        let violates = false;
        if (self._state.puzzle.setup.constraints 
            && self._state.puzzle.setup.constraints.cannotCrosses 
            && self._state.puzzle.setup.constraints.cannotCrosses.filter(d => JSON.stringify(d) === JSON.stringify(newPosition)).length > 0) {
            violates = true;
        }   
        return violates;    
    }
    __positionViolatesCannotCrossPart(newPosition) {
        let self = this;
        let history = self._state.puzzle.history;
        let violates = false;
        if (self._state.puzzle.setup.constraints 
            && self._state.puzzle.setup.constraints.cannotCrosses 
            && self._state.puzzle.setup.constraints.cannotCrosses.filter(d => 
                (d[0] === newPosition[0] // same x, y is in between
                    && (history.lastSnakePosition[1] < d[1] && newPosition[1] > d[1] 
                        || history.lastSnakePosition[1] > d[1] && newPosition[1] < d[1]))
                ||
                (d[1] === newPosition[1] // same y, x is in between
                    && (history.lastSnakePosition[0] < d[0] && newPosition[0] > d[0]
                        || history.lastSnakePosition[0] > d[0] && newPosition[0] < d[0]))

                ).length > 0) {
            violates = true;
        }
        return violates;
    }
    __positionFulfillsMustCross(newPosition) {
        let self = this;
        let history = self._state.puzzle.history;
        let fulfills = false;

        if (self._state.puzzle.setup.constraints 
            && self._state.puzzle.setup.constraints.mustCrosses) {

            for (let j = 0; j < self._state.puzzle.setup.constraints.mustCrosses.length; j++) {
                let mustCrosses = self._state.puzzle.setup.constraints.mustCrosses;
                let xCrossed = mustCrosses[j][0] === newPosition[0];
                let yCrossed = mustCrosses[j][1] === newPosition[1];

                // If the new position is where the must cross is, 
                // this is a junction that could be accessed by other positions
                if (xCrossed && yCrossed) {
                    continue;
                }

                xCrossed = xCrossed 
                    || ((mustCrosses[j][0] > history.lastSnakePosition[0] && mustCrosses[j][0] < newPosition[0])
                      || mustCrosses[j][0] < history.lastSnakePosition[0] && mustCrosses[j][0] > newPosition[0]);
                yCrossed = yCrossed 
                    || ((mustCrosses[j][1] > history.lastSnakePosition[1] && mustCrosses[j][1] < newPosition[1])
                      || (mustCrosses[j][1] < history.lastSnakePosition[1] && mustCrosses[j][1] > newPosition[1]));

                if (xCrossed && yCrossed) {
                    return true;
                }
            }

        }
        return fulfills;
    }
    __positionFulfillsImmediateRegionConstraints(newPosition) {
        let self = this;
        let history = self._state.puzzle.history;
        let fulfills = false;

        if (self._state.puzzle.setup.constraints 
            && self._state.puzzle.setup.constraints.regionConstraints) {
                
            let dirX = newPosition[0] - history.lastSnakePosition[0];
            let dirY = newPosition[1] - history.lastSnakePosition[1];
            let dirXChanged = dirX !== 0;

            if (dirXChanged) {
                let xPos = Math.min(newPosition[0], history.lastSnakePosition[0])+1;
                let aboveRegionConstraint = 
                    self._state.puzzle.setup.constraints
                        .regionConstraints
                        .filter(regionConstraint => regionConstraint[0] === xPos && regionConstraint[1] === newPosition[1] + 1)
                let belowRegionConstraint = 
                    self._state.puzzle.setup.constraints
                        .regionConstraints
                        .filter(regionConstraint => regionConstraint[0] === xPos && regionConstraint[1] === newPosition[1]);
                if (aboveRegionConstraint.length > 0 && belowRegionConstraint.length > 0) {
                    aboveRegionConstraint = aboveRegionConstraint[0];
                    belowRegionConstraint = belowRegionConstraint[0];
                    if (aboveRegionConstraint[2] !== belowRegionConstraint[2]) return true;
                }
            } else {
                let yPos = Math.min(newPosition[1], history.lastSnakePosition[1])+1;
                let aboveRegionConstraint = 
                    self._state.puzzle.setup.constraints
                        .regionConstraints
                        .filter(regionConstraint => regionConstraint[1] === yPos && regionConstraint[0] === newPosition[0] + 1)
                let belowRegionConstraint = 
                    self._state.puzzle.setup.constraints
                        .regionConstraints
                        .filter(regionConstraint => regionConstraint[1] === yPos && regionConstraint[0] === newPosition[0]);
                if (aboveRegionConstraint.length > 0 && belowRegionConstraint.length > 0) {
                    aboveRegionConstraint = aboveRegionConstraint[0];
                    belowRegionConstraint = belowRegionConstraint[0];
                    if (aboveRegionConstraint[2] !== belowRegionConstraint[2]) return true;
                }
            }
            

        }

        return fulfills;
    }



    

    entropyTree({moveAttempts, solvesPuzzle}= {}) {
        let self = this;
        let history = self._state.puzzle.history;

        if (moveAttempts === undefined || solvesPuzzle === undefined) {
            return history.entropyTree;
        }

        if (history.entropyTree === undefined) {
            history.entropyTree = new EntropyTreeNode({moveAttempts, solvesPuzzle});
        } else {
            history.entropyTree.add({moveAttempts, solvesPuzzle})
        }

        return history.entropyTree;

    }


    attemptMove(userMove, opts) {
        
        let self = this;

        if (self._state.inputEnabled === false) return;

        let isPuzzleReset = userMove[0] === 0 && userMove[1] === 0;

        let moveData = {
            userMove: userMove,
            moveTime: self._state.puzzle.history.firstActivatedTime,
            moveTimeFromStart: new Date().getTime() - self._state.puzzle.history.firstActivatedTime
        }

        let puzzle = self._state.puzzle;
        let history = puzzle.history;

        // if (history.moveAttempts.length === 0) {
        //     history.lastSnakePosition = JSON.parse(JSON.stringify(self._state.puzzle.setup.startPosition));
        //     history.snakePositions = [JSON.parse(JSON.stringify(self._state.puzzle.setup.startPosition))];
        // } 

        let newPosition = [
            history.lastSnakePosition[0] + moveData.userMove[0],
            history.lastSnakePosition[1] + moveData.userMove[1]
        ];

        history.lastMoveAttemptedToCrossPosition = false;
        history.lastMoveAttemptedToCrossPartlyBrokenPosition = false;


        let newPositionIsOutOfBounds = false;
        let finishedGame = false;
        let newPositionEntersPartlyCannotCross = false;
        let newPositionEntersFullyCannotCross = false;
        let newPositionEntersPreviousSnakePosition = false;
        let isRetractingMove = false;
        let puzzleSolved = false;

        newPositionIsOutOfBounds = self.__positionIsOutOfBounds(newPosition);
        isRetractingMove = self.__positionIsRetractingMove(newPosition);
        newPositionEntersPreviousSnakePosition = self.__positionCrossesPreviousSnakePosition(newPosition);
        newPositionEntersFullyCannotCross = self.__positionViolatesCannotCrossFull(newPosition);
        newPositionEntersPartlyCannotCross = self.__positionViolatesCannotCrossPart(newPosition);

        if (isPuzzleReset) {
            isRetractingMove = false;
            newPositionEntersPreviousSnakePosition = false;
            newPositionEntersFullyCannotCross = false;
            newPositionEntersPartlyCannotCross = false;
            history.numResets += 1;
            // history.snakePositions = [JSON.parse(JSON.stringify(self._state.puzzle.setup.startPosition))];
            history.snakePositions = [];
            history.lastSnakePosition = JSON.parse(JSON.stringify(self._state.puzzle.setup.startPosition));
            // history.snakePositions = [JSON.parse(JSON.stringify(self._state.puzzle.setup.startPosition))];
            history.nextMovesCalculations = [];
            history.moves = [];
            newPosition = history.lastSnakePosition;
            if (opts !== undefined && opts.byAttemptError) {
                // self.enabledInput(false, 1200);
            }
        }

        let currentlyAtEndPosition = newPosition.join(' ') === puzzle.setup.endPosition[0] + ' ' + puzzle.setup.endPosition[1];


        if (opts && (opts.stopAtFailure || opts.stopAtHitCannotCross)) {
            if (newPositionEntersFullyCannotCross || newPositionEntersPartlyCannotCross) {
                return {notPossibleToSolve: true, hitCannotCross: true};
            }
        }

        puzzle.__generated.isEndGame = false;

        let validAddedNewPosition = false;

        if (isRetractingMove) {
            history.snakePositions.pop();
            history.nextMovesCalculations.pop();
            history.lastSnakePosition = newPosition;

            if (currentlyAtEndPosition) {
                finishedGame = true;
                puzzle.__generated.isEndGame = true;
                puzzleSolved = self.__gameCheckStatus();
            }
        } 
        else {
            if (!newPositionIsOutOfBounds && !newPositionEntersFullyCannotCross) {
                if (!newPositionEntersPreviousSnakePosition && !newPositionEntersPartlyCannotCross) {

                    history.snakePositions.push(newPosition);
                    history.lastSnakePosition = newPosition;

                    validAddedNewPosition = true;
                    
                    if (currentlyAtEndPosition) {
                        finishedGame = true;
                        puzzle.__generated.isEndGame = true;
                        puzzleSolved = self.__gameCheckStatus();
                    }
                } else {
                    history.lastMoveAttemptedToCrossPosition = newPositionEntersPreviousSnakePosition;
                    history.lastMoveAttemptedToCrossPartlyBrokenPosition = newPositionEntersPartlyCannotCross;
                }
            } 
            
        }

        
        self.calculateImmediateNextMoves({validAddedNewPosition});
            

        if (!puzzleSolved) {
            if (opts && opts.stopAtFailure) {
                if (!history.nextMovesCalculations[history.nextMovesCalculations.length - 1].puzzleSolvableConsideringHistory) {
                    return { notPossibleToSolve: true };
                }
            }
        }


        puzzle.__generated.travelsThroughEndpoint = history.snakePositions.map((d) => d.join(' '))
            .filter((d) => d === puzzle.setup.endPosition[0] + ' ' + puzzle.setup.endPosition[1])
            .length > 0;

        self._state.solved = puzzleSolved;
        self._state.puzzle.history.isSolved = puzzleSolved;
        

        // Regardless of whether the move attempt was a 
        // success we'll record it.
        self._state.puzzle.history.moveAttempts.push(moveData);

        if (self.modules.visualization !== null) {
            self.modules.visualization.render();
        }

        // User at the end and it's not solved, and puzzle is to reset on failure
        if (self._settings.options.resetPuzzleOnFailure && !puzzleSolved && currentlyAtEndPosition) {
            self._state.puzzle.history.attemptErrors += 1;
            self.enableInput(false, {forDuration: 1200, cbf: function() {
                self.restartPuzzle({ byAttemptError: true });
                self.__events.trigger('attemptError', self);
            }})
        }


        if (isPuzzleReset) {
            self.__events.trigger('resetted', self);
        }

        if (puzzleSolved) {
            self._state.puzzle.history.endsTimeFromStart = new Date().getTime() - self._state.puzzle.history.firstActivatedTime;
            self.__events.trigger('solved', self);
        }

        if (self._state.puzzle.pathInfoGain !== undefined 
            && self._state.puzzle.pathInfoGain.allEndingPaths.endingPathsBySnakePositionHash !== undefined
            && self._state.puzzle.pathInfoGain.goalTerminatingPaths.endingPathsBySnakePositionHash !== undefined) {
            self.updateCurrPathInfoGain();
        }


    }

    __onFocus() {
        let self = this;
        self.__events.trigger('focus', self);
        if (self._settings.options.moveCB !== undefined) {
            self._settings.options.moveCB(self)
        }
    }

    __onKeyDown(keyDirection) {
        let self = this;
        self.__events.trigger('keydown', keyDirection);
        if (self._settings.options.moveCB !== undefined) {
            self._settings.options.moveCB(self)
        }
    }

    __gameCheckStatus() {
        let self = this;

        self.__groupSquaresTogether();
        return self.__checkIsPuzzleSolved();
    }

    __gameCheckSplitRegionsSolvable() {
        let self = this;

        self.__groupSquaresTogether();
        return self.__checkIsSolvableOnSplitRegions();
    }


    __groupSquaresTogether() {
        let self = this;
        let puzzle = self._state.puzzle;
        let history = puzzle.history;

        puzzle.__generated.squaresToParse = {};
        // Generate hash of areas to check
        for (let row = 1; row <= puzzle.setup.size[1]; row++) {
            for (let col = 1; col <= puzzle.setup.size[0]; col++) {
                puzzle.__generated.squaresToParse[col + ' ' + row] = 1;
            }
        }

        puzzle.__generated.snakeSeparatedGroups = {};
        let groupNumber = 0;
        while (Object.keys(puzzle.__generated.squaresToParse).length > 0) {
            puzzle.__generated.snakeSeparatedGroups[groupNumber] = [];
            let positionToDetermine = Object.keys(puzzle.__generated.squaresToParse)[0].split(' ');
            positionToDetermine[0] = +positionToDetermine[0];
            positionToDetermine[1] = +positionToDetermine[1];
            puzzle.__generated.snakeSeparatedGroups[groupNumber].push(positionToDetermine);
            delete puzzle.__generated.squaresToParse[positionToDetermine.join(' ')]
            self.__determineSquareGroups(positionToDetermine, groupNumber);    
            groupNumber += 1; 
        }


        // if not the end position of the puzzle, then 
        // remove the group that aligns along the edge 
        // of the end position
        if (!puzzle.__generated.isEndGame) {
            let groupKtoRemove = null;
            for (let [k,v] of Object.entries(puzzle.__generated.snakeSeparatedGroups)) {
                for (let positionPair of v) {
                    let endPositionInGroup = (puzzle.setup.endPosition[0] === positionPair[0] && puzzle.setup.endPosition[1] === positionPair[1])
                        || (puzzle.setup.endPosition[0] === positionPair[0] - 1 && puzzle.setup.endPosition[1] === positionPair[1])
                        || (puzzle.setup.endPosition[0] === positionPair[0] && puzzle.setup.endPosition[1] === positionPair[1] - 1)
                        || (puzzle.setup.endPosition[0] === positionPair[0] - 1 && puzzle.setup.endPosition[1] === positionPair[1] - 1)
                    if (endPositionInGroup) {
                        groupKtoRemove = k;
                        break;
                    }
                }
                if (groupKtoRemove !== null) {
                    break;
                }
            }
            if (groupKtoRemove !== null) {
                delete puzzle.__generated.snakeSeparatedGroups[groupKtoRemove];
            }
        }

    }

    __constraintCheckSquares(puzzle, history) {
        let self = this;

        if (puzzle.setup.constraints !== undefined) {

            //////////////
            // Colored Squares
            //////////////

            if (puzzle.setup.constraints.regionConstraints !== undefined && puzzle.setup.constraints.regionConstraints.length !== 0) {

                for (let [k, positionsInGroup] of Object.entries(puzzle.__generated.snakeSeparatedGroups)) {
                    // let sameColor = true;
                    let groupColor = undefined;
                    for (let position of positionsInGroup) {
                        let foundPosition = puzzle.setup.constraints.regionConstraints.filter(d => d[0] === position[0] && d[1] === position[1]);
                        if (foundPosition.length === 0) {
                            // sameColor = true;
                        } else {
                            let positionColor = foundPosition[0][2];
                            if (groupColor === undefined) groupColor = positionColor;
                            if (positionColor !== groupColor) {
                                return false;
                            }
                        }
                    }
                }
            }
        }

        return true;
    }

    __constraintCheckStars(puzzle, history) {
        let self = this;

        if (puzzle.setup.constraints !== undefined) {

            //////////////
            // Stars, or known as suns or sunbursts
            //////////////

            if (puzzle.setup.constraints.stars !== undefined && puzzle.setup.constraints.stars.length !== 0) {
                for (let [k, positionsInGroup] of Object.entries(puzzle.__generated.snakeSeparatedGroups)) {

                    let starsInGroupsByColor = {};

                    for (let position of positionsInGroup) {
                        let foundPosition = puzzle.setup.constraints.stars.filter(d => d[0] === position[0] && d[1] === position[1]);
                        if (foundPosition.length === 0) {

                        } else {
                            let positionColor = foundPosition[0][2];
                            if (starsInGroupsByColor[positionColor] === undefined) starsInGroupsByColor[positionColor] = 0;
                            starsInGroupsByColor[positionColor] += 1;
                            if (starsInGroupsByColor[positionColor] > 2) {
                                return false;
                            }
                        }
                    }


                    if (puzzle.setup.constraints.regionConstraints !== undefined) {
                        for (let position of positionsInGroup) {
                            let foundPosition = puzzle.setup.constraints.regionConstraints.filter(d => d[0] === position[0] && d[1] === position[1]);
                            if (foundPosition.length === 0) {

                            } else {
                                let positionColor = foundPosition[0][2];
                                if (starsInGroupsByColor[positionColor] === undefined) {
                                    // Just ignore if the position color isn't found, doesn't matter
                                } else {
                                    starsInGroupsByColor[positionColor] += 1;
                                    if (starsInGroupsByColor[positionColor] > 2) {
                                        return false;
                                    }
                                }
                            }
                        }

                    }

                    // If any groups only has one star of one color
                    let hasSingleStars = Object.values(starsInGroupsByColor).indexOf(1) > -1;
                    if (hasSingleStars) {
                        return false;
                    }

                }
            }


            return true;
        }
    }


    __checkIsSolvableOnSplitRegions() {
        let self = this;
        let puzzle = self._state.puzzle;
        let history = puzzle.history;

        if (puzzle.setup.constraints !== undefined) {
            if (!self.__constraintCheckSquares(puzzle, history)) return false;
            if (!self.__constraintCheckStars(puzzle, history)) return false;
        }
        return true;
    }

    __checkIsPuzzleSolved() {
        let self = this;
        let puzzle = self._state.puzzle;
        let history = puzzle.history;

        if (puzzle.setup.constraints !== undefined) {


            //////////////
            // Must crosses
            //////////////

            if (puzzle.setup.constraints.mustCrosses !== undefined && puzzle.setup.constraints.mustCrosses.length !== 0) {
                let satisfiedMustCrosses = false;
                let mustCrosses = JSON.parse(JSON.stringify(puzzle.setup.constraints.mustCrosses));

                for (let j = mustCrosses.length - 1; j >= 0; j--) {
                    let mustCrossMatched = false;
                    for (let i = 0; i < puzzle.history.snakePositions.length; i++) {
                        let noNextPosition = i + 1 === puzzle.history.snakePositions.length;
                        let xCrossed = mustCrosses[j][0] === puzzle.history.snakePositions[i][0];
                        let yCrossed = mustCrosses[j][1] === puzzle.history.snakePositions[i][1];
                        if (!noNextPosition) {
                            xCrossed = xCrossed 
                                || ((mustCrosses[j][0] > puzzle.history.snakePositions[i][0] && mustCrosses[j][0] < puzzle.history.snakePositions[i + 1][0])
                                    || mustCrosses[j][0] < puzzle.history.snakePositions[i][0] && mustCrosses[j][0] > puzzle.history.snakePositions[i + 1][0]);
                            yCrossed = yCrossed 
                                || ((mustCrosses[j][1] > puzzle.history.snakePositions[i][1] && mustCrosses[j][1] < puzzle.history.snakePositions[i + 1][1])
                                    || (mustCrosses[j][1] < puzzle.history.snakePositions[i][1] && mustCrosses[j][1] > puzzle.history.snakePositions[i + 1][1]));
                        }
                        if (xCrossed && yCrossed) {
                            mustCrosses.splice(j, 1);
                            mustCrossMatched = true;
                            break;
                        }
                    }
                    if (mustCrossMatched ===  false) {
                        return false
                    }

                }

                // if (mustCrosses.length === 0) {
                //     satisfiedMustCrosses = true;
                // }

                // if (satisfiedMustCrosses === false) return false;
            }


            if (!self.__constraintCheckSquares(puzzle, history)) return false;
            if (!self.__constraintCheckStars(puzzle, history)) return false;


        }


        return true;
    }

    __determineSquareGroups(position, groupNumber) {
        let self = this;
        let puzzle = self._state.puzzle;
        
        // Try all directions
        let testDirections = [[0,1],[1,0],[0,-1],[-1,0]];
        let validDirections = 0;
        for (let testDirection of testDirections) {
            let connectedSquarePosition = self.__squaresAreConnected(position, testDirection);
            if (connectedSquarePosition && typeof puzzle.__generated.squaresToParse[connectedSquarePosition.join(' ')] !== 'undefined') {
                
                puzzle.__generated.snakeSeparatedGroups[groupNumber].push(connectedSquarePosition);
                delete puzzle.__generated.squaresToParse[connectedSquarePosition.join(' ')]
                self.__determineSquareGroups(connectedSquarePosition, groupNumber);
                    
            }
        }
        

    }

    __squaresAreConnected(position, testDirection) {
        let self = this;
        let puzzle = self._state.puzzle;
        let history = puzzle.history;

        let isX = testDirection[0] !== 0;
        let isY = !isX;

        let newPositionX = position[0] + testDirection[0];
        let newPositionY = position[1] + testDirection[1];

        let newPosition = [newPositionX, newPositionY];

        // Out of bounds checking
        if (newPositionX < 1 || newPositionX > puzzle.setup.size[0]) return false;
        if (newPositionY < 1 || newPositionY > puzzle.setup.size[1]) return false;

        // Determine the higher value
        let newPositionIsLarger = false;
        if ((isX && testDirection[0] > 0) || isY && testDirection[1] > 0) {
            newPositionIsLarger = true;
        }

        let lowerPosition = newPositionIsLarger ? position : newPosition;
        // let higherPosition = newPositionIsLarger ? [newPositionX, newPositionY] : position;

        let checkPosition = JSON.parse(JSON.stringify(lowerPosition));
        // Check for neighbouring position
        if (isX) {
            checkPosition[1] -= 1;
        } else {
            checkPosition[0] -= 1;
        }

        // Check if history has connecting state positions
        let hasBlockingSnake = history.snakePositions.filter((pos, i, a)=> {
            if (pos.join(' ') === lowerPosition.join(' ')) {

                // Check left
                if (i > 0) {
                    if (a[i - 1].join(' ') === checkPosition.join(' ')){
                        return true;
                    }
                }

                // Check right
                if (i < a.length - 1) {
                    if (a[i + 1].join(' ') === checkPosition.join(' ')) {
                        return true;
                    }
                }

            }
        }).length > 0;

        if (hasBlockingSnake) return false;

        return newPosition;
        
    }

    __replayHistory(opts) {
        let self = this;

        for (let timerID of self._state.playback.timeouts) {
            clearTimeout(timerID);
        }
        self.deactivate();
        self.setMode('playback');
        if (!self._state.puzzle.savedHistory) {
            self._state.puzzle.savedHistory = JSON.parse(JSON.stringify(self._state.puzzle.history));
        }
        self._state.playback.status = 'active';

        self.reset();

        let originalHistory = self._state.puzzle.savedHistory;

        let i = 0;

        if (originalHistory.moveAttempts === undefined) {
            return;
        }

        for (let moveAttemptObj of originalHistory.moveAttempts) {
            let timeoutDelay = 1000;
            if (opts.speed === 'original') {
                timeoutDelay = moveAttemptObj.moveTimeFromStart;
            } else {
                i++;
                timeoutDelay = i * opts.speed;
            }
            
            self._state.playback.timeouts.push(setTimeout(function(){
                let opts = undefined;
                let isLastMove = originalHistory.moveAttempts[originalHistory.moveAttempts.length - 1] === moveAttemptObj;
                if (isLastMove) {
                    self._state.playback.status = 'complete'
                }

                self.attemptMove(moveAttemptObj.userMove);
            }, timeoutDelay));
        }

    }

    __generateRandomID(length) {
        return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
    }

    __generateInstanceID() {
        let self = this;
        let idIsUnique = false;
        let currID = "";
        while(!idIsUnique) {
            currID = 'witnessPuzzle_' + self.__generateRandomID(5);
            idIsUnique = self._state.hashOfUniqueIDs[currID] === undefined;
        }
        self._state.hashOfUniqueIDs[currID] = false;
        return currID;
    }
}



class EntropyTreeNode {

    constructor({moveAttempts, solvesPuzzle}) {
        let self = this;

        if (moveAttempts.length === 0) {
            console.error('No move for entropy tree')
        }

        this.nodes = {};
        this.numSolvablePathsFromHere = solvesPuzzle ? 1 : 0;
        this.numUnsolvablePathsFromHere = solvesPuzzle ? 0 : 1;

        let move = JSON.stringify(moveAttempts.shift());

        this.isAFinalMove = false;

        if (moveAttempts.length === 0) {
            this.isAFinalMove = true;
            return;
        } else {
            this.nodes[move] = new EntropyTreeNode({moveAttempts, solvesPuzzle});
        }

    }

    branchNodeByMove(move) {
        let self = this;
        return self.nodes[JSON.stringify(move)]
    }


    add({moveAttempts, solvesPuzzle}) {

        let self = this;

        if (moveAttempts === undefined || solvesPuzzle === undefined) {
            return this;
        }

        this.numSolvablePathsFromHere += solvesPuzzle ? 1 : 0;
        this.numUnsolvablePathsFromHere += solvesPuzzle ? 0 : 1;

        if (moveAttempts.length === 0) {
            this.isAFinalMove = true;
            return;
        }
        let move = JSON.stringify(moveAttempts.shift());

        if (this.nodes[move] === undefined) {
            self.nodes[move] = new EntropyTreeNode({ moveAttempts, solvesPuzzle })
        } else {
            self.nodes[move].add({ moveAttempts, solvesPuzzle });
        }


        // if (move === this.move) {
        //     if (self.nodes[JSON.stringify(moveAttempts[0])] === undefined) {
        //         self.nodes[JSON.stringify(moveAttempts[0])] = new EntropyTreeNode({ moveAttempts, solvesPuzzle })
        //     } else {
        //         self.nodes[JSON.stringify(moveAttempts[0])].add({ moveAttempts, solvesPuzzle });
        //     }
        // } else {
        //     if (moveAttempts.length === 0) {
        //         this.isAFinalMove = true;
        //         return;
        //     } else {

        //         if (self.nodes[JSON.stringify(moveAttempts[0])] === undefined) {
        //             self.nodes[JSON.stringify(moveAttempts[0])] = new EntropyTreeNode({ moveAttempts, solvesPuzzle })
        //         } else {
        //             self.nodes[JSON.stringify(moveAttempts[0])].add({ moveAttempts, solvesPuzzle });
        //         }
        //     }
        // }
        
        // if (move === this.move) {
        //     if (self.nodes[JSON.stringify(moveAttempts[0])] === undefined) {
        //         self.nodes[JSON.stringify(moveAttempts[0])] = new EntropyTreeNode({moveAttempts, solvesPuzzle})
        //     } else {
        //         self.nodes[JSON.stringify(moveAttempts[0])].add({moveAttempts, solvesPuzzle});
        //     }
        // } else {
        //     if (moveAttempts.length === 0) {
        //         this.isAFinalMove = true;
        //         return;
        //     } else {

        //         if (self.nodes[JSON.stringify(moveAttempts[0])] === undefined) {
        //             self.nodes[JSON.stringify(moveAttempts[0])] = new EntropyTreeNode({moveAttempts, solvesPuzzle})
        //         } else {
        //             self.nodes[JSON.stringify(moveAttempts[0])].add({moveAttempts, solvesPuzzle});
        //         }
        //     }
        // }
        return self;
    }


}

export default WitnessPuzzle;
