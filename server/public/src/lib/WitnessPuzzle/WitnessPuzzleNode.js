'use strict'

// import WitnessPuzzle_Visualization from './modules/visualization/WitnessPuzzle_Visualization.js';

class WitnessPuzzle {
    constructor(puzzleSetup, options) {
        let self = this;
        let puzzle = self.__setupSelfVariables(puzzleSetup, options);

        if (options !== undefined && options.render !== undefined && options.render) {
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

    setOption(key, val) {
        let self = this;
        self._settings.options[key] = val;
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

    Hpartial(probability) {
        return -1 * probability * Math.log2(probability);
    }

    HByAnyNumOutcomes(numOutcomes) {
        let outcomesArr = [];
        for (let i = 0; i < numOutcomes; i++) {
            outcomesArr.push(1/numOutcomes);
        }
        return this.H(outcomesArr);
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
                        // console.log('last')
                        break;
                    } else {
                        debugger;
                    }
                }


            }
            moveAttemptsWithFinalOutcome.entropyTrajectory = entropyTrajectory;
            moveAttemptsWithFinalOutcome.entropyTotal = entropyTrajectory.reduce((partialSum, a) => partialSum + a, 0);
            

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











        // console.log(pathInfoGainOutcomes);
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



    deriveAllPossibleInfoGain() {

        let self = this;
        self.restartPuzzle(); //reset();
        let history = self._state.puzzle.history;
        history.solutions = []
        history.trajectory = [0];

        let moveAttemptsStack = [{
            moves: []
        }];
        while (moveAttemptsStack.length > 0) {

            let currMoveObj = moveAttemptsStack.pop();
            self.restartPuzzle();

            // Attempt all moves that exist within the set of moves
            // for the given path of the puzzle under moveAttemptsStack
            // Note that at puzzle start, no moves are provided, so no
            // attempted moves are made.
            for (let move of currMoveObj.moves) {
                self.attemptMove(move);
            }

            let outcomesSummary = history.nextMovesCalculations[history.nextMovesCalculations.length - 1];

            // outcomesSummary.reasonedMoves

            // const possibleOutcomes = outcomesSummary.possibleOutcomes;
            // let numLegalMoves = possibleOutcomes.legalWOConstraints2;


            // If solved or not solvable, the go next, otherwise...
            if (!outcomesSummary.puzzleSolvableConsideringHistory || history.isSolved) {

                // Add solutions
                if (history.isSolved) history.solutions.push(currMoveObj)
                continue;
            } else {
                // ... determine the next moves to add for the stack
                let legalNextMoves = [];

                // Either mustmove or add all couldmoves
                if (outcomesSummary.possibleOutcomes.mustMove === 1) {
                    legalNextMoves.push(history.possibleMoveOutcomes.filter(d => d.mustMove)[0])
                } else {
                    history.possibleMoveOutcomes.filter(d => d.couldMove).forEach(legalNextMove => legalNextMoves.push(legalNextMove))
                }

                // Add possible moves to stack
                for (let legalNextMove of legalNextMoves) {
                    let newMoveAttemptObj = JSON.parse(JSON.stringify(currMoveObj));

                    // Add trajectory of number of movies
                    if (history.trajectory[newMoveAttemptObj.moves.length] === undefined) {
                        history.trajectory.push(0);
                    }
                    history.trajectory[newMoveAttemptObj.moves.length] += 1;

                    newMoveAttemptObj.moves.push(legalNextMove.dir);
                    moveAttemptsStack.push(newMoveAttemptObj);
                }
            }

        }



        for (let solution of history.solutions) {
            solution.totalEntropy = 0;
            self.restartPuzzle();

            // Attempt all moves that exist within the set of moves
            // for the given path of the puzzle under moveAttemptsStack
            // Note that at puzzle start, no moves are provided, so no
            // attempted moves are made.
            for (let move of solution.moves) {

                let outcomesSummary = history.nextMovesCalculations[history.nextMovesCalculations.length - 1];
                const possibleOutcomes = outcomesSummary.possibleOutcomes;
                let numLegalMoves = possibleOutcomes.legalWOConstraints2;

                // Let pick a mustMove
                let mustMovePicked = (possibleOutcomes.mustMove - possibleOutcomes.bothCannotAndMustMove) === 1;

                let entropyFaced = mustMovePicked ? 0 : self.HByAnyNumOutcomes(numLegalMoves);

                if (!history.isSolved) {
                    solution.totalEntropy += entropyFaced;
                }


                self.attemptMove(move);
            }
        }

        history.solutions = history.solutions.sort((a,b) => a.totalEntropy - b.totalEntropy)
        // console.log(history.solutions)


        history.minSolutionEntropy = history.solutions[0].totalEntropy;



        // // Note that all history and trajectories here are of a puzzle
        // // by this point completely explored (though only taken winnable paths),
        // // and trajectories are not reflective of outcomes from a state and 
        // // multiple actions, but of all states.  In short, ordering here 
        // // wont' make much sense.
        // history.traj['playerDiff'] = history.traj.actionsActuallyTaken.map((d, i) =>
        //     history.traj['forwardLegalActions'][i] - d
        // );
        // history.trajPlayerDiffTotal = d3.sum(history.traj['playerDiff']);

        // history.infoGainTrajectoryTotal = d3.sum(history.infoGainTrajectory);
        // history.infoGainTrajectoryTotal2 = d3.sum(history.infoGainTrajectory2);



    }



    policyPaths(opts) {
        let self = this;
        const history = self._state.puzzle.history;

        if (opts !== undefined) {

            if (opts.POLCstraightToExit) {                
                history.POLCstraightToExitPaths = self.POLCstraightToExit();
            }
            
        }

    }


    POLCstraightToExit() {
        let self = this;
        const history = self._state.puzzle.history;
        const lastSnakePosition = history.lastSnakePosition;
        const endPosition = self._state.puzzle.setup.endPosition;

        if (JSON.stringify(lastSnakePosition) === JSON.stringify([endPosition[0],endPosition[1]])) {
            return []
        }

        let paths = self.straightPathGenerator(lastSnakePosition, endPosition);

        // Filtering for valid paths
        paths.paths = paths.paths.map(path => self.pathValidatorWithDecisionNullification(path))
        return paths;

    }

    pathValidatorWithDecisionNullification(moves) {
        let self = this;
        const history = self._state.puzzle.history;
        let snakePositions = JSON.parse(JSON.stringify(history.snakePositions));

        for (let i = 0; i < moves.length; i++) {
            let lastSnakePosition = snakePositions[snakePositions.length - 1];

            let newPosition = [lastSnakePosition[0] + moves[i][0], lastSnakePosition[1] + moves[i][1]];

            let newPositionIsOutOfBounds = false;
            let newPositionEntersFullyCannotCross = false;
            let newPositionEntersPartialCannotCross = false;
            let newPositionEntersPreviousSnakePosition = false;
            let isRetractingMove = false;

            newPositionIsOutOfBounds = self.__positionIsOutOfBounds(newPosition);
            newPositionEntersFullyCannotCross = self.__positionViolatesCannotCrossFull(newPosition);
            newPositionEntersPartialCannotCross = self.__positionViolatesCannotCrossPart(newPosition, lastSnakePosition);
            newPositionEntersPreviousSnakePosition = self.__positionCrossesPreviousSnakePosition(newPosition, snakePositions);
            isRetractingMove = self.__positionIsRetractingMove(newPosition, snakePositions);

            const invalid = newPositionIsOutOfBounds 
                || newPositionEntersFullyCannotCross 
                || newPositionEntersPartialCannotCross
                || newPositionEntersPreviousSnakePosition
                || isRetractingMove;

            if (invalid) {
                return {path: moves, valid: !invalid}
            }

            snakePositions = snakePositions.concat([newPosition]);

            
        }



        


        return { path: moves, valid: true };
    }



    straightPathGenerator(startPosition, endPosition) {
        let self = this;
        let paths = [];

        const xIsSameLine = Math.abs(startPosition[0] - endPosition[0]) === 0;
        const yIsSameLine = Math.abs(startPosition[1] - endPosition[1]) === 0;

        const xAndYIsSameLine = xIsSameLine && yIsSameLine;

        // You're already at the end point!
        if (xAndYIsSameLine) return []

        // Straight lines are simplest
        if (xIsSameLine || yIsSameLine) {
            paths = {
                paths: self.GENstraightLinePath(xIsSameLine ? 0 : 1, startPosition, endPosition),
                from: 'straightLinePath'
            };
            return paths;
        }
        

        // Straight zig-zags
        const xySameDistance = Math.abs(startPosition[0] - endPosition[0]) === Math.abs(startPosition[1] - endPosition[1]);
        if (xySameDistance) {
            paths = {
                paths: self.GENstraightZigZags(startPosition, endPosition),
                from: 'zigZagPaths'
            };
            return paths;
        }


        // OneStraightCombo: either x or y is 1 off, then straight line.  Will mirror, have 2 paths.
        const xIsOneOff = Math.abs(startPosition[0] - endPosition[0]) === 1;
        const yIsOneOff = Math.abs(startPosition[1] - endPosition[1]) === 1;

        if (xIsOneOff || yIsOneOff) {
            paths = {
                paths: self.GENoneThenOrFirstStraightPaths(xIsOneOff ? 0 : 1, startPosition, endPosition),
                from: 'oneThenOrFirstStraightPaths'
            };
            return paths;
        }


        // TakeLongerStraights
        const xIsShorter = Math.abs(startPosition[0] - endPosition[0]) <= Math.abs(startPosition[1] - endPosition[1]);
        paths = {
            paths: self.GENtakeLongerStraightsPaths(xIsShorter ? 0 : 1, startPosition, endPosition),
            from: 'takeLongerStraightsPaths'
        };
        return paths;

    }

    GENtakeLongerStraightsPaths(shortIndex, startPosition, endPosition) {
        const longIndex = (shortIndex + 1) % 2;
        const movesLength = Math.abs(endPosition[longIndex] - startPosition[longIndex]);
        const shortIndexLength = Math.abs(endPosition[shortIndex] - startPosition[shortIndex]);

        // Directions of x and y, though, are not.
        const movesXPos = (endPosition[0] - startPosition[0]) > 0;
        const movesYPos = (endPosition[1] - startPosition[1]) > 0;
        const shortIndexPos = shortIndex === 0 ? movesXPos : movesYPos;
        const longIndexPos = longIndex === 0 ? movesXPos : movesYPos;

        let allPaths = [];
        for (let j = 1; j < shortIndexLength; j++) {

            let moves = [];

            // Do up to j moves first
            for (let k = 0; k < j; k++) {
                let currMove = [0, 0];
                currMove[shortIndex] = shortIndexPos ? 1 : -1;
                moves = [currMove].concat(moves);
            }

            // Do straight moves 
            for (let i = 0; i < movesLength; i++) {
                let currMove = [0, 0];
                currMove[longIndex] = longIndexPos ? 1 : -1;
                moves = [currMove].concat(moves);
            }

            // Do remaining short moves
            for (let k = j; k < shortIndexLength; k++) {
                let currMove = [0, 0];
                currMove[shortIndex] = shortIndexPos ? 1 : -1;
                moves = [currMove].concat(moves);
            }

            // Finally add the moves
            allPaths = [moves].concat(allPaths)
        }
        return allPaths;
    }

    GENoneThenOrFirstStraightPaths(oneOffIndex, startPosition, endPosition) {
        const longIndex = (oneOffIndex + 1) % 2;
        const movesLength = Math.abs(endPosition[longIndex] - startPosition[longIndex]);

        // Directions of x and y, though, are not.
        const movesXPos = (endPosition[0] - startPosition[0]) > 0;
        const movesYPos = (endPosition[1] - startPosition[1]) > 0;

        let allPaths = [];

        for (let moveOneOffFirst = 0; moveOneOffFirst < 2; moveOneOffFirst++) {
            let moves = [];
            // Do straight moves first, then decide to put one off first or last
            for (let i = 0; i < movesLength; i++) {
                let currMove = [0, 0];
                if (longIndex === 0) {
                    currMove[longIndex] = movesXPos ? 1 : -1;
                } else {
                    currMove[longIndex] = movesYPos ? 1 : -1;
                }
                moves = [currMove].concat(moves);
            }

            // Now add one off move to the first or last
            let oneOffMove = [0, 0];
            if (oneOffIndex === 0) {
                oneOffMove[oneOffIndex] = movesXPos ? 1 : -1;
            } else {
                oneOffMove[oneOffIndex] = movesYPos ? 1 : -1;
            }

            if (moveOneOffFirst === 0) {
                moves = moves.concat([oneOffMove]);
            } else {
                moves = [oneOffMove].concat(moves);
            }

            // Finally add the moves
            allPaths = [moves].concat(allPaths)
        }
        return allPaths;
    }


    GENstraightZigZags(startPosition, endPosition) {
        // Assumes zigzag exists, so movesStrength & length is same.
        const movesStrength = endPosition[0] - startPosition[0];
        const movesLength = Math.abs(movesStrength);

        // Directions of x and y, though, are not.
        const movesXPos = (endPosition[0] - startPosition[0]) > 0;
        const movesYPos = (endPosition[1] - startPosition[1]) > 0;

        let allPaths = [];

        for (let moveXFirst = 0; moveXFirst < 2; moveXFirst++) {
            let moves = [];
            for (let i = 0; i < movesLength * 2; i++) {
                let iToMove = (moveXFirst + i) % 2;
                let currMove = [0, 0];
                if (iToMove === 0) {
                    currMove[iToMove] = movesXPos ? 1 : -1;
                } else {
                    currMove[iToMove] = movesYPos ? 1 : -1;
                }                
                moves = [currMove].concat(moves);
            }
            allPaths = [moves].concat(allPaths)
        }
        return allPaths;
    }


    GENstraightLinePath(lineIndex, startPosition, endPosition) {
        const othLineIndex = lineIndex === 0 ? 1 : 0;
        const movesStrength = endPosition[othLineIndex] - startPosition[othLineIndex];
        const movesLength = Math.abs(movesStrength);
        const movesPos = movesStrength > 0;

        let moves = [];
        for (let i = 0; i < movesLength; i++) {
            let currMove = [0, 0]
            currMove[othLineIndex] = movesPos ? 1 : -1;
            moves = [currMove].concat(moves);
        }

        return [moves];
    }



    M(n) {
        let self = this;
        let history = self._state.puzzle.history;
        const movesSoFar = self.getMovesToThisState();

        let nStepActions = [];
        let nStepActionsByOutcome = self.nStepLookahead(n);
        nStepActionsByOutcome.actionsToWin.forEach(action => nStepActions.push(action));
        nStepActionsByOutcome.badActions.forEach(action => nStepActions.push(action));
        
        history.nStepActions = nStepActions;
        if (n > 0) {
            // console.log(nStepActionsByOutcome);
        }
        return nStepActions;
        
    }

    getMovesToThisState() {
        let self = this;
        let history = self._state.puzzle.history;
        const currPositions = history.snakePositions;
        let moves = [];
        if (currPositions.length > 1) {
            for (let j = currPositions.length -1 ; j > 0; j--) {
                let [lastX, lastY] = [currPositions[j][0], currPositions[j][1]];
                let [prevX, prevY] = [currPositions[j-1][0], currPositions[j-1][1]];
                moves.unshift([lastX - prevX, lastY - prevY])
            }
        }
        return moves;
    }


    nStepLookahead(n) {
        let self = this;
        let { actionsToWin, badActions } = self.zeroStepM();
        // Capture current only
        let history = self._state.puzzle.history;
        const movesSoFar = self.getMovesToThisState();
        if (n > 0 && actionsToWin.length > 0) {
            // const currMoves = history.snakePositions
            for (let actionToWin of actionsToWin) {
                // If the action is at end, no need to go further down
                if (actionToWin.assessment === 2) break;

                self.restartPuzzle()
                const newMove = actionToWin.dirn.dir;
                let newStateMoves = JSON.parse(JSON.stringify(movesSoFar));
                newStateMoves.push(newMove);
                self.attemptSolveWithPath(newStateMoves);
                let nextMetas = self.nStepLookahead(n - 1);

                actionToWin['child'] = JSON.parse(JSON.stringify(nextMetas));

                // If any are at end, then pass it up as a 2.
                const childReachesEnd = nextMetas.actionsToWin.filter(a => a.assessment === 2).length > 0;
                const nextLevelHasNoWinMoves = nextMetas.actionsToWin.length === 0;
                if (nextLevelHasNoWinMoves) {
                    actionToWin.assessment = -1;
                    actionToWin.reasons['childHasNoMoves'] = true;
                }
                if (childReachesEnd) {
                    actionToWin.assessment = 2;
                    actionToWin.reasons['childReachedEnd'] = true;
                }
            }

            // If children do not exist
            // Push to badActions
            actionsToWin.forEach(a=>{
                if (a.assessment === -1) {
                    badActions.push(a)
                }                
            })
            actionsToWin = actionsToWin.filter(a=>a.assessment !== -1);


        }

        self.restartPuzzle();
        self.attemptSolveWithPath(movesSoFar, { doNotCalcNextMoves: true});
        return { actionsToWin, badActions, n };
    }

    zeroStepM() {
        let self = this;
        let history = self._state.puzzle.history;
        const lastSnakePosition = history.lastSnakePosition;
        const dirns = [
            { name: 'up', dir: [0, 1], oppDir: [0, -1] },
            { name: 'right', dir: [1, 0], oppDir: [-1, 0] },
            { name: 'down', dir: [0, -1], oppDir: [0, 1] },
            { name: 'left', dir: [-1, 0], oppDir: [1, 0] },
        ];

        let actionTemp = {
            dirn: {},
            assessment: 0, // -1 = no, 0 = dunno, 0.5 = MUSTPROBABLE, 1 = must
            reasons: {}
        }

        let actions = [];

        const isAtEnd = lastSnakePosition[0] === self._state.puzzle.setup.endPosition[0] 
            && lastSnakePosition[1] === self._state.puzzle.setup.endPosition[1];

        // Perform simple directional checks
        for (let dirn of dirns) {
            let action = JSON.parse(JSON.stringify(actionTemp));
            action.dirn = dirn;

            let {assessment, reasons} = self.rulesCheck(dirn);
            action.isLegal = assessment > -1;
            action.isPROBABLEMUST = assessment === 0.5;

            // If not deemed impossible, check inference rules unless at end
            if (assessment > -1 && !isAtEnd) {
                const infRulesDirnActions = self.infRulesDirnCheck(dirn);
                assessment = Math.max(infRulesDirnActions.assessment, assessment);
                reasons = infRulesDirnActions.reasons
            }

            if (isAtEnd) {
                assessment = -1;
                reasons = {};
                reasons['isAtEnd'] = true;
            }

            action.assessment = assessment;
            action.reasons = reasons;
            actions.push(action);
        }

        // Exclude MUSTPROBABLE moves as probable
        const MUSTPROBABLEActionsExist = actions.filter(a => a.assessment === 0.5).length > 0;
        if (MUSTPROBABLEActionsExist) {
            actions = actions.map(action => {
                if (!action.isPROBABLEMUST && action.assessment === 0) {
                    action.assessment = -1;
                    action.reasons['triangleRequiresOtherActions'] = true;
                } else if (action.assessment === 0.5) {
                    action.assessment = 0;
                    action.reasons['triangleMUSTPROBABLEMoveHere'] = true;
                }
                return action;
            })
        }

        // Perform an overall inference rule check that assesses
        // all possible actions, right now seeking for multiple must-crosses
        actions = self.actionsOnInfRulesOverallCheck(actions)
        
        const actionsToWin = actions.filter(a=>a.assessment > -1);
        const badActions = actions.filter(a => a.assessment === -1);
        return { actionsToWin, badActions }
    }
    
    rulesCheck(dirn) {
        let self = this;
        let history = self._state.puzzle.history;
        const lastSnakePosition = history.lastSnakePosition;
        let newPosition = [lastSnakePosition[0] + dirn.dir[0], lastSnakePosition[1] + dirn.dir[1]];


        let newPositionIsOutOfBounds = false;
        let newPositionEntersFullyCannotCross = false;
        let newPositionEntersPartialCannotCross = false;
        let newPositionEntersPreviousSnakePosition = false;
        let isRetractingMove = false;
        let newPositionCausesTooManyEdgesOnTriangle = false;
        let newPositionCausesUnsolvableTriangle = false;
        let newPositionIsBoxedIn = self.__positionFulfillsNotBoxedIn(newPosition) === 'unsolvable';

        newPositionIsOutOfBounds = self.__positionIsOutOfBounds(newPosition);
        newPositionEntersFullyCannotCross = self.__positionViolatesCannotCrossFull(newPosition);
        newPositionEntersPartialCannotCross = self.__positionViolatesCannotCrossPart(newPosition, history.lastSnakePosition);
        newPositionEntersPreviousSnakePosition = self.__positionCrossesPreviousSnakePosition(newPosition, history.snakePositions);
        newPositionCausesTooManyEdgesOnTriangle = self.__positionViolatesNumTriangleEdges(newPosition);
        newPositionCausesUnsolvableTriangle = self.__positionViolatesTriangleFulfillmentPossibility(newPosition);
                        

        isRetractingMove = self.__positionIsRetractingMove(newPosition, history.snakePositions);

        let assessment = 0;
        let combinedReasons = { 
            newPositionIsOutOfBounds, newPositionEntersFullyCannotCross, 
            newPositionEntersPartialCannotCross, 
            newPositionEntersPreviousSnakePosition, isRetractingMove, 
            newPositionCausesTooManyEdgesOnTriangle, 
            newPositionCausesUnsolvableTriangle,
            newPositionIsBoxedIn
        }

        let reasons = {}
        for (let [reason, applies] of Object.entries(combinedReasons)) {
            if (applies) {
                reasons[reason] = true;
                assessment = -1;
            }
        }

        if (assessment === 0) {
            if (self.__positionIsTrianglePROBABLEMUST(newPosition)) {
                assessment = 0.5;
                reasons['isTrianglePROBABLEMUST'] = true;
            }
        }

        return { assessment, reasons }
    }

    infRulesDirnCheck(dirn) {
        let self = this;
        let history = self._state.puzzle.history;
        const lastSnakePosition = history.lastSnakePosition;
        let newPosition = [lastSnakePosition[0] + dirn.dir[0], lastSnakePosition[1] + dirn.dir[1]];

        let newPositionEntersPartlyCannotCross = false;

        newPositionEntersPartlyCannotCross = self.__positionViolatesCannotCrossPart(newPosition, lastSnakePosition);

        let assessment = 0;
        let combinedReasons = {
            newPositionEntersPartlyCannotCross
        }

        let reasons = {}
        for (let [reason, applies] of Object.entries(combinedReasons)) {
            if (applies) {
                reasons[reason] = true;
                assessment = -1;
            }
        }
        // Now check for must crosses because of some reason.
        if (assessment > -1) {
            combinedReasons = {
                fulfillsMustCross: self.__positionFulfillsMustCross(newPosition),
                fulfillsImmediateRegionConstraints: self.__positionFulfillsImmediateRegionConstraints(newPosition),
                fulfillsImmediateTriangleMustConstraints: self.__positionFulfillsImmediateTriangleMustConstraints(newPosition),
                fulfillsNotBoxedIn: self.__positionFulfillsNotBoxedIn(newPosition)
            }
            reasons = {}
            for (let [reason, applies] of Object.entries(combinedReasons)) {
                if (applies) {
                    reasons[reason] = true;
                    assessment = 1;
                }
                if (applies === 'unsolvable') {
                    reasons[reason] = false;
                    assessment = -1;
                    break;
                }
            }
        }

        return { assessment, reasons }
    }

    actionsOnInfRulesOverallCheck(actions) {
        let self = this;
        let history = self._state.puzzle.history;
        const lastSnakePosition = history.lastSnakePosition;
        let numMusts = actions.reduce((currV, a) => {
            return (a.assessment === 1 ? 1 : 0) + currV
        }, 0);
        // No move is possible because there are multiple must moves
        if (numMusts > 1) {
            actions.forEach(action => {
                if (action.assessment > -1) {
                    action.assessment = -1;
                    action.reasons = {multipleMustMoves: true}
                }
            })
        }
        // Only 1 move, make other moves not possible
        if (numMusts === 1) {
            actions.forEach(action => {
                if (action.assessment === 0) {
                    action.assessment = -1;
                    action.reasons = { mustMoveExists: true }
                }
            })
        }
        // Check that actions are not on end.
        for (let action of actions.filter(a => a.assessment > -1)) {
            const dir = action.dirn.dir;
            let newPosition = [lastSnakePosition[0] + dir[0], lastSnakePosition[1] + dir[1]];
            const atEnd = newPosition[0] === self._state.puzzle.setup.endPosition[0]
                && newPosition[1] === self._state.puzzle.setup.endPosition[1];
            if (atEnd) {
                action.assessment = 2;
                action.reasons['atEnd'] = true;
            }
        }

        return actions;
    }





    deriveAllPossibleInfoGain_PREVIOUS_RELIANT_OF_generatePathInfoGainOutcomes() {
        let self = this;
        const puzzle = self._state.puzzle;
        self.restartPuzzle();
        let history = self._state.puzzle.history;

        const pathObj = {
            endingPath: null,
            snakePosition: null,
            trajectories: [],
            entropy: {
                allLeafs: 0,
                categorized: 0,
                logicAllLeafs: 0,
                logicCategorized: 0
            },
            win: false
        }

        const trajectoryObj = {
            moves: [],
            entropyBefore: {
                allLeafs: 0,
                categorized: 0,
                logicAllLeafs: 0,
                logicCategorized: 0
            },
            moveEntropy: {
                allLeafs: 0,
                categorized: 0,
                logicAllLeafs: 0,
                logicCategorized: 0
            },
            possibleOutcomes: null,
            logic: false
        }

        history.allPossibleInfoGain = {
            bySnakePositions: {},
            paths: [
            ],
            tree: {

            },
            winPaths: [],
            minIForLogicAllLeafs: 0,
            minLogicAllLeafs: 0
        }


        for (let endingPath of puzzle.pathInfoGain.allEndingPaths.endingPaths) {

            let path = JSON.parse(JSON.stringify(pathObj));
            path.endingPath = JSON.parse(JSON.stringify(endingPath));

            self.restartPuzzle();

            let movesSoFar = [];

            for (let upcomingMove of path.endingPath) {

                // Get the summary of outcomes that are possible from
                // the next moves calculations
                let outcomesSummary = history.nextMovesCalculations[history.nextMovesCalculations.length - 1];
                const possibleOutcomes = outcomesSummary.possibleOutcomes;
                let numLegalMoves = possibleOutcomes.legalWOConstraints2;

                // Update total entropy before this move is made
                let trajectory = JSON.parse(JSON.stringify(trajectoryObj));
                trajectory.possibleOutcomes = JSON.parse(JSON.stringify(possibleOutcomes));
                trajectory.entropyBefore.categorized = path.entropy.categorized;
                trajectory.entropyBefore.allLeafs = path.entropy.allLeafs;
                trajectory.entropyBefore.logicCategorized = path.entropy.logicCategorized;
                trajectory.entropyBefore.logicAllLeafs = path.entropy.logicAllLeafs;

                // Updating current move entropy
                trajectory.moveEntropy.categorized = self.H([
                    possibleOutcomes.couldMove / numLegalMoves,
                    (numLegalMoves - possibleOutcomes.couldMove - (possibleOutcomes.mustMove - possibleOutcomes.bothCannotAndMustMove)) / numLegalMoves,
                    (possibleOutcomes.mustMove - possibleOutcomes.bothCannotAndMustMove) / numLegalMoves,
                ]);
                if (numLegalMoves === 0) {
                    trajectory.moveEntropy.categorized = 0;
                }
                if (isNaN(trajectory.moveEntropy.categorized) || trajectory.moveEntropy.categorized < 0) {
                    debugger;
                }
                trajectory.moveEntropy.allLeafs = self.HByAnyNumOutcomes(numLegalMoves);

                // Let pick a mustMove
                let mustMovePicked = (possibleOutcomes.mustMove - possibleOutcomes.bothCannotAndMustMove) === 1;
                trajectory.logic = mustMovePicked;

                trajectory.moveEntropy.logicAllLeafs = mustMovePicked ? 0 : trajectory.moveEntropy.allLeafs;
                trajectory.moveEntropy.logicCategorized = mustMovePicked ? 0 : trajectory.moveEntropy.categorized;

                // Update total entropy
                path.entropy.categorized += trajectory.moveEntropy.categorized;
                path.entropy.allLeafs += trajectory.moveEntropy.allLeafs;
                path.entropy.logicCategorized += trajectory.moveEntropy.logicCategorized;
                path.entropy.logicAllLeafs += trajectory.moveEntropy.logicAllLeafs;

                trajectory.moves = JSON.parse(JSON.stringify(movesSoFar));
                movesSoFar.push(JSON.parse(JSON.stringify(upcomingMove)));

                // possibleOutcomes:
                //     bothCannotAndMustMove: 0
                //     cannotMove: 1
                //     couldMove: 2
                //     legalWOConstraints: 3
                //     legalWOConstraints2: 3
                //     mustMove: 1


                // debugger;

                path.trajectories.push(trajectory);
                self.attemptMove(upcomingMove);
            }


            // endingPathsBySnakePositionHash
            // debugger;

            let puzzleSnakePositions = JSON.stringify(history.snakePositions);
            path.win = puzzle.pathInfoGain.allEndingPaths.endingPathsBySnakePositionHash[puzzleSnakePositions].winRatio === 1;

            history.allPossibleInfoGain.paths.push(path);
            history.allPossibleInfoGain.bySnakePositions[JSON.stringify(movesSoFar)] =
                history.allPossibleInfoGain.paths[history.allPossibleInfoGain.paths.length - 1];
        }


        history.allPossibleInfoGain.winPaths = history.allPossibleInfoGain.paths.filter(path => path.win);
        history.allPossibleInfoGain.winPaths.sort((a, b) => a.entropy.logicAllLeafs - b.entropy.logicAllLeafs);

        let minLogicAllLeafs = history.allPossibleInfoGain.winPaths[0].entropy.logicAllLeafs;
        history.allPossibleInfoGain.minLogicAllLeafs = minLogicAllLeafs;

        for (let i = 0; i < history.allPossibleInfoGain.winPaths.length; i++) {
            if (history.allPossibleInfoGain.winPaths[i].entropy.logicAllLeafs === minLogicAllLeafs) {
                history.allPossibleInfoGain.minIForLogicAllLeafs = i;
            } else {
                break;
            }
        }
    }



    searchFoundLeastOneSolution() {
        let self = this;
        self.restartPuzzle(); //reset();
        let history = self._state.puzzle.history;
        history.solutions = []
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

            // If there are move moves than possible actions
            while (currMoveObj.moves.length > history.traj.possibleActions.length - 1) {
                for (let key of Object.keys(history.traj)) {
                    history.traj[key].push(0);
                }
            }


            // Attempt all moves that exist within the set of moves
            // for the given path of the puzzle under moveAttemptsStack
            // Note that at puzzle start, no moves are provided, so no
            // attempted moves are made.
            for (let move of currMoveObj.moves) {
                self.attemptMove(move);
            }


            let outcomesSummary = history.nextMovesCalculations[history.nextMovesCalculations.length - 1];


            // trajectory object is just arrays of values, 
            // with the last one (currMoveObj.moves.length) containing
            // the last value.  Note that this is not at all
            // the order based on an existing state, rather a summation
            // of values of all visited states
            history.traj.possibleActions[currMoveObj.moves.length] += 4;
            history.traj.forwardLegalActions[currMoveObj.moves.length] += outcomesSummary.possibleOutcomes.legalWOConstraints2;
            history.traj.actionsActuallyTaken[currMoveObj.moves.length] +=
                (!outcomesSummary.puzzleSolvableConsideringHistory || history.isSolved)
                    ? 0
                    : (outcomesSummary.possibleOutcomes.bothCannotAndMustMove > 0 || outcomesSummary.possibleOutcomes.mustMove > 1)
                        ? 0
                        : (outcomesSummary.possibleOutcomes.mustMove === 1 ? 1 : outcomesSummary.possibleOutcomes.couldMove)


            // Deriving move entropy score BUT WITH the original
            // move entropy analysis, where a move to an unknown outcome
            // renders entropy of 1 bit (since outcome is either win/loss)
            // as opposed to 0 for either a win or a loss.
            let remainder = 0;
            let numLegalWOConstraints = outcomesSummary.possibleOutcomes.legalWOConstraints2;
            if (numLegalWOConstraints > 0) {


                history.possibleMoveOutcomes.filter(d => d.legalWOConstraints2)
                    .forEach(possibleMove => {
                        let moveEntropy = self.B(possibleMove.couldMove ? 0.5 : 1);
                        remainder += 1 / numLegalWOConstraints * moveEntropy;
                    })


                // Add in individual infogain score to a history
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
                    noMoreMoves: !outcomesSummary.puzzleSolvableConsideringHistory,
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
                return true;
            }


            // If solved or not solvable, the go next, otherwise...
            if (!outcomesSummary.puzzleSolvableConsideringHistory || history.isSolved) {
                continue;
            } else {
                // ... determine the next moves to add for the stack
                let legalNextMoves = [];

                // Either mustmove or add all couldmoves
                if (outcomesSummary.possibleOutcomes.mustMove === 1) {
                    legalNextMoves.push(history.possibleMoveOutcomes.filter(d => d.mustMove)[0])
                } else {
                    history.possibleMoveOutcomes.filter(d => d.couldMove).forEach(legalNextMove => legalNextMoves.push(legalNextMove))
                }



                // Add possible moves to stack
                for (let legalNextMove of legalNextMoves) {
                    let newMoveAttemptObj = JSON.parse(JSON.stringify(currMoveObj));

                    // Add trajectory of number of movies
                    if (history.trajectory[newMoveAttemptObj.moves.length] === undefined) {
                        history.trajectory.push(0);
                    }
                    history.trajectory[newMoveAttemptObj.moves.length] += 1;

                    newMoveAttemptObj.moves.push(legalNextMove.dir);
                    moveAttemptsStack.push(newMoveAttemptObj);
                }
            }

        }

        return false;


    }


