//ORDER: [[like weight, share weight, follow weight], [prioritizations]]
const ALG_1 = [[1, 0.5, 2.5], []];
const ALG_2 = [[0.5, 2, 1], ["science", "sports", "MENA"]];
const ALG_3 = [[1, 1, 1], ["USA", "food", "travel"]];

const ALGORITHMS = [ALG_1, ALG_2, ALG_3];

const MATCH_THRESHOLD = 2;
const INITIAL_MATCHING_AMOUNT = 3;

var user;
var initialTraitsDict;
var contentDict = {};
var traits;
var styles;
var assumptions;
var totalInitialMatching;
var lastRecommendedSketch = null;

const feed_testing = 0;
// Start exports section

/**
 * Derives necessary data objects from the sketch json file.
 */
function setup(){
    $.getJSON('json/assumptions.json', function(jsonData, status, xhr)
    {
        assumptions = jsonData.assumptions;
    });
    return $.getJSON('json/sketches_safe.json', function(jsonData, status, xhr)
    {
        traits = jsonData.traits;
        styles = jsonData.styles;
        initialTraitsDict = getInitialTraitsDict();

        var allCombinations = getAllPossibleTraitCombinations();

        for (var i = 0; i < jsonData.sketches.length; i++){
            var sketch = jsonData.sketches[i];

            for (var j = 0; j < allCombinations.length; j++){
                var combo = allCombinations[j].slice(); // Clone the combination

                // If the sketch style is "emoji", set shape traits to 0
                if (sketch.style === "emoji") {
                    traits.shapes.forEach(shapeTrait => {
                        const index = combo.indexOf(shapeTrait);
                        if (index !== -1) {
                            combo[index] = 0;
                        }
                    });
                }

                contentDict[sketch.id + j] = {
                    id_recsys: sketch.id,
                    id: sketch.id + j,
                    style: sketch.style,
                    sketchName: sketch.id,
                    traits: combo,
                    seen: false,
                    matchScore: -1,
                };
            }
        }
    });
}

/**
 * Creates a new user with a blank preferences dictionary. Then, populates initial interests from a passed in 
 * stated preferences dictionary. 
 */
function createNewUser(statedPreferences){
    user = {
        staticPreferences: getInitialTraitsDict(),
    }

    for (var trait in statedPreferences){
        if (statedPreferences[trait]){
            user.staticPreferences[trait] = 1;
        }
    }
}

function initializeFeed(){
    var [matchingContent, nonMatchingContent] = getMatchingAndNonMatchingContent();
    totalInitialMatching = matchingContent.length;
    console.log("found this much matching content",totalInitialMatching )

    var feedList = [];
    var combinedContent = matchingContent.concat(nonMatchingContent);

    while (feedList.length < 6 && combinedContent.length > 0) {
        for (var i = 0; i < 4; i++) {
            var selectedId = selectOneAtRandom(matchingContent);
            
            if (feedList.length === 0 || contentDict[selectedId].id_recsys !== contentDict[feedList[feedList.length - 1]].id_recsys) {
                feedList.push(selectedId);
                console.log("Added " + selectedId + " to initial feed with match score of " + contentDict[selectedId].matchScore + ", is it matching? " + (contentDict[selectedId].matchScore >= MATCH_THRESHOLD));
            }
        }

        for (var i=0; i < 3; i++){
            var selectedId = selectOneAtRandom(combinedContent);
            
            if (feedList.length === 0 || contentDict[selectedId].id_recsys !== contentDict[feedList[feedList.length - 1]].id_recsys) {
                feedList.push(selectedId);
                console.log("Added " + selectedId + " to initial feed with match score of " + contentDict[selectedId].matchScore + ", is it matching? " + (contentDict[selectedId].matchScore >= MATCH_THRESHOLD));
            }
        }
        
        // Remove the selectedId from combinedContent
        combinedContent = combinedContent.filter(id => id !== selectedId);
    }

    if (feedList.length < 6 && feed_testing == 0) {
        console.log("Error: Not enough content found.");
        return [];
    }

    return feedList;
}

