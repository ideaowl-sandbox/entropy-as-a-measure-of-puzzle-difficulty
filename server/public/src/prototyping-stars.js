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

setTimeout(function(){


    d3.select('#updatesSection').selectAll("*").remove();


    let starPuzzles = [
        {
            "size": [3, 3],
            "startPosition": [0, 0],
            "endPosition": [3, 3, 2],
        },
        {
            "size": [2, 3],
            "startPosition": [0, 0],
            "endPosition": [2, 3, 2],
            "constraints": {
                "stars": [
                               [2, 3, 0],
                    [1, 2, 1], 
                ],
                "regionConstraints": [
                    [1, 3, 0], 
                               [2, 2, 1],
                    [1, 1, 1], [2, 1, 1]
                ]
            }
        },
        {
            "size": [4, 3],
            "startPosition": [0, 0],
            "endPosition": [2, 3, 1],
            "constraints": {
                "mustCrosses": [
                    [1, 0],
                    [0, 1],
                    [1, 1.5],
                    [1.5, 1],
                    [1, 3],
                    [0.5, 2],
                    [3, 0],
                    [2, 1]
                ],
                "cannotCrosses": [
                    [1, 2.5],
                    // [0, 2]
                ]
            }
        },
        
    ]


    let testPuzzles = [

        {
            "size": [3, 3],
            "startPosition": [0, 0],
            "endPosition": [3, 3, 1],
        },

        {
            "size": [3, 3],
            "startPosition": [0, 0],
            "endPosition": [3, 3, 1],
            "constraints": {
                "regionConstraints": [
                    [1, 1, 0],
                    [1, 2, 1],
                    [1, 3, 2],
                    [3, 1, 1],
                    [3, 2, 0]
                ]
            }
        },

        {
            "size": [3, 3],
            "startPosition": [0, 0],
            "endPosition": [3, 3, 1],
            "constraints": {
                "regionConstraints": [
                    [1, 1, 0],
                    [1, 2, 1],
                    [1, 3, 2],
                    [2, 1, 1],
                    [2, 2, 1],
                    [2, 3, 1],
                    [3, 1, 1],
                    [3, 2, 0],
                    [3, 3, 0]
                ]
            }
        }


    ]

    

    for (let puzzleSetup of starPuzzles) {
        // let newPuzzle = new WitnessPuzzle(puzzleSetup, { render: true, targetSelection: '#updatesSection', renderImmediateLookAhead: true});
    }


    let testSection  = d3.select('#updatesSection')
        .append('div')
        .classed('testSection', true)
        .style('display', 'block')

    testSection.append('h3')
        .text('Test Section')
    for (let puzzleSetup of testPuzzles) {
        let newPuzzle = new WitnessPuzzle(puzzleSetup, { render: true, targetSelection: '.testSection', renderImmediateLookAhead: true });
    }



    let igtSection = d3.select('#updatesSection')
        .append('div')
        .classed('igtSection', true)
        .style('display', 'block')


    function quickDraw(drawAbleWindmillPuzzles, derive) {

        let previousMoveSetHash = {}

        let puzzleMetaBlocks = d3.select('.igtSection').selectAll('.puzzleMetaBlocks')
            .data(drawAbleWindmillPuzzles.map(d=> {return {puzzleSetup: d}}), d => d.id);

        let puzzleMetaBlocksEntered = puzzleMetaBlocks
            .enter()
            .append('div')
            .classed('puzzleMetaBlocks', true)
            .style('display', 'block');

        puzzleMetaBlocksEntered
            .each(function (windmillPuzzleMeta, puzzleI) {

                if (puzzleI === 4 || puzzleI === 8) {
                    previousMoveSetHash = {}
                }

                let puzzleSetup = windmillPuzzleMeta.puzzleSetup// convertWindmillPuzzleMetaToEugenePuzzleMeta(windmillPuzzleMeta);

                let isMustCross = puzzleSetup.constraints !== undefined && puzzleSetup.constraints.mustCrosses !== undefined;
                d3.select(this).classed('isMustCross', isMustCross);

                if (derive !== undefined && derive === true) { //windmillPuzzleMeta.totalInfoGainTrajectory2 === undefined

                    windmillPuzzleMeta.calcPuzzleObj = new WitnessPuzzle(puzzleSetup, { render: false });
                    windmillPuzzleMeta.calcPuzzleObj.deriveInfoGainTrajectory();
                    windmillPuzzleMeta.totalInfoGainTrajectory2 = windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.infoGainTrajectoryTotal2;
                    windmillPuzzleMeta.totalSolutionsFound = windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.totalSolutionsFound;
                    console.log('obtained trajectory')
                }

                new WitnessPuzzle(puzzleSetup, Object.assign({ classed: ['medium'] }, { targetElement: this, userInterface: false }))

                let metaInfo = d3.select(this)
                    .append('div')
                    .style('display', 'inline-block')
                    // .style('position', 'left')
                    .style('position', 'absolute')
                    .style('font-size', '12px')
                    .style('width', '200px')
                    .style('margin-top', '200px')
                    .style('margin-left', '-200px')
                    .classed('metaInfo', true);

                // metaInfo.append('div')
                //     .style('display', 'inline-block')
                //     .text('@windmill')
                //     .style('cursor', 'pointer')
                //     .style('margin-right', '10px')
                //     .on('click', function () {
                //         window.open('https://windmill.thefifthmatt.com/' + windmillPuzzleMeta.id, '_blank');
                //     })

                // metaInfo.append('div')
                //     .classed('isMeta', true)
                //     .classed('upvotes', true)
                //     .style('display', 'inline-block')
                //     .text('up: ' + windmillPuzzleMeta.upvotes)
                //     .style('margin-right', '10px')
                //     .on('click', function () {
                //         quickDraw(drawAbleWindmillPuzzles.sort((a, b) => +b.upvotes - +a.upvotes))
                //         d3.selectAll('.upvotes').classed('isSorted', true);
                //     })

                // metaInfo.append('div')
                //     .classed('isMeta', true)
                //     .classed('solves', true)
                //     .style('display', 'inline-block')
                //     .text('solves: ' + +windmillPuzzleMeta.solves)
                //     .on('click', function () {
                //         quickDraw(drawAbleWindmillPuzzles.sort((a, b) => +b.solves - +a.solves))
                //         d3.selectAll('.solves').classed('isSorted', true);
                //     })

                // metaInfo.append('div')
                //     .classed('isMeta', true)
                //     .classed('upvotes_solves', true)
                //     .style('display', 'inline-block')
                //     .style('margin-right', '10px')
                //     .text('up/solves: ' + (+windmillPuzzleMeta.upvotes / +windmillPuzzleMeta.solves).toPrecision(2))
                //     .on('click', function () {
                //         quickDraw(drawAbleWindmillPuzzles.sort((a, b) => (+b.upvotes / +b.solves) - (+a.upvotes / a.solves)))
                //         d3.selectAll('.upvotes_solves').classed('isSorted', true);
                //     })

                metaInfo.append('div')
                    .classed('isMeta', true)
                    .classed('igt2', true)
                    .style('display', 'inline-block')
                    .style('margin-right', '10px')
                    .text('igt2: ' + (windmillPuzzleMeta.totalInfoGainTrajectory2).toPrecision(4))
                    .on('click', function () {
                        quickDraw(drawAbleWindmillPuzzles.sort((a, b) => (+b.totalInfoGainTrajectory2) - (+a.totalInfoGainTrajectory2)))
                        d3.selectAll('.igt2').classed('isSorted', true);
                    })

                metaInfo.append('div')
                    .classed('isMeta', true)
                    .classed('solns', true)
                    .style('display', 'inline-block')
                    .style('margin-right', '10px')
                    .text('solns: ' + (+windmillPuzzleMeta.totalSolutionsFound))
                    .on('click', function () {
                        quickDraw(drawAbleWindmillPuzzles.sort((a, b) => (+b.totalSolutionsFound) - (+a.totalSolutionsFound)))
                        d3.selectAll('.solns').classed('isSorted', true);
                    })

                metaInfo.append('div')
                    .classed('isMeta', true)
                    .classed('igt2_solns', true)
                    .style('display', 'inline-block')
                    .style('margin-right', '10px')
                    .text('igt2/solns: ' + (+windmillPuzzleMeta.totalInfoGainTrajectory2 / +windmillPuzzleMeta.totalSolutionsFound).toPrecision(4))
                    .on('click', function () {
                        quickDraw(drawAbleWindmillPuzzles.sort((a, b) => (+b.totalInfoGainTrajectory2 / +b.totalSolutionsFound) - (+a.totalInfoGainTrajectory2 / +a.totalSolutionsFound)))
                        d3.selectAll('.igt2_solns').classed('isSorted', true);
                    })

                metaInfo.append('div')
                    .classed('isMeta', true)
                    .classed('igt2_solns_2', true)
                    .style('display', 'inline-block')
                    .style('margin-right', '10px')
                    .text('igt2/solns^2: ' + (+windmillPuzzleMeta.totalInfoGainTrajectory2 / Math.pow(+windmillPuzzleMeta.totalSolutionsFound, 2)).toPrecision(4))
                    .on('click', function () {
                        quickDraw(drawAbleWindmillPuzzles.sort((a, b) => (+b.totalInfoGainTrajectory2 / Math.pow(+b.totalSolutionsFound, 2)) - (+a.totalInfoGainTrajectory2 / Math.pow(+a.totalSolutionsFound, 2))))
                        d3.selectAll('.igt2_solns_2').classed('isSorted', true);
                    })

                // metaInfo.append('div')
                //     .classed('isMeta', true)
                //     .classed('hideMustCrosses', true)
                //     .style('display', 'inline-block')
                //     .style('margin-right', '10px')
                //     .text('toggleMustCrosses')
                //     .on('click', function () {
                //         let isAnyHidden = !d3.selectAll('.isMustCross.hideMe').empty();
                //         console.log(isAnyHidden);
                //         d3.selectAll('.hideMustCrosses').classed('isSorted', true);
                //         quickDraw(drawAbleWindmillPuzzles);
                //         d3.selectAll('.isMustCross').classed('hideMe', !isAnyHidden);
                //     })


                let infoGainPathsSection = d3.select(this)
                .append('div')
                .style('display', 'inline-block')
                // .style('position', 'absolute')
                .style('font-size', '12px')
                .style('width', 'calc(100vw - 300px)')
                // .style('margin-top', '-30px')
                .classed('infoGainPathsSection', true)
                .each(function() {

                    // let pathsWithInfoGain2 = windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.pathsWithInfoGain2;
                    let visitedPaths = windmillPuzzleMeta.calcPuzzleObj._state.puzzle.history.visitedPaths;

                    d3.select(this).selectAll('.infoGainPathDiv')
                        // .data(pathsWithInfoGain2)
                        .data(visitedPaths)
                        .enter()
                        .append('div')
                        .classed('infoGainPathDiv', true)
                        .style('display', 'inline-block')
                        .style('width', '120px')

                        .each(function (visitedPath, i) {

                            let currPuzzle = new WitnessPuzzle(puzzleSetup, Object.assign({ classed: ['small'] }, { targetElement: this, userInterface: false }))

                            for (let move of visitedPath.moves) {
                                currPuzzle.attemptMove(move);
                            }

                            let hash = JSON.stringify(visitedPath.moves);


                            // if (previousMoveSetHash[hash] !== undefined) {
                            //     d3.select(this)
                            //         .style('opacity', 0.3);
                            // } else {
                            //     previousMoveSetHash[hash] = true;
                            // }
                            d3.select(this)
                                .style('opacity', () => visitedPath['hasInfoGain'] ? 1 : 0.3);

                        })
                    

                });

                

            })


        puzzleMetaBlocks = puzzleMetaBlocks.merge(puzzleMetaBlocksEntered);

        puzzleMetaBlocks.order();


        d3.selectAll('.isMeta').classed('isSorted', false);

    }

    let deriveIGT = true
    testPuzzles = testPuzzles.map((tp, i) => {
        tp.id = i;
        return tp
    })
    quickDraw(testPuzzles, deriveIGT); 
    // quickDraw(testPuzzles.filter((d,i)=> i < 4), deriveIGT); //.filter((d,i)=>i < 7)
    
    // quickDraw(testPuzzles.filter((d,i)=> i >= 4), deriveIGT);
    return;

    d3.queue()
        .defer(d3.json, './data/complexSimplerSets.json')
        .defer(d3.json, './data/puzzlemeta_unique_solutions.json')

    // 
        .awaitAll(function (err, [complexSimplerSets, puzzleMetaUniqueSolutions]) {
            

            

            return;

            puzzleMetaUniqueSolutions = puzzleMetaUniqueSolutions.sort((a, b) =>
                a.setup.size[0] < b.setup.size[0] ? 1 : -1
            );


            let puzzlesToAnalyze = [];



            g.data = { complexSimplerSets, puzzleMetaUniqueSolutions };

            console.log(complexSimplerSets);


            let curriculum = [
                {
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
            }, {
                "size": [1, 3],
                "startPosition": [0, 0],
                "endPosition": [1, 3, 1],
                "constraints": {
                    "regionConstraints": [
                        [1, 2, 0],
                        [1, 1, 1]
                    ],
                    "mustCrosses": [
                        [1, 1.5]
                    ],
                    "cannotCrosses": [
                        [0.5, 2]
                    ]
                }
            }, {
                "size": [1, 3],
                "startPosition": [0, 0],
                "endPosition": [1, 3, 1],
                "constraints": {
                    "regionConstraints": [
                        [1, 2, 0],
                        [1, 1, 1]
                    ],
                    "mustCrosses": [
                        [1, 1.5]
                    ],
                    "cannotCrosses": [
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
                    "regionConstraints": [
                        [1, 4, 0], [3, 4, 1], [4, 4, 0],
                        [1, 3, 0], [2, 3, 0], [3, 3, 0], [4, 3, 0],
                        [1, 2, 0], [2, 2, 1], [3, 2, 0], [4, 2, 0],
                        [1, 1, 1], [2, 1, 1], [3, 1, 1], [4, 1, 0]
                    ],
                    "mustCrosses": [
                        [1, 3.5],
                        [1, 3],
                    ],
                    "cannotCrosses": [
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
                    "regionConstraints": [
                        [1, 4, 0], [3, 4, 1], [4, 4, 0],
                        [1, 3, 0], [2, 3, 1], [3, 3, 0], [4, 3, 0],
                        [1, 2, 0], [2, 2, 1], [3, 2, 0], [4, 2, 0],
                        [1, 1, 1], [2, 1, 1], [3, 1, 1]
                    ],
                    "mustCrosses": [
                        [4, 0.5],
                        [1, 3],
                    ],
                    "cannotCrosses": [
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
                    "cannotCrosses": [
                        [0, 1],
                        [2, 2],
                        [3, 0],
                        [1.5, 1],
                        [0.5, 3],
                        [1, 1.5]
                    ]
                }
                },

                // Simpler puzzles
                {
                    "size": [2, 2],
                    "startPosition": [1, 0],
                    "endPosition": [1, 2, 1],
                    "constraints": {
                    }
                },
                {
                    "size": [0, 2],
                    "startPosition": [0, 0],
                    "endPosition": [0, 2, 1],
                    "constraints": {
                    }
                },
                {
                    "size": [2, 2],
                    "startPosition": [1, 0],
                    "endPosition": [1, 2, 1],
                    "constraints": {
                        "cannotCrosses": [
                            [0, 0],
                            [2, 0]
                        ]
                    }
                },
                {
                    "size": [2, 2],
                    "startPosition": [1, 0],
                    "endPosition": [1, 2, 1],
                    "constraints": {
                        "cannotCrosses": [
                            [0, 0],
                            [2, 0],
                            [0, 1],
                            [2, 1],
                            [0, 2],
                            [2, 2],
                        ]
                    }
                },
                {
                    "size": [2, 2],
                    "startPosition": [1, 0],
                    "endPosition": [1, 2, 1],
                    "constraints": {
                        "mustCrosses": [
                            [1, 0.5],
                            [1, 1.5],
                        ],
                        "cannotCrosses": [
                            [0, 0],
                            [2, 0],
                            [0, 1],
                            [2, 1],
                            [0, 2],
                            [2, 2],
                        ]
                    }
                },
                {
                    "size": [2, 2],
                    "startPosition": [1, 0],
                    "endPosition": [1, 2, 1],
                    "constraints": {
                        "mustCrosses": [
                            [1, 0.5]
                        ],
                        "cannotCrosses": [
                            [0, 0],
                            [2, 0],
                            [0, 1],
                            [2, 1],
                            [0, 2],
                            [2, 2],
                        ]
                    }
                },
                {
                    "size": [2, 2],
                    "startPosition": [1, 0],
                    "endPosition": [1, 2, 1],
                    "constraints": {
                        "cannotCrosses": [
                            [0.5, 0],
                            [1.5, 0],
                            [0.5, 1],
                            [1.5, 1],
                            [0.5, 2],
                            [1.5, 2],
                        ]
                    }
                }
            ];


            curriculum.forEach((puzzle, i) => {
                puzzlesToAnalyze.push({ setup: puzzle, '_id': 'curriculum_' + i })
            });

            curriculum = [
                { "size": [2, 1], "startPosition": [1, 0], "endPosition": [1, 1, 1], 
                constraints: {"regionConstraints": [[1, 1, 0], [2, 1, 1]] }}, 
                
                { "size": [2, 1], "startPosition": [0, 1], "endPosition": [2, 0, 2], 
                constraints: {"regionConstraints": [[1, 1, 1], [2, 1, 0]] }}, 
                
                { "size": [3, 1], "startPosition": [0, 1], "endPosition": [3, 0, 2],
                constraints: {"regionConstraints": [[1, 1, 1], [2, 1, 0], [3, 1, 0]] }}, 
                 
                { "size": [2, 2], "startPosition": [0, 0], "endPosition": [2, 2, 2], 
                constraints: {"regionConstraints": [[1, 1, 0], [2, 1, 1], [1, 2, 0], [2, 2, 0]] }}, 
                
                { "size": [3, 3], "startPosition": [0, 0], "endPosition": [3, 3, 2], 
                constraints: {"regionConstraints": [[1, 1, 1], [2, 1, 1], [3, 1, 1], [1, 2, 0], [2, 2, 1], [3, 2, 0], [1, 3, 0], [2, 3, 0], [3, 3, 0]] }}, 

                { "size": [3, 3], "startPosition": [0, 0], "endPosition": [0, 1, 4], 
                constraints: {"regionConstraints": [[1, 1, 1], [2, 1, 1], [3, 1, 1], [1, 2, 0], [2, 2, 1], [3, 2, 0], [1, 3, 0], [2, 3, 0], [3, 3, 0]] }}, 
                
                { "size": [4, 4], "startPosition": [0, 0], "endPosition": [1, 4, 1], 
                constraints: {"regionConstraints": [[1, 1, 1], [2, 1, 1], [3, 1, 1], [4, 1, 0], [1, 2, 0], [2, 2, 1], [3, 2, 0], [4, 2, 0], [1, 3, 0], [2, 3, 0], [3, 3, 0], [4, 3, 0], [1, 4, 0], [3, 4, 1], [4, 4, 0]] }}, 
                
                { "size": [4, 4], "startPosition": [0, 0], "endPosition": [4, 2, 2], 
                constraints: {"regionConstraints": [[1, 1, 1], [2, 1, 1], [3, 1, 1], [4, 1, 0], [1, 2, 0], [2, 2, 1], [3, 2, 0], [4, 2, 0], [2, 3, 0], [3, 3, 0], [4, 3, 0], [1, 4, 0], [2, 4, 0], [3, 4, 1], [4, 4, 0]] }}, 
                
                { "size": [4, 4], "startPosition": [0, 0], "endPosition": [3, 0, 3], 
                constraints: {"regionConstraints": [[1, 1, 1], [2, 1, 1], [3, 1, 1], [4, 1, 0], [1, 2, 0], [2, 2, 1], [3, 2, 0], [1, 3, 0], [4, 3, 0], [2, 4, 0], [3, 4, 1], [4, 4, 0]] }},

                {
                    "size": [4, 4],
                    "startPosition": [0, 0],
                    "endPosition": [4, 4, 1],
                    constraints: {"regionConstraints": [
                        [1, 4, 1], [2, 4, 0], [3, 4, 0], [4, 4, 1],
                        [1, 3, 0], [2, 3, 0], [3, 3, 0], [4, 3, 0],
                        [1, 2, 0], [2, 2, 0], [3, 2, 0], [4, 2, 0],
                        [1, 1, 1], [2, 1, 0], [3, 1, 0], [4, 1, 1]
                    ]
                }}
            ];

            // curriculum = [];

            curriculum.forEach((puzzle, i) => { 
                puzzlesToAnalyze.push({setup: puzzle, '_id': 'curriculum__' + i})
            });


            
            // puzzlesToAnalyze = [];
            let uniquePuzzlesToEvalByIndex = [5, 2812, 2868, 3244, 3423, 1204, 1022, 1190]; //5, 2812, 2868, 3244, 3423, 1204, 1022, 1190
            uniquePuzzlesToEvalByIndex.map((d,i) => {
                puzzlesToAnalyze.push(puzzleMetaUniqueSolutions[d]);
            });
            let blankPuzzle = JSON.parse(JSON.stringify(puzzlesToAnalyze[puzzlesToAnalyze.length - 1]));
            delete blankPuzzle.setup.constraints;
            blankPuzzle._id += 3;
            puzzlesToAnalyze.unshift(blankPuzzle)

            // let newPuzzle = JSON.parse(JSON.stringify(blankPuzzle));

            
            // newPuzzle.setup.constraints = {
            //     region
            // }



            console.log(puzzlesToAnalyze.map((d, i) => {
                d.sortOriginalOrder = i;
                return d;
            }));
            modelUpdate({
                action: 'analyze and draw',
                data: puzzlesToAnalyze
            })




            let puzzleToShowCount = 0;

            // puzzleSetsSolved.forEach(set=> {
                
            //     let gridSize = JSON.stringify(set.size);
            //     if (g.constraintsInSets[gridSize] === undefined) g.constraintsInSets[gridSize] = {};

            //     let constraints = Object.keys(set.constraints);
            //     constraints.forEach(constraint => {
            //         if (g.constraintsInSets[gridSize][constraint] === undefined) {
            //             g.constraintsInSets[gridSize][constraint] = 0;
            //         }
            //         g.constraintsInSets[gridSize][constraint] = 
            //             Math.max(g.constraintsInSets[gridSize][constraint], 
            //                      set.constraints[constraint]);
            //     })
            // })


            let analysisContainer = d3.select('#updatesSection').append('div')
                .classed('analysisContainer', true)
                .style('width', 6000 + 'px')
                .style('height', puzzlesToAnalyze.length * 220 + 'px');

            analysisContainer.append('div')
                .text('Hide graphs')
                .on('click', function() {
                    let hiddenGraphsContainers = d3.selectAll('.analysisContainerDiv.hideGraphs');

                    let isHidden = hiddenGraphsContainers.empty();

                    d3.selectAll('.analysisContainerDiv')
                        .classed('hideGraphs', isHidden)

                    d3.selectAll('.analysisContainer')
                        .classed('hideGraphs', isHidden)
                })

            analysisContainer.append('div')
                .style('display','block')
                .selectAll('.sortText')
                .data(['Original', 'By Possible Moves (1-step lookahead)', 'By Info Gain Trajectory Orig', 'IGT 2', 'By Total Entropy'])
                .enter()
                .append('span')
                .classed('sortText', true)
                .text(d=>d)
                .on('click', d => {
                    modelUpdate({
                        action: 'sortPuzzles',
                        data: d
                    })
                })
                ;                

            // analysisContainer.append('div')
            //     .classed('analysisContainerDiv', true)
            //     .classed('uniquePuzzlesSection', true);



            // d3.select('#updatesSection').append('h3')
            //     .text('Trajectories from ' + puzzleMetaUniqueSolutions.length + ' Unique-solution Puzzles');

            // d3.select('#updatesSection').append('div')
            //     .classed('uniquePuzzlesShownIndex', true);

            // d3.select('#updatesSection')
            //     .selectAll('.showUniquePuzzlesButton')
            //     .data([
            //         {title: '<< Prev 1000 ', shift: -1000},
            //         {title: '< Prev 100', shift: -100},
            //         {title: 'Next 100 >', shift: 100},
            //         {title: 'Next 1000 >>', shift: 1000}
            //         ])
            //     .enter()
            //     .append('input')
            //     .classed('showUniquePuzzlesButton', true)
            //     .attr('type', 'button')
            //     .attr('value', d=>d.title)
            //     .on('click', d=>modelUpdate({
            //         action: 'show different unique puzzles', 
            //         data: d.shift
            //     }))

            // let uniquePuzzlesSectionsContainer = d3.select('#updatesSection').append('div')
            //     .classed('uniquePuzzlesSectionsContainer', true);

            // uniquePuzzlesSectionsContainer.append('div')
            //     .classed('uniquePuzzlesSectionsContainerDiv', true)
            //     .classed('uniquePuzzlesSection', true);

            // uniquePuzzlesSectionsContainer.append('div')
            //     .classed('uniquePuzzlesSectionsContainerDiv', true)
            //     .classed('puzzleTrajectorySection', true);

            // d3.select('#updatesSection').append('p')
            //     .text('This was the goal I wanted to get to for determining complexity of puzzles.  Unique solution puzzles ' 
            //     + ' reduces the question of complexity relating to how many possible ways a puzzle can be solved, and there are '
            //     + ' distinct, noticable differences in challenges within just puzzles that have a single solution.');

            modelUpdate({
                    action: 'show different unique puzzles', 
                    data: 0
                })




            let options = { targetSelection: '#updatesSection', userInterface: false };
            // d3.select('#updatesSection').append('h3')
            //     .text('Multiple Solutions');

            puzzleToShowCount = 0;
            // puzzleMetaMultipleSolutions
            //     .filter(d=>{
            //         puzzleToShowCount += 1;
            //         return puzzleToShowCount < 100;
            //         })
            //     .forEach(d=>{
            //         let puzzle = new WitnessPuzzle(d.setup, Object.assign({ classed: ['small'] }, options)); //options { render: false }    

            //     })



            // d3.select('#updatesSection').append('p')
            //     .text('As part of the conversation from last time, I thought it would be interesting to see puzzles that have  ' 
            //     + ' two solutions, one that would be much harder than the other.  Using puzzles that have only two solutions '
            //     + ' but have a maximum difference in number of steps to get to a solution, these came up... and were extremely disappointing.  Try them.');
            
        })








    function draw() {
        analyzeAndDrawAllTrajectories()
        // drawSingleConstraintDifferencePairs()
        // drawSetsGraph()
        // drawUniquePuzzles()
        // drawTrajectories()


    }


    function modelUpdate({action, data}) {
        if (action === 'diffPairs control update') {
            g.s.numSolutionsForSimplerPuzzles = data.value;
        }

        if (action === 'show different unique puzzles') {

            if (data + g.s.uniquePuzzlesIndex > 35708 || data + g.s.uniquePuzzlesIndex < 0) {

                if (data + g.s.uniquePuzzlesIndex > 35708) {
                    g.s.uniquePuzzlesIndex = 0;
                }
                if (data + g.s.uniquePuzzlesIndex < 0) {
                    if (data === -1000) g.s.uniquePuzzlesIndex = 35000;
                    if (data === -100) g.s.uniquePuzzlesIndex = 35708;
                }

            } else {
                g.s.uniquePuzzlesIndex = data + g.s.uniquePuzzlesIndex;
            }

        }

        if (action === 'show trajectory') {
            g.s.puzzlesForTrajectories.push(data);
        }

        if (action === 'analyze and draw') {
            g.s.puzzlesForAnalysis = data;
        }

        if (action === 'sortPuzzles') {
            g.s.puzzleSort = data;
        }


        draw();
    }

    function analyzeAndDrawAllTrajectories() {

        let analysisContainer = d3.select('.analysisContainer');

        if (g.s.puzzleSort === 'Original') {
            g.s.puzzleSortV = 'sortOriginalOrder'
        }

        if (g.s.puzzleSort === 'By Info Gain Trajectory Orig') {
            g.s.puzzleSortV = 'totalInfoGainTrajectory';
        }

        if (g.s.puzzleSort === 'IGT 2') {
            g.s.puzzleSortV = 'totalInfoGainTrajectory2';
        }

        if (g.s.puzzleSort === 'By Possible Moves (1-step lookahead)') {
            g.s.puzzleSortV = 'totalTrajectory';
        }

        if (g.s.puzzleSort === 'By Total Entropy') {
            g.s.puzzleSortV = 'totalEntropy';
        }


        let sortedData = g.s.puzzlesForAnalysis.sort((a, b) => {
            
            return a[g.s.puzzleSortV] - b[g.s.puzzleSortV];


        });
        
        let puzzleTrajectories = analysisContainer.selectAll('.analysisContainerDiv')
            .data(sortedData, d => d._id);


        let trajectoriesDiv = puzzleTrajectories.enter()
            .append('div')
            .classed('analysisContainerDiv', true)

        trajectoriesDiv.append('div')
            .attr('class', (d, i) => 'analysisDiv_' + i)
            .classed('puzzleTrajectoriesContent', true)
            .each(function(puzzleMeta) {
                // debugger;
                puzzleMeta.calcPuzzleObj = new WitnessPuzzle(puzzleMeta.setup, { render: false });

                let puzzleSetup = JSON.parse(JSON.stringify(puzzleMeta.setup));
                if (puzzleSetup.constraints !== undefined) {
                    delete puzzleSetup.constraints;
                }
                if (g.cachedNonCrossingPaths[JSON.stringify(puzzleSetup)] === undefined) {
                    // Get outcomes for moveAttemptsSets
                    let calcPuzzleObj = new WitnessPuzzle(puzzleSetup, { render: false });
                    g.cachedNonCrossingPaths[JSON.stringify(puzzleSetup)] = calcPuzzleObj.generateNonCrossingPaths();
                    // delete calcPuzzleObj;
                }
                solvingMoveAttempts = g.cachedNonCrossingPaths[JSON.stringify(puzzleSetup)];


                let moveAttemptsWithFinalOutcomes = [];

                for (let moveAttempts of solvingMoveAttempts) {
                    puzzleMeta.calcPuzzleObj.restartPuzzle();
                    for (let move of moveAttempts) {
                        let outcome = puzzleMeta.calcPuzzleObj.attemptMove(move, { stopAtFailure: true });
                        if (outcome && outcome.notPossibleToSolve) {
                            moveAttemptsWithFinalOutcomes.push({ moveAttempts, solvesPuzzle: false });
                            break;
                        }
                        if (puzzleMeta.calcPuzzleObj._state.puzzle.__generated.isEndGame ) {
                            moveAttemptsWithFinalOutcomes.push({ moveAttempts, solvesPuzzle: puzzleMeta.calcPuzzleObj._state.solved });
                            break;
                        }
                    }
                }

                puzzleMeta.calcPuzzleObj.deriveTrajectory();
                puzzleMeta.calcPuzzleObj.deriveInfoGainTrajectory();
                puzzleMeta.calcPuzzleObj.deriveEntropyTrajectory(moveAttemptsWithFinalOutcomes);

                puzzleMeta.totalTrajectory = puzzleMeta.calcPuzzleObj._state.puzzle.history.trajectoryTotal;
                puzzleMeta.totalEntropy = puzzleMeta.calcPuzzleObj._state.puzzle.history.entropyTotal;
                puzzleMeta.totalInfoGainTrajectory = puzzleMeta.calcPuzzleObj._state.puzzle.history.infoGainTrajectoryTotal;
                puzzleMeta.totalInfoGainTrajectory2 = puzzleMeta.calcPuzzleObj._state.puzzle.history.infoGainTrajectoryTotal2;

                puzzleMeta.visualPuzzleObj = new WitnessPuzzle(puzzleMeta.setup, Object.assign({ classed: ['medium'] }, { targetElement: this, userInterface: false }))
                puzzleMeta.visualPuzzleObj.setMode('playback');
            })

        trajectoriesDiv.append('div')
            .classed('puzzleTrajectoriesContent', true)
            .classed('puzzleTrajectoriesSVGContainer', true)


        // for (let i = 0; i < g.s.puzzlesForAnalysis.length; i++) {
        //     let puzzleMeta = g.s.puzzlesForAnalysis[i];
        //     if (puzzleMeta.calcPuzzleObj === undefined) {
        //         puzzleMeta.calcPuzzleObj = new WitnessPuzzle(puzzleMeta.setup, { render: false });
        //         puzzleMeta.calcPuzzleObj.deriveTrajectory();
        //         puzzleMeta.calcPuzzleObj.deriveEntropyTrajectory(moveAttemptsWithFinalOutcomes);
        //         puzzleMeta.visualPuzzleObj = new WitnessPuzzle(puzzleMeta.setup, Object.assign({ classed: ['medium'] }, { targetSelection: '.analysisDiv_' + i, userInterface: false }))
        //     }
        // }

        trajectoriesDiv.each(function (d) {
            let currDiv = d3.select(this).select('.puzzleTrajectoriesSVGContainer');
            let height = 150;
            let currSVG = currDiv.append('svg').attr('width', 200).attr('height', height);
            currSVG.append('path')
                .attr('fill', 'none')
                .attr('stroke-width', '2')
                .attr('stroke', 'blue')
                .attr('d', 'M0 ' + height + ' ' + d.calcPuzzleObj._state.puzzle.history.trajectory.map((traj, i) => "L" + (i * 7) + " " + (height - traj * 0.8)).join(''))

            currSVG = currDiv.append('svg').attr('width', 200).attr('height', height);
            currSVG.append('path')
                .attr('fill', 'none')
                .attr('stroke-width', '2')
                .attr('stroke', 'blue')
                .attr('d', 'M0 ' + height + ' ' + d.calcPuzzleObj._state.puzzle.history.infoGainTrajectory.map((traj, i) => "L" + (i * 7) + " " + (height - traj * 0.8 * 3)).join(''))

            currSVG.append('path')
                .attr('fill', 'none')
                .attr('stroke-width', '2')
                .attr('stroke', 'red')
                .attr('d', 'M0 ' + height + ' ' + d.calcPuzzleObj._state.puzzle.history.infoGainTrajectory2.map((traj, i) => "L" + (i * 7) + " " + (height - traj * 0.8 * 3)).join(''))

            currSVG.append('text')
                .attr('x', 0)
                .attr('y', 15)
                .style('font-size', '12')
                .text('IGT')

            currSVG.append('text')
                .attr('x', 0)
                .attr('y', 25)
                .style('font-size', '8')
                .style('fill', 'blue')
                .text(d.calcPuzzleObj._state.puzzle.history.infoGainTrajectoryTotal)

            currSVG.append('text')
                .attr('x', 0)
                .attr('y', 35)
                .style('font-size', '8')
                .style('fill', 'red')
                .text(d.calcPuzzleObj._state.puzzle.history.infoGainTrajectoryTotal2)




            currSVG = currDiv.append('svg').attr('width', 200).attr('height', height);
            currSVG.append('path')
                .attr('fill', 'none')
                .attr('stroke-width', '2')
                .attr('stroke', 'blue')
                .attr('d', 'M0 ' + height + ' ' + d.calcPuzzleObj._state.puzzle.history.entropyTrajectory.map((traj, i) => "L" + (i * 7) + " " + (height - traj * 10)).join(''))

            currSVG = currDiv.append('svg').attr('width', 200).attr('height', height);
            currSVG
                .selectAll('.individualPathEntropyTrajectories')
                .data(d.calcPuzzleObj._state.puzzle.history.moveAttemptsWithFinalOutcomes)
                .enter()
                .append('path')
                .attr('fill', 'none')
                .attr('class', (d, i) => 'pathLine_' + i)
                .classed('pathlines', true)
                .classed('pathlinesEntropyTrajectories', true)
                .style('stroke-width', (moveAttemptsObj) => moveAttemptsObj.solvesPuzzle ? 4 : 1)
                .style('stroke', (moveAttemptsObj) => moveAttemptsObj.solvesPuzzle ? 'green' : 'blue')
                .style('opacity', (moveAttemptsObj) => moveAttemptsObj.solvesPuzzle ? 1 : 0.2)
                .attr('d', (moveAttemptsObj, j ) => {
                    return 'M0 ' + height + ' ' + moveAttemptsObj.entropyTrajectory.map((traj, i) => "L" + (i * 7) + " " + (height - traj * 200)).join('')
                })


            currSVG = currDiv.append('svg').attr('width', 200).attr('height', height);
            currSVG
                .selectAll('.individualPathSelectors')
                .data(d.calcPuzzleObj._state.puzzle.history.moveAttemptsWithFinalOutcomes) // .sort((a, b) => (a.moveAttempts.length - b.moveAttempts.length) )
                .enter()
                .append('line')
                .attr('class', (d, i) => 'pathLine_' + i)
                .classed('pathlines', true)
                .classed('individualPathSelectors', true)
                // .attr('fill', 'none')
                .style('stroke-width', (moveAttemptsObj) => 2)
                .style('stroke', (moveAttemptsObj) => moveAttemptsObj.solvesPuzzle ? 'green' : 'blue')
                .style('opacity', (moveAttemptsObj) => moveAttemptsObj.solvesPuzzle ? 1 : 0.2)
                .attr('shape-rendering', 'crispEdges')
                .attr('x1', (moveAttemptsObj, j) => (j * 3))
                .attr('x2', (moveAttemptsObj, j) => (j * 3))
                .attr('y1', (moveAttemptsObj, j) => height)
                .attr('y2', (moveAttemptsObj, j) => height - (moveAttemptsObj.moveAttempts.length * 5))
                .on('mouseover', (moveAttemptsObj, i, a) => {
                    d.visualPuzzleObj.restartPuzzle();
                    for (let move of moveAttemptsObj.moveAttempts) {
                        d.visualPuzzleObj.attemptMove(move, { stopAtHitCannotCross: true })
                    }
                    currDiv.selectAll('.pathlinesEntropyTrajectories')
                        .style('opacity', 0);
                    currDiv.selectAll('.pathLine_' + i)
                        .style('opacity', 1);
                })
                .on('mouseleave', (moveAttemptsObj, i, a) => {
                    d.visualPuzzleObj.restartPuzzle();
                    currDiv.selectAll('.pathLine_' + i)
                        .style('opacity', moveAttemptsObj.solvesPuzzle ? 1 : 0.2);
                    currDiv.selectAll('.pathlinesEntropyTrajectories')
                        .style('opacity', moveAttemptsObj.solvesPuzzle ? 1 : 0.2);
                })


        })



        puzzleTrajectories = puzzleTrajectories.merge(trajectoriesDiv);

        puzzleTrajectories
            // .transition()
            // .duration(1500)
            .style('margin-top', (d, i) => {
                return i * 220
            })
            // .style('display', (d, i, a) => {
            //     if (a.length - 1 !== i) {
            //         if (d[g.s.puzzleSortV] !== d3.select(a[i + 1]).datum()[g.s.puzzleSortV]) {
            //             return 'block !important'
            //         }
            //     }
            //     return 'inline-block';

            // })
            .order();

        d3.selectAll('.spacingDivs').remove();
        puzzleTrajectories.each(function (d,i,a) {
            let isHidingGraphs = !d3.selectAll('.analysisContainerDiv.hideGraphs').empty();
            if (isHidingGraphs) {
                if (i !== 0) {
                    if (d[g.s.puzzleSortV] !== d3.select(a[i + -1]).datum()[g.s.puzzleSortV]) {

                        let newElement = document.createElement("div");
                        newElement.classList.add("spacingDivs");
                        this.parentNode.insertBefore(newElement, this)

                        // d3.select(this).node().parentNode.insertBefore(
                        //     return this.insertBefore
                        //     document.createElement("div").classList.add("spacingDivs"), 
                        //     d3.select(this).node()
                        // )

                        // append('div')
                        //     .classed('spacingDivs', true)
                    }
                }
            }

        })

    }

    function drawTrajectories() {

        let puzzleTrajectoriesSection = d3.select('.puzzleTrajectorySection');



        let puzzleTrajectories = puzzleTrajectoriesSection.selectAll('.puzzleTrajectoriesDiv')
            .data(g.s.puzzlesForTrajectories, d => d._id);

        let trajectoriesDiv = puzzleTrajectories.enter()
            .append('div')
            .classed('puzzleTrajectoriesDiv', true)        

        trajectoriesDiv.append('div')
            .attr('class', (d, i) => 'puzzleTrajectoryDiv-' + i)
            .classed('puzzleTrajectoriesContent', true)

        trajectoriesDiv.append('div')
            .classed('puzzleTrajectoriesContent', true)
            .classed('puzzleTrajectoriesSVGContainer', true)
            

        for (let i = 0; i < g.s.puzzlesForTrajectories.length; i++) {
            let puzzleMeta = g.s.puzzlesForTrajectories[i];
            if (puzzleMeta.calcPuzzleObj === undefined) {
                puzzleMeta.calcPuzzleObj = new WitnessPuzzle(puzzleMeta.setup, {render: false});
                puzzleMeta.calcPuzzleObj.deriveTrajectory();
                // puzzleMeta.calcPuzzleObj.deriveEntropyTrajectory(moveAttemptsWithFinalOutcomes);
                puzzleMeta.visualPuzzleObj = new WitnessPuzzle(puzzleMeta.setup, Object.assign({ classed: ['small'] }, { targetSelection: '.' + 'puzzleTrajectoryDiv-' + i, userInterface: false }))
            }
        }

        trajectoriesDiv.each(function(d){
            let currDiv = d3.select(this).select('.puzzleTrajectoriesSVGContainer');
            let currSVG = currDiv.append('svg').attr('width', 200).attr('height', 100);
            let height = 100;
            currSVG.append('path')
                .attr('fill', 'none')
                .attr('stroke-width', '2')
                .attr('stroke', 'blue')
                .attr('d', 'M0 ' + height + ' ' + d.calcPuzzleObj._state.puzzle.history.trajectory.map((traj, i) => "L" + (i * 7) + " " + (height - traj * 0.8)).join('') )

        })

        console.log(g.s.puzzlesForTrajectories)



        
        
    }

    function drawUniquePuzzles() {

        d3.select('.uniquePuzzlesShownIndex')
            .text('Up to 100 puzzles from index ' + g.s.uniquePuzzlesIndex)

        let options = { targetSelection: '.uniquePuzzlesSection', userInterface: false };
        
        d3.select('.uniquePuzzlesSection').selectAll('*').remove();

        g.data.puzzleMetaUniqueSolutions
            .filter((d,i)=>{
                return i >= g.s.uniquePuzzlesIndex && i < g.s.uniquePuzzlesIndex + 100;
                })
            .forEach((d,i)=>{

                let puzzleDiv = d3.select('.uniquePuzzlesSection').append('div')
                    .classed('puzzleDiv', true)
                    .classed('puzzleDiv-'+i, true)
                let puzzle = new WitnessPuzzle(d.setup, Object.assign({ classed: ['small'] }, { targetSelection: '.' + 'puzzleDiv-' + i, userInterface: false })); //options { render: false }    
                puzzleDiv.append('p').text('Trajectory')
                    .on('click', function (e,j) {
                        console.log('puzzle number', i);
                        modelUpdate({
                            action: 'show trajectory',
                            data: d
                        })
                    });


                // if (g.s.puzzlesForTrajectories.length === 0) {
                //     modelUpdate({
                //         action: 'show trajectory',
                //         data: d
                //     })
                // }                    
            })
    }


    function drawSingleConstraintDifferencePairs() {

        let diffPairsID = 'diffPairs', diffPairsDiv;

        if (d3.select('#' + diffPairsID).empty()) {

            let validSimplerPuzzleNumSolutionPaths = {};

            g.data.complexSimplerSets.forEach(d=> {
                if (validSimplerPuzzleNumSolutionPaths[d.simplerPuzzle.solutions] === undefined) {
                    validSimplerPuzzleNumSolutionPaths[d.simplerPuzzle.solutions] = 1;
                } else {
                    validSimplerPuzzleNumSolutionPaths[d.simplerPuzzle.solutions] += 1;
                }
            })

            console.log(validSimplerPuzzleNumSolutionPaths);

            d3.select('#updatesSection').append('h3')
                .text('Adding One Constraint Results in Single-Solution Puzzles');

            diffPairsDiv = d3.select('#updatesSection')
                .append('div')
                .attr('id', diffPairsID);

            // Metrics Dropdown
            diffPairsDiv.append('div').text('Simpler Puzzles with __ Possible Solutions').style('margin-bottom', '2px')
            diffPairsDiv.append('select')
                .classed('diffPairsSelect', true)
                .on('change', function () {
                    modelUpdate({
                        action: 'diffPairs control update',
                        data: {
                            target: 'diffPairs',
                            value: this.value
                        }
                    })
                })
                .selectAll('.diffPairsOptions')
                .data(Object.keys(validSimplerPuzzleNumSolutionPaths), d => d)
                .enter()
                .append('option')
                .classed('diffPairsOptions', true)
                .attr('value', d => d)
                .text(d => d);

            diffPairsDiv.append('div').attr('id', 'diffPairsContainer');

        }

        diffPairsDiv = d3.select('#' + diffPairsID);
        diffPairsDiv.selectAll('.diffPairsOptions').property('selected', d => d === g.s.numSolutionsForSimplerPuzzles);

        let diffPairsContainerDiv = diffPairsDiv.select('#diffPairsContainer');

        diffPairsContainerDiv.selectAll('*').remove();
        let maxShown = 80;
        let selectedSets = g.data.complexSimplerSets
            .filter(d => {
                maxShown -= 1;

                return maxShown > 0 && d.simplerPuzzle.solutions === +g.s.numSolutionsForSimplerPuzzles;
            })
            .forEach((d,i) => {
                let diffPairsBox = diffPairsContainerDiv.append('div')
                    .classed('diffPairsBox', true)
                    .attr('id', 'diffPairs-'+i);
                let diffPairsBoxSimpler = diffPairsBox.append('div')
                    .attr('id', 'diffPairs-' + i + '-simpler')
                    .classed('diffPairs', true)
                    .classed('diffPairsSimpler', true);
                let diffPairsBoxComplex = diffPairsBox.append('div')
                    .attr('id', 'diffPairs-' + i + '-complex')
                    .classed('diffPairs', true)
                    .classed('diffPairsComplex', true);
                let simplerPuzzle = new WitnessPuzzle(d.simplerPuzzle.setup, Object.assign({ classed: ['small'] }, { targetSelection: '#diffPairs-' + i + '-simpler', userInterface: false })); //options { render: false }    
                let complexPuzzle = new WitnessPuzzle(d.complexPuzzle.setup, Object.assign({ classed: ['small'] }, { targetSelection: '#diffPairs-' + i + '-complex', userInterface: false })); //options { render: false }    
                diffPairsBoxSimpler.append('p').text(g.s.numSolutionsForSimplerPuzzles + ' solution' + (g.s.numSolutionsForSimplerPuzzles > 1 ? 's': ''));
                diffPairsBoxComplex.append('p').text('1 solution');

            })

    }

    function drawSetsGraph() {

        let graphID = 'setsGraph', graphDiv;

        if (d3.select('#' + graphID).empty()) {

            d3.select('#updatesSection').append('h3')
                .text('Solvability of Puzzles');

            d3.select('#updatesSection')
                .append('div')
                .attr('id', graphID + 'Overlay')
                .style('position', 'absolute')
                .style('width', '300')
                .style('length', '300')
                .style('background-color', '#fff')
                .style('border', '1px solid black')
                .style('padding', '12px')
                .style('display', 'none');

            graphDiv = d3.select('#updatesSection')
                .append('div')
                .attr('id', graphID);

            // Grid Size Dropdown
            graphDiv.append('div').text('Grid Size').style('margin-bottom', '2px')
            let gridSizeSelect = graphDiv.append('div').style('margin-bottom', '15px').append('select')
                .classed('gridSizeSelect', true)
                .on('change', function(){
                    modelUpdate({action: 'setsGraph control update', 
                                data: {
                                    target: 'gridSize',
                                    value: this.value
                                }})
                })
                .selectAll('.gridSizeOptions')
                .data(Object.keys(g.constraintsInSets), d=>d)
                .enter()
                .append('option')
                .classed('gridSizeOptions', true)
                .attr('value', d=>d)
                .text(d=>d);

            // Metrics Dropdown
            graphDiv.append('select')
                .classed('metricSelect', true)
                .on('change', function(){
                    modelUpdate({action: 'setsGraph control update', 
                                data: {
                                    target: 'metric',
                                    value: this.value
                                }})
                })
                .selectAll('.metricOptions')
                .data(['Solvability', 'Unique Solutions'], d=>d)
                .enter()
                .append('option')
                .classed('metricOptions', true)
                .attr('value', d=>d)
                .text(d=>d);

            // Metric Type Radio
            let metricTypeDiv = graphDiv
                .selectAll('.metricTypeDiv')
                .data(['%', 'Totals'], d=>d)
                .enter()
                .append('div')
                .classed('metricTypeDiv', true);
                
            metricTypeDiv
                .append('input')
                .attr('type', 'radio')
                .attr('name', 'metricType')
                .classed('metricTypeRadio', true)
                .on('change', function(){
                    modelUpdate({action: 'setsGraph control update', 
                                data: {
                                    target: 'metricType',
                                    value: this.value
                                }})
                })
                .attr('id',  d => 'metricType_' + d)
                .attr('value', d=>d);

            metricTypeDiv
                .append('label')
                .classed('metricTypeLabel', true)
                .attr('for',   d => 'metricType_' + d)
                .text(d=>d);

            function createSetsGraphSelects(svgContainerDiv, graphName, availableConstraints) {
                let setsGraphOptions = svgContainerDiv.append('select')
                    .classed(graphName+'Select', true)
                    .on('change', function(){
                        modelUpdate({action: 'setsGraph control update', 
                                    data: {
                                        target: graphName === 'setsGraphX' ? 'x' : 'y',
                                        value: this.value
                                    }})
                    })
                    .selectAll('.'+graphName+'Options')
                    .data(availableConstraints, d=>d)

                setsGraphOptions.enter()
                    .append('option')
                    .classed(graphName + 'Options', true)
                    .attr('value', d=>d)
                    .attr('selected', d=> {
                        if ((graphName === 'setsGraphX' && d === 'numRegionConstraints') 
                            || (graphName === 'setsGraphY' && d === 'numColorOfRegionConstraints')) {
                                return true;
                            }
                    })
                    .text(d=>d)
            }


            let svgContainerDiv = graphDiv.append('div').classed('svgContainer', true);

            createSetsGraphSelects(svgContainerDiv, 'setsGraphY', Object.keys(g.constraintsInSets[g.s.setsGraph.gridSize]).filter(d=> d!== 'numRegionConstraints'))
            createSetsGraphSelects(svgContainerDiv, 'setsGraphX', ['numRegionConstraints']);

            svgContainerDiv
                .append('svg')
                .classed('setsChartSVG', true)
                .attr('width', g.settings.setsGraph.svgSize)
                .attr('height', g.settings.setsGraph.svgSize)
            
        }

        graphDiv = d3.select('#updatesSection');

        graphDiv.selectAll('.gridSizeOptions').property('selected', d => d === g.s.setsGraph.gridSize);
        graphDiv.selectAll('.metricOptions').property('selected', d => d === g.s.setsGraph.metric);
        graphDiv.selectAll('.metricTypeRadio').property('checked', d => d === g.s.setsGraph.metricType);
        graphDiv.selectAll('.setsGraphX').property('selected', d => d === g.s.setsGraph.x);
        graphDiv.selectAll('.setsGraphY').property('selected', d => d === g.s.setsGraph.y);

        let svg = graphDiv.select('.setsChartSVG');

        let selectedSets = g.data.puzzleSetsSolved.filter(set => {
            let allConstraintsFound = 
                set.constraints[g.s.setsGraph.x] !== undefined 
                && set.constraints[g.s.setsGraph.y] !== undefined;
            let noZeros = allConstraintsFound 
                && set.constraints[g.s.setsGraph.x] !== 0 
                && set.constraints[g.s.setsGraph.y] !== 0;
            let crossingConstraints = g.s.setsGraph.y === 'numColorOfRegionConstraints' 
                && Object.keys(set.constraints).indexOf('numMustCrosses') > -1;
            return JSON.stringify(set.size) === g.s.setsGraph.gridSize 
                && allConstraintsFound && noZeros && !crossingConstraints;
        })

        let gridG = svg.selectAll('.gridG')
            .data(selectedSets, d=>JSON.stringify(d.constraints));

        let gridGEntered = gridG.enter()
            .append('g')
            .classed('gridG', true)
            .attr('transform', d=> {
                return 'translate(' + (g.settings.setsGraph.xAxisGap + d.constraints[g.s.setsGraph.x] * g.settings.setsGraph.gridSize) + ' '
                 + (g.settings.setsGraph.svgSize - g.settings.setsGraph.yAxisGap - d.constraints[g.s.setsGraph.y] * g.settings.setsGraph.gridSize) + ')'
            })
            .on('click', function(d){
                console.log(d);
            })
            .on('mouseenter', function(d) {
                let overlayDiv = d3.select('#' + graphID + 'Overlay');
                overlayDiv.selectAll('*').remove();

                if (g.s.setsGraph.metric === 'Solvability') {
                    overlayDiv.append('div')
                        .text(d.solves + ' solvable puzzles, out of...')
                        .style('font-weight', g.s.setsGraph.metricType === 'Totals' ? 'bold' : 'normal')
                        
                    overlayDiv.append('div')
                        .text(d.numPuzzles + ' puzzles generated, for a solve rate of  ')

                    overlayDiv.append('div')
                        .text(Math.round(d.solves / d.numPuzzles * 100000) / 1000 + '%')
                        .style('font-weight', g.s.setsGraph.metricType === '%' ? 'bold' : 'normal')
                }

                if (g.s.setsGraph.metric === 'Unique Solutions') {
                    if (d.solutionsDistributions[1] === undefined) {
                        overlayDiv.append('div')
                            .text(0 + ' Unique Solutions, out of...')
                            .style('font-weight', g.s.setsGraph.metricType === 'Totals' ? 'bold' : 'normal')
                    } else {
                        overlayDiv.append('div')
                            .text(d.solutionsDistributions[1] + ' Unique Solutions, out of...')
                            .style('font-weight', g.s.setsGraph.metricType === 'Totals' ? 'bold' : 'normal')
                    }
                        
                    overlayDiv.append('div')
                        .text(d.numPuzzles + ' puzzles generated, for a unique sol\'n rate of  ')

                    overlayDiv.append('div')
                        .text(Math.round((d.solutionsDistributions[1] === undefined ? 0 : d.solutionsDistributions[1]) / d.numPuzzles * 100000) / 1000 + '%')
                        .style('font-weight', g.s.setsGraph.metricType === '%' ? 'bold' : 'normal')
                }

                overlayDiv.append('br')
                overlayDiv.append('div')
                    .text(g.s.setsGraph.x + ': ' + d.constraints[g.s.setsGraph.x])
                overlayDiv.append('div')
                    .text(g.s.setsGraph.y + ': ' + d.constraints[g.s.setsGraph.y])

                let solutionsDistributions = Object.entries(d.solutionsDistributions);
                let maxVal = solutionsDistributions.reduce((currMax, currVal)=>Math.max(currMax, currVal[1]), 0)

                let barchartWidthScale = d3.scaleLinear().domain([0, maxVal]).range([0, 150]);

                overlayDiv.append('br')
                overlayDiv.append('div')
                    .text('Distribution of Puzzles by # of Solutions per Puzzle')

                let distributionDiv = overlayDiv
                    .append('div')
                    .classed('distributionsDiv', true)
                    .selectAll('.distributionDiv')
                    .data(solutionsDistributions)
                    .enter()
                    .append('div')
                    .classed('distributionDiv', true)
                    .style('height', '8px');

                distributionDiv.append('div')
                    .classed('distributionTitle', true)
                    .text(d=>d[0]);

                distributionDiv.append('div')
                    .classed('distributionBar', true)
                    .style('height', '7px')
                    .style('width', d=> barchartWidthScale(d[1]))
                    .style('background-color', 'blue');

                distributionDiv.append('div')
                    .classed('distributionBarText', true)
                    .text(d=> d[1]);

                overlayDiv.style('display', 'block')
            })
            .on('mousemove', function(){
                d3.select('#' + graphID + 'Overlay')
                    .style('top', Math.max(d3.event.pageY - 200, 15))
                    .style('left', 10 + d3.event.pageX);
            })
            .on('mouseleave',  function(){
                d3.select('#' + graphID + 'Overlay')
                    .style('display', 'none');
            });


        let gridValMax = 1;
        if (g.s.setsGraph.metricType !== '%') {
            gridValMax = selectedSets.reduce((maxSoFar, currSet)=> {
                    let currSetMax = 0;

                    if (g.s.setsGraph.metric === 'Unique Solutions') {
                        if (currSet.solutionsDistributions !== undefined 
                            && currSet.solutionsDistributions[1] !== undefined) {
                            currSetMax = currSet.solutionsDistributions[1];
                        }
                    } else if (g.s.setsGraph.metric === 'Solvability') {
                        currSetMax = currSet.solves;
                    } 
                    return Math.max(maxSoFar, currSetMax);
                },0)
        }
        
        let gridColorScale = d3.scaleLinear().domain([0, gridValMax])
                .range(['white', 'blue']);

        gridGEntered
            .append('rect')
            .attr('width', g.settings.setsGraph.gridSize)
            .attr('height', g.settings.setsGraph.gridSize)
            .classed('gridGMainRect', true)
            .style('stroke-width', 1)
            .style('stroke', '#333')

        gridG.exit()
            .remove();

        gridG = gridG.merge(gridGEntered);
        
        gridG.each(function(currGridG) {

            gridG.select('.gridGMainRect')
                .style('fill', set => {
                    if (g.s.setsGraph.metric === 'Solvability') {
                        if (set.solves === 0) return '#777';
                        if (g.s.setsGraph.metricType === '%' && set.solves === set.numPuzzles) return '#F4F';
                        return (g.s.setsGraph.metricType === '%' ? gridColorScale(set.solves / set.numPuzzles) : gridColorScale(set.solves))
                    } else if (g.s.setsGraph.metric === 'Unique Solutions') {
                        if (set.solutionsDistributions === undefined || set.solutionsDistributions[1] === undefined) {
                            return '#777';
                        }                   
                        return (g.s.setsGraph.metricType === '%' ? gridColorScale(set.solutionsDistributions[1] / set.numPuzzles) : gridColorScale(set.solutionsDistributions[1]))
                    }
                });


        })


        console.log(selectedSets);

        console.log(g.constraintsInSets);
    }



















    return;












































































































































































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

        d3.select('#updatesSection').append('h3')
            .text('Multiple Combinations of Constraints');

        puzzleGrids.forEach(set => set.puzzles.forEach(d => {
    
            // // puzzleSetsByConstraints = generatePuzzlesWithConstraints(d);
            // // 103k puzzles
            // puzzleSetsByConstraints = generatePuzzlesWithConstraints(d, {
            //     numRegionConstraints: { max: 9 },
            //     numColorOfRegionConstraints: { max: 5 },
            //     // numMustCrosses: { max: 2 },
            //     // numCannotCrosses: { max: 1 }
            // });

            let pathAttempts = generateNonCrossingPaths(d);

            puzzleSetsByConstraints = generatePuzzlesWithConstraints(d, {
                numRegionConstraints: { exactly: 3 },
                numColorOfRegionConstraints: { exactly: 2 },
                numMustCrosses: { max: 3 },
                // numCannotCrosses: { max: 1 }
            });

            console.log(pathAttempts);

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
                // numRegionConstraints: { max: 1},
                // numColorOfRegionConstraints: { max: 3 },
                // numMustCrosses: { max: 2 },
                numCannotCrosses: { max: 2 }
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
                numRegionConstraints: { exactly: 5 },
                numColorOfRegionConstraints: { exactly: 3 },
                // numMustCrosses: { max: 2 },
                // numCannotCrosses: { exactly: 1}
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
                        console.log(numPuzzlesGeneratedSoFar);
                        console.log(Math.round((new Date).getTime() - startDate.getTime())/1000)
                        let puzzle = new WitnessPuzzle(newPuzzle, Object.assign({ classed: ['small'] }, options));
                        // debugger;
                    }
                    if (numPuzzlesGeneratedSoFar % 1000000 === 0) {
                        // debugger;
                    }
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

            let timeStartToGenerateConstraints = performance.now();

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
            //     constraints: {"regionConstraints": [
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
    
