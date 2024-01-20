var postHeight;
var device;
var menu;
var menuButton;
var debugMenu;
var introPages;
var deviceButtons;
var scrollTimeout;
var nudge;

var posts = [];
var buttonCounts = {follows: 0, likes: 0, shares: 0};
var introSequence = [];
var interestDict = {};
var scriptByIndex = {};
var scriptByTrigger = {};
var sketchDict = {};
var selectInterestDict = {};

var animating = false;
var disableMessages = false;
var isMobile = false;
var debug = false;
var inIntro = false;
var menuShowing = false;
var deviceButtonsShowing = true;
var barDragging = false;

const initialPostLoad = 6;
const pageSwipeTime = 400;
const numPreferencesToShow = 4;
const maxPosts = 28;

var introIndex = 0;
var lastYPos = -1;
var startingYPos = -1;
var percentToSwipe = 14;
var currentPost = 0;
var totalPosts = 0;
var simulatedWheelPos = 0;

var interestsPicked = 0;

const deviceIconFilterOn = 'drop-shadow(0 5px 10px black) brightness(100%)'
const deviceIconFilterOff = 'drop-shadow(0 5px 10px black) brightness(2000%)'

import * as recSys from "recSys";
import * as canvas from "html2canvas";

// FOR TESTING

// default 0. set to 1 to skip intro screens

const feed_testing = 0;


// default 0. set to 1 to disable scrolling up
const disable_scroll_up = 0;

// To test for content with specific attributes, set these. Otherwise, comment it out.

// let test_attributes = {
//     'userSize': 'large',
//     'userColor': 'blue',
//     'userShape': 'triangle'
// }

 // to show tutorial on page 2
// if (contentIndex === 2) {
//     // Perform actions specific to contentIndex being 2
//     console.log("Content index is 2");
//     document.getElementsByClassName("tooltip")[0].style.display = "block";
// } else {
//     console.log("Content index is not 2");
//     document.getElementsByClassName("tooltip")[0].style.display = "none";
// }


async function initialize(){
    await loadScript();
    
    device = document.getElementById("device-screen");
    menu = document.getElementById("info");
    menuButton = document.getElementById("info-icon");
    debugMenu = document.getElementById("debug");
    deviceButtons = document.getElementById("device-buttons")

    // mouse touch controls
    document.addEventListener("dragstart", dragStart);
    document.addEventListener("dragend", dragEnd);
    document.addEventListener("dragover", drag);

    let isFirstDrag = true;

    // Add an event listener for dragstart
    document.addEventListener("dragend", function(event) {
        if (isFirstDrag) {
            // This is the first drag
            isFirstDrag = false; // Set the flag to false for subsequent drags
            // Perform actions for the first drag here
            console.log("First drag detected!");
            document.getElementsByClassName("swipe-tutorial-container")[0].style.display = "none";
        }
        
    });

    // scroll touch controls
    document.addEventListener("wheel", wheelMove);

    // mobile touch controls
    document.addEventListener("touchmove", touchMove);
    document.addEventListener("touchend", touchEnd);

    var buttons = document.getElementsByClassName("device-button");
    for (var i = 0; i < buttons.length; i++){
        buttons[i].addEventListener("click", onDeviceButtonClicked);
    };

    var introButtons = document.getElementsByClassName("intro-button");
    for (var i = 0; i < introButtons.length; i++){
        introButtons[i].addEventListener("click", onIntroButtonClicked);
    };

    window.addEventListener("resize", resize);

    addEventListener("keypress", (e) => {
        if (e.key == "d"){
            toggleDebug();
        }
    });

    // Set up Info Menu
    var weightingsMenu = document.getElementById("weightings-template").content.cloneNode(true);
    var preferencesMenu = document.getElementById("preferences-template").content.cloneNode(true);
    menu.appendChild(weightingsMenu);
    menu.appendChild(preferencesMenu);
    setWeightings(menu, 0);

    var info = document.getElementById("info-column");
    var exit = info.getElementsByClassName("info-exit-button")[0];

    isMobile = $(window).width() < 767;
    menuButton.addEventListener("click", () => { toggleInfoMenu(true)} );
    exit.addEventListener("click", () => { toggleInfoMenu(false) });
    console.log("Offset height: " + info.offsetHeight)
    menu.style.top = info.offsetHeight + "px";
    exit.style.display = "block";
    toggleInfoMenu(false);

    await recSys.setup();

    if(feed_testing === 1) {
        recSys.createNewUser(interestDict);
        setPreferences(menu);
        toggleInfoMenu(false);
        var contentIdList = recSys.initializeFeed();
        console.log("this is the id list", contentIdList)
        loadContent(initialPostLoad, contentIdList);
        setContentDraw();
        document.getElementById("debug-content").innerHTML = "ID: " + posts[0].id;
        document.getElementById("debug-post-count").innerHTML = "Post" + currentPost;
        document.getElementById("debug-traits").innerHTML = recSys.getContentTraits(posts[currentPost].id);
    }
    else {
        startIntro();
    }

}

