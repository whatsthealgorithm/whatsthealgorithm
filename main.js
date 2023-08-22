var postHeight;
var device;
var menu;
var menuButton;
var debugMenu;
var introPages;
var deviceButtons;

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

const initialPostLoad = 10;
const pageSwipeTime = 400;
const numPreferencesToShow = 4;
const maxPosts = 28;

var introIndex = 0;
var lastYPos = -1;
var startingYPos = -1;
var percentToSwipe = 15;
var currentPost = 0;
var totalPosts = 0;

var interestsPicked = 0;

import * as recSys from "recSys";
import * as canvas from "html2canvas";

// FOR TESTING

// default 0. set to 1 to skip intro screens

const feed_testing = 1;

// To test for content with specific attributes, set these. Otherwise, comment it out.

// let test_attributes = {
//     'userSize': 'large',
//     'userColor': 'red',
//     'userShape': 'triangle'
// }


// On Page Load
$(document).ready(function() { 
    initialize();
});

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
    menu.style.top = info.offsetHeight + "px";
    exit.style.display = "block";
    toggleInfoMenu(false);

    await recSys.setup();

    if(feed_testing === 1) {
        recSys.createNewUser(interestDict);
        setPreferences(menu);
        toggleInfoMenu(false);
        var contentIdList = recSys.initializeFeed();
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
    });
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
            interestButton.className = "interest-selection";
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

/**
 * Click handler for interest buttons in the intro sequece 
 **/ 
function onIntroInterestButtonClicked(e){
    if (!interestDict[e.target.innerHTML]){
        e.target.style.backgroundColor = "#1ad631";
        interestDict[e.target.innerHTML] = true;
        interestsPicked++;
    }
    else{
        e.target.style.backgroundColor = "antiquewhite";
        interestDict[e.target.innerHTML] = false;
        interestsPicked--;
    }

    if (interestsPicked >= 3){
        $("#interest-finished")[0].disabled = false;
    }
    else{
        $("#interest-finished")[0].disabled = true;
    }
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
        e.target.style.backgroundColor = "antiquewhite";
        selectInterestDict[e.target.innerHTML] = false;
    }
}

function loadContent(amount, idList){
    var contentIndex = 0;
    for (var i = 0; i < amount; i++){
        var isMessagePost = messageAtIndex(totalPosts + i);
        var id = isMessagePost ? "message-" + (totalPosts + i) : idList[contentIndex];
        var post = isMessagePost ? createMessagePost(scriptByIndex[totalPosts + i], totalPosts + i) : createContentPost(totalPosts + i, id);
        post.setAttribute('draggable', true);
        device.appendChild(post);
        var entry = {id: id, div: post, type: isMessagePost ? "message" : "content", confirmed: false};
        posts.push(entry);
        contentIndex += isMessagePost ? 0 : 1;
        // If we just made a message post, still make sure we create the specified amount of content posts
        amount += isMessagePost ? 1 : 0;
    }
    console.log("Adding " + amount + " to total posts")
    totalPosts += amount;
    postHeight = $("#post-0")[0].clientHeight;
}


function createContentPost(index, contentId){
    var post = document.createElement("div");
    post.id = "post-" + index; 
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
    e.dataTransfer.setData('text/plain', 'anything');
}

function drag(e) {
    e.preventDefault();
    move(e.pageY);
}

function touchMove(e){
    move(e.touches[0].screenY);
}

