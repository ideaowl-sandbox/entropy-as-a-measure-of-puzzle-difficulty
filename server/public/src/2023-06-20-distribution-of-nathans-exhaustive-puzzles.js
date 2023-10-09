import WitnessPuzzle from './lib/WitnessPuzzle/WitnessPuzzle.js';
import d3 from './lib/WitnessPuzzle/modules/_dependencies/d3/4.13.0/d3roll.min.js';
// import regression from './lib/regression/regression.js';

let g = {

};

let puzzleI  = 0;
let allPuzzles = [];
let selectPuzzleEntropy = undefined;
let allSelectedPuzzles = [];

const puzzleSetFiles = [
    'OUTPUT-witness3x3-eugeneMeta.json',
    'OUTPUT-witness3x4-eugeneMeta.json',
];

[0].forEach(() => d3.select('#noES6ModuleLoading').style('display', 'none'))




setTimeout(function(){

    d3.select('#updatesSection').selectAll("*").remove();
    d3.select('#updatesSection').each(function () {

        const thisDiv = d3.select(this);

        let dropdown = thisDiv.append('select');
        dropdown.selectAll('.measure')
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

        const distributionContainer = thisDiv.append('div')
            .classed('distributionContainer', true)
            .style('height', '250px')
            .style('display', 'block');

        const buttonContainer = thisDiv.append('div')
            .classed('buttonContainer', true)
            .style('display', 'block');

        buttonContainer.append('button')
            .text('Index 0')
            .on('click', d => showPuzzles(undefined, 0))

        const jumps = [-500, -100, -50, 50, 100, 500];
        
        buttonContainer.selectAll('.buttonJumps')
            .data(jumps)
            .enter()
            .append('button')
            .classed('buttonJumps', true)
            .text(d=>d)
            .on('click', d=> showPuzzles(+d))

        const puzzlesContainer = thisDiv.append('div')
            .classed('puzzlesContainer', true);

        loadData(dropdown.property('value'))

        function loadData(filename){
            console.log(filename)
            d3.json('./data/distributionPuzzleSets/' + filename, function (puzzles) {
                puzzleI = 0;
                allPuzzles = puzzles;
                selectPuzzleEntropy = undefined;
                createHistogram(allPuzzles);
                showPuzzles(undefined, 0);
            })
        }

        function createHistogram(puzzles) {
            distributionContainer.selectAll('*').remove();
            let buckets = {};
            let min = undefined;
            let max = undefined;
            puzzles.forEach(function (puzzle) {
                if (buckets[puzzle.ReMUSEn0] === undefined) {
                    buckets[puzzle.ReMUSEn0] = 0;
                }
                buckets[puzzle.ReMUSEn0]++;
                if (min === undefined) { min = puzzle.ReMUSEn0 }
                if (max === undefined) { max = puzzle.ReMUSEn0 }
                if (puzzle.ReMUSEn0 < min) { min = puzzle.ReMUSEn0 }
                if (puzzle.ReMUSEn0 > max) { max = puzzle.ReMUSEn0 }
            })


            const maxCount = Math.max(...Object.values(buckets))

            let bucketData = Object.entries(buckets);

            let bucketDivs = distributionContainer.selectAll('.bucket')
                .data(bucketData)
                .enter()
                .append('div')
                .classed('bucket', true)
                .style('position', 'absolute')
                .style('cursor', 'pointer')
                .on('click', function(d) {
                    selectPuzzleEntropy = d[0];
                    allSelectedPuzzles = allPuzzles.filter(p=>p.ReMUSEn0 === +selectPuzzleEntropy);
                    d3.selectAll('.bucket .bucketBar').style('background-color', '#4444aa');
                    d3.select(this).select('.bucketBar').style('background-color', '#aa4444');
                    showPuzzles(undefined, 0);
                })


            bucketDivs.each(function (d) {
                let bucketDiv = d3.select(this);

                bucketDiv.append('div')
                    .classed('bucketBar', true)
                    .style('width', '10px')
                    .style('height', d[1] / maxCount * 200 + 'px')
                    .style('background-color', '#4444aa')
                    .style('position', 'absolute')
                    .style('top', (1 - (d[1] / maxCount)) * 200 + 20 + 'px')
                    .style('left', +d[0] * 80 + 'px')

                bucketDiv.append('div')
                    .style('position', 'absolute')
                    .style('top', 224 + 'px')
                    .style('width', '30px')
                    .style('height', '20px')
                    .style('text-align', 'center')
                    .style('font-size', '10px')
                    .style('left', +d[0] * 80 - 10 + 'px')
                    .text(parseInt(d[0] * 100) / 100)

                bucketDiv.append('div')
                    .style('position', 'absolute')
                    .style('top', (1 - (d[1] / maxCount)) * 200 + 4 + 'px')
                    .style('width', '30px')
                    .style('height', '20px')
                    .style('text-align', 'center')
                    .style('font-size', '10px')
                    .style('left', +d[0] * 80 - 10 + 'px')
                    .text(d[1])

            })


            selectPuzzleEntropy = min;
            allSelectedPuzzles = allPuzzles.filter(p => p.ReMUSEn0 === +selectPuzzleEntropy);
            d3.selectAll('.bucket .bucketBar')
                .style('background-color', d => +d[0] === selectPuzzleEntropy ? '#aa4444' : '#4444aa');
            showPuzzles(undefined, 0);
            
            

        };

        function showPuzzles(jump, forcedI) {

            if (jump !== undefined) {
                puzzleI += jump;
            }
            if (forcedI !== undefined) {
                puzzleI = forcedI;
            }
            
            puzzlesContainer.selectAll('*').remove();

            let puzzlesToShow = allSelectedPuzzles.slice(puzzleI, puzzleI+50);
            puzzlesToShow.forEach(function (pMeta) {
                let puzzleContainer = d3.select(puzzlesContainer.node())
                    .append('div')
                    .style('display', 'inline-block')
                    .style('width', '120px')
                
                new WitnessPuzzle(pMeta.puzzleSetup, { classed: ['small'], targetElement: puzzleContainer.node(), render:true })
                puzzleContainer.selectAll('svg').style('display', 'inline-block')

                if (pMeta.puzzleSetup.ref) {
                    puzzleContainer
                        .append('div')
                        .style('display', 'inline-block')
                        .style('font-size', '10px')
                        .style('margin-top', '-18px')
                        .text(pMeta.puzzleSetup.ref)
                }
            }) 

        }

    })

    return;
    d3.queue()
    
        // .defer(d3.json, './data/windmillUnencodedPuzzles-2022-12-27-minEntropy2n0to2-all124.json')
        // .defer(d3.json, './data/windmillUnencodedPuzzles-2023-01-04-minEntropyWStraightExits-all124.json')
        // .defer(d3.json, './data/windmillUnencodedPuzzles-2023-01-12-addedOtherSolutionMetrics.json')
        // .defer(d3.json, './data/equidistant-curriculum-2023-01-19.json')
        .defer(d3.json, './data/windMill-2023-01-12-OUTPUT-from-Node.json')




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
    
