'use strict'
import d3 from '../_dependencies/d3/4.13.0/d3roll.min.js';

const KEYCODE_UP = 38;
const KEYCODE_RIGHT = 39;
const KEYCODE_DOWN = 40;
const KEYCODE_LEFT = 37;

const KEYCODE_W = 87;
const KEYCODE_A = 65;
const KEYCODE_S = 83;
const KEYCODE_D = 68;


class WitnessPuzzle_Visualization {
    constructor(core, properties) {
        let self = this;
        self.__setupSelfVariables(core, properties);
        self.generateViz(core, properties);
    }

    __setupSelfVariables(core, properties) {
        let self = this;
        self._core = core;
        if (core._settings.options.render === false) return;
        self._settings = properties || {};
        

        let puzzle = self._core._state.puzzle;
        let maxSize = Math.max(...puzzle.setup.size);
        let displaySettingsForMaxSize = {
            2: {
                spacing: 75,
                circleRadius: 14
            },
            3: {
                spacing: 60,
                circleRadius: 11
            },
            4: {
                spacing: 50,
                circleRadius: 9
            }
        };
        self._settings.display = displaySettingsForMaxSize[maxSize];
        self._settings.display.maxSize = maxSize;

        let colorScheme = {
            'default': {
                circles: ['#000', '#fff'],
                background: '#4A49FD',
                snakeStillSolving: '#C2E0FF',
                snakeDefault: '#22059b',
                circlesError: 'red',
                snakeSolved: 'rgba(116, 166, 254)',
                snakeError: 'rgb(51, 51, 51)',
                backgroundError: 'rgb(255,180,180)',
                playback: {
                    background: 'rgba(245,245,245,1)',
                    backgroundCompleted: 'rgb(242,236,255)'
                }
            },
            'alt1': {
                circles: ['white', 'rgb(90,210,90)'],
                background: '#4A49FD',
                snakeStillSolving: '#C2E0FF',
                snakeDefault: '#22059b',
                circlesError: 'red',
                snakeSolved: 'rgba(116, 166, 254, 0.5)',
                snakeError: 'rgb(51, 51, 51)',
                backgroundError: 'rgb(255,180,180)',
                playback: {
                    background: 'rgba(245,245,245,1)',
                    backgroundCompleted: 'rgb(242,236,255)'
                }
            },
            'alt2': {
                circles: ['rgb(90,90,210)', '#111'],
                background: 'white',
                snakeStillSolving: '#111',
                snakeDefault: '#bbb',
                circlesError: 'red',
                snakeSolved: '#888',
                snakeError: 'rgb(210,90,90)',
                backgroundError: 'rgb(255,180,180)',
                playback: {
                    background: 'rgba(245,245,245,1)',
                    backgroundCompleted: 'rgb(242,236,255)'
                }
            },
            'alt3': {
                circles: ['rgb(90,170,210)', '#111', '#822', '#050'],
                background: 'white',
                snakeStillSolving: '#66e',
                snakeDefault: '#bbb',
                circlesError: 'red',
                snakeSolved: '#6a6',
                snakeError: 'rgb(210,90,90)',
                backgroundError: 'rgb(255,180,180)',
                playback: {
                    background: 'rgba(245,245,245,1)',
                    backgroundCompleted: 'rgb(242,236,255)'
                }
            }
        }
        self._settings.display.colors = colorScheme['alt3'];

        self._state = {
            id: null,
            canvasSize: 300
        }
        self._objs = {
            container: null,
            params: {}
        };

    }

    __generateRandomID(length) {
        return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
    }

    __generateInstanceID() {
        let self = this;
        let idUnique = false;
        let currID = "";
        while(!idUnique) {
            currID = 'witnessPuzzle_' + self.__generateRandomID(5);
            idUnique = d3.selectAll('.'+currID).empty();
        }
        return currID;
    }

