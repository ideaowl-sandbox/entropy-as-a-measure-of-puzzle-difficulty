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
            },
            5: {
                spacing: 40,
                circleRadius: 7
            }
        };
        self._settings.display = displaySettingsForMaxSize[maxSize];
        self._settings.display.maxSize = maxSize;

        let colorScheme = {
            'default': {
                circles: ['#000', '#fff'],
                triangles: ['orange'],
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
                triangles: ['orange'],
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
                triangles: ['orange'],
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
                circles: ['rgb(90,170,210)', '#111', '#822', '#080', '#EAA', '#008', '#CC0', '#0CC', '#C0C'],
                triangles: ['orange'],
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
            idUnique = d3.selectAll('.'+currID).empty();triangles
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
            let selector = self._core._settings.options.targetSelection;
            if (self._core._settings.options.targetElement !== undefined) {
                selector = self._core._settings.options.targetElement;
            }
            self._objs.container = d3.select(selector)
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

        // let svg = d3.select(self._core._settings.options.targetSelection + ' svg.witnessPuzzleContainer');

        // if (svg.empty()) {
        //     svg = d3.select(self._core._settings.options.targetSelection)
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
                    } else if (dSettings.maxSize === 4) {
                        return 'translate(90,0)';
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



        
        if (self._core._settings.options.renderImmediateLookAhead) {
            if (svg.selectAll('.lookAheadPuzzleSolvableStatus').empty()) {
                svg.append('rect')
                    .classed('lookAheadPuzzleSolvableStatus', true)
                    .attr('fill', dSettings.colors.background)
                    .attr('x', self._state.canvasSize - 30)
                    .attr('y', 0)
                    .attr('width', 30)
                    .attr('height', 30);
            }
            let puzzleSolvableConsideringHistory = puzzle.history.nextMovesCalculations[puzzle.history.nextMovesCalculations.length - 1].puzzleSolvableConsideringHistory;
            svg.selectAll('.lookAheadPuzzleSolvableStatus')
                .attr('fill', puzzleSolvableConsideringHistory ? 'green' : 'red')
        }




                    
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


        if (self._core._settings.options.renderImmediateLookAhead) {
            let possibleMoveLines = svg.select('.witnessPuzzle').selectAll('.possibleMoveOutcomeLines')
                .data(puzzle.history.possibleMoveOutcomes, d => d.position.join(' '));


            possibleMoveLines.exit().remove();

            possibleMoveLines
                .enter()
                .append('line')
                .classed('possibleMoveOutcomeLines', true)
                .attr('x1', d => (puzzle.history.lastSnakePosition[0] + 1) * dSettings.spacing)
                .attr('y1', d => self._state.canvasSize - (puzzle.history.lastSnakePosition[1] + 1) * dSettings.spacing)
                .attr('x2', d =>  (d.position[0] + 1 + (d.dir[0])*-0.6) * dSettings.spacing) //(Math.abs(d.dir[1]) > 0 ? 0.2 : 1)
                .attr('y2', d => self._state.canvasSize - (d.position[1] + 1  + (d.dir[1])*-0.6) * dSettings.spacing)
                .attr('stroke', d => {
                    if (d.botCannotAndMustMove) return 'pink';
                    if (d.cannotMove) return 'red';
                    if (d.mustMove) return 'cyan';
                    if (d.couldMove) return 'grey';
                } )//dSettings.colors.snakeDefault)
                .attr('stroke-width', '10')
                .attr('stroke-linecap', 'round');
        }









        if (self._core._settings.options.renderPOLCstraightToExit) {
            
            let straightToExitPaths = svg.select('.witnessPuzzle').selectAll('.straightToExitPaths')
                .data(puzzle.history.POLCstraightToExitPaths === undefined ? [] : puzzle.history.POLCstraightToExitPaths.paths, d => Math.random());

            function randomColourWithFixedAlpha(alpha) {
                return 'rgba(' + Math.random() * 0 + ', ' +
                    Math.random() * 255 + ', ' +
                    Math.random() * 255 + ', ' + alpha + ')';
            }

            straightToExitPaths.exit()
                .remove();

            straightToExitPaths.enter()
                .append('path')
                .classed('straightToExitPaths', true)
                .attr('stroke', (d) => d.valid ? randomColourWithFixedAlpha(0.3) : 'rgba(255,0,0,0.3)' )
                .attr('fill', 'none')
                .attr('d', d => {
                    return 'M ' + (puzzle.history.lastSnakePosition[0] * dSettings.spacing + dSettings.spacing) + ' ' + (self._state.canvasSize - puzzle.history.lastSnakePosition[1] * dSettings.spacing - dSettings.spacing)
                })
                .attr('stroke-width', '10')
                .attr('stroke-linecap', 'round')
                .attr('stroke-linejoin', 'round')
                .merge(straightToExitPaths)
                .transition()
                .duration(1000)
                .attr('d', function (d) {
                    return 'M ' + (puzzle.history.lastSnakePosition[0] * dSettings.spacing + dSettings.spacing) + ' ' + (self._state.canvasSize - puzzle.history.lastSnakePosition[1] * dSettings.spacing - dSettings.spacing)
                        + d.path.map((m, i, a) => {
                            // if (a.length > 0 && i > 0) {
                                return ' h ' + ((m[0]) * dSettings.spacing) + ' v ' + ((m[1]) * -dSettings.spacing)
                            // }
                        }).join(', ')
                })

        }


        if (self._core._settings.options.renderNLookAhead) {


            svg.select('.witnessPuzzle').selectAll('.possibleNStepLines, .possibleNStepText').remove();

            let possibleNStepLines = svg.select('.witnessPuzzle').selectAll('.possibleNStepLines')
                .data(puzzle.history.nStepActions);


            let possibleNStepText = svg.select('.witnessPuzzle').selectAll('.possibleNStepText')
                .data(puzzle.history.nStepActions);


            if (puzzle.history.nStepActions !== undefined && puzzle.history.nStepActions.length > 0) {


                // possibleNStepLines.exit().remove();
    
                possibleNStepLines
                    .enter()
                    .append('line')
                    .classed('possibleNStepLines', true)
                    .attr('x1', d => (puzzle.history.lastSnakePosition[0] + 1) * dSettings.spacing)
                    .attr('y1', d => self._state.canvasSize - (puzzle.history.lastSnakePosition[1] + 1) * dSettings.spacing)
                    .attr('x2', d => (puzzle.history.lastSnakePosition[0] + 1 + (d.dirn.dir[0]) * 0.25) * dSettings.spacing) //(Math.abs(d.dir[1]) > 0 ? 0.2 : 1)
                    .attr('y2', d => self._state.canvasSize - (puzzle.history.lastSnakePosition[1] + 1 + (d.dirn.dir[1]) * 0.25) * dSettings.spacing)
                    .attr('stroke', d => {
                        if (d.assessment === -1) return '#880000';
                        if (d.assessment === 2) return 'black';
                        if (d.assessment > 0) return '#3f3';
                        if (d.assessment === 0) return 'grey';
                    })//dSettings.colors.snakeDefault)
                    .attr('stroke-width', '10')
                    .attr('stroke-linecap', 'round');

                const puzzSize = puzzle.setup.size;
                possibleNStepText
                    .enter()
                    .append('g')
                    .attr('fill', d => {
                        if (d.assessment === -1) return '#880000';
                        if (d.assessment === 2) return 'black';
                        if (d.assessment > 0) return 'darkgreen';
                        if (d.assessment === 0) return 'grey';
                    })//dSettings.colors.snakeDefault)
                    .attr('transform', d => {
                        let initialTranslate = 0;

                        if (dSettings.maxSize === 2) initialTranslate = 30;
                        if (dSettings.maxSize === 3) initialTranslate = 60;
                        if (dSettings.maxSize === 4) initialTranslate = 90;
                        if (dSettings.maxSize === 5) initialTranslate = 120;

                        let x = dSettings.spacing + initialTranslate;
                        if (d.dirn.name === 'left') {
                            if (puzzSize[0] === 1) x = 10 - initialTranslate;
                            // if (puzzSize[0] === 2) x = -20 - initialTranslate;
                            if (puzzSize[0] === 3) x = 76 - initialTranslate;
                            if (puzzSize[0] === 4) x = 12;
                            if (puzzSize[0] === 5) x = 20;
                        };
                        if (d.dirn.name === 'right') {
                            if (puzzSize[0] === 1) x = 295 - initialTranslate;
                            // if (puzzSize[0] === 2) x = 3 - initialTranslate;
                            if (puzzSize[0] === 3) x = 350 - initialTranslate;
                            if (puzzSize[0] === 4) x = 292;
                            if (puzzSize[0] === 5) x = 288;
                        };

                        let y = 150;
                        if (d.dirn.name === 'up') y = 30;
                        if (d.dirn.name === 'down') y = 290;

                        return 'translate(' + x + ' ' + y + ')'

                    })
                    // .attr('x', d => {
                    //     if (d.dirn.name === 'left') return 10;
                    //     if (d.dirn.name === 'right') return 290;
                    //     return 150;
                    // } )
                    // .attr('y', d => {
                    //     if (d.dirn.name === 'up') return 10;
                    //     if (d.dirn.name === 'down') return 290;
                    //     return 150;
                    // })
                    
                    .classed('possibleNStepText', true)
                    .append('text')

                    .attr('transform', d => {
                        if (d.dirn.name === 'left' || d.dirn.name === 'right') {
                            return 'rotate(270)'
                        }
                    })
                    .attr('font-weight', 'bold')
                    .attr('text-anchor', (d,i) => {
                        return 'middle'
                        if (d.dirn.name === 'left') return 'end';
                    })
                    .attr('font-size', '10px')
                    .text(d=> {
                        return Object.keys(d.reasons);
                    })


            }
        }



        
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



            if (puzzle.setup.constraints !== undefined) {

                //////////////
                // Triangles
                //////////////

                // If there are colored squares, draw
                if (puzzle.setup.constraints.triangles !== undefined && puzzle.setup.constraints.triangles.length !== 0) {
                    // let filledSquareCircles = puzzleG.selectAll('.filledSquareCircle')
                    let triangles = svg.select('.witnessPuzzle').selectAll('.triangle')
                        .data(puzzle.setup.constraints.triangles, d => d[0] + ' ' + d[1]);

                    triangles.enter()
                        // .append('circle')
                        .append('g')
                        .attr('class', d => 'triangle_' + d[0] + '_' + d[1])
                        .classed('triangle', true)
                        .attr('transform', d =>                         
                            'translate('
                            + (((d[0] + 0.5) * dSettings.spacing) - (d[2] * 0.2 + (d[2] - 1) * 0.05) * dSettings.spacing / 2)
                            +',' 
                            + (self._state.canvasSize - (d[1] + 0.62) * dSettings.spacing)
                            + ')'
                        )
                        .each(function(d) {
                            const numTriangles = d[2];
                            for (let i = 0; i < numTriangles; i++) {
                                let triangle = d3.select(this)
                                    .append('polygon')
                                    .attr('points',
                                        d => {
                                            // bottom left
                                            return ((i * 0.25) * dSettings.spacing) + ',' + (0.2 * dSettings.spacing) + ' ' +
                                            // bottom right
                                                ((i * 0.25 + 0.2) * dSettings.spacing) + ',' + (0.2 * dSettings.spacing) + ' ' +
                                            // top
                                            ((i * 0.25 + 0.1) * dSettings.spacing) + ',' + 0
                                        }
                                    )
                                    .attr('fill', d => {
                                        if (typeof dSettings.colors.triangles[0] !== 'undefined') {
                                            return dSettings.colors.triangles[0]
                                        }
                                        return 'rgba(0,0,0,0)';
                                    })
                            }

                        });

                    // ENTER + UPDATE
                    triangles.merge(triangles);

                }
            }


            //////////////
            // Stars, also known as suns or sunbursts
            //////////////

            // If there are colored squares, draw
            if (puzzle.setup.constraints.stars !== undefined && puzzle.setup.constraints.stars.length !== 0) {
                // let filledSquareCircles = puzzleG.selectAll('.filledSquareCircle')
                let filledStars = svg.select('.witnessPuzzle').selectAll('.filledStars')
                    .data(puzzle.setup.constraints.stars, d => d[0] + ' ' + d[1]);

                let filledStarsEntered = filledStars.enter();

                filledStarsEntered
                    .append('rect')
                    .attr('class', d => 'filledStars_' + d[0] + '_' + d[1])
                    .classed('filledStars', true)
                    .attr('x', d => (d[0] + 0.35) * dSettings.spacing)
                    .attr('y', d => self._state.canvasSize - (d[1] + 0.65) * dSettings.spacing)
                    .attr('width', dSettings.spacing * 0.3)
                    .attr('height', dSettings.spacing * 0.3)
                    .attr('stroke', 'rgba(0,0,0,0)')
                    .attr('fill', d => {
                        let colorID = d[2];
                        if (typeof dSettings.colors.circles[colorID] !== 'undefined') {
                            return dSettings.colors.circles[colorID]
                        }
                        return 'rgba(0,0,0,0)';
                    });

                filledStarsEntered
                    .append('rect')
                    .attr('class', d => 'filledStars_' + d[0] + '_' + d[1])
                    .classed('filledStars', true)
                    .attr('x', d => (d[0] + 0.35) * dSettings.spacing)
                    .attr('y', d => self._state.canvasSize - (d[1] + 0.65) * dSettings.spacing)
                    .attr('width', dSettings.spacing * 0.3)
                    .attr('height', dSettings.spacing * 0.3)
                    .attr('transform', d => 'rotate(45 ' + ((d[0] + 0.5) * dSettings.spacing) + ' ' + (self._state.canvasSize - (d[1] + 0.5) * dSettings.spacing) + ')')
                    .attr('stroke', 'rgba(0,0,0,0)')
                    .attr('fill', d => {
                        let colorID = d[2];
                        if (typeof dSettings.colors.circles[colorID] !== 'undefined') {
                            return dSettings.colors.circles[colorID]
                        }
                        return 'rgba(0,0,0,0)';
                    });                    

                // ENTER + UPDATE
                filledStars = filledStars.merge(filledStarsEntered);

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

            if (self._core._state.mode === 'playback') {
                svg.select('.snakeStartCircle')
                    .attr('fill', dSettings.colors.snakeStillSolving)
                svg.select('.snakePath')
                    .attr('stroke', dSettings.colors.snakeStillSolving)
                    return;
            }

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
                for (let [k, positionsInGroup] of Object.entries(puzzle.__generated.snakeSeparatedGroups)) {
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

                if (isGameSolved) {
                    svg.select('.snakePath')
                        .transition()
                        .duration(1000)
                        .attr('stroke', dSettings.colors.snakeSolved);

                } else {

                    svg.select('.snakePath')
                        .transition()
                        .duration(1000)
                        .attr('stroke', 'rgb(200,0,0)');
                }
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

        // If puzzle solved, don't do anything unless options 
        // do not suggest that it stops.
        if ((core._state.solved || core._state.active === false)
            && !core._settings.options.doNotStopOrRestartAtEnd) {
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
        core.attemptMove(userMove, {userDrivenMove: true});
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
