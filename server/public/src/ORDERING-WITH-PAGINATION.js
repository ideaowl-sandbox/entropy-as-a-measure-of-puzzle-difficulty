import WitnessPuzzle from './lib/WitnessPuzzle/WitnessPuzzle.js';
import d3 from './lib/WitnessPuzzle/modules/_dependencies/d3/4.13.0/d3roll.min.js';
// import regression from './lib/regression/regression.js';


let puzzleI = 0;
let allPuzzles = [];

const puzzleSetFiles = [
    'AT-MOST-12-SOLUTIONS-NumReg-6-NumCol-2-MaxMust-2-SampleRate-200000-OUTPUT.json',
    'AT-MOST-12-SOLUTIONS-NumReg-8-NumCol-3-MaxMust-1-SampleRate-50000-OUTPUT.json',
    'AT-MOST-12-SOLUTIONS-NumReg-10-NumCol-2-MaxMust-1-SampleRate-50000-OUTPUT.json',
];

[0].forEach(() => d3.select('#noES6ModuleLoading').style('display', 'none'))


setTimeout(function(){


    d3.select('#updatesSection').selectAll("*").remove();
    d3.select('#updatesSection').each(function () {

        const thisDiv = d3.select(this);
        thisDiv.append('div')
            .style('font-weight', 'bold')
            .style('margin-bottom', '4px')
            .text('PuzzleSet File:')

        let dropdown = thisDiv.append('select');
        dropdown.selectAll('.puzzleSet')
            .data(puzzleSetFiles)
            .enter()
            .append('option')
            .attr('value', d => d)
            .text(d => d);

        dropdown
            .on('change', function () {
                const filename = dropdown.property('value');
                loadData(filename)
            })

        thisDiv.append('div')
            .style('font-weight', 'bold')
            .style('margin-bottom', '4px')
            .style('margin-top', '8px')
            .text('Measures:')
        
        let measureDropdown = thisDiv.append('select');
        measureDropdown.selectAll('.measure')
            .data([])
            .enter()
            .append('option')
            .classed('measure', true)
            .attr('value', d => d)
            .text(d => d);

        const buttonContainer = thisDiv.append('div')
            .classed('buttonContainer', true)
            .style('display', 'block');

        buttonContainer.append('button')
            .text('Index 0')
            .on('click', d => showPuzzles(undefined, 0))

        const jumps = [-500, -100, -20, 20, 100, 500];

        buttonContainer.selectAll('.buttonJumps')
            .data(jumps)
            .enter()
            .append('button')
            .classed('buttonJumps', true)
            .text(d => d)
            .on('click', d => showPuzzles(+d))

        const indexValues = thisDiv.append('div')
            .classed('indexValues', true);

        const puzzlesContainer = thisDiv.append('div')
            .classed('puzzlesContainer', true);

        const sortedPuzzlesContainer = thisDiv.append('div').classed('sortedPuzzlesContainer', true)
        sortedPuzzlesContainer.style('margin-top', '20px')
        

        loadData(dropdown.property('value'))

        function loadData(filename) {
            console.log(filename)
            d3.json('./data/puzzlesets/' + filename, function (puzzles) {
                puzzleI = 0;
                allPuzzles = puzzles;

                const puzzlesNOTfromWindmill = allPuzzles[0].windmillData === undefined;
                if (puzzlesNOTfromWindmill) {
                    allPuzzles.forEach(pMeta => {
                        pMeta.measureValsByName.solves = -100;
                        pMeta.measureValsByName.upvotes = -100;
                        // pMeta.measureValsByName.milliSecondsToExtract = pMeta.milliSecondsToExtract;
                        // pMeta.measures.push({ name: 'milliSecondsToExtract', val: pMeta.milliSecondsToExtract })
                        pMeta.measures.filter(measure => measure.name === 'solves')[0]['val'] = -100;
                        pMeta.measures.filter(measure => measure.name === 'upvotes')[0]['val'] = -100;
                    })
                }

                let metricList = {}
                allPuzzles.forEach(function (meta) {
                    // Create root zz_m_ metrics
                    meta.measures.forEach(measure => {
                        meta['zz_m_' + measure.name] = measure.val;
                        metricList['zz_m_' + measure.name] = 'metric';
                    })
                })

                const measures = Object.keys(allPuzzles[0].measureValsByName);

                measureDropdown.selectAll('*').remove();

                measureDropdown.selectAll('.measure')
                    .data(measures)
                    .enter()
                    .append('option')
                    .classed('measure', true)
                    .attr('value', d => d)
                    .text(d => d);

                measureDropdown
                    .on('change', function () {
                        const measure = thisDiv.property('value');
                        // drawAndOrder(measure)
                        showPuzzles(undefined, 0)
                    })

                showPuzzles(undefined, 0);
            })
        }

        function showPuzzles(jump, forcedI) {
            if (jump !== undefined) {
                puzzleI += jump;
            }
            if (forcedI !== undefined) {
                puzzleI = forcedI;
            }
            function getMetricsValArr() {
                const currMeasure = measureDropdown.property('value');
                const measureVals = allPuzzles.map(function (pMeta) {
                    return pMeta.measureValsByName[currMeasure];
                })
                let uniqueVals = [...new Set(measureVals)];
                return uniqueVals.sort((a, b) => a >= b ? 1 : -1)
            }
            

            puzzlesContainer.selectAll('*').remove();

            const uniqueMetricVals = getMetricsValArr();

            indexValues.text(uniqueMetricVals.length
                + ' unique measure values from ' 
                + allPuzzles.length + ' puzzles, showing '
                + puzzleI + '-' + (puzzleI+20))


            sortedPuzzlesContainer.selectAll('*').remove();

            sortedPuzzlesContainer
                .selectAll('.uniqueMetricValContainer')
                .data(uniqueMetricVals.slice(puzzleI, puzzleI + 20))
                .enter()
                .append('div')
                .classed('uniqueMetricValContainer', true)
                .style('display', 'inline-block')
                .style('vertical-align', 'top')
                .style('margin-bottom', '20px')
                .style('width', '120px')
                .each(function (metricVal) {
                    const currMeasure = measureDropdown.property('value');
                    let setI = 0;
                    const relevantPuzzles = allPuzzles
                    .filter(pMeta => pMeta.measureValsByName[currMeasure] === metricVal);
                    
                    d3.select(this).append('div').text(metricVal.toPrecision(4))
                    const currMetricValContainer = d3.select(this).append('div').classed('currMetricValContainer', true).node();

                    const currMetricPuzzlesContainer = d3.select(currMetricValContainer).append('div')
                        .classed('currMetricPuzzlesContainer', true)
                        .node()
                    relevantPuzzles.forEach(function (pMeta, i) {
                        if (i < 3) {
                            new WitnessPuzzle(pMeta.puzzleSetup, { classed: ['small'], targetElement: currMetricPuzzlesContainer })
                        }
                    })

                    if (relevantPuzzles.length > 3) {
                        let listIndexSection = d3.select(currMetricValContainer)
                            .append('div')
                            .classed('listIndexSection', true)
                            .style('margin-top', '-15px;');

                        listIndexSection
                            .append('div')
                            .style('font-size', '11px')
                            .text(relevantPuzzles.length + ' puzzles')

                        let listIndexStatus = listIndexSection
                            .append('div')
                            .classed('listIndexStatus', true)
                            .style('font-size', '9px')
                            .text('Showing 0-3');
                        
                        listIndexSection.selectAll('.spanButtons')
                            .data(['reset', -3, 3])
                            .enter()
                            .append('span')
                            .style('font-size', '9px')
                            .style('margin-right', '5px')
                            .style('color', '#2222ff')
                            .style('cursor', 'pointer')
                            .text(d=>d)
                            .on('click', d=>updateSet(d))
                        
                        function updateSet(by) {
                            if (by === 'reset') {
                                setI = 0;
                            } else {
                                setI += by;
                            }

                            d3.select(currMetricPuzzlesContainer).selectAll('*').remove();
                            relevantPuzzles.slice(setI, setI + 3).forEach(function (pMeta, i) {
                                new WitnessPuzzle(pMeta.puzzleSetup, { classed: ['small'], targetElement: currMetricPuzzlesContainer })
                            })
                            listIndexStatus.text('showing ' + setI + '-' + (setI+3))

                        }
                    }
                })


            // let puzzlesToShow = allPuzzles.slice(puzzleI, puzzleI + 50);
            // puzzlesToShow.forEach(function (puzzleToShow) {
            //     new WitnessPuzzle(puzzleToShow.puzzleSetup, { classed: ['small'], targetElement: puzzlesContainer.node() })
            // })

        }

    })

    return;











    d3.queue()
    
        // .defer(d3.json, './data/windmillUnencodedPuzzles-2022-12-27-minEntropy2n0to2-all124.json')
        // .defer(d3.json, './data/windmillUnencodedPuzzles-2023-01-04-minEntropyWStraightExits-all124.json')
        // .defer(d3.json, './data/windmillUnencodedPuzzles-2023-01-12-addedOtherSolutionMetrics.json')
        // .defer(d3.json, './data/equidistant-curriculum-2023-01-19.json')
        // .defer(d3.json, './data/windMill-2023-01-12-OUTPUT-from-Node.json')
        // .defer(d3.json, './data/puzzleSets/MEASURED-AT-MOST-12-SOLUTIONS-NumReg-6-NumCol-2-MaxMust-2-SampleRate-200000-OUTPUT.json')
        .defer(d3.json, './data/puzzleSets/AT-MOST-12-SOLUTIONS-NumReg-6-NumCol-2-MaxMust-2-SampleRate-200000-OUTPUT.json')



        // .defer(d3.json, './data/windmillUnencodedPuzzles-6-contraints-only-with-metrics-and-trajs.json') //windmillUnencodedPuzzles-3-contraints-only
        // .defer(d3.json, './data/puzzlemeta_unique_solutions.json')

        .awaitAll(function (err, [windmillPuzzles]) {

            d3.select('#updatesSection').selectAll("*").remove();

            let drawAbleWindmillPuzzles = windmillPuzzles;

            if (drawAbleWindmillPuzzles[0].windmillData !== undefined) {
                drawAbleWindmillPuzzles = drawAbleWindmillPuzzles
                    .filter(pMeta => pMeta.windmillData.width <= 4 && pMeta.windmillData.height <= 4 && (pMeta.windmillData.width > 1 || pMeta.windmillData.height > 1))
                    .filter(pMeta => pMeta.windmillData.width === 4 && pMeta.windmillData.height === 4)
                    .filter(pMeta => pMeta.measureValsByName.totalSolutionsFound > 0)

                    // .filter(d => d.createUtc > 1467832706257)
                    .filter(d => d.upvotes < 80)
            }
 

            const puzzlesNOTfromWindmill = drawAbleWindmillPuzzles[0].windmillData === undefined;
            if (puzzlesNOTfromWindmill) {
                drawAbleWindmillPuzzles.forEach(pMeta => {
                    pMeta.measureValsByName.solves = -100;
                    pMeta.measureValsByName.upvotes = -100;
                    pMeta.measureValsByName.milliSecondsToExtract = pMeta.milliSecondsToExtract;
                    pMeta.measures.push({ name: 'milliSecondsToExtract', val: pMeta.milliSecondsToExtract })
                    pMeta.measures.filter(measure => measure.name === 'solves')[0]['val'] = -100;
                    pMeta.measures.filter(measure => measure.name === 'upvotes')[0]['val'] = -100;
                })
            }



            let metricList = {}
            drawAbleWindmillPuzzles.forEach(function (meta) {
                // Create root zz_m_ metrics
                meta.measures.forEach(measure => {
                    meta['zz_m_' + measure.name] = measure.val;
                    metricList['zz_m_' + measure.name] = 'metric';
                })
            })

            console.log(drawAbleWindmillPuzzles);

            const measures = Object.keys(drawAbleWindmillPuzzles[0].measureValsByName);

            d3.select('#updatesSection').each(function(){

                const thisDiv = d3.select(this);

                let dropdown = thisDiv.append('select');
                dropdown.selectAll('.measure')
                    .data(measures)
                    .enter()
                    .append('option')
                    .attr('value', d=>d)
                    .text(d=>d);

                dropdown
                    .on('change', function() {
                        const measure = thisDiv.property('value');
                        drawAndOrder()
                    })
                
                console.log(dropdown.property('value'))
                
                // thisDiv.append('h4').text('Original ordering 1st row, 2nd is selected measure');

                const orderedPuzzlesContainer = thisDiv
                    .append('div')
                    .classed('orderedPuzzlesContainer', true)
                    .style('display', 'none')
                    .style('white-space', 'nowrap');

                drawAbleWindmillPuzzles.forEach(function (pMeta) {
                    new WitnessPuzzle(pMeta.puzzleSetup, { classed: ['small'], targetElement: orderedPuzzlesContainer.node() })
                }) 

                const sortedPuzzlesContainer = thisDiv.append('div').classed('sortedPuzzlesContainer', true)


                sortedPuzzlesContainer.style('margin-top', '20px')
                function drawAndOrder() {

                    function getMetricsValArr() {
                        const currMeasure = dropdown.property('value');
                        const measureVals = drawAbleWindmillPuzzles.map(function (pMeta) {
                            return pMeta.measureValsByName[currMeasure];
                        })
                        let uniqueVals = [...new Set(measureVals)];
                        return uniqueVals.sort((a,b)=> a >= b ? 1 : -1)
                    }

                    const uniqueMetricVals = getMetricsValArr();

                    sortedPuzzlesContainer.selectAll('*').remove();

                    sortedPuzzlesContainer
                        .selectAll('.uniqueMetricValContainer')
                        .data(uniqueMetricVals)
                        .enter()
                        .append('div')
                        .classed('uniqueMetricValContainer', true)
                        .style('display', 'inline-block')
                        .style('vertical-align', 'top')
                        .style('width', '120px')
                        .each(function(metricVal) {
                            const currMetricValContainer = this;
                            const currMeasure = dropdown.property('value');
                            const relevantPuzzles = drawAbleWindmillPuzzles
                                .filter(pMeta => pMeta.measureValsByName[currMeasure] === metricVal);

                            d3.select(this).append('div').text(metricVal.toPrecision(4))

                            relevantPuzzles.forEach(function (pMeta) {
                                new WitnessPuzzle(pMeta.puzzleSetup, { classed: ['small'], targetElement: currMetricValContainer })
                            }) 
                        })

                }

                drawAndOrder()


            })





        })


}, 200)
    
