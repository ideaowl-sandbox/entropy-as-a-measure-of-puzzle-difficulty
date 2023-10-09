'use strict'

import WitnessPuzzle_Visualization from './modules/visualization/WitnessPuzzle_Visualization.js';

class WitnessPuzzle {
    constructor(puzzleSetup, options) {
        let self = this;
        let puzzle = self.__setupSelfVariables(puzzleSetup, options);
        self.render(puzzle);

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

    // updateProperties(params) {resetPuzzleOnFailure
    //     let self = this;

    //     for (const [k, v] of Object.entries(params)) {
    //         self._state.experimentProps[k] = v;
    //     }

    // }

    // __removePuzzle(instanceID) {
    //     let self = this;

    //     // let index = -1;
    //     // self._data.mdps.filter((mdpData,i) => {
    //     //     if(mdpData.instanceID === instanceID) {
    //     //         index = i;
    //     //     }
    //     // })

    //     // self._data.mdps.splice(index, 1);
    // }

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
            snakePositions: [JSON.parse(JSON.stringify(self._state.puzzle.setup.startPosition))]
        }
        self.modules.visualization.render();
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
            targetElement: 'body'
        }

        if (options !== undefined) {
            defaultOptions = options;
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
            snakePositions: [JSON.parse(JSON.stringify(puzzle.setup.startPosition))]
        };


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


    attemptSolveWithPath(moves) {
        let self = this;
        self.restartPuzzle();
        for (let i = 0; i < moves.length; i++) {
            let outcome = self.attemptMove(moves[i],{stopAtFailure: true});
            if (outcome && outcome.hitCannotCross) {
                self._state.inputEnabled = false;
                console.log('CANNOT SOLVE');
                return false;
            }
        }
        
        return (self._state.solved ? self._state.puzzle.history.snakePositions.length : false);
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

        if (history.moveAttempts.length === 0) {
            history.lastSnakePosition = JSON.parse(JSON.stringify(self._state.puzzle.setup.startPosition));
            history.snakePositions = [JSON.parse(JSON.stringify(self._state.puzzle.setup.startPosition))];
        } 

        history.lastMoveAttemptedToCrossPosition = false;
        history.lastMoveAttemptedToCrossPartlyBrokenPosition = false;

        let newPosition = [
            history.lastSnakePosition[0] + moveData.userMove[0],
            history.lastSnakePosition[1] + moveData.userMove[1]
        ];

        let newPositionIsOutOfBounds = false;
        let finishedGame = false;
        let newPositionEntersPartlyCannotCross = false;
        let newPositionEntersFullyCannotCross = false;
        let newPositionEntersCrossedPosition = false;
        let isRetractingMove = false;
        let puzzleSolved = false;

        if (newPosition[0] < 0 || newPosition[0] > self._state.puzzle.setup.size[0]
            || newPosition[1] < 0 || newPosition[1] > self._state.puzzle.setup.size[1]) {
            newPositionIsOutOfBounds = true;
        }


        if (history.snakePositions.length > 1) {
            if (history.snakePositions[history.snakePositions.length-2].join(' ') === newPosition.join(' ')) {
                isRetractingMove = true;
            }
        }
        if (history.snakePositions.filter(d => JSON.stringify(d) === JSON.stringify(newPosition)).length > 0) {
            newPositionEntersCrossedPosition = true;
        }
        if (self._state.puzzle.setup.constraints && self._state.puzzle.setup.constraints.cannotCrosses && self._state.puzzle.setup.constraints.cannotCrosses.filter(d => JSON.stringify(d) === JSON.stringify(newPosition)).length > 0) {
            newPositionEntersFullyCannotCross = true;
        }
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
            newPositionEntersPartlyCannotCross = true;
        }


        if (isPuzzleReset) {
            isRetractingMove = false;
            newPositionEntersCrossedPosition = false;
            newPositionEntersFullyCannotCross = false;
            newPositionEntersPartlyCannotCross = false;
            history.numResets += 1;
            // history.snakePositions = [JSON.parse(JSON.stringify(self._state.puzzle.setup.startPosition))];
            history.snakePositions = [];
            newPosition = JSON.parse(JSON.stringify(self._state.puzzle.setup.startPosition));
            if (opts !== undefined && opts.byAttemptError) {
                // self.enabledInput(false, 1200);
            }
        }

        let currentlyAtEndPosition = newPosition.join(' ') === puzzle.setup.endPosition[0] + ' ' + puzzle.setup.endPosition[1];


        if (opts && opts.stopAtFailure) {
            if (newPositionEntersFullyCannotCross || newPositionEntersPartlyCannotCross) {
                return {hitCannotCross: true};
            }
        }        

        puzzle.__generated.isEndGame = false;

        if (isRetractingMove) {
            history.snakePositions.pop();
            history.lastSnakePosition = newPosition;

            if (currentlyAtEndPosition) {
                finishedGame = true;
                puzzle.__generated.isEndGame = true;
                puzzleSolved = self.__gameCheckStatus();
            }
        } 
        else {
            if (!newPositionIsOutOfBounds && !newPositionEntersFullyCannotCross) {
                if (!newPositionEntersCrossedPosition && !newPositionEntersPartlyCannotCross) {
                    history.snakePositions.push(newPosition);
                    history.lastSnakePosition = newPosition;
    
                    if (currentlyAtEndPosition) {
                        finishedGame = true;
                        puzzle.__generated.isEndGame = true;
                        puzzleSolved = self.__gameCheckStatus();
                    }
                } else {
                    history.lastMoveAttemptedToCrossPosition = newPositionEntersCrossedPosition;
                    history.lastMoveAttemptedToCrossPartlyBrokenPosition = newPositionEntersPartlyCannotCross;
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

    }

    __onFocus() {
        let self = this;
        self.__events.trigger('focus', self);
    }

    __onKeyDown(keyDirection) {
        let self = this;
        self.__events.trigger('keydown', keyDirection);
    }

    __gameCheckStatus() {
        let self = this;

        self.__groupSquaresTogether();
        return self.__checkIsPuzzleSolved();
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

        puzzle.__generated.squareGroups = {};
        let groupNumber = 0;
        while (Object.keys(puzzle.__generated.squaresToParse).length > 0) {
            puzzle.__generated.squareGroups[groupNumber] = [];
            let positionToDetermine = Object.keys(puzzle.__generated.squaresToParse)[0].split(' ');
            positionToDetermine[0] = +positionToDetermine[0];
            positionToDetermine[1] = +positionToDetermine[1];
            puzzle.__generated.squareGroups[groupNumber].push(positionToDetermine);
            delete puzzle.__generated.squaresToParse[positionToDetermine.join(' ')]
            self.__determineSquareGroups(positionToDetermine, groupNumber);    
            groupNumber += 1; 
        }

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


            //////////////
            // Colored Squares
            //////////////

            if (puzzle.setup.constraints.regionConstraints !== undefined && puzzle.setup.constraints.regionConstraints.length !== 0) {

                for (let [k, positionsInGroup] of Object.entries(puzzle.__generated.squareGroups)) {
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

    __determineSquareGroups(position, groupNumber) {
        let self = this;
        let puzzle = self._state.puzzle;
        
        // Try all directions
        let testDirections = [[0,1],[1,0],[0,-1],[-1,0]];
        let validDirections = 0;
        for (let testDirection of testDirections) {
            let connectedSquarePosition = self.__squaresAreConnected(position, testDirection);
            if (connectedSquarePosition && typeof puzzle.__generated.squaresToParse[connectedSquarePosition.join(' ')] !== 'undefined') {
                
                puzzle.__generated.squareGroups[groupNumber].push(connectedSquarePosition);
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

export default WitnessPuzzle;
