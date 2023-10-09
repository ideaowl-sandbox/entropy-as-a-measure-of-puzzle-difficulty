
var mongoose = require('mongoose');
mongoose.Promise = Promise;
var Schema = mongoose.Schema;
var fs = require('fs');

console.log('Connecting to local database witness-thesis')
mongoose.connect('mongodb://localhost:27017/witness-thesis', { useNewUrlParser: true });

var db = mongoose.connection;

var PuzzleSet = mongoose.model('PuzzleSet', new mongoose.Schema({
    constraints: Schema.Types.Mixed,
    size: [],
    puzzle: Schema.Types.Mixed,
    completedExpanding: Boolean,
    completedSolving: Boolean,
    solves: Number, 
    solveAttempts: Number,
    numPuzzles: Number,
    solutionsDistribution: Schema.Types.Mixed
}))


var PuzzleMeta = mongoose.model('PuzzleMeta', new mongoose.Schema({
    setup: Schema.Types.Mixed,
    setID: String,
    solutions: Number,
    triedAllPaths: Boolean,
    numSolutionsByLength: Schema.Types.Mixed
}))

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    
    console.log('  -- database connected!')
    console.log('');

    obtainMustCrossCreatesUniques();

    // saveQueryResultsIntoFile({
    //     TargetModel: PuzzleSet,
    //     description: 'Getting solved puzzlesets',
    //     query: {'completedSolving': true},
    //     outputFilename: 'puzzlesets_solved.json'});

    // saveQueryResultsIntoFile({
    //     TargetModel: PuzzleMeta,
    //     description: 'Getting single-solution puzzles',
    //     query: {'solutions': 1},
    //     outputFilename: 'puzzlemeta_unique_solutions.json'});

    // saveQueryResultsIntoFile({
    //     TargetModel: PuzzleMeta,
    //     description: 'Getting two-extreme-differently-length-solution puzzles',
    //     query: {'solutions': 2, "numSolutionsByLength.9": 1, "numSolutionsByLength.15": 1},
    //     outputFilename: 'puzzlemeta_2_solutions_length_9_and_15.json'});



})

async function obtainMustCrossCreatesUniques() {


    
    PuzzleMeta.find({'solutions': 1,'setup.constraints.mustCrosses': {$size: 2}}).limit(1000).exec()
        .then(async function(data){

            // console.log(data[0].setup);
            // let searchPromises = [];

            let complexSimplerSets = [];
            let simplerPuzzleSetup = {};

            for (let i = 0; i < data.length; i++) {
                simplerPuzzleSetup = {};
                simplerPuzzleSetup['setup.size'] = data[i].setup.size;
                simplerPuzzleSetup['setup.startPosition'] = data[i].setup.startPosition;
                simplerPuzzleSetup['setup.endPosition'] = data[i].setup.endPosition;
                simplerPuzzleSetup['setup.constraints'] = JSON.parse(JSON.stringify(data[i].setup.constraints));
                // for (let [k,v] of Object.entries(data[i].setup.constraints)) {
                //     simplerPuzzleSetup['setup.constraints.' + k] = v;
                // }
                
                simplerPuzzleSetup['setup.constraints'].mustCrosses.pop();

                // console.log(JSON.stringify(simplerPuzzleSetup));

                await PuzzleMeta.find(simplerPuzzleSetup).exec()
                    .then(function(simplerPuzzleMeta){
                    console.log(simplerPuzzleMeta[0]._id);
                    complexSimplerSets.push({
                        simplerPuzzle: simplerPuzzleMeta[0],
                        complexPuzzle: data[i],
                        solutionsDiff: data[i].solutions - simplerPuzzleMeta[0].solutions
                    })
                    console.log(' diff: ' + (data[i].solutions - simplerPuzzleMeta[0].solutions))
                })
            }


            // console.log('    ' + description + ': saving into "'+outputFilename+'"...')
            fs.writeFile('complexSimplerSets.json', JSON.stringify(complexSimplerSets), ()=> {
                console.log('    complexSimplerSets: completed saving!');
            });
        })

}

function saveQueryResultsIntoFile({TargetModel, description, query, outputFilename}) {
    console.log('    ' + description + ': retrieving...')
    TargetModel.find(query).exec()
        .then(function(data){
            console.log('    ' + description + ': saving into "'+outputFilename+'"...')
            fs.writeFile(outputFilename, JSON.stringify(data), ()=> {
                console.log('    ' + description + ': completed saving!');
            });
        })
}





return;


// // [0].forEach(() => d3.select('#noES6ModuleLoading').style('display', 'none'))

// setTimeout(function(){

//     // d3.select('#updatesSection').selectAll("*").remove();



// // let newPuzzleObj = new WitnessPuzzle(curriculum.witness_curriculum[0], options);
// // let newPuzzleObjs = new WitnessPuzzle(curriculum.witness_curriculum[1], options);
// // let newPuzzleObjss = new WitnessPuzzle(curriculum.witness_curriculum[2], options);
// // let newPuzzleObjsss = new WitnessPuzzle(curriculum.witness_curriculum[3], options);
// // newPuzzleObj.loadHistory(solveAttempt.history);








// }, 200)
    