/**
 * Sets the upcoming two posts to draw their sketches, and the previous sketch to not draw
 */
function setContentDraw(){
    // Turn previous post off (if exists)
    if (posts[currentPost-1] != null && sketchDict[posts[currentPost-1].div.id] != null){
        sketchDict[posts[currentPost-1].div.id].setDraw(false);
    }
    // Turn current post on 
    if (posts[currentPost] != null && sketchDict[posts[currentPost].div.id] != null){
        sketchDict[posts[currentPost].div.id].setDraw(true);
    }
    // Turn next post on
    if (posts[currentPost + 1] != null && sketchDict[posts[currentPost+1].div.id] != null){
        sketchDict[posts[currentPost+1].div.id].setDraw(false);
    }
}

function loadScript(){
    return $.getJSON('json/script.json', function(jsonData, status, xhr)
    {
        for (var i = 0; i < jsonData.script.length; i++){
            var s = jsonData.script[i];
            if (s.index != null){
                scriptByIndex[parseInt(s.index)] = s;
            }
            if (s.trigger != null){
                scriptByTrigger[s.trigger] = s;
            }
        }
        console.log(scriptByIndex);
    });
}

function getCategoryForTrait(trait) {
    if (jsonData.traits.colors.includes(trait)) {
        return "color";
    } else if (jsonData.traits.shapes.includes(trait)) {
        return "shape";
    } else if (jsonData.traits.speeds.includes(trait)) {
        return "speed";
    } else {
        // If the trait doesn't belong to any of the predefined categories, you can handle it as needed
        return "unknown";
    }
}
function startIntro(){
    document.getElementById("intro").style.display = "flex";
    inIntro = true;
    introPages = document.getElementsByClassName("intro-page");
    for (var i = 0; i < introPages.length; i++){
        introPages[i].style.display = "flex";
        introPages[i].style.zIndex = 5 + introPages.length - i;
        introSequence.push(introPages[i]);
    }
    introPages[0].style.opacity = 1;

    var buttonContainer = document.getElementById("intro-button-container");

    var traits = recSys.getAllTraits();
    for (var traitName in traits){
        for (var i = 0; i < traits[traitName].length; i++){
            var trait = traits[traitName][i];
            var interestButton = document.createElement("button");
            interestButton.className = "interest-selection trait-" + traitName;
            interestButton.innerHTML = trait;
            interestButton.onclick = onIntroInterestButtonClicked;
            buttonContainer.appendChild(interestButton);
            interestDict[trait] = false;
        }
    }
    $("#interest-finished")[0].disabled = true;
}

function onIntroButtonClicked(){
    var page =  introSequence[introIndex];
    var arrow = document.getElementById("swipe-animation");
    arrow.style.display="block";
    page.style.opacity = 0;
    setTimeout(() => { page.style.display = "none"; }, 100);
    introIndex++;

    // Check if we need to wait
    if (introIndex == 2){
        recSys.createNewUser(interestDict);
        setPreferences(menu);
        toggleInfoMenu(false);
        var contentIdList = recSys.initializeFeed();
        loadContent(initialPostLoad, contentIdList);

        setTimeout(onIntroButtonClicked, 4000);
    }

    setContentDraw();
    if (introIndex >= introPages.length){
        setTimeout(() => {
            document.getElementById("debug-content").innerHTML = "ID: " + posts[0].id;
            document.getElementById("debug-post-count").innerHTML = "Post " + currentPost;
            document.getElementById("intro").style.display = "none";
            inIntro = false;
        }, 100);
    };
}

// Implement a function to determine the trait type based on the button label
function getTraitType(trait){
    switch (trait) {
        case "red":
        case "blue":
        case "green":
            return "color";
        case "circle":
        case "square":
        case "triangle":
            return "shape";
        case "slow":
        case "normal":
        case "fast":
            return "speed";
        default:
            return "unknown";
    }
}

function onIntroInterestButtonClicked(e) {
    const trait = e.target.innerHTML;
    const traitType = getTraitType(trait);

    // Deselect previously selected trait of the same type
    for (let key in interestDict) {
        if (getTraitType(key) === traitType && interestDict[key]) {
            interestDict[key] = false;
            // Update button style for the deselected trait
            Array.from(document.getElementsByTagName('button')).forEach(button => {
                if (button.innerHTML === key) {
                    button.style.backgroundColor = "";
                }
            });
        }
    }

    // Toggle the selected trait
    interestDict[trait] = !interestDict[trait];
    e.target.style.backgroundColor = interestDict[trait] ? "#1ad631" : "";
    
    const isOneOfEachTypeSelected = checkIfOneOfEachTypeSelected();
    // Check if one of each type is selected
    if (isOneOfEachTypeSelected) {
        document.getElementById('error-message').style.display = 'none';
        document.getElementById('click-detector').style.display = 'none';
    } 

    // Enable or disable the submit button
    document.getElementById("interest-finished").disabled = !isOneOfEachTypeSelected;
}

