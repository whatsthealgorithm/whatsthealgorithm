const crimsonRoom = ( sketch ) => {
    var bgColor;
    var color;

    

    sketch.setup = () => {
        var deviceScreen = document.getElementById("device-screen");
        var canvas = sketch.createCanvas(deviceScreen.offsetWidth, deviceScreen.offsetHeight, sketch.WEBGL);
        canvas.addClass("p5-content");
    
        sketch.smooth();
        sketch.noStroke();      
      
    };

    var t=0
    sketch.draw = () => {
        sketch.setColor();
        sketch.background(bgColor);
        sketch.fill(color);

        let device_adjust = device.offsetWidth / 300;

        //console.log("speed: "+sketch.userSpeedF)

        let delta_time = sketch.deltaTime / 1000;
        //console.log(delta_time)
        t += delta_time * 0.3 * sketch.userSpeedF;
        let shapes_per_row = 50;
        let w = device.offsetWidth;
        let h = device.offsetHeight;
        let max_d = 200 * device_adjust;
        for(d=15;d<max_d;d*=1.2){
            for(i=0;i<shapes_per_row;i++){
                a=t+sketch.TAU/shapes_per_row*i+d/(900+sketch.sin(t*4)*300);
                x=sketch.quick_map(a)*d;
                y=sketch.quick_map(a+sketch.PI/2)*d;
                s=4+d/20+(sketch.abs(x)-sketch.abs(y))/20;
                s *= device_adjust
                
                if (sketch.userShape == "square"){
                    sketch.rect(w/2+x,h/2+y,s,s);
                }
                else if (sketch.userShape == "circle"){
                    sketch.circle(w/2+x,h/2+y,s);
                }
                else{
                    sketch.push();
                    sketch.translate(w/2+x,h/2+y);
                    sketch.triangle(-s/2,s/2, s/2,s/2, 0,-s/2 );
                    sketch.pop();
                }
            }
        }

        sketch.fill(0);
        sketch.text("fps "+sketch.frameRate(), w-150, device.offsetHeight-40);
    };


    sketch.quick_map = (n) => {
        return sketch.map(sketch.sin(n),-.5,.5,-1,1,1);
    }

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
  
  
  