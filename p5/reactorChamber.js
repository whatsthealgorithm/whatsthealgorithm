const reactorChamber = ( sketch ) => {

    var index = 0;
    var bgColor;
    var color;

    sketch.setup = () => {
        var deviceScreen = document.getElementById("device-screen");
        var canvas = sketch.createCanvas(deviceScreen.offsetWidth, deviceScreen.offsetHeight, sketch.WEBGL);
        canvas.addClass("p5-content");
        canvas.addClass("reactorChamber");
    };

    t=0;

    let scale = 0.5;

    sketch.draw = () => {
        sketch.setColor();
        sketch.background(bgColor);
        sketch.fill(color);

        let device_adjust = device.offsetWidth / 300;

        s=300 * scale * device_adjust;

        let delta_t = sketch.deltaTime / 4000;
        delta_t *= sketch.userSpeedF;
        t -= delta_t;
        w = device.offsetHeight;
        let y_spacing = device.offsetHeight / 2.5;

        for(k=-1;k<=1;k+=2){
            sketch.push();
            let y_pos =  y_spacing * k ;

            sketch.translate(0, y_pos, 60);
            sketch.rotateX(t);
            sketch.sphere(s)
            sketch.randomSeed(0)
            for(i=0;i<150;i++){
                h=sketch.random(120)+sketch.noise(t*6,sketch.random(9))*70
                sketch.push()
                sketch.rotateX(sketch.random(6) )
                sketch.rotateZ(sketch.random(6))
                
                sketch.translate(0,-s)

                if (sketch.userShape == "square"){
                    sketch.box(50,h,50)
                }
                else if (sketch.userShape == "circle"){
                    let sphere_res  = 5;
                    sketch.sphere(h*0.4, sphere_res,sphere_res)
                }
                else{
                    sketch.scale(1,-1);
                    sketch.cone(70, h*1.3);
                }
                
                sketch.pop()
            }
            sketch.pop()
        }
    
    };

    sketch.setColor = () => {
        color = sketch.userColor;

        if (sketch.userColor == "red"){
            bgColor = '#9e1b11';
        }
        else if (sketch.userColor == "blue"){
            bgColor = '#8bb7d6';
        }
        else if (sketch.userColor == "green"){
            bgColor = '#2fcc54';
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
  
  
  