// function initializeFeed(){
//     var [matchingContent, nonMatchingContent] = getMatchingAndNonMatchingContent();
//     totalInitialMatching = matchingContent.length;
//     console.log("found this much matching content",totalInitialMatching )

//     var feedList = [];
//     var combinedContent = matchingContent.concat(nonMatchingContent);

//     while (feedList.length < 6 && combinedContent.length > 0) {
//         var selectedId = selectOneAtRandom(combinedContent);
//         if (feedList.length === 0 || contentDict[selectedId].id_recsys !== contentDict[feedList[feedList.length - 1]].id_recsys) {
//             feedList.push(selectedId);
//             console.log("Added " + selectedId + " to initial feed with match score of " + contentDict[selectedId].matchScore + ", is it matching? " + (contentDict[selectedId].matchScore >= MATCH_THRESHOLD));
//         }
//         // Remove the selectedId from combinedContent
//         combinedContent = combinedContent.filter(id => id !== selectedId);
//     }

//     if (feedList.length < 6 && feed_testing == 0) {
//         console.log("Error: Not enough content found.");
//         return [];
//     }

//     return feedList;
// }

function selectOneAtRandom(contentList) {
    var randomIndex = Math.floor(Math.random() * contentList.length);
    return contentList[randomIndex];
}


/**
 * Handler function for marking content as seen.
 */
function onContentSeen(contentId){
    if (contentDict.hasOwnProperty(contentId)){
        contentDict[contentId].seen = true;
    }
}

/**
 * Handler function for proccessing engagment on a piece of content. 
 */
function onContentEngagement(contentId, interaction){
    var contentTraits = contentDict[contentId].traits;
    for (var i = 0; i < contentTraits.length; i++){
        if (interaction == "like"){
            user.staticPreferences[contentTraits[i]] += ALG_1[0][0];
        }
        else if (interaction == "follow"){
            user.staticPreferences[contentTraits[i]] += ALG_1[0][1];
        }
        else if (interaction == "share"){
            user.staticPreferences[contentTraits[i]] += ALG_1[0][2];
        }
    }
    user.staticPreferences[contentDict[contentId].style] += 1;
}

/**
 * Handler function for proccessing a disengagment on a piece of content. 
 */
function onContentDisengagement(contentId, interaction){
    var contentTraits = contentDict[contentId].traits;
    for (var i = 0; i < contentTraits.length; i++){
        if (interaction == "like"){
            user.staticPreferences[contentTraits[i]] -= ALG_1[0][0];
        }
        else if (interaction == "follow"){
            user.staticPreferences[contentTraits[i]] -= ALG_1[0][1];
        }
        else if (interaction == "share"){
            user.staticPreferences[contentTraits[i]] -= ALG_1[0][2];
        }
    }
    user.staticPreferences[contentDict[contentId].style] -= 1;
}