function checkIfOneOfEachTypeSelected() {
    let colorSelected = false;
    let shapeSelected = false;
    let speedSelected = false;

    for (let trait in interestDict) {
        if (interestDict[trait]) {
            switch (getTraitType(trait)) {
                case "color":
                    colorSelected = true;
                    break;
                case "shape":
                    shapeSelected = true;
                    break;
                case "speed":
                    speedSelected = true;
                    break;
            }
        }
    }

    return colorSelected && shapeSelected && speedSelected;
}


/**
 * Click handler for interest buttons in the create-your-own algorithm section
 **/ 
function onSelectInterestButtonClicked(e){
    if (!selectInterestDict[e.target.innerHTML]){
        e.target.style.backgroundColor = "#1ad631";
        selectInterestDict[e.target.innerHTML] = true;
    }
    else{
        e.target.style.backgroundColor = "";
        selectInterestDict[e.target.innerHTML] = false;
    }
}

function loadContent(amount, idList){
    var contentIndex = 0;
    if (idList && idList.length < amount && feed_testing == 0) {
        console.warn("idList does not have enough elements for the required amount.");
        return;
    }
    console.log("this is the id list 2", idList)
    for (var i = 0; i < amount; i++){
        var isMessagePost = messageAtIndex(totalPosts + i);

        if(feed_testing == 1){
            contentIndex = 0;  
        }

        var id = isMessagePost ? "message-" + (totalPosts + i) : idList[contentIndex];
        var post = isMessagePost ? createMessagePost(scriptByIndex[totalPosts + i], totalPosts + i) : createContentPost(totalPosts + i, id);
        post.setAttribute('draggable', true);
        device.appendChild(post);
        var entry = {id: id, div: post, type: isMessagePost ? "message" : "content", confirmed: false, isFollowed: false, isLiked: false, isShared: false};
        // Make user able to scroll past algorithm cards
        if (isMessagePost && scriptByIndex[totalPosts + i].dataId == "algorithm-select-template"){
            entry.confirmed = true;
        }
        posts.push(entry);
        contentIndex += isMessagePost ? 0 : 1;
        // If we just made a message post, still make sure we create the specified amount of content posts
        amount += isMessagePost ? 1 : 0;

    }
    totalPosts += amount;
    postHeight = $("#post-0")[0].clientHeight;

}

function createContentPost(index, contentId){
    var post = document.createElement("div");
    post.id = "post-" + index;
    var gradient = document.createElement("div");
    gradient.classList = "black-gradient";
    post.appendChild(gradient);
    var name = recSys.getContentSketchName(contentId);
    var contentTemplate = new p5(eval(name), post);
    setupContentAttributes(contentTemplate, contentId);

    contentTemplate.id = "content-" + index;

    post.className = "post";
    //post.addEventListener("click", click);
    contentTemplate.setDraw(false);
    sketchDict[post.id] = contentTemplate;

    return post;
}


function setupContentAttributes(template, id){
    if (typeof test_attributes == 'undefined') {
        var traits = recSys.getContentTraits(id);
        template.userColor = traits[0];
        template.userShape = traits[1];
        template.userSpeed = traits[2];
    }
    else {
        template.userSpeed = test_attributes.userSpeed;
        template.userColor = test_attributes.userColor;
        template.userShape = test_attributes.userShape;
    }

    template.userSpeedF = 1.0;
    if (template.userSpeed == "slow")    template.userSpeedF = 0.5;
    if (template.userSpeed == "fast")    template.userSpeedF = 2;
}

function createMessagePost(message, index){
    var messagePost = document.createElement("div");
    messagePost.className = "post message-div";
    messagePost.id = "post-" + index; 
    var gradient = document.createElement("div");
    gradient.classList = "black-gradient";
    messagePost.appendChild(gradient);

    var messageBox = document.createElement("div");
    messageBox.className = "message-box";

    if (message.dataId != null){
        var messageData = document.createElement("div");
        messageData.className = "message-data";
        messageData.id = message.dataId + "-div";
        var content = document.getElementById(message.dataId).content.cloneNode(true);
        messageData.append(content);
        if (message.dataId == "weightings-template"){
            setWeightings(messageData, 0);
        }
        else if (message.dataId == "preferences-template"){
            setPreferences(messageData);
        }
        else if (message.dataId == "algorithm-select-template"){
            setAlgorithmsForSelection(messageData);
        }
        else if (message.dataId == "algorithm-create-template"){
            setAlgorithmCreate(messageData);
        }
        else if (message.dataId == "assumptions-template"){
            setAssumptions(messageData);
        }
        messageBox.appendChild(messageData);
    }

    if (message.title != null){
        var messageTitle = document.createElement("div");
        messageTitle.className = "message-title";
        messageTitle.innerHTML += message.title;
        messageBox.appendChild(messageTitle);
    }
    
    if (message.body != null){
        var messageBody = document.createElement("div");
        messageBody.className = "message-body";
        messageBody.innerHTML += message.body;
        messageBox.appendChild(messageBody);    
    }

    if (message.buttons != null){
        for (var i = 0; i < message.buttons.length; i++){
            var messageButton = document.createElement("button");
            messageButton.className = "message-button";
            messageButton.innerHTML += message.buttons[i];
            messageButton.id = message.buttons[i] + "-" + index;
            messageButton.onclick = onMessageButtonClicked;
            messageBox.appendChild(messageButton);
        }
    }

    messagePost.appendChild(messageBox);
    //messagePost.addEventListener("click", click);
    return messagePost;
}

