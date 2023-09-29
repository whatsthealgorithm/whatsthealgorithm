const textSwipe = ( sketch ) => {

    var index = 0;
    var bgColor;
    var color;

    var imgs = [];

    sketch.setup = () => {
        color = 0;
        bcColor = 0;
        var deviceScreen = document.getElementById("device-screen");
        var canvas = sketch.createCanvas(deviceScreen.offsetWidth, deviceScreen.offsetHeight);
        canvas.addClass("p5-content");
        canvas.addClass("textSwipe");
    
        sketch.smooth();
        sketch.noStroke(); 
    };

    sketch.draw = () => {

        //console.log(device.offsetHeight);

        //if this is the first frame, make the images
        if (imgs.length == 0){
            for (let i=0; i<2; i++){
                let g = sketch.createGraphics(device.offsetWidth, device.offsetHeight);
                let y_spacing = device.offsetHeight * 0.2;
                
                g.smooth();
                g.textSize(device.offsetHeight * 0.08);
                g.textStyle(sketch.BOLD);
                g.textAlign(sketch.CENTER, sketch.CENTER);
                g.noStroke();
                if (i == 0) g.fill(0);
                else        g.fill(255);

                //could be any text here. could be randomzied too
                g.text("JUNGLE", device.offsetWidth/2, device.offsetHeight/2 - y_spacing);
                g.text("IS", device.offsetWidth/2, device.offsetHeight/2);
                g.text("MASSIVE", device.offsetWidth/2, device.offsetHeight/2 + y_spacing);

                //put some shapes along the top and bottom
                let shape_size = device.offsetHeight * 0.05;
                let shape_padding = device.offsetHeight * 0.014;
                let shape_y_dist = y_spacing/2;

                for (let x=0; x<=device.offsetWidth; x+=shape_size + shape_padding){
                    for (let k=0; k<2; k++){

                        let y = shape_y_dist;
                        if (k==1)   y = device.offsetHeight-shape_y_dist;
                        
                        if (sketch.userShape == "square"){
                            g.square(x-shape_size/2, y, shape_size);
                        }
                        else if (sketch.userShape == "circle"){
                            g.circle(x, y, shape_size);
                        }
                        else{
                            g.push();
                            g.translate(x,y);
                            if (k==0)   g.scale(1,-1);
                            g.triangle(-shape_size/2,shape_size/2, shape_size/2,shape_size/2, 0,-shape_size/2 );
                            g.pop();
                        }
                    }
                }

                //add it
                imgs.push(g);
            }
        }

        sketch.setColor();
        sketch.background(bgColor);
        sketch.fill(color);


        let time = sketch.millis() / 1000;
        time *= sketch.userSpeedF;
        //move y divide up and down, going a little out of frame
        let y_divide = device.offsetHeight/2 + Math.sin( time * 3 ) * (device.offsetHeight*0.6);
        //clamp it
        y_divide = Math.min(y_divide, device.offsetHeight);
        
        sketch.noStroke();
        sketch.rect(0,0, device.offsetWidth, y_divide);

        sketch.image(imgs[1], 0,0);
        sketch.image(imgs[0], 0,0, device.offsetWidth,y_divide, 0,0, device.offsetWidth,y_divide);

        
    };

    sketch.setColor = () => {
        
        if (sketch.userColor == "red"){
            color = "#ff9494";
            bgColor = "red";
        }
        else if (sketch.userColor == "blue"){
            bgColor = "#0024ff";
            color = '#94a3ff';
        }
        else if (sketch.userColor == "green"){
            color = "#2aff00";
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
  
  
  