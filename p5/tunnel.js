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

        sketch.setColor();
        sketch.background(bgColor);
        sketch.fill(color);

        let t = sketch.millis() / 1000.0;

        let base_hue = 2.8;   //red
        if (sketch.userColor == "red"){
        }
        else if (sketch.userColor == "blue"){
            base_hue = 2;
        }
        else if (sketch.userColor == "yellow"){
            base_hue = 0.7
        }


        s=18
        p=t%1
        u=t*1.57
        w=device.offsetWidth;
        h=device.offsetHeight;
        sketch.colorMode(sketch.HSB,3)
        sketch.noFill()
        for(i=0;i<s;i++){
            o=i/s+p/s
            sketch.strokeWeight(45)
            let hue = base_hue+sketch.sin(o*-4+u)/2;
            let bri = 2+sketch.sin(o*-8+u);
            sketch.stroke(hue, bri, 3)
            d=70-o*30
            sketch.circle(w/2+sketch.sin(a=o*4+u)*d, h/2+sketch.cos(a)*d/2, device.offsetHeight*1.2*o)
        }t+=.04

        
    };

    sketch.setColor = () => {
        if (sketch.userColor == "red"){
            color = "red";
            bgColor = '#9e1b11';
        }
        else if (sketch.userColor == "blue"){
            color = "blue";
            bgColor = '#8bb7d6';
        }
        else if (sketch.userColor == "yellow"){
            color = "yellow";
            bgColor = '#ccc72f';
        }
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
  
  
  