function messageAtIndex(index){
    return scriptByIndex[index] != null;
}

// This prevents us from dragging a phantom version of the div
function dragStart(e){
    var img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    e.dataTransfer.setDragImage(img, 0, 0);
    e.dataTransfer.clearData();
    e.dataTransfer.setData('text/plain', '');
}

function drag(e) {
    e.preventDefault();
    if (e.target.classList.contains("message-button")){
        return;
    }
    move(e.pageY);
}

function touchMove(e){
    if (e.target.classList.contains("message-button")){
        return;
    }
    move(e.touches[0].screenY);
}

function wheelMove(e){
    if (scrollTimeout == null){
        simulatedWheelPos = window.innerHeight / 2;
    }
    else{
        clearTimeout(scrollTimeout);
    }
    simulatedWheelPos -= e.deltaY * 0.2;
    move(simulatedWheelPos);
    
    scrollTimeout = setTimeout(() => {
        moveEnd();
        scrollTimeout = null;
    }, 100);
}

function move(currentY){
    if (inIntro || barDragging){
        return;
    }

    // Detect if dragging has just started
    if (lastYPos == -1){
        lastYPos = currentY;
        startingYPos = currentY;
        $('.black-gradient').css({
            'opacity': '1',
        });
        return;
    }
    // Detect if we've reached top of page
    else if (currentY == 0){
        return;
    }
    else if (currentY - lastYPos < 0 && currentPost >= maxPosts){
        return;
    }
    else if (disable_scroll_up == 1 && currentY - lastYPos > 0){
        return;
    }

    var marginTop = parseInt($('#device-screen')[0].style.marginTop.slice(0, -2));

    if (isNaN(marginTop)){
        marginTop = 0;
    }

    // If waiting for message confirmation, prevent from dragging too much.
    if (!waitingForMessage() || (startingYPos - lastYPos) < (postHeight / 20)){
        marginTop += currentY - lastYPos;
        $('#device-screen')[0].style.marginTop =  marginTop + "px";
    }

    lastYPos = currentY;
}

function dragEnd(e) {
    e.preventDefault();
    if (e.target.classList.contains("message-button")){
        return;
    }
    moveEnd();
}

function touchEnd(e){
    if (e.target.classList.contains("message-button")){
        return;
    }
    moveEnd();
}

function moveEnd(){
    if (inIntro || disableMessages || animating){
        if (waitingForMessage()){
            snapToCurrentPost();
        }
        return;
    }

    var difference = startingYPos - lastYPos;
    var percentDragged = 100 * (difference / device.offsetHeight);

    lastYPos = -1;
    startingYPos = -1;

    if (percentDragged > percentToSwipe){
        tryNextPost();
    }
    else if (percentDragged < -percentToSwipe && currentPost != 0){
        tryLastPost();
    }
    snapToCurrentPost();
}

function click(e){
    if (animating || inIntro){
        return;
    }
    // Top forty percent of screen = scroll up
    if (e.clientY < postHeight * 0.4){
        tryLastPost();
    }
    // Bottom sixty percent of screen = scroll down
    else{
        tryNextPost();
    }
    snapToCurrentPost();
}

function tryNextPost(){
    if (currentPost + 1 < totalPosts && !waitingForMessage() && currentPost < maxPosts) {
        //update render here
        var deviceButtons = document.getElementById('device-buttons');
        currentPost++;
        console.log("this is the current posts", currentPost)
        var tooltipElements = document.getElementsByClassName('tooltip');
        var tooltip2Elements = document.getElementsByClassName('tooltiptext');

        if (currentPost == 1) {
            tooltipElements[0].style.opacity = 1;
            tooltip2Elements[0].style.opacity = 1;
            deviceButtons.classList.add('not-hidden');
        }
        else if (currentPost ==2) {
            deviceButtons.classList.remove('not-hidden');
            tooltipElements[0].style.opacity = 0;    
            tooltip2Elements[0].style.opacity = 0;
        }
        else{
            tooltipElements[0].style.opacity = 0;    
            tooltip2Elements[0].style.opacity = 0;
        }
        if (currentPost == 18) {
            nudge.style.display = "block";
            menuButton.classList.add('not-hidden');
        }
        else if (currentPost == 19) {
            menuButton.classList.remove('not-hidden');
            nudge.style.display = "none";    
        }
        // See if we need to load more posts
        if (currentPost + 1 >= totalPosts && totalPosts < maxPosts){
            var numPosts = Math.min(5, maxPosts - totalPosts);
            var nextContentIds = recSys.recommend(numPosts);
            console.log('Recommended IDs:', nextContentIds);
            loadContent(numPosts, nextContentIds);
        }

        recSys.onContentSeen(posts[currentPost].id);
    }
}