/**
 * Recommends a specified number of content posts based on the users' recorded preferences thus far. 
 */
 function recommend(amount) {
    console.log("Recommend function called");
    var ideal = getIdealContentVector(user.staticPreferences);
    var unseenContent = [];

    for (var id in contentDict) {
        if (!contentDict[id].seen) {
            unseenContent.push(id);
        }
    }

    // Sort the content based on similarity to ideal vector
    unseenContent.sort(function(id1, id2) {
        var contentVector1 = createContentVector(contentDict[id1]);
        var contentVector2 = createContentVector(contentDict[id2]);
        var similarityDifference = calculateSimilarity(ideal, contentVector2) - calculateSimilarity(ideal, contentVector1);
    
        // If the similarity scores are equal, return a random number to shuffle the order
        if (similarityDifference === 0) {
            return Math.random() - 0.5;
        }
    
        return similarityDifference;
    });

    var recommendations = [];

    while (recommendations.length < amount && unseenContent.length > 0) {
        const topContent = unseenContent.shift();  // Get the top recommendation
        console.log("Processing content:", topContent);
        if (recommendations.length === 0) {
            // If this is the first video, add it without filtering
            recommendations.push(topContent);
        } else {
            // Check against the last added video
            const lastAdded = recommendations[recommendations.length - 1];
            const currentSketchTraits = contentDict[topContent].traits;
            const lastSketchTraits = contentDict[lastAdded].traits;

            const sameStyle = contentDict[topContent].id_recsys === contentDict[lastAdded].id_recsys;
            console.log("id", contentDict[topContent].id_recsys);
            console.log("same style?", sameStyle);
            if (sameStyle) {
                console.log("Filtered Content:", topContent);
                console.log("Reason: Matches style with previous content.");
                continue;
            }
            const sameColor = currentSketchTraits.includes(lastSketchTraits.find(trait => traits.colors.includes(trait)));
            console.log("same color?", sameColor);
            const sameShape = currentSketchTraits.includes(lastSketchTraits.find(trait => traits.shapes.includes(trait)));
            console.log("same shape?", sameShape);
            const differentSpeed = !currentSketchTraits.includes(lastSketchTraits.find(trait => traits.speeds.includes(trait)));
            console.log("different speed?", differentSpeed);
            
            if (!(sameStyle && sameColor && sameShape && differentSpeed)) {
                console.log("Added Content:", topContent);
                recommendations.push(topContent);
            }
            else { 
                console.log("Filtered Content:", topContent);
                // Additional information if you want more context
                console.log("Reason: Matches style, color, shape with previous content but has different speed.");
            }
           
        }
    }

    for (var i = 0; i < recommendations.length; i++) {
        console.log("Recommending " + recommendations[i] + ", similarity to ideal is " + calculateSimilarity(ideal, createContentVector(contentDict[recommendations[i]])));
    }

    return recommendations;
}



/**
 * Returns the traits dictionary (derived from json) with all possible traits sorted by category
 */
function getAllTraits(){
    return traits;
}

/**
 * Returns an array of traits for a specific piece of content (e.g. ["red", "square", "fast"])
 */
function getContentTraits(id){
    if (contentDict.hasOwnProperty(id)){
        return contentDict[id].traits;
    }
    return null;
}

/**
 * Returns an array of the top interests and their scores, sorted from highest to lowest 
 */
function getTopInterests(){
    var arr = [];
    for (var pref in user.staticPreferences){
        console.log("these are the preferences BEFORE sorting,", user.staticPreferences )
        if (user.staticPreferences.hasOwnProperty(pref) && !isNaN(user.staticPreferences[pref])) {
            arr.push([pref, user.staticPreferences[pref]]);
        }
    } 

    arr.sort(function(a, b) { return b[1] - a[1]; });
    console.log("these are the preferences AFTER sorting,", arr )

    return arr;
}

/**
 * Returns the top trait of the given category name
 */
// function getTopTrait(categoryName){
//     var topTrait = traits[categoryName][0];
//     var topVal = 0;
//     for (var trait in traits[categoryName]){
//         if (user.staticPreferences[trait] > topVal){
//             topVal = user.staticPreferences[trait];
//             topTrait = traits[categoryName][trait];
//         }
//     }anything
//     return topTrait;
// }

function getTopTrait(categoryName){
    var topTrait = traits[categoryName][0];
    var topVal = 0;
    for (var i = 0; i < traits[categoryName].length; i++){
        var trait = traits[categoryName][i];
        if (user.staticPreferences[trait] > topVal){
            topVal = user.staticPreferences[trait];
            topTrait = trait;
        }
    }
    return topTrait;
}

/**
 * Returns the assumption associated with the given trait
 */
function getAssumption(topTrait){
    return assumptions[topTrait];
}

/**
 * Gets the name of the sketch associated with the given content id
 */
function getContentSketchName(id){

// sketchName: sketch.id

    return contentDict[id].sketchName;
}

// End exports

/**
 * Creates a dict with only traits marked that belong to the passed in piece of content. 
 */
