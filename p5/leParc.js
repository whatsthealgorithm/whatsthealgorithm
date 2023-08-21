const leParc = ( sketch ) => {

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

        let t = sketch.millis() / 1000;
        t *= sketch.userSpeedF;


        w = device.offsetWidth;
        h = device.offsetHeight;
        s = device.offsetWidth / 7;
        c = sketch.color(213,209,200)

        
        if (sketch.userColor == "red"){
            c = sketch.color(214, 161, 173);
        }
        else if (sketch.userColor == "blue"){
            c = sketch.color(161, 164, 214);
        }
        else if (sketch.userColor == "yellow"){
            c = sketch.color(214, 214, 161);
        }
        else if (sketch.userColor == "green"){
            c = sketch.color("#add6a1");
        }
        

        sketch.noStroke()
        sketch.background(102,99,91)
        for(x=-s;x<w;x+=s){
            for(y=-s;y<h;y+=s){
                p=(t+(x+y)*.0025)%2-1;
                o=(.5+p*.5)*s*.5;
                sketch.fill(p>0?s:c);
                sketch.rect(x+o,y+o,s,s);
                sketch.fill(p>0?c:s);


                if (sketch.userShape == "square"){
                    sketch.square(x+s/2,y+s/2,p*s*.9);
                }
                else if (sketch.userShape == "circle"){
                    sketch.circle(x+s/2,y+s/2,p*s*.9);
                }
                else{
                    let ts = p*s*.75;
                    sketch.triangle(x-ts/2,y+ts/2, x+ts/2,y+ts/2, x+0,y-ts/2 );
                }

                
            }
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
  
  
  