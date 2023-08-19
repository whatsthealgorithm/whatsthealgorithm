const tunnel = ( sketch ) => {

    var index = 0;
    var bgColor;
    var color;

    sketch.setup = () => {
      var canvas = sketch.createCanvas(device.offsetWidth, device.offsetHeight);
      canvas.addClass("p5-content");
  
      sketch.smooth();
      sketch.noStroke();      
      
    };

    sketch.draw = () => {
        
        let t = sketch.millis() / 1000.0;
        t *= sketch.userSpeedF;

        let base_hue = 2.8;   //red
        if (sketch.userColor == "red"){
        }
        else if (sketch.userColor == "blue"){
            base_hue = 2;
        }
        else if (sketch.userColor == "green"){
            base_hue = 0.9
        }

        //terrible tweetcart code
        s=18;
        p=t%1;
        u=t*1.57;
        w=device.offsetWidth;
        h=device.offsetHeight;
        sketch.colorMode(sketch.HSB,3);
        sketch.noFill();
        for(i=0;i<s;i++){
            o=i/s+p/s;
            sketch.strokeWeight(50);
            let hue = base_hue+sketch.sin(o*-4+u)/2;
            let bri = 2+sketch.sin(o*-8+u);
            sketch.stroke(hue, bri, 3);
            d=70-o*30;

            let x = w/2+sketch.sin(a=o*4+u)*d;
            let y = h/2+sketch.cos(a)*d/2;
            let size =  device.offsetHeight*1.2*o;

            if (sketch.userShape == "triangle"){
                size *= 1.75;
                y -= 20;
                sketch.push();
                sketch.translate(x,y);
                sketch.triangle(-size/2,size/2, size/2,size/2, 0,-size/2 );
                sketch.pop();
            }
            else if (sketch.userShape == "square"){
                sketch.square(x-size/2, y-size/2, size);
            }
            else if (sketch.userShape == "circle"){
                sketch.circle(x,y, size);
            }
        }
        
        t+=.04

        
    };

    sketch.setDraw = (shouldDraw) =>{
        if (shouldDraw && !sketch.isLooping()){
            sketch.loop();
        }
        else if (!shouldDraw && sketch.isLooping()){
            sketch.noLoop();
        }
    }
  };
  
  
  