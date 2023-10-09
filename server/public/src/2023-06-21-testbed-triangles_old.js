import WitnessPuzzle from './lib/WitnessPuzzle/WitnessPuzzle.js';
import d3 from './lib/WitnessPuzzle/modules/_dependencies/d3/4.13.0/d3roll.min.js';


// g is now set in previous 2022-12-27 code

// let g = {
//     cachedGeneratedConstraints: {
//         grids: {},
//         junctions: {}
//     },
//     data: {

//     },
//     settings: {
//         setsGraph: {
//             svgSize: 300,
//             gridSize: 20,
//             xAxisGap: 40,
//             yAxisGap: 40
//         }
//     },


//     constraintsInSets: {

//     },

//     s: {
//         setsGraph: {
//             x: 'numRegionConstraints',
//             y: 'numColorOfRegionConstraints',
//             metric: 'Solvability',
//             metricType: '%',
//             gridSize: '[3,3]'
//         },
//         uniquePuzzlesIndex: 0
//     }


// };





let numPuzzlesGeneratedSoFar = 0;

[0].forEach(() => d3.select('#noES6ModuleLoading').style('display', 'none'))

d3.selectAll('.testbedModule').style('display', 'none');
setTimeout(function(){

    d3.select('#testbed_triangles').style('display', 'block');




    d3.select('#kl_n0').selectAll("*").remove();


            let testPuzzles = [{
                "size": [4, 4],
                "startPosition": [2, 4],
                "endPosition": [2, 0, 3],
                "constraints": {
                    "regionConstraints": [
                    ],
                    "mustCrosses": [
                    ],
                    "cannotCrosses": [
                    ],
                    "triangles": [
                        [2, 2, 1],
                        [2, 3, 3],
                        [3, 3, 2]
                    ]
                }
            }, 
            // {
            //     "size": [4, 4],
            //     "startPosition": [2, 4],
            //     "endPosition": [2, 0, 3],
            //     "constraints": {
            //         "regionConstraints": [
            //             // [1, 2, 0],
            //             // [1, 1, 1]
            //         ],
            //         "mustCrosses": [
            //             [2, 0.5],
            //             [2, 1.5],
            //             [2, 2.5],
            //             [2, 3.5],
            //         ],
            //         "cannotCrosses": [
            //             [0, 3.5],
            //             [1, 3.5],
            //             [3, 3.5],
            //             [4, 3.5]
            //         ]
            //     }
            // }, 
            {
                "size": [3, 3],
                "startPosition": [2, 3],
                "endPosition": [2, 0, 3],
                "constraints": {
                    "regionConstraints": [
                        // [1, 2, 0],
                        // [1, 1, 1]
                    ],
                    "mustCrosses": [
                    ],
                    "cannotCrosses": [
                    ],
                    "triangles": [
                        [1, 1, 1],
                        [2, 1, 3],
                        [2, 2, 2]
                    ]
                }
            }, 
            // {
            //     "size": [4, 4],
            //     "startPosition": [2, 4],
            //     "endPosition": [2, 0, 3],
            //     "constraints": {
            //         "regionConstraints": [
            //             // [1, 2, 0],
            //             // [1, 1, 1]
            //         ],
            //         "mustCrosses": [
            //             [2, 0.5],
            //             [2, 1.5],
            //             [2, 2.5],
            //             [2, 3.5],
            //             [2.5, 4],
            //         ],
            //         "cannotCrosses": [
            //             [0, 3.5],
            //             [1, 3.5]
            //         ]
            //     }
            // },
            ];


    // testPuzzles = [{
    //     "size": [4, 2],
    //     "startPosition": [2, 2],
    //     "endPosition": [2, 0, 3],
    //     "constraints": {
    //         "regionConstraints": [
    //             // [1, 2, 0],
    //             // [1, 1, 1]
    //         ],
    //         "mustCrosses": [
    //             [2, 0.5],
    //             // [2, 1.5]
    //         ],
    //         "cannotCrosses": [
    //             [0, 1.5],
    //             [1, 1.5],
    //             [3, 1.5],
    //             [4, 1.5]
    //         ]
    //     }
    // }];


    let optionss = { 
        targetElement: '#triangles', 
        renderImmediateLookAhead: false, 
        renderPOLCstraightToExit: false, 
        renderNLookAhead: true, 
        userInterface: true ,
        doNotStopOrRestartAtEnd: true,
        render: false
    };
            // let testPuzzle = new WitnessPuzzle(testPuzzleSetup, Object.assign({ classed: ['large'] }, optionss)); //options { render: false }    
            
            let testBedPuzzles = [];

            testPuzzles.forEach((puzzleSetup,i) => {

                
                let puzzleSec = d3.select('#triangles')
                    .append('div')
                    .classed('puzzleSec', true)
                    .classed('puzzleSec_' + i, true)
                    .style('margin-bottom', '40px')
                    ;

                optionss.targetElement = '.puzzleSec_' + i;

                let testPuzzle = new WitnessPuzzle(puzzleSetup, Object.assign({ classed: ['large'] }, optionss));

                // puzzleSetup.testPuzzle = testPuzzle;
                // testPuzzle.deriveMinSolKLDivergenceEntropy()
                // testPuzzle.deriveMinSolKLDivergenceEntropyWithPruningAndNdepth(0, { storeKLTrajectoryForDebugging: true });
                // testPuzzle.deriveMinSolKLDivergenceEntropyWithPruningAndNdepth(1, { storeKLTrajectoryForDebugging: true });
                // testPuzzle.deriveMinSolKLDivergenceEntropyWithPruningAndNdepth(2, { storeKLTrajectoryForDebugging: true });
                // console.log(testPuzzle._state.puzzle.history.minSolKLDivergenceEntropyWithPruningAndN0);
                // testPuzzle.deriveMinSolKLDivergenceEntropyWithPruningAndNdepth(100, { storeKLTrajectoryForDebugging: true });
                // console.log(testPuzzle._state.puzzle.history.minSolKLDivergenceEntropyWithPruningAndN80);
                let showPuzzle = new WitnessPuzzle(puzzleSetup, Object.assign({ classed: ['large'] }, { ...optionss, render: true }));

                const puzzleTextSec = puzzleSec.append('div')
                    .classed(optionss.targetElement + 'Text', true)
                    .style('display', 'inline-block')
                    .style('width', '600px')
                    .style('vertical-align', 'top')
                    .style('font-size', '12px')

                showPuzzle.on('keydown', function(self) {
                    
                    const posn = JSON.stringify(showPuzzle._state.puzzle.history.snakePositions);

                    puzzleTextSec.selectAll('*').remove();


                    [0, 1, 2, 100].forEach(function(n) {
                        const currStateData = testPuzzle._state.puzzle.history['KLTrajectoryN'+n][posn];
                        puzzleTextSec.append('h3')
                            .text('n=' + n) 

                        if (currStateData === undefined) {
                            puzzleTextSec.append('div')
                                .text('never traversed here due to pruning');
                        }
                        else {



                            let puzzleTextSecLeft = puzzleTextSec.append('div')
                                .style('width', '300px')
                                .style('vertical-align', 'top')
                                .style('display', 'inline-block');

                            let puzzleTextSecRight = puzzleTextSec.append('div')
                                .style('width', '300px')
                                .style('vertical-align', 'top')
                                .style('display', 'inline-block');



                            puzzleTextSecLeft.append('div')
                                .text('totalEntropy @ state: ' + currStateData.totalEntropy)
                                .style('font-weight', 'bold');

                            puzzleTextSecLeft.append('div')
                                .text('totalEntropy = currEntropy + min(childEntropy)')
                                .style('font-style', 'italic');


                            puzzleTextSecRight.append('div')
                                .text('currEntropy (w/o children): ' + currStateData.currEntropy);


                            if (currStateData.logicOutcomes !== undefined) {

                                puzzleTextSecRight.append('div')
                                    .text('currEntropy = KLDivergence(childProbs, uniformProbs)')                                
                                    .style('font-style', 'italic');



                                puzzleTextSecRight.append('div')
                                    .text('uniform probs: ' + JSON.stringify(currStateData.localSoftMinProb.map(prob => (Math.round(prob * 100000) / 100000))));
                                puzzleTextSecRight.append('div')
                                    .text('child probs (via entropy): ' + JSON.stringify(currStateData.childSoftMinProb.map(prob => (Math.round(prob * 100000) / 100000))));

                                currStateData.logicOutcomes.forEach(function (logicOutcome, i) {
                                    puzzleTextSecLeft.append('div')
                                        .text(' --- child entropy from ' + logicOutcome.dirn.name + ': ' + logicOutcome.childEntropy)
                                        .style('opacity', logicOutcome.childEntropy === currStateData.minEntropy ? 1 : 0.5);
                                })
                                
                            }
                        
                        }

                        
                    })


                    
                })



                testBedPuzzles.push({
                    puzzleSetup,
                    testPuzzle,
                    showPuzzle,
                    puzzleSec
                })


                d3.select(optionss.targetElement).select('svg').style('overflow', 'visible');
                    
                // if (i === 0) {
                //     testPuzzle.attemptSolveWithPath([[0, 1], [1,0]], { POLCstraightToExitAtEnd: true })
                // }
                // if (i === 1) {
                //     testPuzzle.attemptSolveWithPath([[0, 1]], { POLCstraightToExitAtEnd: true })
                // }
                // if (i === 2) {
                //     testPuzzle.attemptSolveWithPath([[0, 1],[1,0],[1,0],[0,-1],[-1,0]], { POLCstraightToExitAtEnd: true })
                // }
            })



    // d3.queue()
    //     // .defer(d3.json, './data/puzzlesets_solved.json')
    //     // .defer(d3.json, './data/puzzlemeta_unique_solutions.json')
    //     .defer(d3.json, './data/puzzlemeta_2_solutions_length_9_and_15.json')
    //     .awaitAll(function(err, [puzzleMetaMultipleSolutions]) {
            
            

    //         // puzzleMetaUniqueSolutions = puzzleMetaUniqueSolutions.sort((a,b)=> 
    //         //     a.setup.size[0] < b.setup.size[0] ? 1 : -1
    //         // );

    //         // g.data = {puzzleSetsSolved, puzzleMetaUniqueSolutions, puzzleMetaMultipleSolutions};

    //         // let puzzleToShowCount = 0;

    //         // puzzleSetsSolved.forEach(set=> {
                
    //         //     let gridSize = JSON.stringify(set.size);
    //         //     if (g.constraintsInSets[gridSize] === undefined) g.constraintsInSets[gridSize] = {};

    //         //     let constraints = Object.keys(set.constraints);
    //         //     constraints.forEach(constraint => {
    //         //         if (g.constraintsInSets[gridSize][constraint] === undefined) {
    //         //             g.constraintsInSets[gridSize][constraint] = 0;
    //         //         }
    //         //         g.constraintsInSets[gridSize][constraint] = 
    //         //             Math.max(g.constraintsInSets[gridSize][constraint], 
    //         //                      set.constraints[constraint]);
    //         //     })
    //         // })


    //         // draw();

    //     //     d3.select('#updatesSection').append('p')
    //     //         .text('This helps to visualize solvability and unique solutions for different constraints.  Hopefully the mouseover provides enough context/info.');

    //     //     d3.select('#updatesSection').append('p')
    //     //         .text('I ran into performance issues on generating combinations of puzzles, particularly for the mustCrosses.  I think it\'s because' 
    //     //         + ' determining if region constraints are valid happens only when the attempt gets to the end.  This could be determined earlier, '
    //     //         + ' and we would want to know this earlier for measuring complexity of puzzles anyhow.');


    //     //     d3.select('#updatesSection').append('h3')
    //     //         .text(puzzleMetaUniqueSolutions.length + ' Puzzles with Only 1 Solution');

    //     //     d3.select('#updatesSection').append('div')
    //     //         .classed('uniquePuzzlesShownIndex', true);

    //     //     d3.select('#updatesSection')
    //     //         .selectAll('.showUniquePuzzlesButton')
    //     //         .data([
    //     //             {title: '<< Prev 1000 ', shift: -1000},
    //     //             {title: '< Prev 100', shift: -100},
    //     //             {title: 'Next 100 >', shift: 100},
    //     //             {title: 'Next 1000 >>', shift: 1000}
    //     //             ])
    //     //         .enter()
    //     //         .append('input')
    //     //         .classed('showUniquePuzzlesButton', true)
    //     //         .attr('type', 'button')
    //     //         .attr('value', d=>d.title)
    //     //         .on('click', d=>modelUpdate({
    //     //             action: 'show different unique puzzles', 
    //     //             data: d.shift
    //     //         }))

    //     //     d3.select('#updatesSection').append('div')
    //     //         .classed('uniquePuzzlesSection', true);

    //     //     d3.select('#updatesSection').append('p')
    //     //         .text('This was the goal I wanted to get to for determining complexity of puzzles.  Unique solution puzzles ' 
    //     //         + ' reduces the question of complexity relating to how many possible ways a puzzle can be solved, and there are '
    //     //         + ' distinct, noticable differences in challenges within just puzzles that have a single solution.');

    //     //     modelUpdate({
    //     //             action: 'show different unique puzzles', 
    //     //             data: 0
    //     //         })

    //     //     let options = { targetElement: '#updatesSection', userInterface: false };
    //     //     d3.select('#updatesSection').append('h3')
    //     //         .text('Multiple Solutions');

    //     //     puzzleToShowCount = 0;
    //     //     puzzleMetaMultipleSolutions
    //     //         .filter(d=>{
    //     //             puzzleToShowCount += 1;
    //     //             return puzzleToShowCount < 100;
    //     //             })
    //     //         .forEach(d=>{
    //     //             let puzzle = new WitnessPuzzle(d.setup, Object.assign({ classed: ['small'] }, options)); //options { render: false }    

    //     //         })



    //     //     d3.select('#updatesSection').append('p')
    //     //         .text('As part of the conversation from last time, I thought it would be interesting to see puzzles that have  ' 
    //     //         + ' two solutions, one that would be much harder than the other.  Using puzzles that have only two solutions '
    //     //         + ' but have a maximum difference in number of steps to get to a solution, these came up... and were extremely disappointing.  Try them.');
            
    //     })








    
    
    
    
    function draw() {

        drawSetsGraph()
        drawUniquePuzzles()

    }


    function modelUpdate({action, data}) {
        if (action === 'setsGraph control update') {
            g.s.setsGraph[data.target] = data.value;
        }

        if (action === 'show different unique puzzles') {

            if (data + g.s.uniquePuzzlesIndex > 35708 ||  data + g.s.uniquePuzzlesIndex < 0) {

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

        draw();
    }

    function drawUniquePuzzles() {

        d3.select('.uniquePuzzlesShownIndex')
            .text('Up to 100 puzzles from index ' + g.s.uniquePuzzlesIndex)

        let options = { targetElement: '.uniquePuzzlesSection', userInterface: false };
        
        d3.select('.uniquePuzzlesSection').selectAll('*').remove();

        g.data.puzzleMetaUniqueSolutions
            .filter((d,i)=>{
                return i >= g.s.uniquePuzzlesIndex && i < g.s.uniquePuzzlesIndex + 100;
                })
            .forEach(d=>{
                let puzzle = new WitnessPuzzle(d.setup, Object.assign({ classed: ['small'] }, options)); //options { render: false }    

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
    