function tryLastPost(){
    if (currentPost != 0){
        currentPost--;
    }
    if (currentPost == 25){
        menuButton.style.display = "block";
    }
}

function waitingForMessage(){
    return posts[currentPost].type == "message" && !posts[currentPost].confirmed;
}

function snapToCurrentPost(){
    var marginTop = parseInt($('#device-screen')[0].style.marginTop.slice(0, -2));
    if (isNaN(marginTop)){
        marginTop = 0;
    }
    var targetMarginTop = currentPost * postHeight * -1;
    var diff = targetMarginTop - marginTop;
    animating = true;
    $('#device-screen').animate({
        marginTop: '+=' + diff + 'px'
    }, pageSwipeTime, "swing", () => { 
        animating = false;
        $('.black-gradient').css({
            'opacity': '0',
        });
    });

    if (posts[currentPost].type == "message"){
        setTimeout(() => {
            toggleDeviceButtons(false);
        }, 200);
    }
    else if (!deviceButtonsShowing){
        setTimeout(() => {
            toggleDeviceButtons(true);
        }, 500);
    }
    setContentDraw();
    setButtonInteractions();
    document.getElementById("debug-content").innerHTML = "ID: " + posts[currentPost].id;
    document.getElementById("debug-post-count").innerHTML = "Post " + currentPost;
    document.getElementById("debug-traits").innerHTML = recSys.getContentTraits(posts[currentPost].id);
}

function toggleDeviceButtons(show){
    if (show && !deviceButtonsShowing){
        deviceButtonsShowing = true;
        deviceButtons.style.opacity = 1;
        setTimeout(() => {
            deviceButtons.style.display = "flex";
        }, 100);
    }
    else if (!show && deviceButtonsShowing){
        deviceButtonsShowing = false;
        deviceButtons.style.opacity = 0;
        setTimeout(() => {
            deviceButtons.style.display = "none";
        }, 100);
    }
}

function setWeightings(div, algorithmIndex){
    var algoWeightings = recSys.ALGORITHMS[algorithmIndex][0];
    var likesBar = div.getElementsByClassName("likes-bar")[0];
    likesBar.style.width = (35 * algoWeightings[0]) + "%";

    var sharesBar = div.getElementsByClassName("shares-bar")[0];
    sharesBar.style.width = (35 * algoWeightings[1]) + "%";

    var followsBar = div.getElementsByClassName("follows-bar")[0];
    followsBar.style.width = (35 * algoWeightings[2]) + "%";
}

function setPreferences(div){
    var interests = recSys.getTopInterests();
    // console.log(interests)
    var total = interests[0][1] * 1.1;

    for (var i = 0; i < numPreferencesToShow; i++){
        var name = interests[i][0];
        // console.log("this is the one interest," name)
        name = name.charAt(0).toUpperCase() + name.slice(1); // capitalize first letter
        var percent = 100 * interests[i][1] / total;
        var barDiv = div.getElementsByClassName("pref-" + i)[0];
        barDiv.getElementsByClassName("param-" + i)[0].innerHTML = name;
        barDiv.getElementsByClassName("bar-fill")[0].style.width = percent + "%";
    }
}

function setAlgorithmsForSelection(div){
    // populate the algorithms div with the rest of the algorithms 
    var algCard = div.querySelector(".alg-card");
    for (var i = 1; i < recSys.ALGORITHMS.length; i++){
        div.appendChild(algCard.cloneNode(true));
    }
    // now go in and set all data for the algorithms 
    var algCards = div.getElementsByClassName("alg-card");
    for (var i = 0; i < algCards.length; i++){
        algCards[i].id = "alg-" + i;
        algCards[i].addEventListener("click", onAlgorithmCardClicked);
        algCards[i].getElementsByClassName("alg-title")[0].innerHTML = "Algorithm " + i;
        var buttonContainer = algCards[i].getElementsByClassName("alg-interest-list")[0];
        if (recSys.ALGORITHMS[i][1].length == 0){
            algCards[i].getElementsByClassName("alg-subtitle")[0].style.innerHTML = "No Key Preferences";
        }
        for (var j = 0; j < recSys.ALGORITHMS[i][1].length; j++){
            var interestButton = document.createElement("button");
            interestButton.className = "interest-selection2";
            interestButton.innerHTML = recSys.ALGORITHMS[i][1][j];
            buttonContainer.appendChild(interestButton);
        }
        var weightingsMenu = document.getElementById("weightings-template").content.cloneNode(true);
        var weightingsContainer = algCards[i].getElementsByClassName("alg-weightings")[0];
        weightingsContainer.classList.add("alg-select-weightings");
        weightingsContainer.appendChild(weightingsMenu);
        weightingsContainer.getElementsByClassName("top-info-row")[0].style.display = "none";
        setWeightings(weightingsContainer, i);
    }
}