function move(currentY){
    if (inIntro || barDragging){
        return;
    }

    // Detect if dragging has just started
    if (lastYPos == -1){
        lastYPos = currentY;
        startingYPos = currentY;
        return;
    }
    // Detect if we've reached top of page
    else if (currentY == 0){
        return;
    }
    else if (currentY - lastYPos < 0 && currentPost >= maxPosts){
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
    moveEnd();
}

function touchEnd(e){
    moveEnd();
}

function moveEnd(){
    if (inIntro){
        return;
    }

    var difference = startingYPos - lastYPos;
    var percentDragged = 100 * (difference / screen.height);

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
    console.log("Current post is " + currentPost + " and total posts are " + totalPosts);
    if (currentPost + 1 < totalPosts && !waitingForMessage() && currentPost < maxPosts) {
        //update render here
        currentPost++;

        // See if we need to load more posts
        if (currentPost + 1 >= totalPosts && totalPosts < maxPosts){
            var numPosts = Math.min(5, maxPosts - totalPosts);
            var nextContentIds = recSys.recommend(numPosts);
            loadContent(numPosts, nextContentIds);
        }

        //UNCOMMENT when we have enough content to not run out
        //recSys.onContentSeen(posts[currentPost].id);
    }
}


function tryLastPost(){
    if (currentPost != 0){
        currentPost--;
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
    }, pageSwipeTime, "swing", () => { animating = false});

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
    var total = interests[0][1] * 1.1;

    for (var i = 0; i < numPreferencesToShow; i++){
        var name = interests[i][0];
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
            interestButton.className = "interest-selection";
            interestButton.innerHTML = recSys.ALGORITHMS[i][1][j];
            buttonContainer.appendChild(interestButton);
        }
        var weightingsMenu = document.getElementById("weightings-template").content.cloneNode(true);
        var weightingsContainer = algCards[i].getElementsByClassName("alg-weightings")[0];
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

    var buttonContainer = div.getElementsByClassName("select-priorities")[0];

    var traits = recSys.getAllTraits();
    for (var traitName in traits){
        for (var i = 0; i < traits[traitName].length; i++){
            var trait = traits[traitName][i];
            var interestButton = document.createElement("button");
            interestButton.className = "interest-selection";
            interestButton.innerHTML = trait;
            interestButton.onclick = onSelectInterestButtonClicked;
            buttonContainer.appendChild(interestButton);
            selectInterestDict[trait] = false;
        }
    }
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
    console.log(buttons);
    console.log(selectInterestDict)
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
    var topShape = recSys.getTopTrait("shapes");
    var topSpeed = recSys.getTopTrait("speeds");
    div.getElementsByClassName("assumption-color")[0].innerHTML = topColor;
    div.getElementsByClassName("assumption-shape")[0].innerHTML = topShape;
    div.getElementsByClassName("assumption-speed")[0].innerHTML = topSpeed;
    div.getElementsByClassName("assumption-color-analysis")[0].innerHTML = recSys.getAssumption(topColor);
    div.getElementsByClassName("assumption-shape-analysis")[0].innerHTML = recSys.getAssumption(topShape);
    div.getElementsByClassName("assumption-speed-analysis")[0].innerHTML = recSys.getAssumption(topSpeed);
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
        console.log(scriptByTrigger[trigger]);
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
}

function onDeviceButtonClicked(e){
    if (posts[currentPost].type == "message"){
        return;
    }
    if (e.target.id == "follow"){
        buttonCounts.follows++;
        document.getElementById("debug-follows").innerHTML =  buttonCounts.follows;
        recSys.onContentEngagement(posts[currentPost].id, "follow");
    }
    else if (e.target.id == "like"){
        buttonCounts.likes++;
        document.getElementById("debug-likes").innerHTML = buttonCounts.likes;
        recSys.onContentEngagement(posts[currentPost].id, "like");
    }
    else if (e.target.id == "share"){
        buttonCounts.shares++;
        document.getElementById("debug-shares").innerHTML = buttonCounts.shares;
        recSys.onContentEngagement(posts[currentPost].id, "share");
    }

    if (menuShowing){
        setPreferences(menu);
    }

    e.target.classList.remove('button-clicked')
    void e.target.offsetWidth; // trigger reflow
    e.target.classList.add('button-clicked');
}

function onAlgorithmCardClicked(e){
    //Extract index from id
    var id = e.target.closest(".alg-card").id;
    var index = parseInt(e.target.id.split("-").slice(-1));
    posts[currentPost].confirmed = true;
    tryNextPost();
    snapToCurrentPost();
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

    if (!isMobile && $(window).width() < 767){
        isMobile = true;
    }
    else if (isMobile && $(window).width() >= 767){
        isMobile = false;
    }
}

// MOBILE SPECIFIC

function toggleInfoMenu(show){
    if (!show){
        menu.style.top = info.offsetHeight + "px";
        menuButton.style.opacity = 1;
        menuShowing = true;
    }
    else{
        setPreferences(menu);
        menu.style.top = 0;
        menuButton.style.opacity = 0;
    }
}

//