const threeGrids = ( sketch ) => {

    var index = 0;
    var bgColor;
    var color;

    sketch.setup = () => {
        var deviceScreen = document.getElementById("device-screen");
        var canvas = sketch.createCanvas(deviceScreen.offsetWidth, deviceScreen.offsetHeight, sketch.WEBGL);
        canvas.addClass("p5-content");
        canvas.addClass("threeGrids");
    };

    t=0;


    sketch.draw = () => {
        let time = (sketch.millis() / 1000) * 0.5 * sketch.userSpeedF;

        sketch.setColor();
        sketch.background(25+Math.sin(time * 3) * 100);
        sketch.fill(color);

        let device_adjust = device.offsetWidth / 300;
        
        let w = 500 * device_adjust;
        let c = 100 * device_adjust;

        //sketch.colorMode(sketch.HSB,1);
        sketch.push();
        sketch.translate(0,c,-w);
        sketch.rotateY(time*1.5);
        sketch.rotate(time*1.5);

        for(y=0;y<w;y+=c)
            for(x=0;x<w;x+=c+=.2){
                
                d=(sketch.noise(x/9,y/9,time/4)*w+Math.sin((x+y)/9+time*1.5)*70);

                // sketch.translate(0,0,-100*y);

                for(i=-d;i<d;i+=c){
                 
                    sketch.push();
                    sketch.translate(x*5,y*5,i*10);

                    if (sketch.userShape == "square"){
                        sketch.box(c*1.5)
                    }
                    else if (sketch.userShape == "circle"){
                        let sphere_res  = 5;
                        sketch.sphere(c*1.5, sphere_res,sphere_res)
                    }
                    else{
                        //sketch.scale(1,-1);
                        sketch.rotateX(Math.PI/2);
                        sketch.cone(c*1.5, c*0.85);
                    }

                    
                    sketch.pop();

                }

            }
        sketch.pop();
        // sketch.fill(color);

    };

    sketch.setColor = () => {
        color = sketch.userColor;
        if (sketch.userColor == "red"){
            bgColor = '#9e1b11';
        }
        else if (sketch.userColor == "blue"){
            bgColor = "blue";
            color = '#8bb7d6';
        }
        else if (sketch.userColor == "green"){
            color = "#84f28c";
            bgColor = '#228429';
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
  
  
  