function setAlgorithmCreate(div){
    var weightingsDiv = div.getElementsByClassName("create-weightings")[0];

    var weightingsMenu = document.getElementById("weightings-template").content.cloneNode(true);

    weightingsDiv.append(weightingsMenu);

    div.getElementsByClassName("weightings")[0].style.display = "none";
    var bars = div.getElementsByClassName("bar");

    for (var i = 0; i < bars.length; i++){

        bars[i].id = "bar-" + i;
        bars[i].setAttribute('draggable', true);
        bars[i].addEventListener("click", onWeightingsBarClicked);
        bars[i].addEventListener("dragover", onWeightingsBarDrag);
        bars[i].addEventListener("dragend", onWeightingsBarDragEnd);
        // mobile touch controls
        bars[i].addEventListener("touchmove", onWeightingsBarTouchMove);
        bars[i].addEventListener("touchend", onWeightingsBarTouchEnd);
    }

    var algoWeightings = recSys.ALGORITHMS[0][0];

    var likesBar = div.getElementsByClassName("likes-bar")[0];
    likesBar.style.width = (35 * algoWeightings[0]) + "%";

    var sharesBar = div.getElementsByClassName("shares-bar")[0];
    sharesBar.style.width = (35 * algoWeightings[1]) + "%";

    var followsBar = div.getElementsByClassName("follows-bar")[0];
    followsBar.style.width = (35 * algoWeightings[2]) + "%"

    // var buttonContainer = div.getElementsByClassName("select-priorities")[0];

    // var traits = recSys.getAllTraits();
    // for (var traitName in traits){
    //     for (var i = 0; i < traits[traitName].length; i++){
    //         var trait = traits[traitName][i];
    //         var interestButton = document.createElement("button");
    //         interestButton.className = "interest-selection create trait-" + traitName;
    //         interestButton.innerHTML = trait;
    //         interestButton.onclick = onSelectInterestButtonClicked;
    //         buttonContainer.appendChild(interestButton);
    //         selectInterestDict[trait] = false;
    //     }
    // }
}

function onWeightingsBarClicked(e){
    var bar = e.target.closest(".bar");
    var barFill = bar.getElementsByClassName("bar-fill")[0];
    barFill.style.width = (100 * e.offsetX / bar.offsetWidth) + "%";
}

function onWeightingsBarDrag(e){
    moveWeightingsBar(e.offsetX, e.target.closest(".bar"));
}

function onWeightingsBarDragEnd(e){
    e.preventDefault();
    barDragging = false;
}

function onWeightingsBarTouchMove(e){
    var rect = e.target.getBoundingClientRect();
    var x = e.touches[0].pageX - rect.left;
    moveWeightingsBar(x, e.target.closest(".bar"));
}

function onWeightingsBarTouchEnd(e){
    barDragging = false;
}

function moveWeightingsBar(x, bar){
    if (!barDragging){
        barDragging = true;
    }
    var barFill = bar.getElementsByClassName("bar-fill")[0];
    barFill.style.width = (100 * x / bar.offsetWidth) + "%";
}

function setMyAlgorithm(div){
    var createCard = $("#algorithm-create-card")[0];
    var myAlgCard = createCard.cloneNode(true);
    myAlgCard.id = "my-alg-card";
    var createCardBars = createCard.getElementsByClassName("bar");
    var myAlgBars = myAlgCard.getElementsByClassName("bar");

    for (var i = 0; i < createCardBars.length; i++){
        myAlgBars[i].getElementsByClassName("bar-fill")[0].style.width = createCardBars[i].getElementsByClassName("bar-fill")[0].style.width; 
    }

    myAlgCard.getElementsByClassName("message-subtitle")[0].style.display = "none";

    var buttons = myAlgCard.getElementsByClassName("interest-selection");
    for (var i = 0; i < buttons.length; i++){
        if (selectInterestDict[buttons[i].innerHTML]){
            buttons[i].style.backgroundColor = "#1ad631";
        }
        else{
            buttons[i].style.display = "none";
        }
    }

    myAlgCard.getElementsByClassName("message-title")[0].innerHTML = "My Algorithm";
    div.getElementsByClassName("my-alg")[0].appendChild(myAlgCard);    
}

