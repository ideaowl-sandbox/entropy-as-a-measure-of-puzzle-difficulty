
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

    saveQueryResultsIntoFile({
        TargetModel: PuzzleSet,
        description: 'Getting solved puzzlesets',
        query: {'completedSolving': true},
        outputFilename: 'puzzlesets_solved.json'});

    saveQueryResultsIntoFile({
        TargetModel: PuzzleMeta,
        description: 'Getting single-solution puzzles',
        query: {'solutions': 1},
        outputFilename: 'puzzlemeta_unique_solutions.json'});

    saveQueryResultsIntoFile({
        TargetModel: PuzzleMeta,
        description: 'Getting two-extreme-differently-length-solution puzzles',
        query: {'solutions': 2, "numSolutionsByLength.9": 1, "numSolutionsByLength.15": 1},
        outputFilename: 'puzzlemeta_2_solutions_length_9_and_15.json'});



})



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
    
