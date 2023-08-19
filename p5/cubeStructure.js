const cubeStructure = ( sketch ) => {

    var index = 0;
    var bgColor;
    var color;

    sketch.setup = () => {
      var canvas = sketch.createCanvas(device.offsetWidth, device.offsetHeight, sketch.WEBGL);

      canvas.addClass("p5-content");
      
    };

    t=0;


    sketch.draw = () => {


        let time = (sketch.millis() / 1000) * 0.5;

        sketch.setColor();
        sketch.background(210+Math.sin(time * 3) * 20);
        sketch.fill(color);

        

        let w = 500;
        let c = 50;

        //sketch.colorMode(sketch.HSB,1);
        sketch.push();
        sketch.translate(0,c,-w);
        sketch.rotateY(time);
        sketch.rotate(time*1.7);
        for(y=0;y<w;y+=c)
            for(x=0;x<w;x+=c+=.2){
                
                d=sketch.noise(x/9,y/9,time/5)*w+Math.sin((x+y)/9+time*1.5)*99;

                for(i=-d;i<d;i+=c){
                    sketch.push();
                    sketch.translate(x-w/2,y-w/2,i);

                    if (sketch.userShape == "square"){
                        sketch.box(c/2)
                    }
                    else if (sketch.userShape == "circle"){
                        let sphere_res  = 5;
                        sketch.sphere(c*0.4, sphere_res,sphere_res)
                    }
                    else{
                        //sketch.scale(1,-1);
                        sketch.rotateX(Math.PI/2);
                        sketch.cone(c*0.4, c*0.85);
                    }

                    
                    sketch.pop();

                }
            }
        sketch.pop();
        
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
  
  
  