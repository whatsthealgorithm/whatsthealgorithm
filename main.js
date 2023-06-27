var lastYPos = -1;
var startingYPos = -1;
var percentToSwipe = 15;
var postHeight;
var posts;
var currentPost = 0;

const initialPostLoad = 10;

// On Page Load
$(document).ready(function() { 
    loadContent();

    //document.addEventListener("drag", drag);
    document.addEventListener("dragstart", dragStart);
    document.addEventListener("dragend", dragEnd);
    document.addEventListener("dragover", drag);
});


function loadContent(){
    // Generate our posts, right now just colored divs'
    for (var i = 0; i < initialPostLoad; i++){
        var div = document.createElement("div");
        div.style.backgroundColor = generateRandomColor();
        div.className = "post";
        div.id = "post-" + i; 
        div.setAttribute('draggable', true);
        document.getElementById("screen").appendChild(div);
    }
    postHeight = $("#post-0")[0].clientHeight;
    console.log(postHeight)
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
    // Detect if dragging has just started
    if (lastYPos == -1){
        lastYPos = e.pageY;
        startingYPos = e.pageY;
        return;
    }
    // Detect if we've reached top of page
    else if (e.pageY == 0){
        return;
    }

    var marginTop = parseInt($('#screen')[0].style.marginTop.slice(0, -2));

    if (isNaN(marginTop)){
        marginTop = 0;
    }

    marginTop += e.pageY - lastYPos;

    $('#screen')[0].style.marginTop =  marginTop + "px";
    lastYPos = e.pageY;
}

function dragEnd(e) {
    e.preventDefault();

    var difference = startingYPos - e.pageY;
    var percentDragged = 100 * (difference / screen.height);
    var postChanged = false;

    if (percentDragged > percentToSwipe && currentPost + 1 < initialPostLoad){
        postChanged = true;
        currentPost++;
    }
    else if (percentDragged < -percentToSwipe && currentPost != 0){
        postChanged = true;
        currentPost--;
    }

    lastYPos = -1;
    startingYPos = -1;

    snapToCurrentPost();
    
    if (postChanged){
        adjustBars();
    }
}

function generateRandomColor(){
    return "#" + Math.floor(Math.random()*16777215).toString(16);
}

function snapToCurrentPost(){
    var marginTop = parseInt($('#screen')[0].style.marginTop.slice(0, -2));
    var targetMarginTop = currentPost * postHeight * -1;
    var diff = targetMarginTop - marginTop;
    $('#screen').animate({
        marginTop: '+=' + diff + 'px'
    }, 400);
}

function adjustBars(){
    var bars = document.getElementsByClassName("bar-fill");
    for (var i = 0; i < bars.length; i++){
        bars[i].style.width = Math.random() * 100 + "%";
    }
}