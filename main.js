var postHeight;
var device;
var menu;
var menuButton;
var debugMenu;
var introPages;

var posts = [];
var buttonCounts = {follows: 0, likes: 0, shares: 0};
var introSequence = [];
var interestDict = {};
var scriptByIndex = {};
var scriptByTrigger = {};

var animating = false;
var disableMessages = false;
var isMobile = false;
var debug = false;
var inIntro = false;
var menuShowing = false;

const initialPostLoad = 2;  //10;       //ANDY EDIT FOR TESTING
const pageSwipeTime = 400;
const numPreferencesToShow = 4;

var lastYPos = -1;
var startingYPos = -1;
var percentToSwipe = 15;
var currentPost = 0;
var totalPosts = 0;
var introIndex = 0;
var interestsPicked = 0;

import * as recSys from "recSys";

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

    document.addEventListener("dragstart", dragStart);
    document.addEventListener("dragend", dragEnd);
    document.addEventListener("dragover", drag);

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
    if (isMobile){
        // move info menu into device div
        document.getElementById("device").insertBefore(info, device);

        menuButton.addEventListener("click", () => { toggleInfoMenu(true)} );
        exit.addEventListener("click", () => { toggleInfoMenu(false) });
        menu.style.top = info.offsetHeight + "px";
        exit.style.display = "block";
        toggleInfoMenu(false);
    };

    await recSys.setup();
    startIntro();

    //andy edits for testing
    introIndex = 1;
    onIntroButtonClicked();
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

    var traits = recSys.getTraits();
    for (var traitName in traits){
        for (var i = 0; i < traits[traitName].length; i++){
            var trait = traits[traitName][i];
            var interestButton = document.createElement("button");
            interestButton.className = "interest-selection";
            interestButton.innerHTML = trait;
            interestButton.onclick = onInterestButtonClicked;
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
        console.log("create content")
        recSys.createNewUser(interestDict);
        setPreferences(menu);
        if (isMobile){
            toggleInfoMenu(false);
        }
        var contentIdList = recSys.initializeFeed();
        document.getElementById("total-matching").innerHTML = recSys.getInitialMatchingAmount();
        loadContent(initialPostLoad, contentIdList);

        //setTimeout(onIntroButtonClicked, 4000);
        setTimeout(onIntroButtonClicked, 40);   //ANDY EDIT FOR TESTING
    }

    if (introIndex >= introPages.length){
        setTimeout(() => {
            document.getElementById("debug-content").innerHTML = "ID: " + posts[0].id;
            document.getElementById("intro").style.display = "none";
            inIntro = false;
        }, 100);
    };
}

function onInterestButtonClicked(e){
    console.log("interest clicked");
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
    totalPosts += amount;
    postHeight = $("#post-0")[0].clientHeight;
}

function createContentPost(index, contentId){
    var post = document.createElement("div");
    post.id = "post-" + index; 
    //var contentTemplate = new p5(testTemplate, post);
    var contentTemplate = new p5(andyTemplate, post);

    setupContentAttributes(contentTemplate, contentId);

    contentTemplate.id = "content-" + index;
    post.className = "post";
    post.addEventListener("click", click);
    return post;
}

function setupContentAttributes(template, id){
    template.userSize = recSys.getTopTrait("sizes", id);
    template.userColor = recSys.getTopTrait("colors", id);
    template.userShape = recSys.getTopTrait("shapes", id);
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
        var content = document.getElementById(message.dataId).content.cloneNode(true);
        messageData.append(content);
        if (message.dataId == "weightings-template"){
            setWeightings(messageData, 0);
        }
        else if (message.dataId == "preferences-template"){
            setPreferences(messageData);
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
   

    for (var i = 0; i < message.buttons.length; i++){
        var messageButton = document.createElement("button");
        messageButton.className = "message-button";
        messageButton.innerHTML += message.buttons[i];
        messageButton.id = message.buttons[i] + "-" + index;
        messageButton.onclick = onMessageButtonClicked;
        messageBox.appendChild(messageButton);
    }

    messagePost.appendChild(messageBox);
    messagePost.addEventListener("click", click);
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
    if (inIntro){
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
    if (e.offsetY < postHeight * 0.4){
        tryLastPost();
    }
    // Bottom sixty percent of screen = scroll down
    else{
        tryNextPost();
    }
    snapToCurrentPost();
}

function tryNextPost(){
    if (currentPost + 1 < totalPosts && !waitingForMessage()) {
        currentPost++;

        // See if we need to load more posts
        if (currentPost + 1 >= totalPosts){
            var nextContentIds = recSys.recommend(5);
            loadContent(5, nextContentIds);
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

    if (waitingForMessage()){
        setTimeout(() => {
            $('#device-buttons')[0].style.opacity = 0;
        }, 200);
    }
    else if ($('#device-buttons')[0].style.opacity == 0){
        setTimeout(() => {
            $('#device-buttons')[0].style.opacity = 1;
        }, 500);
    }
    document.getElementById("debug-content").innerHTML = "ID: " + posts[currentPost].id;
}

function setWeightings(div, algorithmIndex){
    var algo = recSys.ALGORITHMS[algorithmIndex];
    var likesBar = div.getElementsByClassName("likes-bar")[0];
    likesBar.style.width = (35 * algo[0]) + "%";

    var sharesBar = div.getElementsByClassName("shares-bar")[0];
    sharesBar.style.width = (35 * algo[1]) + "%";

    var followsBar = div.getElementsByClassName("follows-bar")[0];
    followsBar.style.width = (35 * algo[2]) + "%";
}

function createBar(label, percent, className){
     var barDiv = document.createElement("div");
    barDiv.append(document.getElementById("bar-template").content.cloneNode(true));
    barDiv.getElementsByClassName("param-name")[0].innerHTML = label;
    var bar = barDiv.getElementsByClassName("bar-fill")[0];
    bar.style.width = percent + "%";
    barDiv.className = className;
    return barDiv;
};

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
            trigger = message.triggers[i];
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
        if (isMobile){
            menuButton.style.display = "block";
        }
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

    if (!isMobile || menuShowing){
        setPreferences(menu);
    }

    e.target.classList.remove('button-clicked')
    void e.target.offsetWidth; // trigger reflow
    e.target.classList.add('button-clicked');
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
        var info = document.getElementById("info-column");
        document.getElementById("device").insertBefore(info, device);
        isMobile = true;
    }
    else if (isMobile && $(window).width() >= 767){
        var info = document.getElementById("info-column");
        var deviceCol = document.getElementById("device-column");
        document.getElementById("content").insertBefore(info, deviceCol);
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