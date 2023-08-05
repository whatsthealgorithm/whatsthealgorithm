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
var totalInitialMatching;

// Start exports section

/**
 * Derives necessary data objects from the content json file.
 */
function setup(){
    return $.getJSON('json/content.json', function(jsonData, status, xhr)
    {
        traits = jsonData.traits;
        initialTraitsDict = getInitialTraitsDict();

        for (var i = 0; i < jsonData.content.length; i++){
            var content = jsonData.content[i];
            var traitsDict = {...initialTraitsDict}; // performs a deep copy

            for (var j = 0; j < content.traits.length; j++){
                traitsDict[content.traits[j]] = 1;
            }

            contentDict[content.id] = {
                id: content.id,
                traits: traitsDict,
                seen: false,
                matchScore: -1,
            };
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

/**
 * Initializes the user's initial feed with a mixture of targeted and random content. 
 */
function initializeFeed(){
    var [matchingContent, nonMatchingContent] = getMatchingAndNonMatchingContent();
    totalInitialMatching = matchingContent.length;
    var selectedMatchingContent = selectAtRandom(matchingContent, 7);
    var selectedNonMatchingContent = selectAtRandom(nonMatchingContent, 10 - selectedMatchingContent.length);

    if (selectedMatchingContent.lenth + selectedNonMatchingContent.length < 10){
        console.log("Error: Not enough content found");
    }

    console.log("Found " + selectedMatchingContent.length + " pieces of matching content and " + selectedNonMatchingContent.length + " pieces of non matching content.");

    var initialMatching = selectedMatchingContent.slice(0, INITIAL_MATCHING_AMOUNT);
    var leftoverMatching = selectedMatchingContent.slice(INITIAL_MATCHING_AMOUNT);
    if (leftoverMatching.length != 0){
        selectedNonMatchingContent = selectAtRandom(leftoverMatching.concat(selectedNonMatchingContent), 10 - initialMatching.length);
    }

    var feedList = initialMatching.concat(selectedNonMatchingContent);
    for (var id in feedList){
        console.log("Added " + feedList[id] + " to initial feed with match score of " + contentDict[feedList[id]].matchScore + ", is it matching? " + (contentDict[feedList[id]].matchScore >= MATCH_THRESHOLD));
    }
    return feedList;
}

/**
 * Handler function for marking content as seen.
 */
function onContentSeen(contentId){
    contentDict[contentId].seen = true;
}

/**
 * Handler function for proccessing engagment on a piece of content. 
 */
function onContentEngagement(contentId, interaction){
    var contentTraits = contentDict[contentId].traits;
    for (var trait in contentTraits){
        if (contentTraits[trait] != 0){
            if (interaction == "like"){
                user.staticPreferences[trait] += ALG_1_WEIGHTINGS[0];
            }
            else if (interaction == "follow"){
                user.staticPreferences[trait] += ALG_1_WEIGHTINGS[1];
            }
            else if (interaction == "share"){
                user.staticPreferences[trait] += ALG_1_WEIGHTINGS[2];
            }
        }
    }
}

/**
 * Recommends a specified number of content posts based on the users' recorded preferences thus far. 
 */
function recommend(amount){
    var ideal = getIdealContentVector(user.staticPreferences);

    var unseenContent = [];

    for (var id in contentDict){
        if (!contentDict[id].seen){
            unseenContent.push(id);
        }
    }

    unseenContent.sort(function(id1, id2) { return calculateSimilarity(ideal, contentDict[id2].traits) - calculateSimilarity(ideal, contentDict[id1].traits); });

    var topContent = unseenContent.slice(0, amount);
    for (var i = 0; i < topContent.length; i++){
        console.log("Recommending " + topContent[i] + ", similarity to ideal is " + calculateSimilarity(ideal, contentDict[topContent[i]].traits));
    }
    return topContent;
}


/**
 * Returns the traits dictionary (derived from json) with all possible traits sorted by category
 */
function getTraits(){
    return traits;
}

/**
 * Returns the top trait within a category for a specified piece of content content. 
 * (e.g. returns 'yellow' for category 'color' for id 'content5')
 */
function getTopTrait(categoryName, id){
    var content = contentDict[id];
    var traitList = traits[categoryName];
    for (var i = 0; i < traitList.length; i++){
        if (content.traits[traitList[i]] > 0){
            return traitList[i];
        }
    }
    // TODO: make random? 
    return traitList[0];
}

function getInitialMatchingAmount(){
    return totalInitialMatching;
}

function getTopInterests(){
    var arr = [];
    for (var pref in user.staticPreferences){
        arr.push([pref, user.staticPreferences[pref]]);
    } 

    arr.sort(function(a, b) { return b[1] - a[1]; });
    return arr;
}

// End exports

/**
 * Returns a zero-initialized dictionary mapping traits to their value.
 */
function getInitialTraitsDict(){
    var dict = {};
    for (var categorytName in traits){
        for (var i = 0; i < traits[categorytName].length; i++){
            dict[traits[categorytName][i]] = 0;
        }
    }
    return dict;
}

/**
 * Returns the ideal content vector of a passed in preferences dictionary. 
 * The top trait of each category will be marked, or no mark in that category if there is no top trait 
 */
function getIdealContentVector(preferences){
    console.log(preferences);
    var traitsDict = {...initialTraitsDict};
    for (var traitName in traits){
        var maxVal = 0;
        var topTrait = null;
        for (var i = 0; i < traits[traitName].length; i++){
            var trait = traits[traitName][i];

            if (preferences[trait] > maxVal){
                topTrait = trait;
                maxVal =  preferences[trait];
            }
        }
        if (topTrait != null){
            traitsDict[topTrait] = 1;
        }
    }
    return traitsDict; 
}

/**
 * Returns the similarity score based off of two trait vectors. 
 */
function calculateSimilarity(idealVector, contentVector){
    var similarityScore = 0;
    var traits = Object.keys(idealVector);
    for (var i = 0; i < traits.length; i++){
        similarityScore += idealVector[traits[i]] * contentVector[traits[i]];
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
        if (content.traits[trait] > 0 && user.staticPreferences[trait] > 0){
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

export { ALGORITHMS, setup, createNewUser, initializeFeed, onContentSeen, onContentEngagement, recommend, getTraits, getTopTrait, getInitialMatchingAmount, getTopInterests };