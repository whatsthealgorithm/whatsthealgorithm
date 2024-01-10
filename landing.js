var device; 
document.addEventListener("DOMContentLoaded", () => {
    device = document.getElementById("device-screen");
    var post = document.createElement("div");
    var template = new p5(tunnel, post);
    template.userColor = "red";
    template.userShape = "circle";
    template.userSpeedF = 1.0;
    device.appendChild(post);
    device.addEventListener("click", () =>{
        document.getElementById("game-link").click();
    });
});

