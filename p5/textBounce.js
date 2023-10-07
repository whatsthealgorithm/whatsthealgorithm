const textBounce = (sketch) => {

var logox, logoy;

// var xspeed = 2.5;
// var yspeed = 2.5;
var xspeed, yspeed;
var colors = ['#CC1B2C', '#0DB000', '#CC8200', '#C200CC', '#0600FF', '#B8CC00', '#F533FF', '#40E333', '#FF2138'];
var text_color, text_width, ext_color;
var speeds, speeds_tab, speeds_mob;
var mode;

let logo, logo_size, extension = '.tech';

let extensions = ['.tech', '.privacy', '.surveillance', '.exile', '.identity', '.archives', '.bias', '.climate', '.nature', '.monopoly', '.food'];

let hidden_text, spacing;

let ext_size;

let keywords = ['lujain', 'tom', 'grace', 'jihyun', 'munib', 'rastra', 'alia', 'tona', 'tech', 'privacy', 'media', 'exile', 'identity', 'archives', 'bias', 'climate', 'nature', 'monopoly', 'food', 'internet', 'youth', 'nepal', 'korea', 'palestine', 'lebanon', 'nigeria', 'usa', 'said', 'apps', 'bosnia', 'uae', 'abu dhabi', 'online'];

let word_list = [], wi;


sketch.setup = () => {
  sketch.textFont('Ministry');

  var deviceScreen = document.getElementById("device-screen");
  var canvas = sketch.createCanvas(deviceScreen.offsetWidth, deviceScreen.offsetHeight);
 
  canvas.addClass("p5-content");
  canvas.addClass("textSpotlight");

  sketch.noStroke();

  logox = device.offsetWidth/2.5;
  logoy = device.offsetHeight/2;

  text_color = sketch.random(colors);
  ext_color = sketch.random(colors);
  speeds =  [sketch.random(-2.5,-2), sketch.random(2,2.5)];
  speeds_tab = [sketch.random(-2,-1), sketch.random(1,2)];
  speeds_mob = [sketch.random(-1,-.5), sketch.random(.5,1)];

  if (device.offsetWidth > 700) {
  mode = "desktop"
  xspeed = sketch.random(speeds);
  yspeed = sketch.random(speeds);
  logo_size = device.offsetWidth / 25;
}

if (device.offsetWidth < 700) {
  mode = "mobile";

  if (device.offsetWidth > 400) {
  xspeed = sketch.random(speeds_tab);
  yspeed = sketch.random(speeds_tab);
}
  
  if (device.offsetWidth <= 400) {
  xspeed = sketch.random(speeds_mob);
  yspeed = sketch.random(speeds_mob);
  }

  logo_size = device.offsetWidth / 15;
}

  //console.log(device.offsetWidth);
  //console.log(device.offsetHeight);


  for (let i=0; i<device.offsetWidth; i+=(sketch.textWidth("abu dhabi")*1.1)) {
    for (let j=0;j<device.offsetHeight;j+=50) {
    word_list.push(sketch.random(keywords));
  }
  }

  //console.log(word_list);

}

sketch.windowResized = () => {
  resizeCanvas(windowWidth, windowHeight);
  //console.log("resized");

  for (let i=0; i<device.offsetWidth; i+=(sketch.textWidth("abu dhabi")*1.1)) {
    for (let j=0;j<device.offsetHeight;j+=50) {
    word_list.push(sketch.random(keywords));
  }
  }

console.log(word_list.length);

  if (device.offsetWidth < 700) {

  if (device.offsetWidth > 400) {
  xspeed = sketch.random(speeds_tab);
  yspeed = sketch.random(speeds_tab);


}
  
  if (device.offsetWidth <= 400) {
  xspeed = sketch.random(speeds_mob);
  yspeed = sketch.random(speeds_mob);
  }

  logo_size = device.offsetWidth / 15;
  mode = "mobile";

}

if (device.offsetWidth > 700) {
  mode = "desktop";
  xspeed = sketch.random(speeds);
  yspeed = sketch.random(speeds);
  logo_size = device.offsetWidth / 25;
}

if (logox > (device.offsetWidth-(sketch.textWidth(logo)+sketch.textWidth(extension)))) {
  logox = device.offsetWidth - (sketch.textWidth(logo)+sketch.textWidth(extension));
}

if (logox < 0) {
  logox = device.offsetWidth + 10;
}

if (logoy > device.offsetHeight) {
  logoy = device.offsetHeight - 30;
}

if (logoy < 0) {
  logoy+=10;
}



}

sketch.draw = () => {

  sketch.background('#02012F');
  // sketch.fill(sketch.random(0,255), sketch.random(0,255),sketch.random(0,255));

    for (let i=120; i>0; i-=1) {
      sketch.fill(255,255,255,120-i);
      sketch.circle(logox,logoy,i)
      sketch.fill('#02012F');
      if (i > 1) {
      sketch.circle(sketch.mouseX,sketch.mouseY,i-1);
    }
    }
  // sketch.fill(220,220,200,80);
  // sketch.circle(sketch.mouseX,sketch.mouseY,100);

  sketch.textSize(20);

  hidden_text = "abu dhabi";

  sketch.fill('#02012F');

  wi = 0;
  
  for (let i=0; i<device.offsetWidth; i+=(sketch.textWidth(hidden_text)*1.1)) {
    for (let j=0;j<device.offsetHeight;j+=50) {
      sketch.text(word_list[wi],i,j);
      wi+=1;
  }
  }
  
  sketch.fill(text_color);
  sketch.textSize(logo_size);
  // logo = "multiplicity" + extension;
  logo = "multiplicity";
  sketch.text(logo,logox,logoy);
  sketch.fill(ext_color);
  sketch.text(extension,logox+sketch.textWidth(logo),logoy);

  logox += xspeed;
  logoy += yspeed;


  if (logox < 0 || logox > (device.offsetWidth - (sketch.textWidth(logo)+sketch.textWidth(extension)))) {
    //console.log("entered logox");
    // ext_size = sketch.textWidth(extension);
    // xspeed = xspeed * -1;
    text_color = sketch.random(colors);
    ext_color = sketch.random(colors);
    extension = sketch.random(extensions);

    if (logox > (device.offsetWidth - (sketch.textWidth(logo)+sketch.textWidth(extension)))) {
    logox = device.offsetWidth - (sketch.textWidth(logo)+sketch.textWidth(extension));
    }

    xspeed = xspeed * -1;
  }

  else if (logoy < 0 || logoy > device.offsetHeight) {
    //console.log("entered logoy"); 
    yspeed = yspeed * -1;
    text_color = sketch.random(colors);
    ext_color = sketch.random(colors);
    extension = sketch.random(extensions);
  }


}

    sketch.setDraw = (shouldDraw) =>{
        if (shouldDraw && !sketch.isLooping()){
            sketch.loop();
        }
        else if (!shouldDraw && sketch.isLooping()){
            sketch.noLoop();
        }
    }

};