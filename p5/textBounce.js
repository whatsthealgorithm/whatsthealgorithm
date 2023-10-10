const textBounce = (sketch) => {

var bgColor;
var color;

var text_x;
var text_y;

var words = [];

sketch.setup = () => {

  var deviceScreen = document.getElementById("device-screen");
  var canvas = sketch.createCanvas(deviceScreen.offsetWidth, deviceScreen.offsetHeight);
 
  canvas.addClass("p5-content");
  canvas.addClass("textBounce");

  sketch.noStroke();

   for(let i = 0; i<70;i++) {
    let w = new Word();
    words.push(w);
  }
  

}


sketch.draw = () => {

  sketch.setColor();

  sketch.background(240);

  sketch.fill(bgColor);


        let time = sketch.millis() / 1000.0;
        time *= sketch.userSpeedF;
        let delta_time = sketch.deltaTime / 1000.0;
        delta_time *= sketch.userSpeedF;


//shape grid
        let bg_spacing = device.offsetWidth * 0.1;
        let bg_period = 2;

        let bg_off_x = bg_spacing * ( (time * bg_period) % 1);
        let bg_off_y = Math.sin(time) * bg_spacing * 2;

        sketch.fill(255);

        let cols = 0;
        for(let x=-bg_spacing-bg_off_x; x<device.offsetWidth+bg_spacing; x+=bg_spacing){
            cols++;
            for(let y=-bg_spacing*2-bg_off_y; y<device.offsetHeight+bg_spacing*2; y+=bg_spacing){

                if (sketch.userShape == "square"){
                    sketch.push();
                    sketch.translate(x,y);
                    sketch.rotate(x/30 + y/30)
                    let size = bg_spacing/2
                    sketch.square(-size/2,-size/2, size);
                    sketch.pop();
                }
                else if (sketch.userShape == "circle"){
                    let size =  bg_spacing/2 + Math.sin(x/30 + y/30) * 2;
                    sketch.circle(x,y, size);
                }
                else{
                    let ts = bg_spacing*0.5;
                    sketch.push();
                    sketch.translate(x,y);
                    sketch.rotate(x/30 + y/30)
                    sketch.triangle(ts/2,ts/2, -ts/2,ts/2, 0,-ts/2 );
                    sketch.pop();
                }

            }
        }

  // sketch.text("word",text_x,100+sketch.sin(sketch.radians(text_x))*50);

  for (let i =0;i<words.length;i++) {
  words[i].update();
  words[i].show();
}

}


sketch.setColor = () => {
        
        if (sketch.userColor == "red"){
            color = "#EE4813";
            bgColor = "darkred";
        }
        else if (sketch.userColor == "blue"){
            bgColor = "#2251F8";
            color = 'darkblue';
        }
        else if (sketch.userColor == "green"){
            color = "#20E864";
            bgColor = 'darkgreen';
        }
    }

class Word {
  constructor() {

    this.alphabet = "abcdefghijklmnopqrstuvwxyz";

    this.letter = sketch.round(sketch.random(0,this.alphabet.length));

    this.switch = sketch.round(sketch.random(0,1));

    this.x = sketch.random(0, device.offsetWidth);
    this.y = sketch.random(0,device.offsetHeight);
    this.angle = sketch.random(120,180);
    this.scale = sketch.random(70,140);

    this.size = sketch.random(20,50);

    switch(sketch.userSpeed) {
    case "slow":
        this.x_speed = sketch.random(-1,1);
        this.y_speed = sketch.random(-1,1);
        break;

    case "medium":
        this.x_speed = sketch.random(-2,2);
        this.y_speed = sketch.random(-2,2);
        break;

    case "fast":
        this.x_speed = sketch.random(-3,3);
        this.y_speed = sketch.random(-3,3);
        break;
    default:
      this.x_speed = sketch.random(-2,2);
        this.y_speed = sketch.random(-2,2);
        break;
    }



    this.size = sketch.random(10,100);
  }

  update() {
    if(this.x > 0 && this.x <= device.offsetWidth) {
          this.x += this.x_speed;
    }

    if(this.x > device.offsetWidth) {
      this.x -= 5;
      this.x_speed *= -1;
    }

    if(this.x < 0) {
      this.x += 5;
      this.x_speed *= -1;
    }

    if(this.y > 0 && this.y <= device.offsetHeight) {
          // this.y += this.y_speed;
      this.angle += this.y_speed;
    }

    // if(this.y > device.offsetHeight) {
    //   this.y -= 10;
    //   this.y_speed *= -1;
    // }

    // if(this.y < 0) {
    //   this.y += 10;
    //   this.y_speed *= -1;
    // }



  }
  show() {

  sketch.textSize(this.size);

  if(this.switch == 0){
      sketch.fill(color);
  }

  if(this.switch == 1){
    sketch.fill(bgColor);
  }

  sketch.text(this.alphabet[this.letter],this.x+2,this.y+sketch.sin(sketch.radians(this.angle))*this.scale+2);

   if(this.switch == 1){
      sketch.fill(color);
  }

  if(this.switch == 0){
    sketch.fill(bgColor);
  }

  sketch.text(this.alphabet[this.letter],this.x,this.y+sketch.sin(sketch.radians(this.angle))*this.scale);

 

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