var lastYPos = -1;
var startingYPos = -1;
var percentToSwipe = 15;
var postHeight;
var posts = [];
var currentPost = 0;
var device;
var menu;
var menuButton;
var waitingToProceed = false;
var animating = false;

const initialPostLoad = 10;
var mobileCutoff = 767;
var isMobile;
var menuShowing;

var mockMessage = {title: "Test Message", body: "We are interrupting your scrolling to tell you..." };

// On Page Load
$(document).ready(function() { 
    device = document.getElementById("device-screen");
    menu = document.getElementById("info");
    menuButton = document.getElementById("info-icon");
    loadContent();

    document.addEventListener("dragstart", dragStart);
    document.addEventListener("dragend", dragEnd);
    document.addEventListener("dragover", drag);

    document.addEventListener("touchmove", touchMove);
    document.addEventListener("touchend", touchEnd);

    device.addEventListener("click", click);
    
    window.addEventListener("resize", resize);

    isMobile = $(window).width() < 767;
    if (isMobile){
        // move info menu into device div
        var info = document.getElementById("info-column");
        document.getElementById("device").insertBefore(info, device);

        menuButton.addEventListener("click", toggleInfoMenu);
        document.getElementById("info-exit-button").addEventListener("click", toggleInfoMenu);
        menu.style.top = info.offsetHeight + "px";
    }
});


function loadContent(){
    // Generate our posts, right now just colored divs
    for (var i = 0; i < initialPostLoad; i++){
        var post = insertMessage(i) ? createMessagePost(mockMessage, i) : createContentPost();
        post.id = "post-" + i; 
        post.setAttribute('draggable', true);
        device.appendChild(post);
        var entry = {div: post, type: insertMessage(i) ? "message" : "content", confirmed: false};
        posts.push(entry);
    }
    postHeight = $("#post-0")[0].clientHeight;
}

function createContentPost(){
    var post = document.createElement("div");
    post.style.backgroundColor = generateRandomColor();
    post.className = "post";
    return post;
}

function createMessagePost(message, index){
    var messagePost = document.createElement("div");
    messagePost.className = "post message-div";

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
    return messagePost;
}

function insertMessage(index){
    // Just arbitrary for now
    return index == 3 || index == 6;
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
    if (animating){
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
    if (currentPost + 1 < initialPostLoad && !waitingForMessage()) {
        currentPost++;
        setInfoWindow();
    }
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
    currentPost++;
    snapToCurrentPost();

    //lighten screen
    document.getElementById("info").style.backgroundColor = "";
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