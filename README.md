# Code for: Entropy as a Measure of Puzzle Difficulty
Code created for Eugene's thesis

For slides and other information, links and contact information is at https://ideaowl.com/thesis



## Folder Content
- ```experiment-cli```: Code used to run the results. This was built to enable parallel threads, where you run ```node ___experiment-name___.js```, and the code that runs on each processor is found in ```___experiment-name___-zzz-child-extractor.js```.
- ```server/public```, where the multiple html files exist, is hosted as a simple web-servable page that has multiple outputs based on the names of the html file. So ```server/public/correlation.html``` contains the latest correlation outputs. Most of this won't make much sense to people only because this acts like a history of the work that's been done, the multiple experiments and outputs shown to my supervisors through my thesis.
- ```windmill``` contains code for extracting puzzles from the Windmill. 