    extractSolutions() {
        let self = this;
        self.restartPuzzle(); //reset();
        let history = self._state.puzzle.history;
        history.solutions = []
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

            // If there are move moves than possible actions
            while (currMoveObj.moves.length > history.traj.possibleActions.length - 1) {
                for (let key of Object.keys(history.traj)) {
                    history.traj[key].push(0);
                }
            }


            // Attempt all moves that exist within the set of moves
            // for the given path of the puzzle under moveAttemptsStack
            // Note that at puzzle start, no moves are provided, so no
            // attempted moves are made.
            for (let move of currMoveObj.moves) {
                self.attemptMove(move);
            }


            let outcomesSummary = history.nextMovesCalculations[history.nextMovesCalculations.length - 1];


            // trajectory object is just arrays of values, 
            // with the last one (currMoveObj.moves.length) containing
            // the last value.  Note that this is not at all
            // the order based on an existing state, rather a summation
            // of values of all visited states
            history.traj.possibleActions[currMoveObj.moves.length] += 4;
            history.traj.forwardLegalActions[currMoveObj.moves.length] += outcomesSummary.possibleOutcomes.legalWOConstraints2;
            history.traj.actionsActuallyTaken[currMoveObj.moves.length] +=
                (!outcomesSummary.puzzleSolvableConsideringHistory || history.isSolved)
                    ? 0
                    : (outcomesSummary.possibleOutcomes.bothCannotAndMustMove > 0 || outcomesSummary.possibleOutcomes.mustMove > 1)
                        ? 0
                        : (outcomesSummary.possibleOutcomes.mustMove === 1 ? 1 : outcomesSummary.possibleOutcomes.couldMove)


            // Deriving move entropy score BUT WITH the original
            // move entropy analysis, where a move to an unknown outcome
            // renders entropy of 1 bit (since outcome is either win/loss)
            // as opposed to 0 for either a win or a loss.
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


                // Add in individual infogain score to a history
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
                    noMoreMoves: !outcomesSummary.puzzleSolvableConsideringHistory,
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
                // Add solutions
                history.solutions.push(currMoveObj);
            }