function setAssumptions(div){
    var topColor = recSys.getTopTrait("colors");
    console.log("this is the top color,", topColor);
    var topShape = recSys.getTopTrait("shapes");
    var topSpeed = recSys.getTopTrait("speeds");
    div.getElementsByClassName("assumption-color")[0].innerHTML = topColor;
    // div.getElementsByClassName("assumption-shape")[0].innerHTML = topShape;
    // div.getElementsByClassName("assumption-speed")[0].innerHTML = topSpeed;
    div.getElementsByClassName("assumption-color-analysis")[0].innerHTML = recSys.getAssumption(topColor);
    // div.getElementsByClassName("assumption-shape-analysis")[0].innerHTML = recSys.getAssumption(topShape);
    // div.getElementsByClassName("assumption-speed-analysis")[0].innerHTML = recSys.getAssumption(topSpeed);
}

function onMessageButtonClicked(e){
    if (disableMessages){
        return;
    }

    disableMessages = true;

    //Extract index from id
    var index = parseInt(e.target.id.split("-").slice(-1));
    var message = scriptByIndex[index];
    if (message == null){
        console.log("ERROR: Cannot find message at index " + index);
        return;
    }

    var button;
    var trigger;
    for (var i = 0; i < message.buttons.length; i++){
        if (message.buttons[i] == e.target.innerHTML){
            button = message.buttons[i];
            trigger = message.buttonTriggers[i];
            break;
        }
    }
    if (button === "Explore") {
        menuButton.style.display = "none";
    }

    if (!posts[currentPost].confirmed){
        // Adds a new post if needed
        processTrigger(trigger);
    }
    
    posts[currentPost].confirmed = true; 
    tryNextPost();
    snapToCurrentPost();
    setTimeout(() => { disableMessages = false; }, pageSwipeTime);

    //lighten screen
    document.getElementById("info").style.backgroundColor = "";

}

function processTrigger(trigger){
    if (scriptByTrigger.hasOwnProperty(trigger)){
        var post = createMessagePost(scriptByTrigger[trigger], totalPosts);
        // Insert generated message post right after other message post
        posts[currentPost].div.insertAdjacentElement("afterend", post);
        post.setAttribute('draggable', true);
        var id = "message-" + totalPosts;
        var entry = {id: id, div: post, type: "message", confirmed: false};
        posts.splice(currentPost + 1, 0, entry);
        scriptByIndex[totalPosts] = scriptByTrigger[trigger];
        totalPosts++;
    }
    else if (trigger == "continue"){
        // if (index === "25") {
        //     document.getElementById("info").style.display = "none";
        // }
        return;
    }
    else if (trigger == "unlock-menu"){
        menuButton.style.display = "block";
    }
    else if (trigger == "create-my-algorithm"){
        setMyAlgorithm($("#algorithm-image-template-div")[0]);
    }
    else if (trigger == "save-algorithm"){
        html2canvas($("#my-alg-card")[0]).then(function(canvas) {
            canvas.classList = "alg-image";
            var canvasUrl = canvas.toDataURL();
            var createEl = document.createElement('a');
            createEl.href = canvasUrl;
            createEl.download = "my_algorithm";
            createEl.click();
            createEl.remove();
        });
    }
    else if (trigger === "hide-menu"){
        menuButton.style.display = "none";

    }
}

function onDeviceButtonClicked(e){
    if (posts[currentPost].type == "message"){
        return;
    }
    if (e.target.id == "follow"){
        if (!posts[currentPost].isFollowed){
            buttonCounts.follows++;
            $('#follow').css({
                '-webkit-filter': deviceIconFilterOn,
                'filter': deviceIconFilterOn
            });
            recSys.onContentEngagement(posts[currentPost].id, "follow");
        }
        else{
            buttonCounts.follows--;
            $('#follow').css({
                '-webkit-filter': deviceIconFilterOff,
                'filter': deviceIconFilterOff
            });
            recSys.onContentDisengagement(posts[currentPost].id, "follow");
        }
        document.getElementById("debug-follows").innerHTML =  buttonCounts.follows;
        posts[currentPost].isFollowed = !posts[currentPost].isFollowed;
    }
    else if (e.target.id == "like"){
        if (!posts[currentPost].isLiked){
            buttonCounts.likes++;
            $('#like').css({
                '-webkit-filter': deviceIconFilterOn,
                'filter': deviceIconFilterOn
            });
            recSys.onContentEngagement(posts[currentPost].id, "like");
        }
        else{
            buttonCounts.likes--;
            $('#like').css({
                '-webkit-filter': deviceIconFilterOff,
                'filter': deviceIconFilterOff
            });
            recSys.onContentDisengagement(posts[currentPost].id, "like");
        }
        document.getElementById("debug-likes").innerHTML =  buttonCounts.likes;
        posts[currentPost].isLiked = !posts[currentPost].isLiked;
    }
    else if (e.target.id == "share"){
        if (!posts[currentPost].isShared){
            buttonCounts.shares++;
            $('#share').css({
                '-webkit-filter': deviceIconFilterOn,
                'filter': deviceIconFilterOn
            });
            recSys.onContentEngagement(posts[currentPost].id, "share");
        }
        else{
            buttonCounts.shares--;
            $('#share').css({
                '-webkit-filter': deviceIconFilterOff,
                'filter': deviceIconFilterOff
            });
            recSys.onContentDisengagement(posts[currentPost].id, "share");
        }
        document.getElementById("debug-shares").innerHTML =  buttonCounts.shares;
        posts[currentPost].isShared = !posts[currentPost].isShared
    }

    if (menuShowing){
        setPreferences(menu);
    }

    e.target.classList.remove('button-clicked')
    void e.target.offsetWidth; // trigger reflow
    e.target.classList.add('button-clicked');
}