function createContentVector(content){
    var vector = {...initialTraitsDict};
    for (var trait in content.traits){
        vector[content.traits[trait]] = 1;
    }
    vector[content.style] = 1;
    return vector;
}

/**
 * Gets all possible trait combinations for an arbitrary list of traits.
 */
function getAllPossibleTraitCombinations(){
    var traitsList = Object.values(traits);
    var combos = traitsList[0];
    for (var i = 1; i < traitsList.length; i++){
        combos = combine(combos, traitsList[i]);
    }
    return combos;
}

/**
 * Helper function that rewrites the passed in array to encompass all new combinations of the given list.
 */
function combine(array, list){
    var ar = [];
    for (var i = 0; i < array.length; i++){
        for (var j = 0; j < list.length; j++){
            var c = [array[i], list[j]];
            ar.push(c.flat());
        }
    }
    array = ar;
    return array;
}

/**
 * Returns a zero-initialized dictionary mapping traits to their value.
 */
function getInitialTraitsDict(){
    var dict = {};
    for (var categoryName in traits){
        for (var i = 0; i < traits[categoryName].length; i++){
            dict[traits[categoryName][i]] = 0;
        }
    }
    for (var style in styles){
        dict[styles[style]] = 0;
    }
    return dict;
}

/**
 * Returns the ideal content vector of a passed in preferences dictionary. 
 * The top trait of each category will be marked, or no mark in that category if there is no top trait 
 */
function getIdealContentVector(preferences){
    var traitsDict = {...initialTraitsDict};
    for (var traitName in traits){
        var maxVal = 0;
        var topTrait = null;
        for (var i = 0; i < traits[traitName].length; i++){
            var trait = traits[traitName][i];

            if (preferences[trait] > maxVal){
                topTrait = trait;
                maxVal = preferences[trait];
            }
        }
        if (topTrait != null){
            traitsDict[topTrait] = 1;
        }
    }

    // Get top style
    var topStyle = styles[0];
    var maxVal = 0;
    for (var i = 0; i < styles.length; i++){
        if (preferences[styles[i]] > maxVal){
            topStyle = styles[i];
            maxVal = preferences[styles[i]];
        }
    }
    traitsDict[topStyle] = 1;
    return traitsDict; 
}

/**
 * Returns the similarity score based off of two trait vectors. 
 */
function calculateSimilarity(idealVector, contentVector){
    var similarityScore = 0;
    var traitList = Object.keys(idealVector);
    // console.log("this is the idea vector", idealVector);
    // console.log("this is the content vector", contentVector);
    for (var i = 0; i < traitList.length; i++){
        similarityScore += idealVector[traitList[i]] * contentVector[traitList[i]];
    }
    return similarityScore;
}

/**
 * Returns two arrays that separate all content into matching and non-matching ccategories
 */
function getMatchingAndNonMatchingContent(){
    var matchingContent = [];
    var nonmatchingContent = [];
    for (var id in contentDict){
        if (matchesPreferences(contentDict[id], MATCH_THRESHOLD)){
            matchingContent.push(id);
        }
        else{
            nonmatchingContent.push(id);
        }
    }
    return [matchingContent, nonmatchingContent];
}

/**
 * Returns if a piece of content matches the user's preferences given a specified threshold.
 */
function matchesPreferences(content, threshold){
    var overlap = 0;
    for (var trait in content.traits){
        if (user.staticPreferences[content.traits[trait]] != 0){
            overlap++;
        }
    }
    content.matchScore = overlap;
    return overlap >= threshold;
}

/**
 * Selects a specified number of items from an array.
 */
function selectAtRandom(array, num){
    var selection = [];
    while (selection.length < num && array.length != 0){
        var index = Math.floor(Math.random() * array.length);
        selection.push(array[index]);
        array.splice(index, 1);
    }
    return selection;
}

export { ALGORITHMS, setup, createNewUser, initializeFeed, onContentSeen, onContentEngagement, onContentDisengagement, recommend, getAllTraits, getContentTraits, getTopInterests, getTopTrait, getAssumption, getContentSketchName };