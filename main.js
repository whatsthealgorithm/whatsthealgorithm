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

var waitingToProceed = false;
var animating = false;
var isMobile = false;
var menuShowing = false;
var debug = false;
var inIntro = false;

const initialPostLoad = 5;
var mobileCutoff = 767;
var lastYPos = -1;
var startingYPos = -1;
var percentToSwipe = 15;
var currentPost = 0;
var totalPosts = 0;
var introIndex = 0;
var interestsPicked = 0;

var heartSize = 1;

var mockMessage = {title: "Test Message", body: "We are interrupting your scrolling to tell you..." };
var interests = ["Interest 1", "Interest 2", "Interest 3", "Interest 4", "Interest 5", "Interest 6", "Interest 7"];

// On Page Load
$(document).ready(function() { 
    device = document.getElementById("device-screen");
    menu = document.getElementById("info");
    menuButton = document.getElementById("info-icon");
    debugMenu = document.getElementById("debug");

    loadContent(initialPostLoad);

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

    isMobile = $(window).width() < 767;
    if (isMobile){
        // move info menu into device div
        var info = document.getElementById("info-column");
        document.getElementById("device").insertBefore(info, device);

        menuButton.addEventListener("click", toggleInfoMenu);
        document.getElementById("info-exit-button").addEventListener("click", toggleInfoMenu);
        menu.style.top = info.offsetHeight + "px";
    };

    //startIntro();
});

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
    for (var i = 0; i < interests.length; i++){
        var interestButton = document.createElement("button");
        interestButton.className = "interest-selection";
        interestButton.innerHTML = interests[i];
        interestButton.onclick = onInterestButtonClicked;
        buttonContainer.appendChild(interestButton);
        interestDict[interests[i]] = false;
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
        setTimeout(onIntroButtonClicked, 4000);
    }

    if (introIndex >= introPages.length){
        setTimeout(() => {
            document.getElementById("intro").style.display = "none";
            inIntro = false;
        }, 100);
    };
}

function onInterestButtonClicked(e){
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

function loadContent(amount){
    for (var i = totalPosts; i < totalPosts + amount; i++){
        var post = insertMessage(i) ? createMessagePost(mockMessage, i) : createContentPost(i);
        post.setAttribute('draggable', true);
        device.appendChild(post);
        var entry = {div: post, type: insertMessage(i) ? "message" : "content", confirmed: false};
        posts.push(entry);
    }
    totalPosts += amount;
    postHeight = $("#post-0")[0].clientHeight;
}

function createContentPost(index){
    var post = document.createElement("div");
    post.id = "post-" + index; 
    var content = new p5(heartContent, post);
    content.heartSize = heartSize;
    content.id = "content-" + index;
    post.style.backgroundColor = generateRandomColor();
    post.className = "post";
    post.addEventListener("click", click);
    return post;
}

function createMessagePost(message, index){
    var messagePost = document.createElement("div");
    messagePost.className = "post message-div";
    messagePost.id = "post-" + index; 

    var messageBox = document.createElement("div");
    messageBox.className = "message-box";

    var messageTitle = document.createElement("div");
    messageTitle.className = "message-title";
    messageTitle.innerHTML += message.title;

    var messageBody = document.createElement("div");
    messageBody.className = "message-body";
    messageBody.innerHTML += message.body;

    var messageButton = document.createElement("button");
    messageButton.className = "message-button";
    messageButton.innerHTML += "Okay";
    messageButton.id = "message-button-" + index;
    messageButton.onclick = onMessageButtonClicked;

    messageBox.appendChild(messageTitle);
    messageBox.appendChild(messageBody);
    messageBox.appendChild(messageButton);

    messagePost.appendChild(messageBox);
    messagePost.addEventListener("click", click);
    return messagePost;
}

function insertMessage(index){
    // Just arbitrary for now
    return index == 3;
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
    if (!waitingForMessage() || Math.abs(startingYPos - lastYPos) < (postHeight / 10)){
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
        setInfoWindow();

        // See if we need to load more posts
        if (currentPost + 1 >= totalPosts){
            adjustContent();
            loadContent(3);
        }
    }
}

function adjustContent(){
    heartSize = 1 + buttonCounts.likes * 0.1;
}

function tryLastPost(){
    if (currentPost != 0 && !waitingForMessage()){
        currentPost--;
        setInfoWindow();
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
    }, 400, "swing", () => {animating = false});

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
}

function setInfoWindow(){
    //right now change bars randomly
    var bars = document.getElementsByClassName("bar-fill");
    for (var i = 0; i < bars.length; i++){
        bars[i].style.width = Math.random() * 100 + "%";
    }

    //if we land on an unconfirmed message, grey out info window
    if (waitingForMessage() && !isMobile){
        document.getElementById("info").style.backgroundColor = "rgb(0, 0, 0, 0.2)";
    }
}

function onMessageButtonClicked(){
    posts[currentPost].confirmed = true; 
    tryNextPost();
    snapToCurrentPost();

    //lighten screen
    document.getElementById("info").style.backgroundColor = "";
}

function onDeviceButtonClicked(e){
    if (e.target.id == "follow"){
        buttonCounts.follows++;
        document.getElementById("debug-follows").innerHTML =  buttonCounts.follows;
    }
    else if (e.target.id == "like"){
        buttonCounts.likes++;
        document.getElementById("debug-likes").innerHTML = buttonCounts.likes;
    }
    else if (e.target.id == "share"){
        buttonCounts.shares++;
        document.getElementById("debug-shares").innerHTML = buttonCounts.shares;
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

function generateRandomColor(){
    return "#" + Math.floor(Math.random()*16777215).toString(16);
}

// MOBILE SPECIFIC

function toggleInfoMenu(){
    if (menuShowing){
        menu.style.top = info.offsetHeight + "px";
        menuButton.style.opacity = 1;
    }
    else{
        menu.style.top = 0;
        menuButton.style.opacity = 0;
    }
    menuShowing = !menuShowing;
}

//