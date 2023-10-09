const textSpotlight = (sketch) => {

var essay = "TikTok’s algorithm treats each video more or less independently to assess its viral potential, caring relatively little about how many followers the creator has. This would be a trivial algorithm change for its competitors. What’s stopping them? Only the fact that their top creators, who collectively determine the platform’s fate, would rebel, because they stand to lose the fruits of the following they’ve built up over years. Stratechery explains that this is why Instagram got into trouble recently with its attempts to change its algorithm to compete with TikTok. The de-emphasis of subscriptions means that there are fewer superstars, and fewer parasocial relationships. This, in turn, has kept creators from getting too powerful or quite as invested: TikTok pays them a pittance, and didn’t pay at all until 2020. The company has faced criticism for this, and it arguably takes advantage of creators. I don’t hold it up as a model to emulate. But the upside (to TikTok) is that it doesn’t have to worry nearly as much about angering creators as it experiments with its design and algorithm.  What TikTok lacks in superstars it more than makes up for in its “long tail” of creators. The app is far more successful in converting content consumers into creators, in part because its creator tools are superior and more fun. Besides, TikTok has a trick up its sleeve that lowers the barrier to entry for new creators. As many people have observed, every video seems to be guaranteed an audience. How could that be?";

var start = 0;

var text_x = 5;

const spots = [];

var bgColor;
var color;

var angle = 0;

sketch.setup = () => {

  var deviceScreen = document.getElementById("device-screen");
  var canvas = sketch.createCanvas(deviceScreen.offsetWidth, deviceScreen.offsetHeight);
 
  canvas.addClass("p5-content");
  canvas.addClass("textSpotlight");

  sketch.noStroke();


  for(let i = 0; i<20;i++) {
    let s = new Spotlight();
    spots.push(s);
  }

}


sketch.draw = () => {

  sketch.setColor();

  sketch.background(bgColor);

  sketch.fill(color);


for (let i =0;i<spots.length;i++) {
  spots[i].update();
  spots[i].show();
}
  sketch.noStroke();
  // console.log(circle.x); 

  // sketch.circle(init_x,init_y,radius);
  // sketch.circle(init_x2,init_y2,250);


  sketch.fill(bgColor);

  sketch.textSize(20);
  sketch.textStyle(sketch.BOLDITALIC);

  sketch.rotate(sketch.sin(angle)*.1);

  for(var i =0;i<essay.length; i= i+40){
    sketch.text(essay.substring(start,i),text_x,i*.6);
   start = i;
  }

angle+=.05;

// if (Math.abs(text_x) < device.offsetWidth / 2) {
//   text_x+= 1;
// }

}

class Spotlight {
  constructor() {
    this.x = sketch.random(0, device.offsetWidth);
    this.y = sketch.random(0,device.offsetHeight);

    switch(sketch.userSpeed) {
    case "slow":
        this.x_speed = sketch.random(-3,3);
        this.y_speed = sketch.random(-3,3);
        break;

    case "medium":
        this.x_speed = sketch.random(-4,4);
        this.y_speed = sketch.random(-4,4);
        break;

    case "fast":
        this.x_speed = sketch.random(-5,5);
        this.y_speed = sketch.random(-5,5);
        break;
    default:
      this.x_speed = sketch.random(-4,4);
        this.y_speed = sketch.random(-4,4);
        break;
    }



    this.radius = sketch.random(10,100);
  }

  update() {
    if(this.x > this.radius/2 && this.x <= device.offsetWidth - this.radius/2) {
          this.x += this.x_speed;
    }

    if(this.x > device.offsetWidth - this.radius / 2) {
      this.x -= 10;
      this.x_speed *= -1;
    }

    if(this.x < this.radius/2) {
      this.x += 10;
      this.x_speed *= -1;
    }

    if(this.y > this.radius/2 && this.y <= device.offsetHeight - this.radius/2) {
          this.y += this.y_speed;
    }

    if(this.y > device.offsetHeight - this.radius / 2) {
      this.y -= 10;
      this.y_speed *= -1;
    }

    if(this.y < this.radius/2) {
      this.y += 10;
      this.y_speed *= -1;
    }



  }
  show() {

    switch(sketch.userShape) {
    case "circle":
      sketch.circle(this.x,this.y,this.radius);
      break;

    case "triangle":
      sketch.triangle(this.x, this.y, (this.x+this.radius), (this.y-this.radius*2),this.x+this.radius*2, this.y);
      break;

    case "square":
     sketch.square(this.x,this.y,this.radius);
     break;
    }


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



// make a class for the spotlights??


sketch.setDraw = (shouldDraw) =>{
        if (shouldDraw && !sketch.isLooping()){
            sketch.loop();
        }
        else if (!shouldDraw && sketch.isLooping()){
            sketch.noLoop();
        }
    }

};