function setButtonInteractions(){
    if (!posts[currentPost].isFollowed){
        $('#follow').css({
            '-webkit-filter': deviceIconFilterOff,
            'filter': deviceIconFilterOff
        });
    }
    else{
        $('#follow').css({
            '-webkit-filter': deviceIconFilterOn,
            'filter': deviceIconFilterOn
        });
    }
    
    if (!posts[currentPost].isLiked){
        $('#like').css({
            '-webkit-filter': deviceIconFilterOff,
            'filter': deviceIconFilterOff
        });
    }
    else{
        $('#like').css({
            '-webkit-filter': deviceIconFilterOn,
            'filter': deviceIconFilterOn
        });
    }

    if (!posts[currentPost].isShared){
        $('#share').css({
            '-webkit-filter': deviceIconFilterOff,
            'filter': deviceIconFilterOff
        });
    }
    else{
        $('#share').css({
            '-webkit-filter': deviceIconFilterOn,
            'filter': deviceIconFilterOn
        });
    }
}

function onAlgorithmCardClicked(e){
    if (disableMessages){
        return;
    }
    disableMessages = true;
    //Extract index from id
    var id = e.target.closest(".alg-card").id;
    var index = parseInt(e.target.id.split("-").slice(-1));
    posts[currentPost].confirmed = true;
    tryNextPost();
    snapToCurrentPost();
    setTimeout(() => { disableMessages = false; }, pageSwipeTime);
}

function toggleDebug(){
    debugMenu.style.display = debug ? "none" : "block";
    debug = !debug;
}

function resize(){
    if ( $("#post-0")[0] != null){
        postHeight = $("#post-0")[0].clientHeight;
        $('#device-screen')[0].style.marginTop = -postHeight * currentPost + "px";
    }
    for (var id in sketchDict){
        sketchDict[id].resizeCanvas($('#device-screen')[0].offsetWidth, $('#device-screen')[0].offsetHeight);
    }

    if (!menuShowing){
        menu.style.top = info.offsetHeight + "px";
    }

    if (!isMobile && $(window).width() < 767){
        isMobile = true;
    }
    else if (isMobile && $(window).width() >= 767){
        isMobile = false;
    }
}

function toggleInfoMenu(show){
    if (!show){
        menu.style.top = info.offsetHeight + "px";
        menuButton.style.opacity = 1;
        nudge.style.display = "none";
        menuShowing = false;
    }
    else{
        setPreferences(menu);
        menu.style.top = 0;
        menuButton.style.opacity = 0;
        menuShowing = true;
    }
}
document.getElementById('click-detector').addEventListener('click', function() {
    var button = document.getElementById('interest-finished');
    if (button.disabled) {
        document.getElementById('error-message').style.display = 'block';
    }
});

document.addEventListener('DOMContentLoaded', function () {
    var image1 = document.getElementById('follow');
    var image2 = document.getElementById('like');
    var image3 = document.getElementById('share');
    var tooltip = document.getElementsByClassName('tooltip')[0];
    var tooltiptext = document.getElementsByClassName('tooltiptext')[0];
    var deviceButtons = document.getElementById('device-buttons');
    nudge = document.getElementsByClassName('nudge')[0];

    image1.addEventListener('click', function () {
        deviceButtons.classList.remove('not-hidden');
        tooltip.style.opacity = 0;    
    tooltip.style.opacity = 0;    
        tooltip.style.opacity = 0;    
        tooltiptext.style.opacity = 0;

    });

    image2.addEventListener('click', function () {
        deviceButtons.classList.remove('not-hidden');
        tooltip.style.opacity = 0;    
    tooltip.style.opacity = 0;    
        tooltip.style.opacity = 0;    
        tooltiptext.style.opacity = 0;

    });
    image3.addEventListener('click', function () {
        deviceButtons.classList.remove('not-hidden');
        tooltip.style.opacity = 0;    
    tooltip.style.opacity = 0;    
        tooltip.style.opacity = 0;    
        tooltiptext.style.opacity = 0;
    });

    initialize();
});