    render() {
        let self = this;
        if (self._core._settings.options.render === false) return;
                
        let puzzle = self._core._state.puzzle;
        let ispuzzle = self._core._state.active;
        let obsfucate = self._core._settings.options.obsfucate;

        let dSettings = self._settings.display;



        if (self._objs.container === null) {
            self._objs.container = d3.select(self._core._settings.options.targetElement)
                .append('svg')  
                .classed('witnessPuzzleContainer', true)
                .attr('width', self._state.canvasSize)
                .attr('height', self._state.canvasSize)
                .attr('viewBox', '0 0 ' + self._state.canvasSize + ' ' + self._state.canvasSize);

            if (self._core._settings.options.classed !== undefined) {
                self._core._settings.options.classed.forEach(classed=>{
                    self._objs.container.classed(classed, true);
                })
            }
        }
            
            
        let svg = self._objs.container;
        
        // if (self._core._state.mode !== 'image') {
        //     svg.on('click', function(){
        //         console.log('svg click');
        //         if (!obsfucate || obsfucate === undefined) {
        //             self._core.activate();
        //         }
        //     })
        // }
            
        if (obsfucate && !ispuzzle) {
            svg.style('opacity', 0);
        } else {
            svg.transition()
                .duration(500)
                .style('opacity', 1)
        }

        // let svg = d3.select(self._core._settings.options.targetElement + ' svg.witnessPuzzleContainer');

        // if (svg.empty()) {
        //     svg = d3.select(self._core._settings.options.targetElement)
        //         .append('svg')  
        //         .classed('witnessPuzzleContainer', true)
        //         .attr('width', self._state.canvasSize)
        //         .attr('height', self._state.canvasSize);
        // }

        let puzzleG = svg.selectAll('.witnessPuzzle')
            .data([self._core]);

        if (svg.selectAll('.backgroundRect').empty()) {
            svg.append('rect')
                .classed('backgroundRect', true)
                .attr('fill', dSettings.colors.background)
                .attr('width', self._state.canvasSize)
                .attr('height', self._state.canvasSize);
        }




        if (self._core._state.mode === 'playback') {
            let backgroundColor = dSettings.colors.playback.background;
            let delay = 0, duration = 0;
            if (self._core._state.playback.status === 'complete') {
                backgroundColor = dSettings.colors.playback.backgroundCompleted;
                delay = 800;
                duration = 1000;
            }
            svg.selectAll('.backgroundRect')
                .transition()
                .delay(delay)
                .duration(duration)
                .attr('fill', backgroundColor);
        }

        // ENTER
        puzzleG.enter()
            .append('g')
            .classed('witnessPuzzle', true)
            .attr('transform', function(d){
                if (puzzle.setup.size[0] === 1) {
                    if (dSettings.maxSize === 2) {
                        return 'translate(30,0)';
                    } else if(dSettings.maxSize === 3) {
                        return 'translate(60,0)';
                    } 
                }
            });

        // ENTER + UPDATE
        puzzleG.merge(puzzleG);


        let gridlines = svg.select('.witnessPuzzle').selectAll('.gridline')
            .data(puzzle.__generated.gridlines)
            .enter()
            .append('line')
            .classed('gridline', true)
            .attr('x1', d => (d[0] + 1) * dSettings.spacing)
            .attr('y1', d => self._state.canvasSize - (d[1] + 1) * dSettings.spacing)
            .attr('x2', d => (d[2] + 1) * dSettings.spacing)
            .attr('y2', d => self._state.canvasSize - (d[3] + 1) * dSettings.spacing)
            .attr('stroke', dSettings.colors.snakeDefault)
            .attr('stroke-width', '10')
            .attr('stroke-linecap', 'round');


        let startCircle = svg.select('.witnessPuzzle').selectAll('.startCircle')
            .data([puzzle.setup.startPosition])
            .enter()
            .append('circle')
            .classed('startCircle', true)
            .attr('cy', d => self._state.canvasSize - (d[1] + 1) * dSettings.spacing)
            .attr('cx', d => (d[0] + 1) * dSettings.spacing)
            .attr('r', 13)
            .attr('fill', dSettings.colors.snakeDefault);







                    
        let showPulse = false;
        if(self._core._settings.options.promptUserToActivate
            && !ispuzzle
            && (JSON.stringify(puzzle.history.lastSnakePosition) === JSON.stringify(puzzle.setup.startPosition))) {
                showPulse = true;
            }
        let startUserPromptPulseData =  showPulse ? [puzzle.history.snakePositions[puzzle.history.snakePositions.length - 1]]: [] ;

        let startUserPromptPulse = svg.select('.witnessPuzzle').selectAll('.startUserPromptPulse')
            .data(startUserPromptPulseData, d => 0);

        let startUserPromptPulseEntered = startUserPromptPulse.enter()
            .append('circle')
            .classed('startUserPromptPulse', true)
            .attr('r', 3.5)
            .attr('stroke', 'rgba(255,255,255,0.7)')
            .attr('stroke-width', '2')
            .attr('fill', 'none')
            .attr('cx', d => d[0] * dSettings.spacing + dSettings.spacing)
            .attr('cy', d => self._state.canvasSize - d[1] * dSettings.spacing - dSettings.spacing)

        startUserPromptPulseEntered
            .append('animate')
            .attr('atributeType', 'SVG')
            .attr('attributeName', 'r')
            .attr('begin', '0s')
            .attr('dur', '2.5s')
            .attr('repeatCount', 'indefinite')
            .attr('from', '0')
            .attr('to', '50');

        startUserPromptPulseEntered
            .append('animate')
            .attr('atributeType', 'CSS')
            .attr('attributeName', 'opacity')
            .attr('begin', '0s')
            .attr('dur', '2.5s')
            .attr('repeatCount', 'indefinite')
            .attr('from', '1')
            .attr('to', '-1.25');

        startUserPromptPulse.exit()
            .remove();



        let endGridline = svg.select('.witnessPuzzle').selectAll('.endGridline')
            .data([puzzle.setup.endPosition])
            .enter()
            .append('line')
            .classed('endGridline', true)
            .attr('x1', d => (d[0] + 1) * dSettings.spacing)
            .attr('y1', d => self._state.canvasSize - (d[1] + 1) * dSettings.spacing)
            .attr('x2', d => (d[0] + 1 + (d[2] === 2 ? 0.2 : 0) + (d[2] === 4 ? -0.2 : 0)) * dSettings.spacing)
            .attr('y2', d => self._state.canvasSize - (d[1] + 1 + (d[2] === 1 ? 0.2 : 0) + (d[2] === 3 ? -0.2 : 0)) * dSettings.spacing)
            .attr('stroke', dSettings.colors.snakeDefault)
            .attr('stroke-width', '10')
            .attr('stroke-linecap', 'round');


        
        svg.select('.witnessPuzzle').selectAll('.bounceSnakeLine').remove();
        if (puzzle.history.lastMoveAttemptedToCrossPosition || puzzle.history.lastMoveAttemptedToCrossPartlyBrokenPosition) {
            let bounceSnakeLine = svg.select('.witnessPuzzle').selectAll('.bounceSnakeLine')
                .data([[puzzle.history.lastSnakePosition, puzzle.history.moveAttempts[puzzle.history.moveAttempts.length-1].userMove]])
                .enter()
                .append('line')
                .classed('bounceSnakeLine', true)
                .attr('stroke', dSettings.colors.snakeStillSolving)
                .attr('stroke-width', '10')
                .attr('stroke-linecap', 'round')
                .attr('x1', d => (d[0][0] + 1) * dSettings.spacing)
                .attr('y1', d => self._state.canvasSize - (d[0][1] + 1) * dSettings.spacing)
                .attr('x2', d => (d[0][0] + 1) * dSettings.spacing)
                .attr('y2', d => self._state.canvasSize - (d[0][1] + 1) * dSettings.spacing)
                .transition()
                .duration(25)
                .attr('x2', d => (d[0][0] + d[1][0] * (puzzle.history.lastMoveAttemptedToCrossPartlyBrokenPosition ? 0.3 : 0.65) + 1) * dSettings.spacing)
                .attr('y2', d => self._state.canvasSize - (d[0][1] + d[1][1] * (puzzle.history.lastMoveAttemptedToCrossPartlyBrokenPosition ? 0.3 : 0.65)  + 1) * dSettings.spacing)
                .transition()
                .duration(125)
                .attr('x2', d => (d[0][0] + 1) * dSettings.spacing)
                .attr('y2', d => self._state.canvasSize - (d[0][1] + 1) * dSettings.spacing);
        }

        // if (puzzle.history.moveAttempts.length > 0) {

        let startCircleData = !ispuzzle ? [] : [puzzle.history.snakePositions[0]];
        
        let snakeStartCircle = svg.select('.witnessPuzzle').selectAll('.snakeStartCircle')
            .data(startCircleData, d => 0);

        snakeStartCircle.enter()
            .append('circle')
            .classed('snakeStartCircle', true)
            .attr('fill', dSettings.colors.snakeStillSolving)
            .attr('cy', d => self._state.canvasSize - (d[1] + 1) * dSettings.spacing)
            .attr('cx', d => (d[0] + 1) * dSettings.spacing)
            .attr('r', 0)
            .transition()
            .duration(500)
            .attr('r', 13);

        snakeStartCircle
            .exit()
            .remove();

        let snakePath = svg.select('.witnessPuzzle').selectAll('.snakePath')
            .data([puzzle.history.snakePositions], d=> 0);

        snakePath.enter()
            .append('path')
            .classed('snakePath', true)
            .attr('stroke', dSettings.colors.snakeStillSolving)
            .attr('fill', 'none')
            .attr('d', d => {
                return 'M ' + (d[0][0] * dSettings.spacing + dSettings.spacing) + ' ' + (self._state.canvasSize - d[0][1] * dSettings.spacing - dSettings.spacing)
            })
            .attr('stroke-width', '10')
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round')
            .merge(snakePath)
            .transition()
            .duration(1000)
            .attr('d', function(d){
                return 'M ' + (d[0][0] * dSettings.spacing + dSettings.spacing) + ' ' + (self._state.canvasSize - d[0][1] * dSettings.spacing - dSettings.spacing) 
                + d.map((m,i,a) => {
                    if (a.length > 0 && i > 0) {
                        return ' h ' + ((a[i][0] - a[i - 1][0]) * dSettings.spacing) + ' v ' + ((a[i][1] - a[i - 1][1]) * -dSettings.spacing)
                    }
                }).join(', ')
            })
            // .attrTween("d", function (d) {

            //     this._current = this._current || d;

            //     console.log(d, this.current);
            //     return function(t) {
            //         console.log(t);
            //         return '';
            //     }
            //     // var interpolate = d3.interpolate(this._current, d);
            //     // this._current = interpolate(0);
            //     // return function (t) {
            //     //     return arc(interpolate(t));
            //     // };
            // });


        
        
        let snakeHeadCircleData = [puzzle.setup.startPosition]//!ispuzzle ? [] : [puzzle.history.snakePositions[puzzle.history.snakePositions.length - 1]];

        let snakeHeadCircle = svg.select('.witnessPuzzle').selectAll('.snakeHeadCircle')
            .data(snakeHeadCircleData, d => 0);

        let snakeHeadEnter = snakeHeadCircle.enter()
            .append('circle')
            .classed('snakeHeadCircle', true)
            .attr('r', 3.5)
            .attr('stroke', 'rgba(0,0,0,0.5)')
            .attr('stroke-width', '0.5')
            .attr('fill', 'rgba(255,255,255,0.5)');

        snakeHeadCircle = snakeHeadEnter
            .merge(snakeHeadCircle);

        snakeHeadCircle
            .attr('stroke', 'rgba(0,0,0,' + (puzzle.history.snakePositions.length > 1 ? '0.5' : '0') +')')
            .attr('cx', d => d[0] * dSettings.spacing + dSettings.spacing)
            .attr('cy', d => self._state.canvasSize - d[1] * dSettings.spacing - dSettings.spacing);

        // snakeHeadCircle.exit()
        //     .remove();





        if (puzzle.setup.constraints !== undefined) {

            //////////////
            // Colored Squares
            //////////////

            // If there are colored squares, draw
            if (puzzle.setup.constraints.regionConstraints !== undefined && puzzle.setup.constraints.regionConstraints.length !== 0) {
                // let filledSquareCircles = puzzleG.selectAll('.filledSquareCircle')
                let filledSquareCircles = svg.select('.witnessPuzzle').selectAll('.filledSquareCircle')
                    .data(puzzle.setup.constraints.regionConstraints, d => d[0] + ' ' + d[1]);

                filledSquareCircles.enter()
                    // .append('circle')
                    .append('rect')
                    .attr('class', d => 'filledSquareCircle_' + d[0] + '_' + d[1])
                    .classed('filledSquareCircle', true)
                    // .attr('cy', d => self._state.canvasSize - (d[1] + 0.5) * dSettings.spacing)
                    // .attr('cx', d => (d[0] + 0.5) * dSettings.spacing)
                    // .attr('r', dSettings.circleRadius)
                    .attr('x', d => (d[0] + 0.3) * dSettings.spacing)
                    .attr('y', d => self._state.canvasSize - (d[1] + 0.7) * dSettings.spacing)
                    .attr('width', dSettings.spacing * 0.4)
                    .attr('height', dSettings.spacing * 0.4)
                    .attr('rx', dSettings.spacing * 0.1)
                    .attr('stroke', 'rgba(0,0,0,0)')
                    .attr('fill', d => {
                        let colorID = d[2];
                        if (typeof dSettings.colors.circles[colorID] !== 'undefined') {
                            return dSettings.colors.circles[colorID]
                        }
                        return 'rgba(0,0,0,0)';
                    });

                // ENTER + UPDATE
                filledSquareCircles.merge(filledSquareCircles);

            }

            //////////////
            // Must crosses
            //////////////

            // If there are colored squares, draw
            if (puzzle.setup.constraints.mustCrosses !== undefined && puzzle.setup.constraints.mustCrosses.length !== 0) {
                // let filledSquareCircles = puzzleG.selectAll('.filledSquareCircle')
                let mustCrosses = svg.select('.witnessPuzzle').selectAll('.mustCross')
                    .data(puzzle.setup.constraints.mustCrosses, d => d[0] + ' ' + d[1]);

                mustCrosses.enter()
                    .append('circle')
                    .attr('class', d => 'mustCross_' + d[0] + '_' + d[1])
                    .classed('mustCross', true)
                    .attr('cy', d => self._state.canvasSize - (d[1] + 1) * dSettings.spacing)
                    .attr('cx', d => (d[0] + 1) * dSettings.spacing)
                    .attr('r', 4)
                    .attr('stroke', 'rgba(0,0,0,0)')
                    .attr('fill', d => {
                        // let colorID = d[2];
                        // if (typeof dSettings.colors.circles[colorID] !== 'undefined') {
                        //     return dSettings.colors.circles[colorID]
                        // }
                        return 'rgba(0,0,0,1)';
                    });

                // ENTER + UPDATE
                mustCrosses.merge(mustCrosses);

            }


            // // If there are colored squares, draw
            // if (puzzle.setup.constraints.cannotCrosses !== undefined && puzzle.setup.constraints.cannotCrosses.length !== 0) {

            //     let fullCannotCrosses = puzzle.setup.constraints.cannotCrosses.filter(d => d[0] === parseInt(d[0]) && d[1] === parseInt(d[1]))
            //     let partCannotCrosses = puzzle.setup.constraints.cannotCrosses.filter(d => d[0] !== parseInt(d[0]) || d[1] !== parseInt(d[1]))

            //     let partCannotCross = svg.select('.witnessPuzzle').selectAll('.partCannotCross')
            //         .data(partCannotCrosses, d=> d[0] + ' ' + d[1])
            //         .enter()
            //         .append('line')
            //         .classed('partCannotCross', true)
            //         .attr('x1', d => (d[0] + (d[0] === parseInt(d[0]) ? 1 : 0.85)) * dSettings.spacing)
            //         .attr('y1', d => self._state.canvasSize - (d[1] + (d[1] === parseInt(d[1]) ? 1 : 0.85)) * dSettings.spacing)
            //         .attr('x2', d => (d[0] + (d[0] === parseInt(d[0]) ? 1 : 1.15)) * dSettings.spacing)
            //         .attr('y2', d => self._state.canvasSize - (d[1] + (d[1] === parseInt(d[1]) ? 1 : 1.15)) * dSettings.spacing)
            //         .attr('stroke', dSettings.colors.snakeDefault)
            //         .attr('stroke-width', '10')
            //         .attr('stroke-linecap', 'butt')
            //         .attr('stroke', '#fff');

            //     let expandedFullCannotCrosses = []
            //     fullCannotCrosses.forEach(d=>{
            //         for (let dir of [[0,1],[0,-1],[-1,0],[1,0]]) {
            //             let newX = dir[0] + d[0];
            //             let newY = dir[1] + d[1];
            //             if (newX >= 0 && newX <= puzzle.setup.size[0] && newY >= 0 && newY <= puzzle.setup.size[1]) {
            //                 expandedFullCannotCrosses.push([d[0], d[1], newX, newY]);
            //             }
            //         }
            //     })


            //     let expandedFullCannotCross = svg.select('.witnessPuzzle').selectAll('.expandedFullCannotCrosses')
            //         .data(expandedFullCannotCrosses, d => d.join(' '))
            //         .enter()
            //         .append('line')
            //         .classed('expandedFullCannotCrosses', true)
            //         .attr('x1', d => (d[0] + 1) * dSettings.spacing)
            //         .attr('y1', d => self._state.canvasSize - (d[1] + 1) * dSettings.spacing)
            //         .attr('x2', d => (d[2] + 1) * dSettings.spacing)
            //         .attr('y2', d => self._state.canvasSize - (d[3] + 1) * dSettings.spacing)
            //         .attr('stroke', dSettings.colors.snakeDefault)
            //         .attr('stroke-width', '10')
            //         .attr('stroke-linecap', 'square')
            //         .attr('stroke', '#fff');

            // }
        }





        // if () {

            
        // let endGridline = svg.select('.witnessPuzzle').selectAll('.endGridline')
        // .data([puzzle.setup.endPosition])
        // .enter()
        // .append('line')
        // .classed('endGridline', true)
        // .attr('x1', d => (d[0] + 1) * 50)
        // .attr('y1', d => self._state.canvasSize - (d[1] + 1) * 50)
        // .attr('x2',)
        // .attr('y2',)
        // .attr('stroke', '#22059b')
        // .attr('stroke-width', '10')
        // .attr('stroke-linecap', 'round');
            // .attr('x2', d => (d[0] + 1 + (d[2] === 2 ? 0.2 : 0) + (d[2] === 4 ? -0.2 : 0)) * 50)
            // .attr('y2', d => self._state.canvasSize - (d[1] + 1 + (d[2] === 1 ? 0.2 : 0) + (d[2] === 3 ? -0.2 : 0)) * 50)
            // .attr('stroke', '#22059b')

        let showEndPulse = false;
        if(!puzzle.__generated.isEndGame && !showPulse && ispuzzle) {
            showEndPulse = true;
        }
        let endUserPromptPulseData = showEndPulse ? [[puzzle.setup.endPosition]]: [] ;

        let endUserPromptPulse = svg.select('.witnessPuzzle').selectAll('.endUserPromptPulse')
            .data(endUserPromptPulseData);

        let endUserPromptPulseEntered = endUserPromptPulse.enter()
            .append('circle')
            .classed('endUserPromptPulse', true)
            .attr('r', 3.5)
            .attr('stroke', 'rgba(255,255,255,0.7)')
            .attr('stroke-width', '2')
            .attr('fill', 'none')
            .attr('cx', d => (d[0][0] + 1 + (d[0][2] === 2 ? 0.2 : 0) + (d[0][2] === 4 ? -0.2 : 0)) * dSettings.spacing)
            .attr('cy', d => self._state.canvasSize - (d[0][1] + 1 + (d[0][2] === 1 ? 0.2 : 0) + (d[0][2] === 3 ? -0.2 : 0)) * dSettings.spacing)

        endUserPromptPulseEntered
            .append('animate')
            .attr('atributeType', 'SVG')
            .attr('attributeName', 'r')
            .attr('begin', '0s')
            .attr('dur', '4.5s')
            .attr('repeatCount', 'indefinite')
            .attr('from', '0')
            .attr('to', '40');

        endUserPromptPulseEntered
            .append('animate')
            .attr('atributeType', 'CSS')
            .attr('attributeName', 'opacity')
            .attr('begin', '0s')
            .attr('dur', '4.5s')
            .attr('repeatCount', 'indefinite')
            .attr('from', '1')
            .attr('to', '-2.5');

        endUserPromptPulse.exit()
            .remove();            

        // }

    

    

        if (svg.selectAll('.foregroundRect').empty()) {
            svg.append('rect')
                .classed('foregroundRect', true)
                .attr('fill', 'rgba(0,0,0,0)')
                .attr('tabindex', 1)
                .attr('width', self._state.canvasSize)
                .attr('height', self._state.canvasSize)
                .on('keydown', function () {
                    self.__userKeyDown(self._core);
                })
                .on('click', function () {
                    if (self._core._state.mode !== 'image' 
                        && self._core._state.mode !== 'playback') {
                        if (!obsfucate || obsfucate === undefined) {
                            self._core.activate();
                        }
                    }
                })
                .on('focus', function(){
                    self._core.__onFocus();
                })
                // .on('blur', function() {
                //     self._core.deactivate()
                // })
        }


        if (svg.selectAll('.userInterface').empty() && self._core._settings.options.userInterface) {
            let userInterfaceG = svg.append('g')
                .classed('userInterface', true)
                .attr('transform', 'translate(0,' + (self._state.canvasSize - 20) + ')');

            userInterfaceG.append('rect')
                .style('fill', 'green')
                .attr('width', 20)
                .attr('height', 20)
                .on('click', function () {
                    self.__replayHistory({speed: 'original'});
                })

            userInterfaceG.append('rect')
                .style('fill', 'yellow')
                .attr('x', 20)
                .attr('width', 20)
                .attr('height', 20)
                .on('click', function () {
                    self.__replayHistory({ speed: 200 });
                })
        }    


        if (ispuzzle) {    
            svg.select('.foregroundRect').node().focus();
        }


        function pulseSnakeError() {

            svg.select('.snakeStartCircle')
                .transition()
                .duration(200)
                .attr('fill', dSettings.colors.snakeError)
                .transition()
                .duration(200)
                .attr('fill', dSettings.colors.snakeStillSolving)
                .transition()
                .duration(200)
                .attr('fill', dSettings.colors.snakeError)
                .transition()
                .duration(200)
                .attr('fill', dSettings.colors.snakeStillSolving)
                .transition()
                .duration(200)
                .attr('fill', dSettings.colors.snakeError)
                .transition()
                .duration(200)
                .attr('fill', dSettings.colors.snakeStillSolving)

            svg.select('.snakePath')
                .transition()
                .duration(200)
                .attr('stroke', dSettings.colors.snakeError)
                .transition()
                .duration(200)
                .attr('stroke', dSettings.colors.snakeStillSolving)
                .transition()
                .duration(200)
                .attr('stroke', dSettings.colors.snakeError)
                .transition()
                .duration(200)
                .attr('stroke', dSettings.colors.snakeStillSolving)
                .transition()
                .duration(200)
                .attr('stroke', dSettings.colors.snakeError)
                .transition()
                .duration(200)
                .attr('stroke', dSettings.colors.snakeStillSolving)            
        }



        let blinkingSquaresClasses = [];
        if (puzzle.__generated.isEndGame) {

            if (puzzle.setup.constraints !== undefined && puzzle.setup.constraints.regionConstraints !== undefined && puzzle.setup.constraints.regionConstraints.length !== 0) {

                // Determine the blinkingSquaresClasses
                for (let [k, positionsInGroup] of Object.entries(puzzle.__generated.squareGroups)) {
                    let sameColor = true;
                    let groupColor = undefined;
                    for (let position of positionsInGroup) {
                        let foundPosition = puzzle.setup.constraints.regionConstraints.filter(d => d[0] === position[0] && d[1] === position[1]);
                        if (foundPosition.length === 0) {
                            sameColor = true;
                        } else {
                            let positionColor = foundPosition[0][2];
                            if (groupColor === undefined) groupColor = positionColor;
                            if (positionColor !== groupColor) {
                                sameColor = false;
                                break;
                            }
                        }
                    }
    
                    if (sameColor === false) {
                        for (let position of positionsInGroup) {
                            let foundPosition = puzzle.setup.constraints.regionConstraints.filter(d => d[0] === position[0] && d[1] === position[1]);
                            if (foundPosition.length > 0) {
                                let positionColor = foundPosition[0][2];
                                if (positionColor === 0) {
                                    blinkingSquaresClasses.push('.filledSquareCircle_' + position.join('_'))
                                }
                            }
                        }
                    }

            }

            }



            let isGameSolved = puzzle.history.isSolved; //blinkingSquaresClasses.length === 0;

            if (!isGameSolved && (ispuzzle || self._core._state.mode === 'playback')) {
                pulseSnakeError()
            } else {
                svg.select('.snakePath')
                    .transition()
                    .duration(1000)
                    .attr('stroke', dSettings.colors.snakeSolved);
            }



        } else {
            
            snakeStartCircle
                .transition()
                .duration(0)
                .attr('fill', dSettings.colors.snakeStillSolving)

            svg.select('.snakePath')
                .transition()
                .duration(0)
                .attr('stroke', dSettings.colors.snakeStillSolving);

            
            if (puzzle.__generated.travelsThroughEndpoint) {
                pulseSnakeError()
            }

            // svg.selectAll('.backgroundRect')
            //     .transition()
            //     .duration(0)
            //     .attr('fill', dSettings.colors.background)


            // svg.selectAll('.filledSquareCircle')
            //     .transition()
            //     .duration(0)
            //     .attr('fill', d => {
            //         let colorID = d[2];
            //         if (typeof dSettings.colors.circles[colorID] !== 'undefined') {
            //             return dSettings.colors.circles[colorID]
            //         }
            //         return 'rgba(0,0,0,0)';
            //     });
        }


        // }

        
    }


