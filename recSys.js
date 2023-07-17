const LIKE_WEIGHT = 1;
const SHARE_WEIGHT = 0.5;
const REPOST_WEIGHT = 2.5;

var userProfile;

function initializeFeed(profile){
    userProfile = profile;
    var matchingContent = getAllMatchingContent();
    var selectedMatchingContent = selectAtRandom(matchingContent, 3);
    
    var nonMatchingContent = getAllNonMatchingContent();
    var selectedNonMatchingContent = selectAtRandom(nonMatchingContent, 3)

    return selectedMatchingContent.concat(selectedNonMatchingContent);
}

function getAllMatchingContent(){

}

function getAllNonMatchingContent(){

}

function selectAtRandom(array, num){
    var selection = [];
    while (selection.count < num){
        var index = Math.random() * array.count
        selection.push(array[index]);
        array.splice(index, 1);
    }
    return selection;
}