            // If solved or not solvable, the go next, otherwise...
            if (!outcomesSummary.puzzleSolvableConsideringHistory || history.isSolved) {
                continue;
            } else {
                // ... determine the next moves to add for the stack
                let legalNextMoves = [];

                // Either mustmove or add all couldmoves
                if (outcomesSummary.possibleOutcomes.mustMove === 1) {
                    legalNextMoves.push(history.possibleMoveOutcomes.filter(d => d.mustMove)[0])
                } else {
                    history.possibleMoveOutcomes.filter(d => d.couldMove).forEach(legalNextMove => legalNextMoves.push(legalNextMove))
                }



                // Add possible moves to stack
                for (let legalNextMove of legalNextMoves) {
                    let newMoveAttemptObj = JSON.parse(JSON.stringify(currMoveObj));

                    // Add trajectory of number of movies
                    if (history.trajectory[newMoveAttemptObj.moves.length] === undefined) {
                        history.trajectory.push(0);
                    }
                    history.trajectory[newMoveAttemptObj.moves.length] += 1;

                    newMoveAttemptObj.moves.push(legalNextMove.dir);
                    moveAttemptsStack.push(newMoveAttemptObj);
                }
            }

        }

        return history.solutions;
    }



    deriveMinSolKLDivergenceEntropyWithPruningAndNdepth(n, opts) {
        let self = this;
        let history = self._state.puzzle.history;
        const defaultOpts = {storeKLTrajectoryForDebugging: false};
        if (opts !== undefined) { opts = Object.assign(defaultOpts, opts) } else { opts = defaultOpts };
        if (opts.storeKLTrajectoryForDebugging) { history['KLTrajectoryN' + n] = {} }

        self.restartPuzzle();
        const { totalEntropy, currEntropy, minEntropy, localSoftMinProb, childSoftMinProb, logicOutcomes } = self.obtainKLEntropyWithPruningAndNdepth(0, n, opts);
        history['minSolKLDivergenceEntropyWithPruningAndN'+n] = totalEntropy;
        return totalEntropy;
    }

    obtainKLEntropyWithPruningAndNdepth(depth,n, opts) {
        let self = this;
        // self.restartPuzzle(); 
        let history = self._state.puzzle.history;

        // Exit if either puzzle is solved
        if (history.isSolved) {
            if (opts.storeKLTrajectoryForDebugging) { history['KLTrajectoryN' + n][JSON.stringify(history.snakePositions)] = { currEntropy: 0 } }
            return 0
        };
        let outcomes = self.M(n);

        let numLogicActions = outcomes.reduce((a, d) => a + (d.assessment > -1 ? 1 : 0), 0);

        // if (depth === 0 && numLogicActions === 0) {
        //     debugger;
        // }

        // Exit if no actions are possible
        if (numLogicActions === 0) {
            if (opts.storeKLTrajectoryForDebugging) { history['KLTrajectoryN' + n][JSON.stringify(history.snakePositions)] = { currEntropy: Infinity } }
            return Infinity
        };

        let legalOutcomes = outcomes.filter(d => d.isLegal);
        let logicOutcomes = outcomes.filter(d => d.assessment > -1);

        logicOutcomes.forEach(logicOutcome => {
            logicOutcome.localProb = 1 / numLogicActions;
            logicOutcome.localPartialEntropy = self.Hpartial(logicOutcome.localProb);
        });

        const localSoftMinProb = self.softmin(logicOutcomes.map(d => d.localPartialEntropy));
        logicOutcomes.forEach((logicOutcome, i) => {
            logicOutcome.localSoftMinProb = localSoftMinProb[i];
        })



        if (false && self.modules.visualization !== null) {
            self.modules.visualization.render();
        }


        for (let logicOutcome of logicOutcomes) {
            self.attemptMove(logicOutcome.dirn.dir);

            if (false && self.modules.visualization !== null) {
                self.modules.visualization.render();
            }

            logicOutcome.childEntropy = self.obtainKLEntropyWithPruningAndNdepth(depth + 1, n, opts);
            self.attemptMove(logicOutcome.dirn.oppDir);
        }

        let childSoftMinProb = self.softmin(logicOutcomes.map(d => d.childEntropy));
        // Check if all are infinity, if so, replace with 0.
        if (logicOutcomes.every(d => d.childEntropy === Infinity)) {
            childSoftMinProb = childSoftMinProb.map(d => 0);
        }


        for (let i = 0; i < childSoftMinProb.length; i++) {
            if (isNaN(childSoftMinProb[i])) {
                console.log(logicOutcomes.map(d => d.childEntropy), logicOutcomes)
                debugger;
            }
        }



        if (logicOutcomes.length === 1 && logicOutcomes[0].childEntropy === Infinity) {
            childSoftMinProb = [0];
        }
        logicOutcomes.forEach((logicOutcome, i) => {
            logicOutcome.childSoftMinProb = childSoftMinProb[i];
        })

        // Take care of the 0 probabilities
        let normedChildSoftMinProb = [], normedLocalSoftMinProb = [];
        for (let logicOutcome of logicOutcomes) {
            if (logicOutcome.childSoftMinProb != 0) {
                normedChildSoftMinProb.push(logicOutcome.childSoftMinProb);
                normedLocalSoftMinProb.push(logicOutcome.localSoftMinProb);
                if (logicOutcome.localSoftMinProb === 0) {
                    console.log(logicOutcomes, 'localSoftMinProb is 0');
                    debugger;
                }
            }
        }


        let currEntropy = 0;

        if (normedChildSoftMinProb.length != 0) {
            currEntropy = self.KL(normedChildSoftMinProb, normedLocalSoftMinProb);
        }
        const output = currEntropy + Math.min(...logicOutcomes.map(d => d.childEntropy));
        if (isNaN(output) || output === undefined) {
            console.log(logicOutcomes);
            debugger;
        }


        if (false && self.modules.visualization !== null) {
            self.modules.visualization.render();
        }



        const minEntropy = Math.min(...logicOutcomes.map(d => d.childEntropy));
        const totalEntropy = currEntropy + minEntropy;
        if (opts.storeKLTrajectoryForDebugging) {
            history['KLTrajectoryN' + n][JSON.stringify(history.snakePositions)] =
                { totalEntropy, currEntropy, minEntropy, logicOutcomes, localSoftMinProb, childSoftMinProb, logicOutcomes }
        }

        if (depth === 0) {
            return { totalEntropy, currEntropy, minEntropy, localSoftMinProb, childSoftMinProb, logicOutcomes };
        } else {
            return currEntropy + Math.min(...logicOutcomes.map(d => d.childEntropy));
        }

    }

    deriveMinSolKLDivergenceEntropy() {
        let self = this;
        self.restartPuzzle(); 
        let history = self._state.puzzle.history;
        const { totalEntropy, currEntropy, minEntropy, localSoftMinProb, childSoftMinProb, legalOutcomes } = self.obtainKLEntropy(0);
        history.minSolKLDivergenceEntropy = totalEntropy;
        return totalEntropy;
    }

    obtainKLEntropy(depth) {
        let self = this;
        // self.restartPuzzle(); 
        let history = self._state.puzzle.history;

        // Exit if either puzzle is solved
        if (history.isSolved) {
            return 0
        };
        let outcomes = self.M(0);
        let numLogicActions = outcomes.reduce((a, d) => a + (d.assessment > -1 ? 1 : 0), 0);
        // Exit if no actions are possible
        if (numLogicActions === 0) {
            return Infinity
        };

        let legalOutcomes = outcomes.filter(d=>d.isLegal);

        legalOutcomes.forEach(legalOutcome => {
            if (legalOutcome.assessment > -1) {
                legalOutcome.localProb = 1 / numLogicActions;
                legalOutcome.localPartialEntropy = self.Hpartial(legalOutcome.localProb);
            } else {
                legalOutcome.localProb = 0;
                legalOutcome.localPartialEntropy = Infinity;
            }
        })

        const localSoftMinProb = self.softmin(legalOutcomes.map(d => d.localPartialEntropy));
        legalOutcomes.forEach((legalOutcome, i) => {
            legalOutcome.localSoftMinProb = localSoftMinProb[i];
        })

        if (false && self.modules.visualization !== null) {
            self.modules.visualization.render();
        } 


        for (let legalOutcome of legalOutcomes) {
            self.attemptMove(legalOutcome.dirn.dir);

            if (false && self.modules.visualization !== null) {
                self.modules.visualization.render();
            } 

            legalOutcome.childEntropy = self.obtainKLEntropy(depth + 1);
            self.attemptMove(legalOutcome.dirn.oppDir);
        }

        let childSoftMinProb = self.softmin(legalOutcomes.map(d => d.childEntropy));
        // Check if all are infinity, if so, replace with 0.
        if (legalOutcomes.every(d => d.childEntropy === Infinity)) {
            childSoftMinProb = childSoftMinProb.map(d => 0);
        }


        for (let i = 0; i <  childSoftMinProb.length; i++) {
            if (isNaN(childSoftMinProb[i])) {
                console.log(legalOutcomes.map(d => d.childEntropy), legalOutcomes)
                debugger;
            }
        }



        if (legalOutcomes.length === 1 &&  legalOutcomes[0].childEntropy === Infinity) {
            childSoftMinProb = [0];
        }
        legalOutcomes.forEach((legalOutcome, i) => {
            legalOutcome.childSoftMinProb = childSoftMinProb[i];
        })

        // Take care of the 0 probabilities
        let normedChildSoftMinProb = [], normedLocalSoftMinProb = [];
        for (let legalOutcome of legalOutcomes) {
            if (legalOutcome.childSoftMinProb != 0) {
                normedChildSoftMinProb.push(legalOutcome.childSoftMinProb);
                normedLocalSoftMinProb.push(legalOutcome.localSoftMinProb);
                if (legalOutcome.localSoftMinProb === 0) {
                    console.log(legalOutcomes, 'localSoftMinProb is 0');
                    debugger;
                }
            }
        }


        let currEntropy = 0; 

        if (normedChildSoftMinProb.length != 0) {
            currEntropy = self.KL(normedChildSoftMinProb, normedLocalSoftMinProb);
        }
        const output = currEntropy + Math.min(...legalOutcomes.map(d => d.childEntropy));
        if (isNaN(output) || output === undefined) {
            console.log(legalOutcomes);
            debugger;
        }


        if (false && self.modules.visualization !== null) {
            self.modules.visualization.render();
        } 

        if (depth === 0) {
            let minEntropy = Math.min(...legalOutcomes.map(d => d.childEntropy));
            let totalEntropy = currEntropy + minEntropy;
            return {totalEntropy, currEntropy, minEntropy, localSoftMinProb, childSoftMinProb, legalOutcomes};
        } else {
        return currEntropy + Math.min(...legalOutcomes.map(d => d.childEntropy));
        }
        
    }

    KL(trueDist, approxDist) {
        return trueDist.map((p, i) => p * Math.log2(p / approxDist[i])).reduce((a, b) => a + b);
    }

    softmin(arr) {
        arr = arr.map(d => d * -1);
        return arr.map(function (value, index) {
            return Math.exp(value) / arr.map(function (y /*value*/) { return Math.exp(y) }).reduce(function (a, b) { return a + b })
        })
    }


    deriveInfoGainTrajectory(opts) {
        let self = this;
        self.restartPuzzle(); //reset();
        let history = self._state.puzzle.history;
        history.solutions = []
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
        let debug = false;
        let debugCount = 0;
        let currPathCount = 0;


        if (opts !== undefined && opts.debug === true) {
            debug = true;
        }

        let moveAttemptsStack = [{
            moves: []
        }];
        while (moveAttemptsStack.length > 0) {

            let currMoveObj = moveAttemptsStack.pop();
            self.restartPuzzle();

            // If there are move moves than possible actions
            while (currMoveObj.moves.length > history.traj.possibleActions.length - 1) {
                for (let key of Object.keys(history.traj)) {
                    history.traj[key].push(0);
                }
            }

            currPathCount++;



            // if (debug && currPathCount === 18) {
            //     debugger;
            //     // console.log({ currPathCount, outcomesSummary, solved: history.isSolved, possibleMoveOutcomes: history.possibleMoveOutcomes });
            //     // return;
            // }

            // Attempt all moves that exist within the set of moves
            // for the given path of the puzzle under moveAttemptsStack
            // Note that at puzzle start, no moves are provided, so no
            // attempted moves are made.
            for (let move of currMoveObj.moves) {
                self.attemptMove(move);
            }
            let outcomesSummary = history.nextMovesCalculations[history.nextMovesCalculations.length - 1];


            // trajectory object is just arrays of values, 
            // with the last one (currMoveObj.moves.length) containing
            // the last value.  Note that this is not at all
            // the order based on an existing state, rather a summation
            // of values of all visited states
            history.traj.possibleActions[currMoveObj.moves.length] += 4;
            history.traj.forwardLegalActions[currMoveObj.moves.length] += outcomesSummary.possibleOutcomes.legalWOConstraints2;
            history.traj.actionsActuallyTaken[currMoveObj.moves.length] +=
                (!outcomesSummary.puzzleSolvableConsideringHistory || history.isSolved)
                    ? 0
                    : (outcomesSummary.possibleOutcomes.bothCannotAndMustMove > 0 || outcomesSummary.possibleOutcomes.mustMove > 1)
                        ? 0
                        : (outcomesSummary.possibleOutcomes.mustMove === 1 ? 1 : outcomesSummary.possibleOutcomes.couldMove)


            // Deriving move entropy score BUT WITH the original
            // move entropy analysis, where a move to an unknown outcome
            // renders entropy of 1 bit (since outcome is either win/loss)
            // as opposed to 0 for either a win or a loss.
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



            // if (debug && debugCount > 2) {
            //     debugger;
            //     return;
            // }



            remainder = 0;
            numLegalWOConstraints = outcomesSummary.possibleOutcomes.legalWOConstraints2;
            if (numLegalWOConstraints > 0) {


                history.possibleMoveOutcomes.filter(d => d.legalWOConstraints2)
                    .forEach(possibleMove => {
                        let moveEntropy = self.B(possibleMove.couldMove ? 0.5 : 1);
                        remainder += 1 / numLegalWOConstraints * moveEntropy;
                    })


                // Add in individual infogain score to a history
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
                    noMoreMoves: !outcomesSummary.puzzleSolvableConsideringHistory,
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
                // Add solutions
                history.solutions.push(currMoveObj);
            }


            // If solved or not solvable, the go next, otherwise...
            if (!outcomesSummary.puzzleSolvableConsideringHistory || history.isSolved) {

                debugCount++;
                if (debug && opts.stopAtI === debugCount) {
                    console.log({ currPathCount, outcomesSummary, solved: history.isSolved, possibleMoveOutcomes: history.possibleMoveOutcomes });
                    // debugger;
                    return;
                }
                continue;
            } else {
                // ... determine the next moves to add for the stack
                let legalNextMoves = [];

                // Either mustmove or add all couldmoves
                if (outcomesSummary.possibleOutcomes.mustMove === 1) {
                    legalNextMoves.push(history.possibleMoveOutcomes.filter(d => d.mustMove)[0])
                } else {
                    history.possibleMoveOutcomes.filter(d => d.couldMove).forEach(legalNextMove => legalNextMoves.push(legalNextMove))
                }



                // Add possible moves to stack
                for (let legalNextMove of legalNextMoves) {
                    let newMoveAttemptObj = JSON.parse(JSON.stringify(currMoveObj));

                    // Add trajectory of number of movies
                    if (history.trajectory[newMoveAttemptObj.moves.length] === undefined) {
                        history.trajectory.push(0);
                    }
                    history.trajectory[newMoveAttemptObj.moves.length] += 1;

                    newMoveAttemptObj.moves.push(legalNextMove.dir);
                    moveAttemptsStack.push(newMoveAttemptObj);
                }
            }

        }


















        for (let solution of history.solutions) {
            solution.totalNoLogicEntropy = 0;
            solution.totalEntropy = 0;
            solution.totalSavedEntropy = 0;
            solution.totalCatEntropy = 0;
            solution.totalMinEntropy2N0 = 0;
            solution.totalMinEntropy2N1 = 0;
            solution.totalMinEntropy2N2 = 0;
            solution.totalMinEntropy2N2 = 0;
            solution.totalMinEntropy2N1wStraightExits = 0;
            solution.hasValidStraightExitAlready = false;
            self.restartPuzzle();

            // Attempt all moves that exist within the set of moves
            // for the given path of the puzzle under moveAttemptsStack
            // Note that at puzzle start, no moves are provided, so no
            // attempted moves are made.
            for (let [moveI, move] of solution.moves.entries()) {


                if (!solution.hasValidStraightExitAlready) {
                    const remainingMovesJSON = JSON.stringify(solution.moves.slice(moveI));
                    self.policyPaths({ POLCstraightToExit: true });
                    for (let path of history.POLCstraightToExitPaths.paths) {
                        if (path.valid) {
                            const currStraightPathJSON = JSON.stringify(path.path);
                            if (remainingMovesJSON === currStraightPathJSON) {
                                solution.hasValidStraightExitAlready = true;
                            }
                        }
                    }
                }

                let outcomesSummary = history.nextMovesCalculations[history.nextMovesCalculations.length - 1];
                const possibleOutcomes = outcomesSummary.possibleOutcomes;
                let numLegalMoves = possibleOutcomes.legalWOConstraints2;

                // Let pick a mustMove
                let mustMovePicked = (possibleOutcomes.mustMove - possibleOutcomes.bothCannotAndMustMove) === 1;

                let entropyFacedV2N0 = self.HByAnyNumOutcomes(self.M(0).filter(d=>d.assessment > -1).length);
                let entropyFacedV2N1 = self.HByAnyNumOutcomes(self.M(1).filter(d => d.assessment > -1).length);
                let entropyFacedV2N2 = self.HByAnyNumOutcomes(self.M(2).filter(d => d.assessment > -1).length);
                let noLogicEntropy = self.HByAnyNumOutcomes(numLegalMoves);
                let entropyFaced = mustMovePicked ? 0 : self.HByAnyNumOutcomes(numLegalMoves);
                let entropySaved = mustMovePicked ? self.HByAnyNumOutcomes(numLegalMoves) : 0;

                let entropyCat = mustMovePicked ? 0 : self.H([
                    possibleOutcomes.couldMove / numLegalMoves,
                    (numLegalMoves - possibleOutcomes.couldMove - (possibleOutcomes.mustMove - possibleOutcomes.bothCannotAndMustMove)) / numLegalMoves,
                    (possibleOutcomes.mustMove - possibleOutcomes.bothCannotAndMustMove) / numLegalMoves,
                ]);
                if (numLegalMoves === 0) {
                    entropyCat = 0;
                }

                if (!history.isSolved) {
                    solution.totalNoLogicEntropy += noLogicEntropy;
                    solution.totalEntropy += entropyFaced;
                    solution.totalSavedEntropy += entropySaved;
                    solution.totalCatEntropy += entropyCat;
                    solution.totalMinEntropy2N0 += entropyFacedV2N0;
                    solution.totalMinEntropy2N1 += entropyFacedV2N1;
                    solution.totalMinEntropy2N2 += entropyFacedV2N2;
                    solution.totalMinEntropy2N1wStraightExits += 
                        solution.hasValidStraightExitAlready ? 0 : entropyFacedV2N2;
                }


                self.attemptMove(move);
            }
        }

        history.solutions = history.solutions.sort((a, b) => a.totalNoLogicEntropy - b.totalNoLogicEntropy)
        history.minSolutionNoLogicEntropy = history.solutions.length > 0 ? history.solutions[0].totalNoLogicEntropy : 0;
        history.solutions = history.solutions.sort((a, b) => a.totalEntropy - b.totalEntropy)
        history.minSolutionEntropy = history.solutions.length > 0 ? history.solutions[0].totalEntropy : 0;

        history.solutions = history.solutions.sort((a, b) => a.totalMinEntropy2N0 - b.totalMinEntropy2N0)
        history.minSolutionEntropy2N0 = history.solutions.length > 0 ? history.solutions[0].totalMinEntropy2N0 : 0;

        history.solutions = history.solutions.sort((a, b) => a.totalMinEntropy2N1 - b.totalMinEntropy2N1)
        history.minSolutionEntropy2N1 = history.solutions.length > 0 ? history.solutions[0].totalMinEntropy2N1 : 0;

        history.solutions = history.solutions.sort((a, b) => a.totalMinEntropy2N2 - b.totalMinEntropy2N2)
        history.minSolutionEntropy2N2 = history.solutions.length > 0 ? history.solutions[0].totalMinEntropy2N2 : 0;

        history.solutions = history.solutions.sort((a, b) => a.totalMinEntropy2N1wStraightExits - b.totalMinEntropy2N1wStraightExits)
        history.minSolutionEntropy2N2wStraightExits = history.solutions.length > 0 ? history.solutions[0].totalMinEntropy2N1wStraightExits : 0;

        history.solutions = history.solutions.sort((a, b) => a.totalMinEntropy2N1wStraightExits - b.totalMinEntropy2N1wStraightExits)
        const max3SolutionsLength = Math.min(history.solutions.length, 3);
        let avgLast3Entropy = 0;
        for (let i = 0; i < max3SolutionsLength; i++) {
            avgLast3Entropy += history.solutions[i].totalMinEntropy2N1wStraightExits / max3SolutionsLength;
        }
        history.minLast3SolutionEntropy2N2wStraightExits = history.solutions.length > 0 ? avgLast3Entropy : 0;

        history.solutions = history.solutions.sort((a, b) => a.totalSavedEntropy - b.totalSavedEntropy)
        history.minSolutionSavedEntropy = history.solutions.length > 0 ? history.solutions[0].totalSavedEntropy : 0;

        history.solutions = history.solutions.sort((a, b) => a.totalCatEntropy - b.totalCatEntropy)
        history.minSolutionCatEntropy = history.solutions.length > 0 ? history.solutions[0].totalCatEntropy : 0;


        history.solnsNumOf = history.solutions.length;

        const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;
        let arrOfSolnsMoves = history.solutions.map(sol => sol.moves.length);
        history.solnsAvgLength = average(arrOfSolnsMoves);

        arrOfSolnsMoves.length = Math.min(arrOfSolnsMoves.length, 3);
        history.solnsAvgLengthFromMinLast3 = average(arrOfSolnsMoves);
        history.solnsLengthFromMinEntropy = history.solutions.length > 0 ? history.solutions[0].moves.length : 0;




















        // Note that all history and trajectories here are of a puzzle
        // by this point completely explored (though only taken winnable paths),
        // and trajectories are not reflective of outcomes from a state and 
        // multiple actions, but of all states.  In short, ordering here 
        // wont' make much sense.
        history.traj['playerDiff'] = history.traj.actionsActuallyTaken.map((d, i) =>
            history.traj['forwardLegalActions'][i] - d
        );
        history.trajPlayerDiffTotal = history.traj['playerDiff'].reduce((partialSum, a) => partialSum + a, 0);

        history.infoGainTrajectoryTotal = history.infoGainTrajectory.reduce((partialSum, a) => partialSum + a, 0);
        history.infoGainTrajectoryTotal2 = history.infoGainTrajectory2.reduce((partialSum, a) => partialSum + a, 0);


    }






    deriveOnlyMinSolutionEntropiesWithSolutionPaths(solutionPaths) {

        let self = this;
        self.restartPuzzle(); //reset();
        let history = self._state.puzzle.history;
        
        let solutions = [] 
        solutionPaths.forEach(p => solutions.push({ moves: p }));

        for (let solution of solutions) {
            solution.totalEntropy = 0;
            solution.totalSavedEntropy = 0;
            solution.totalCatEntropy = 0;
            solution.totalMinEntropy2N0 = 0;
            solution.totalMinEntropy2N1 = 0;
            solution.totalMinEntropy2N2 = 0;
            solution.totalMinEntropy2N2 = 0;
            solution.totalMinEntropy2N1wStraightExits = 0;
            solution.hasValidStraightExitAlready = false;
            self.restartPuzzle();

            // Attempt all moves that exist within the set of moves
            // for the given path of the puzzle under moveAttemptsStack
            // Note that at puzzle start, no moves are provided, so no
            // attempted moves are made.
            for (let [moveI, move] of solution.moves.entries()) {


                if (!solution.hasValidStraightExitAlready) {
                    const remainingMovesJSON = JSON.stringify(solution.moves.slice(moveI));
                    self.policyPaths({ POLCstraightToExit: true });
                    for (let path of history.POLCstraightToExitPaths.paths) {
                        if (path.valid) {
                            const currStraightPathJSON = JSON.stringify(path.path);
                            if (remainingMovesJSON === currStraightPathJSON) {
                                solution.hasValidStraightExitAlready = true;
                            }
                        }
                    }
                }

                let outcomesSummary = history.nextMovesCalculations[history.nextMovesCalculations.length - 1];
                const possibleOutcomes = outcomesSummary.possibleOutcomes;
                let numLegalMoves = possibleOutcomes.legalWOConstraints2;

                // Let pick a mustMove
                let mustMovePicked = (possibleOutcomes.mustMove - possibleOutcomes.bothCannotAndMustMove) === 1;

                let entropyFacedV2N0 = self.HByAnyNumOutcomes(self.M(0).filter(d => d.assessment > -1).length);
                let entropyFacedV2N1 = self.HByAnyNumOutcomes(self.M(1).filter(d => d.assessment > -1).length);
                let entropyFacedV2N2 = self.HByAnyNumOutcomes(self.M(2).filter(d => d.assessment > -1).length);
                let entropyFaced = mustMovePicked ? 0 : self.HByAnyNumOutcomes(numLegalMoves);
                let entropySaved = mustMovePicked ? self.HByAnyNumOutcomes(numLegalMoves) : 0;

                let entropyCat = mustMovePicked ? 0 : self.H([
                    possibleOutcomes.couldMove / numLegalMoves,
                    (numLegalMoves - possibleOutcomes.couldMove - (possibleOutcomes.mustMove - possibleOutcomes.bothCannotAndMustMove)) / numLegalMoves,
                    (possibleOutcomes.mustMove - possibleOutcomes.bothCannotAndMustMove) / numLegalMoves,
                ]);
                if (numLegalMoves === 0) {
                    entropyCat = 0;
                }

                if (!history.isSolved) {
                    solution.totalEntropy += entropyFaced;
                    solution.totalSavedEntropy += entropySaved;
                    solution.totalCatEntropy += entropyCat;
                    solution.totalMinEntropy2N0 += entropyFacedV2N0;
                    solution.totalMinEntropy2N1 += entropyFacedV2N1;
                    solution.totalMinEntropy2N2 += entropyFacedV2N2;
                    solution.totalMinEntropy2N1wStraightExits +=
                        solution.hasValidStraightExitAlready ? 0 : entropyFacedV2N2;
                }


                self.attemptMove(move);
            }
        }

        solutions = solutions.sort((a, b) => a.totalEntropy - b.totalEntropy)
        history.minSolutionEntropy = solutions.length > 0 ? solutions[0].totalEntropy : 0;

        solutions = solutions.sort((a, b) => a.totalMinEntropy2N0 - b.totalMinEntropy2N0)
        history.minSolutionEntropy2N0 = solutions.length > 0 ? solutions[0].totalMinEntropy2N0 : 0;

        solutions = solutions.sort((a, b) => a.totalMinEntropy2N1 - b.totalMinEntropy2N1)
        history.minSolutionEntropy2N1 = solutions.length > 0 ? solutions[0].totalMinEntropy2N1 : 0;

        solutions = solutions.sort((a, b) => a.totalMinEntropy2N2 - b.totalMinEntropy2N2)
        history.minSolutionEntropy2N2 = solutions.length > 0 ? solutions[0].totalMinEntropy2N2 : 0;

        solutions = solutions.sort((a, b) => a.totalMinEntropy2N1wStraightExits - b.totalMinEntropy2N1wStraightExits)
        history.minSolutionEntropy2N2wStraightExits = solutions.length > 0 ? solutions[0].totalMinEntropy2N1wStraightExits : 0;

        solutions = solutions.sort((a, b) => a.totalMinEntropy2N1wStraightExits - b.totalMinEntropy2N1wStraightExits)
        const max3SolutionsLength = Math.min(solutions.length, 3);
        let avgLast3Entropy = 0;
        for (let i = 0; i < max3SolutionsLength; i++) {
            avgLast3Entropy += solutions[i].totalMinEntropy2N1wStraightExits / max3SolutionsLength;
        }
        history.minLast3SolutionEntropy2N2wStraightExits = solutions.length > 0 ? avgLast3Entropy : 0;

        solutions = solutions.sort((a, b) => a.totalSavedEntropy - b.totalSavedEntropy)
        history.minSolutionSavedEntropy = solutions.length > 0 ? solutions[0].totalSavedEntropy : 0;

        solutions = solutions.sort((a, b) => a.totalCatEntropy - b.totalCatEntropy)
        history.minSolutionCatEntropy = solutions.length > 0 ? solutions[0].totalCatEntropy : 0;


        history.solnsNumOf = solutions.length;

        const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;
        let arrOfSolnsMoves = solutions.map(sol => sol.moves.length);
        history.solnsAvgLength = average(arrOfSolnsMoves);

        arrOfSolnsMoves.length = Math.min(arrOfSolnsMoves.length, 3);
        history.solnsAvgLengthFromMinLast3 = average(arrOfSolnsMoves);
        history.solnsLengthFromMinEntropy = solutions.length > 0 ? solutions[0].moves.length : 0;


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
        history.trajectoryTotal = history.trajectory.reduce((partialSum, a) => partialSum + a, 0);
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

    restartPuzzleWithExistingMoves(opts) {
        let self = this;
        let history = self._state.puzzle.history;
        self._settings.options.entropyLookAhead = undefined;
        let currSnakeHistory = JSON.parse(JSON.stringify(history.snakePositions));
        self.attemptMove([0, 0]);
        let previousMoves = undefined;
        if (currSnakeHistory.length > 0) {
            for (let i = currSnakeHistory.length - 1; i > 0; i--) {
                let lastPosn = currSnakeHistory[i]
                let last2ndPosn = currSnakeHistory[i-1];

                let lastMove = [[lastPosn[0] - last2ndPosn[0], lastPosn[1] - last2ndPosn[1]]];
                
                if (previousMoves === undefined) {
                    previousMoves = lastMove;
                } else {
                    previousMoves = lastMove.concat(previousMoves)
                }


            }

            if (previousMoves === undefined) {
                previousMoves = [[0,0]];
            }

            self.attemptSolveWithPath(previousMoves, opts)
        }
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
            renderNLookAhead: false,
            renderPOLCstraightToExit: false,
            performImmediateLookAhead: true,
            entropyLookAhead: undefined,
            doNotStopOrRestartAtEnd: false,
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

        if (options.allPossibleInfoGain !== undefined) {
            puzzle.history.allPossibleInfoGain = options.allPossibleInfoGain;
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

        self.calculateImmediateNextMoves({ validAddedNewPosition: true});

        if (defaultOptions.entropyLookAhead !== undefined) {
            self.M(defaultOptions.entropyLookAhead);
        }

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

            const triggerNLookAhead = options !== undefined && options.entropyLookAheadAtEnd !== undefined && (i === moves.length - 1);
            const triggerPOLCstraightToExit = options !== undefined && options.POLCstraightToExitAtEnd !== undefined && (i === moves.length - 1);
            if (options !== undefined) {
                options['triggerNLookAhead'] = triggerNLookAhead;
                self._settings.options.entropyLookAhead = options.entropyLookAheadAtEnd;

                options['triggerPOLCstraightToExit'] = triggerPOLCstraightToExit;
                self._settings.options.POLCstraightToExit = options.POLCstraightToExitAtEnd;                
            }
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
        }).filter(positionOutcomeObj=>!self.__positionIsRetractingMove(positionOutcomeObj.position, history.snakePositions));

        // 3 outcomes per potential move
        // 1) cannot move into that position
        // 2) must move into that position or cause a fail
        // 3) can move into that position, won't cause a fail

        let possibleOutcomes = {
            cannotMove: 0,
            mustMove: 0,
            couldMove: 0,
            couldMoveBeforePROBABLEMUST: 0,
            bothCannotAndMustMove: 0,
            legalWOConstraints: 0,
            legalWOConstraints2: 0,
            PROBABLEMUST: 0,
            reasonedMoves: []
        };
        
        history.possibleMoveOutcomes = positionsOutcomesToCalculate.map(positionOutcomeObj => {
            let position = positionOutcomeObj.position;

            positionOutcomeObj['outcome'] = self.__positionOutcomes(position);

            positionOutcomeObj['PROBABLEMUST'] = positionOutcomeObj['outcome'].isTrianglePROBABLEMUST;

            positionOutcomeObj['cannotMove'] = 
                positionOutcomeObj['outcome'].isOutOfBounds || 
                positionOutcomeObj['outcome'].crossesPreviousSnakePosition ||
                positionOutcomeObj['outcome'].violatesCannotCrossFull || 
                positionOutcomeObj['outcome'].violatesCannotCrossPart ||
                positionOutcomeObj['outcome'].violatesNumTriangleEdges || 
                positionOutcomeObj['outcome'].violatesTriangleFulfillmentPossibility 
                || positionOutcomeObj['outcome'].isBoxedIn;

            positionOutcomeObj['legalWOConstraints'] = (!positionOutcomeObj['outcome'].crossesPreviousSnakePosition
                && !positionOutcomeObj['outcome'].isOutOfBounds);

            positionOutcomeObj['legalWOConstraints2'] = (!positionOutcomeObj['outcome'].crossesPreviousSnakePosition
                && !positionOutcomeObj['outcome'].isOutOfBounds && !positionOutcomeObj['outcome'].violatesCannotCrossFull);

            positionOutcomeObj['mustMove'] = positionOutcomeObj['outcome'].fulfillsMustCross
                || positionOutcomeObj['outcome'].fulfillsImmediateRegionConstraints
                || positionOutcomeObj['outcome'].fulfillsImmediateTriangleMustConstraints;

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

            possibleOutcomes['PROBABLEMUST'] += positionOutcomeObj['PROBABLEMUST'] ? 1 : 0;
            possibleOutcomes['cannotMove'] += positionOutcomeObj['cannotMove'] ? 1 : 0;
            possibleOutcomes['couldMove'] += positionOutcomeObj['couldMove'] ? 1 : 0; // later
            possibleOutcomes['couldMoveBeforePROBABLEMUST'] += positionOutcomeObj['couldMove'] ? 1 : 0;
            possibleOutcomes['mustMove'] += positionOutcomeObj['mustMove'] ? 1 : 0;
            possibleOutcomes['bothCannotAndMustMove'] += positionOutcomeObj['bothCannotAndMustMove'] ? 1 : 0;
            
            possibleOutcomes['legalWOConstraints'] += positionOutcomeObj['legalWOConstraints'] ? 1 : 0;
            possibleOutcomes['legalWOConstraints2'] += positionOutcomeObj['legalWOConstraints2'] ? 1 : 0;

            // console.log('legal', possibleOutcomes['legalWOConstraints'], possibleOutcomes['legalWOConstraints2'])
            
            return positionOutcomeObj;
        })

        // // Dealing with PROBABLEMUSTs, altering possibleMoveOutcomes
        // if (possibleOutcomes['PROBABLEMUST'] > 0) {
        //     possibleOutcomes['couldMove'] = possibleOutcomes['PROBABLEMUST'];
        //     history.possibleMoveOutcomes.forEach(positionOutcomeObj => {

        //         if (positionOutcomeObj['PROBABLEMUST'] && !positionOutcomeObj['mustMove'] && !positionOutcomeObj['cannotMove']) {
        //             positionOutcomeObj['couldMove'] = true;
        //         } else if (!positionOutcomeObj['PROBABLEMUST'] && positionOutcomeObj['couldMove']) {
        //             positionOutcomeObj['cannotMove'] = true;
        //             possibleOutcomes['cannotMove'] += 1;
        //             possibleOutcomes['couldMove'] -= 1;
        //         }

        //     })
        // }


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



            // let solvableWithTheseMoves = lastMoveMadeMakesPuzzleStillSolvable
            //     && (possibleOutcomes.mustMove - possibleOutcomes.bothCannotAndMustMove < 2
            //     || (possibleOutcomes.mustMove === 0 && possibleOutcomes.couldMove > 0))

            // if (possibleOutcomes.mustMove - possibleOutcomes.bothCannotAndMustMove === 1) {
            //     possibleOutcomes.reasonedMoves.push(history.possibleMoveOutcomes
            //         .filter(possibleMoveOutcome => possibleMoveOutcome.mustMove && !possibleMoveOutcome.bothCannotAndMustMove)[0])
            // } 










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
        let history = self._state.puzzle.history;
        let outcomes = {
            position: newPosition,
            isOutOfBounds: self.__positionIsOutOfBounds(newPosition),
            isRetractingMove: self.__positionIsRetractingMove(newPosition, history.snakePositions),
            crossesPreviousSnakePosition: self.__positionCrossesPreviousSnakePosition(newPosition, history.snakePositions),
            violatesCannotCrossFull: self.__positionViolatesCannotCrossFull(newPosition),
            violatesCannotCrossPart: self.__positionViolatesCannotCrossPart(newPosition, history.lastSnakePosition),
            fulfillsMustCross: self.__positionFulfillsMustCross(newPosition),
            fulfillsImmediateRegionConstraints: self.__positionFulfillsImmediateRegionConstraints(newPosition),
            fulfillsImmediateTriangleMustConstraints: self.__positionFulfillsImmediateTriangleMustConstraints(newPosition),
            violatesNumTriangleEdges: self.__positionViolatesNumTriangleEdges(newPosition),
            violatesTriangleFulfillmentPossibility: self.__positionViolatesTriangleFulfillmentPossibility(newPosition),
            isTrianglePROBABLEMUST: self.__positionIsTrianglePROBABLEMUST(newPosition),
            isBoxedIn: self.__positionFulfillsNotBoxedIn(newPosition) === 'unsolvable',
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
    __positionIsRetractingMove(newPosition, snakePositions) {
        let self = this;
        return (snakePositions.length > 1 
            && snakePositions[snakePositions.length-2].join(' ') === newPosition.join(' '))     
    }
    __positionCrossesPreviousSnakePosition(newPosition, snakePositions) {
        let self = this;
        return (snakePositions.filter(d => JSON.stringify(d) === JSON.stringify(newPosition)).length > 0)     
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
    __positionViolatesCannotCrossPart(newPosition, lastSnakePosition) {
        let self = this;
        let violates = false;
        if (self._state.puzzle.setup.constraints 
            && self._state.puzzle.setup.constraints.cannotCrosses 
            && self._state.puzzle.setup.constraints.cannotCrosses.filter(d => 
                (d[0] === newPosition[0] // same x, y is in between
                    && (lastSnakePosition[1] < d[1] && newPosition[1] > d[1] 
                    || lastSnakePosition[1] > d[1] && newPosition[1] < d[1]))
                ||
                (d[1] === newPosition[1] // same y, x is in between
                    && (lastSnakePosition[0] < d[0] && newPosition[0] > d[0]
                    || lastSnakePosition[0] > d[0] && newPosition[0] < d[0]))

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


    __checkTriangleMustMove(triangle, newPosition) {
        let self = this;
        let history = self._state.puzzle.history;

        let metaPositions = self.__getTriangleMetaPositions(triangle);

        let triangleFilledMeta = self.__triangleFilledVerticesAndEdges(triangle, newPosition, metaPositions);



        // Check for single triangle
        if (triangle[2] === 1) {



            if (triangleFilledMeta.filledVertices.length === 4
                && triangleFilledMeta.filledEdges.length === 1 && triangleFilledMeta.immediateFilledEdge !== false) {
                return true;
            }

            const edgesRemainingToFill = triangle[2] - triangleFilledMeta.filledEdges.length;
            if (triangleFilledMeta.filledVertices.length === 4 && edgesRemainingToFill === 0) {
                return triangleFilledMeta.immediateFilledEdge !== false;
            }

            const remainingVerticesAvailable = 4 - triangleFilledMeta.filledVertices.length;
            if (remainingVerticesAvailable === edgesRemainingToFill && triangleFilledMeta.immediateFilledEdge !== false) {
                return true;
            }

            // if the vertex opposite to the position previous to this is filled, check for move that is solvable
            if (triangleFilledMeta.filledVertices.length === 3 
                && triangleFilledMeta.originalVertexIsOppositeFilled) {


                return undefined;

                let globalTraverse = {};
                const validAction = self.__speedTraverseWithCBF(history.snakePositions, globalTraverse, function (traverseVars) {
                    if (traverseVars.atEnd) {
                        globalTraverse['searchFoundAndEndEverything'] = true;
                    }
                })

                // console.log(globalTraverse, validAction)

                if (validAction !== false) {
                    const lastPosition = history.snakePositions[history.snakePositions.length - 1];


                    // if at end no need to check end position
                    const currentlyAtEndPosition = lastPosition.join(' ') === self._state.puzzle.setup.endPosition[0] + ' ' + self._state.puzzle.setup.endPosition[1];
                    if (currentlyAtEndPosition) return true;


                    let nextPosition = [
                        lastPosition[0] + validAction.dir[0],
                        lastPosition[1] + validAction.dir[1]
                    ];

                        return JSON.stringify(nextPosition) === JSON.stringify(newPosition);

                    // try {
                    //     let nextPosition = [
                    //         lastPosition[0] + validAction.dir[0],
                    //         lastPosition[1] + validAction.dir[1]
                    //     ];

                    //     return JSON.stringify(nextPosition) === JSON.stringify(newPosition);
                    // } catch (error) {

                    //     debugger;
                    //     console.error(validAction);
                    //     console.error(self._state.puzzle.setup)
                    //     console.error(self._state.puzzle.setup.constraints.triangles)
                    //     console.error(error);
                    //     // Expected output: ReferenceError: nonExistentFunction is not defined
                    //     // (Note: the exact output may be browser-dependent)
                    // }


                    // let nextPosition = [
                    //     lastPosition[0] + validAction.dir[0],
                    //     lastPosition[1] + validAction.dir[1]
                    // ];

                } else {
                    return false;
                }
            }


        }

        // Check for double triangle
        if (triangle[2] === 2) {

            // if (triangleFilledMeta.immediateFilledVertex !== false) {
            //     return remainingVerticesAvailable === edgesRemainingToFill;
        // }
            // const edgesRemainingToFill = triangle[2] - triangleFilledMeta.filledEdges.length;
            // const remainingVerticesAvailable = 4 - triangleFilledMeta.filledVertices.length;
            // if (remainingVerticesAvailable === edgesRemainingToFill && triangleFilledMeta.immediateFilledEdge !== false) {
            //     return true;
            // }

            if (triangleFilledMeta.filledVertices.length === 3
                && triangleFilledMeta.filledEdges.length === 1 && triangleFilledMeta.immediateFilledEdge !== false) {
                return true;
            }

            if (triangleFilledMeta.filledVertices.length === 4
                && triangleFilledMeta.filledEdges.length === 2 && triangleFilledMeta.immediateFilledEdge !== false) {
                return true;
            }

        }

        // Check for triple triangle
        if (triangle[2] === 3) {
            if (triangleFilledMeta.filledVertices.length === 3
                && triangleFilledMeta.filledEdges.length === 2 && triangleFilledMeta.immediateFilledEdge !== false) {
                return true;
            }
            if (triangleFilledMeta.filledVertices.length === 4 
                && triangleFilledMeta.filledEdges.length === 3 && triangleFilledMeta.immediateFilledEdge !== false) {
                return true;
            }
        }

        return undefined;


    }

    __triangleFilledVerticesAndEdges(triangle, newPosition, metaPositions, snakePositionsSoFar) {
        let self = this;
        let history = self._state.puzzle.history;

        let filledEdges = [];
        let immediateFilledEdge = false;
        let filledVertices = [];
        let immediateFilledVertex = false;
        let originalVertexPosition = undefined;
        let originalVertexIsOppositeFilled = false;


        let snakePositions = snakePositionsSoFar || history.snakePositions;


        originalVertexPosition = snakePositions[snakePositions.length - 1];
        const originalVertexDirection = Object.entries(metaPositions.vertexPositionsByDir).map(
            ([dir, pos]) => {
                if (pos.join(',') === originalVertexPosition.join(',')) {
                    return dir;
                } else {
                    return null
                }
            }
        ).filter(dir => dir !== null)[0];

        let originalVertexOppositePositionName = null;

        switch (originalVertexDirection) {
            case 'bottomLeft':
                originalVertexOppositePositionName = 'topRight';
                break;
            case 'bottomRight':
                originalVertexOppositePositionName = 'topLeft';
                break;
            case 'topLeft':
                originalVertexOppositePositionName = 'bottomRight';
                break;
            case 'topRight':
                originalVertexOppositePositionName = 'bottomLeft';
                break;
        }

        const oppositeVertexPosition = metaPositions.vertexPositionsByDir[originalVertexOppositePositionName];

        



        let fullSnakePositions = JSON.parse(JSON.stringify(snakePositions));

        if (newPosition !== null) {
            fullSnakePositions = fullSnakePositions.concat([newPosition]);
        }

        for (let i = 0; i < fullSnakePositions.length; i++) {
            
            // Check vertex
            for (let vertexPosition of metaPositions.vertexPositions) {
                if (fullSnakePositions[i].join(',') === vertexPosition.join(',') 
                    // just because the vertex is filled it could be the same one, so check to make sure its new
                    && filledVertices.map(v => v.join(',')).indexOf(vertexPosition.join(',')) === -1) {
                    filledVertices.push(vertexPosition);

                    if (oppositeVertexPosition !== undefined 
                        && vertexPosition.join(',') === oppositeVertexPosition.join(',')) {
                        originalVertexIsOppositeFilled = true;
                    }

                    if (i === fullSnakePositions.length - 1) {
                        immediateFilledVertex = vertexPosition;
                    }
                }
            }

            // Check edge, has to have at least two vertices
            if (i > 0) {

                let possibleEdgePositionsPairs = [
                    [fullSnakePositions[i-1], fullSnakePositions[i]],
                    [fullSnakePositions[i], fullSnakePositions[i-1]]
                ];

                
                
                for (let possibleEdgePositionsPair of possibleEdgePositionsPairs) {
                    for (let edgePosition of metaPositions.edgePositions) {

                        if (possibleEdgePositionsPair.map(pair=>pair.join(',')).join(' ')
                            === edgePosition.edgeByLower.map(pair => pair.join(',')).join(' ')) {

                            filledEdges.push(edgePosition);

                            if (i===fullSnakePositions.length-1) {
                                immediateFilledEdge = edgePosition;
                            }

                        }

                    }
                }
            }


        }



        return { immediateFilledEdge, filledEdges, immediateFilledVertex, filledVertices, 
            originalVertexPosition, originalVertexIsOppositeFilled };
    
    }

    __getTriangleMetaPositions(triangle) {

        const bottomLeft = [triangle[0] - 1, triangle[1] - 1];
        const bottomRight = [triangle[0], triangle[1] - 1];
        const topLeft = [triangle[0] - 1, triangle[1]];
        const topRight = [triangle[0], triangle[1]];

        const vertexPositions = [bottomLeft, bottomRight, topLeft, topRight];
        const vertexPositionsByDir = {bottomLeft, bottomRight, topLeft, topRight};

        const edgePositions = [
            {dir: 'left', edgeByLower: [bottomLeft, topLeft]},
            {dir: 'right', edgeByLower: [bottomRight, topRight]},
            {dir: 'top', edgeByLower: [topLeft, topRight]},
            {dir: 'bottom', edgeByLower: [bottomLeft, bottomRight]}
        ]

        return {
            vertexPositions, 
            edgePositions,
            vertexPositionsByDir
        }
        
    }

    __positionIsTrianglePROBABLEMUST(newPosition) {
        let self = this;
        let fulfills = false;


        if (self._state.puzzle.setup.constraints
            && self._state.puzzle.setup.constraints.triangles) {

            let concernedTriangles = self.__trianglesTouchedByPosition(newPosition);
            let mustPROBABLEtriangle = [];

            for (let triangle of concernedTriangles) {
                mustPROBABLEtriangle.push(self.__checkTriangleMUSTPROBABLE(triangle, newPosition));
            }

            mustPROBABLEtriangle = mustPROBABLEtriangle.filter(mustCross => mustCross !== undefined);


            if (mustPROBABLEtriangle.length === 0) return false;

            const allTrianglesMUSTPROBABLEFromThisPosition = mustPROBABLEtriangle.reduce((a, b) => a || b, false);
            return allTrianglesMUSTPROBABLEFromThisPosition;

        }

        return fulfills;
    }

    __positionFulfillsImmediateTriangleMustConstraints(newPosition, snakePositionsSoFar) {
        let self = this;
        let history = self._state.puzzle.history;
        let fulfills = false;


        if (self._state.puzzle.setup.constraints
            && self._state.puzzle.setup.constraints.triangles) {
                
            let concernedTriangles = self.__trianglesTouchedByPosition(newPosition);
            let mustCrossTriangles = [];

            for (let triangle of concernedTriangles) {
                mustCrossTriangles.push(self.__checkTriangleMustMove(triangle, newPosition, snakePositionsSoFar));
            }

            mustCrossTriangles = mustCrossTriangles.filter(mustCross => mustCross !== undefined);


            if (mustCrossTriangles.length === 0) return false;

            const allTrianglesMustCrossedFromThisPosition = mustCrossTriangles.reduce((a, b) => a && b, true);
            return allTrianglesMustCrossedFromThisPosition;

        }

        return fulfills;
    }


    __trianglesTouchedByPosition(newPosition) {
        let self = this;
        return self._state.puzzle.setup.constraints
            .triangles
            .filter(triangleConstraint =>
                (triangleConstraint[0] >= newPosition[0]
                    && triangleConstraint[0] <= newPosition[0] + 1)
                && (triangleConstraint[1] >= newPosition[1]
                    && triangleConstraint[1] <= newPosition[1] + 1)
            );
    }


    __positionViolatesNumTriangleEdges(newPosition, snakePositionsSoFar) {
        let self = this;
        let history = self._state.puzzle.history;
        let fulfills = false;


        if (self._state.puzzle.setup.constraints
            && self._state.puzzle.setup.constraints.triangles) {

            let concernedTriangles = self.__trianglesTouchedByPosition(newPosition);
            let tooManyEdgesTriangles = [];

            for (let triangle of concernedTriangles) {
                tooManyEdgesTriangles.push(self.__checkTriangleTooManyEdges(triangle, newPosition, snakePositionsSoFar));
            }

            tooManyEdgesTriangles = tooManyEdgesTriangles.filter(tooManyEdges => tooManyEdges !== undefined);

            if (tooManyEdgesTriangles.length === 0) return false;

            const allTrianglesTooManyFromThisPosition = tooManyEdgesTriangles.reduce((a, b) => a || b, false);
            return allTrianglesTooManyFromThisPosition;

        }

        return fulfills;
    }


    __positionViolatesTriangleFulfillmentPossibility(newPosition, snakePositionsSoFar) {
        let self = this;
        let history = self._state.puzzle.history;
        let fulfills = false;


        if (self._state.puzzle.setup.constraints
            && self._state.puzzle.setup.constraints.triangles) {

            let concernedTriangles = self.__trianglesTouchedByPosition(newPosition);
            let unsolvableTriangles = [];

            for (let triangle of concernedTriangles) {
                unsolvableTriangles.push(self.__checkTriangleIsNotSolvable(triangle, newPosition, snakePositionsSoFar));
            }

            unsolvableTriangles = unsolvableTriangles.filter(unsolvable => unsolvable !== undefined);

            if (unsolvableTriangles.length === 0) return false;

            const allTrianglesUnsolvableFromThisPosition = unsolvableTriangles.reduce((a, b) => a || b, false);
            return allTrianglesUnsolvableFromThisPosition;

        }

        return fulfills;
    }


    __checkTriangleMUSTPROBABLE(triangle, newPosition) {

        let self = this;
        let history = self._state.puzzle.history;

        let metaPositions = self.__getTriangleMetaPositions(triangle);
        let triangleFilledMeta = self.__triangleFilledVerticesAndEdges(triangle, newPosition, metaPositions);

        if (triangle[2] === 3 
            && triangleFilledMeta.filledVertices.length === 2 
            && triangleFilledMeta.filledEdges.length === 1) {
                // console.log(triangleFilledMeta.filledEdges)
                return true;
        }
        
        return false;
    }

    __checkTriangleIsNotSolvable(triangle, newPosition, snakePositionsSoFar) {

        let self = this;
        let history = self._state.puzzle.history;

        let metaPositions = self.__getTriangleMetaPositions(triangle);
        let triangleFilledMeta = self.__triangleFilledVerticesAndEdges(triangle, newPosition, metaPositions, snakePositionsSoFar);

        const edgesRemainingToFill = triangle[2] - triangleFilledMeta.filledEdges.length;
        const remainingVerticesAvailable = 4 - triangleFilledMeta.filledVertices.length;

        if (triangleFilledMeta.immediateFilledVertex !== false) {
            return remainingVerticesAvailable < edgesRemainingToFill;
        }

        return false;
    }


    __checkTriangleTooManyEdges(triangle, newPosition, snakePositionsSoFar) {

        let self = this;
        let history = self._state.puzzle.history;

        let metaPositions = self.__getTriangleMetaPositions(triangle);
        let triangleFilledMeta = self.__triangleFilledVerticesAndEdges(triangle, newPosition, metaPositions);

        return triangleFilledMeta.filledEdges.length > triangle[2];
    }


    __positionFulfillsNotBoxedIn(newPosition) {
        let self = this;
        let history = self._state.puzzle.history;
        const size = self._state.puzzle.setup.size;
        let fulfills = false;
        

        // Radial wall direction clockwise
        function wallIndexFromOne(position) {
            if (position[1] === size[1]) return 1;
            if (position[0] === size[0]) return 2;
            if (position[1] === 0) return 3;
            if (position[0] === 0) return 4;
            return 0;
        }

        function wallsTouched(position) {
            let walls = [0,0,0,0];
            if (position[1] === size[1]) walls[0] = 1;
            if (position[0] === size[0]) walls[1] = 1;
            if (position[1] === 0) walls[2] = 1;
            if (position[0] === 0) walls[3] = 1;
            return walls;
        }


        // If the previous position is along the same wall, no need to check
        let prevPositionAlongSameWall = false;
        if (history.snakePositions.length > 1) {
            const lastPosition = history.snakePositions[history.snakePositions.length - 1];


            const isAtEnd = lastPosition[0] === self._state.puzzle.setup.endPosition[0]
                && lastPosition[1] === self._state.puzzle.setup.endPosition[1];

            if (isAtEnd) return false;



            // Not at wall, return
            if (wallIndexFromOne(lastPosition) === 0) {
                return false;
            }
            const secondLastPosition = history.snakePositions[history.snakePositions.length - 2];
            const prevWallTouched = wallsTouched(secondLastPosition);
            prevPositionAlongSameWall = wallsTouched(lastPosition)
                .map((a, i) => (a + prevWallTouched[i]) > 1 ? 1 : 0)
                .reduce((a,b) => a + b, 0);
            if (prevPositionAlongSameWall > 0) {
                // No need to check for a box if the previous last position 
                // is also along the same side for a wall
                return false;
            }
        } else {
            return false;
        }




        // Do a quick check to see if we even need to
        // traverse and determine boxing if there is no box
        let wallsHitWOCorners = [0,0,0,0];
        const corners = [[0,0],[0,size[1]], [size[0], 0], [size[0], size[1]] ];
        for (let position of history.snakePositions) {

            let isCorner = corners.reduce(
                (prevVal, corner) => prevVal + ((corner[0] === position[0] && corner[1] === position[1]) ? 1 : 0 )
                , 0)
            if (isCorner > 0) continue;

            if (wallIndexFromOne(position) > 0) {
                wallsHitWOCorners[wallIndexFromOne(position)-1] += 1;
            }
        }
        let numWallsHit = wallsHitWOCorners.reduce((prevVal, currVal) => prevVal + Math.min(currVal, 1), 0)
        // if (numWallsHit < 2) return false;

        // console.log(wallsHitWOCorners, numWallsHit)

        let globalTraverse = {};
        const validAction = self.__speedTraverseWithCBF(history.snakePositions, globalTraverse, function(traverseVars) {
            if (traverseVars.atEnd) {
                globalTraverse['searchFoundAndEndEverything'] = true;
            }
        })

        // console.log(globalTraverse, validAction)

        if (validAction !== false) {
            const lastPosition = history.snakePositions[history.snakePositions.length - 1];

            let nextPosition = [
                lastPosition[0] + validAction.dir[0],
                lastPosition[1] + validAction.dir[1]
            ];

            return JSON.stringify(nextPosition) === JSON.stringify(newPosition);
        } else {
            return 'unsolvable';
        }
        
    }


    __actionsSpeedToEndPointWithoutAffectingPuzzle(snakePositionsSet) {

    }

    __speedTraverseWithCBF(snakePositionsSoFar, globalTraverse, cbf) {

        // const currSnakePositions = JSON.parse(JSON.stringify(snakePositionsSoFar));

        const self = this;
        const puzzle = self._state.puzzle;

        const lastSnakePosition = snakePositionsSoFar[snakePositionsSoFar.length - 1];

        const atEnd = lastSnakePosition.join(' ') === puzzle.setup.endPosition[0] + ' ' + puzzle.setup.endPosition[1];

        cbf({ atEnd, globalTraverse, snakePositionsSoFar})

        if (globalTraverse['searchFoundAndEndEverything']) {
            return true;
        }

        let dirns = [
            { name: 'up', dir: [0, 1] },
            { name: 'right', dir: [1, 0] },
            { name: 'down', dir: [0, -1] },
            { name: 'left', dir: [-1, 0] },
        ];

        let validDirns = [];

        for (let dirn of dirns) {

            let newPosition = [
                lastSnakePosition[0] + dirn.dir[0],
                lastSnakePosition[1] + dirn.dir[1]
            ];

            const invalidPosition = self.__positionIsOutOfBounds(newPosition)
                || self.__positionIsRetractingMove(newPosition, snakePositionsSoFar)
                || self.__positionCrossesPreviousSnakePosition(newPosition, snakePositionsSoFar)
                || self.__positionViolatesCannotCrossFull(newPosition)
                || self.__positionViolatesCannotCrossPart(newPosition, lastSnakePosition)
                || self.__positionViolatesNumTriangleEdges(newPosition, snakePositionsSoFar) // relies on history, whereas other functions here depend on snakepositionsofar 
                || self.__positionViolatesTriangleFulfillmentPossibility(newPosition, snakePositionsSoFar);


            if (invalidPosition) {
                continue;
            }

            let newSnakePositions = JSON.parse(JSON.stringify(snakePositionsSoFar))
                .concat([newPosition])

            const outcome = self.__speedTraverseWithCBF(newSnakePositions, globalTraverse, cbf)

            if (outcome) {
                return dirn;
            }

            // if (globalTraverse['searchFoundAndEndEverything']) {
            //     return true;
            // }
        }

        return false;

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
        let newPositionEntersPartlyCannotCross = false;
        let newPositionEntersFullyCannotCross = false;
        let newPositionEntersPreviousSnakePosition = false;
        let isRetractingMove = false;
        let puzzleSolved = false;

        newPositionIsOutOfBounds = self.__positionIsOutOfBounds(newPosition);
        isRetractingMove = self.__positionIsRetractingMove(newPosition, history.snakePositions);
        newPositionEntersPreviousSnakePosition = self.__positionCrossesPreviousSnakePosition(newPosition, history.snakePositions);
        newPositionEntersFullyCannotCross = self.__positionViolatesCannotCrossFull(newPosition);
        newPositionEntersPartlyCannotCross = self.__positionViolatesCannotCrossPart(newPosition, history.lastSnakePosition);

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
                    
                    if (currentlyAtEndPosition ) {
                        puzzle.__generated.isEndGame = true;
                        puzzleSolved = self.__gameCheckStatus();
                    }
                } else {
                    history.lastMoveAttemptedToCrossPosition = newPositionEntersPreviousSnakePosition;
                    history.lastMoveAttemptedToCrossPartlyBrokenPosition = newPositionEntersPartlyCannotCross;
                }
            } 
            
        }

        if (opts && opts.doNotCalcNextMoves) {

        } else {
            self.calculateImmediateNextMoves({validAddedNewPosition});
        }


        if (opts !== undefined && (opts.triggerPOLCstraightToExit !== false || opts.userDrivenMove)) {
            self.policyPaths({ POLCstraightToExit: true })
        }

        if (opts !== undefined && (opts.triggerNLookAhead !== false || opts.userDrivenMove)) {
            self.M(self._settings.options.entropyLookAhead);
        }
        
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


        if (!self._settings.options.doNotStopOrRestartAtEnd) {

        // User at the end and it's not solved, and puzzle is to reset on failure
        if (self._settings.options.resetPuzzleOnFailure && !puzzleSolved && currentlyAtEndPosition) {
            self._state.puzzle.history.attemptErrors += 1;
                self.enableInput(false, {
                    forDuration: 1200, cbf: function () {
                self.restartPuzzle({ byAttemptError: true });
                self.__events.trigger('attemptError', self);
        }
                })
            }

        if (isPuzzleReset) {
            self.__events.trigger('resetted', self);
        }

        if (puzzleSolved) {
            self._state.puzzle.history.endsTimeFromStart = new Date().getTime() - self._state.puzzle.history.firstActivatedTime;
            self.__events.trigger('solved', self);
            }

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

    __constraintCheckTriangles(puzzle, history) {
        let self = this;

        if (self._state.puzzle.setup.constraints
            && self._state.puzzle.setup.constraints.triangles) {

            let mustPROBABLEtriangle = [];

            for (let triangle of self._state.puzzle.setup.constraints.triangles) {

                const metaPositions = self.__getTriangleMetaPositions(triangle);
                const triangleFilledMeta = self.__triangleFilledVerticesAndEdges(triangle, null, metaPositions);

                if (triangleFilledMeta.filledEdges.length !== triangle[2]) {
                    return false
                };
            }

        }

        return true
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
            if (!self.__constraintCheckTriangles(puzzle, history)) return false;


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

// export default WitnessPuzzle;
module.exports = WitnessPuzzle;