    __replayHistory(opts) {
        let self = this;
        self._core.__replayHistory(opts);
    }

    __updateMode(mode) {
        let self = this;
        self._state.mode = mode;

        self.render();
    }

    __generateAndRenderMDPs() {
        let self = this;
        self.__collateGeneratorParametersAndGenerate();
        self.render();
    }

    __userKeyDown(core) {
        let userMove = [0, 0];
        let keyDirection = null;

        // If puzzle solved, don't do anything
        if (core._state.solved || core._state.active === false) {
            return;
        };

        if (d3.event.keyCode === KEYCODE_W
            || d3.event.keyCode === KEYCODE_UP) {
            userMove[1] = 1;
            keyDirection = 'u';
        }

        if (d3.event.keyCode === KEYCODE_D
            || d3.event.keyCode === KEYCODE_RIGHT) {
            userMove[0] = 1;
            keyDirection = 'r';
        }

        if (d3.event.keyCode === KEYCODE_S
            || d3.event.keyCode === KEYCODE_DOWN) {
            userMove[1] = -1;
            keyDirection = 'd';
        }

        if (d3.event.keyCode === KEYCODE_A
            || d3.event.keyCode === KEYCODE_LEFT) {
            userMove[0] = -1;
            keyDirection = 'l';
        }


        d3.event.preventDefault();
        core.attemptMove(userMove);
        core.__onKeyDown(keyDirection);
    }

    generateViz(core, properties) {

        if (core._settings.options.render === false) return;

        let self = this;
        let coreAlreadyHasViz = core.modules.visualization !== null;

        if (coreAlreadyHasViz) {
            return;
        }



        self.render();

        // let uniqueID = self.__generateInstanceID();
        // self._state.id = uniqueID;
        // self.__generateHtmlElements(uniqueID);
    }

}


export default WitnessPuzzle_Visualization;
