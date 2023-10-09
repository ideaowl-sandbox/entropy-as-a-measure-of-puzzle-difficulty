import WitnessPuzzle from './lib/WitnessPuzzle/WitnessPuzzle.js';
import d3 from './lib/WitnessPuzzle/modules/_dependencies/d3/4.13.0/d3roll.min.js';
// import regression from './lib/regression/regression.js';



// let moveAttemptsWithFinalOutcomes = [];
let solvingMoveAttempts = [];

let numPuzzlesGeneratedSoFar = 0;
// let options = ;

[0].forEach(() => d3.select('#noES6ModuleLoading').style('display', 'none'))


setTimeout(function(){

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
    
