const threeChambers = ( sketch ) => {

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

        s=500 * scale * device_adjust;

        let delta_t = sketch.deltaTime / 4000;
        delta_t *= (sketch.userSpeedF * 1.2);
        t -= delta_t;
        w = device.offsetHeight;
        let y_spacing = device.offsetHeight / 2.5;

        for(k=-1;k<=1;k+=2){
            sketch.push();
            let y_pos =  y_spacing * k ;

            // sketch.translate(0, y_pos, 60);
            sketch.rotateX(t);
            sketch.rotateY(-t);
            // sketch.sphere(s)
            sketch.randomSeed(0)
            for(i=0;i<150;i++){
                if(i%5 == 0){
                    sketch.fill(155);
                }
                h=sketch.random(15,20)+sketch.noise(t*10,sketch.random(5,9))*70
                sketch.push()
                sketch.rotateX(sketch.random(6) )
                sketch.rotateZ(sketch.random(6))
                
                sketch.translate(0,-s)

                if (sketch.userShape == "square"){
                    sketch.box(40,h,40);
                }
                else if (sketch.userShape == "circle"){
                    let sphere_res  = 5;
                    sketch.sphere(h*0.4, sphere_res,sphere_res);
                }
                else{
                    sketch.scale(-1,-1);
                    sketch.cone(20, h);
                }
                
                sketch.pop()
                 sketch.fill(color);
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
  
  
  