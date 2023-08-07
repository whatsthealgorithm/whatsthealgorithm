const textSwipe = ( sketch ) => {

    var index = 0;
    var bgColor;
    var color;

    var imgs = [];

    sketch.setup = () => {
      var canvas = sketch.createCanvas(device.offsetWidth, device.offsetHeight);
      canvas.addClass("p5-content");
  
      sketch.smooth();
      sketch.noStroke(); 
      
      //make the image
      for (let i=0; i<2; i++){
        let g = sketch.createGraphics(device.offsetWidth, device.offsetHeight);
        let y_spacing = 140;
        g.textSize(60);
        g.textStyle(sketch.BOLD);
        g.textAlign(sketch.CENTER, sketch.CENTER);
        g.noStroke();
        if (i == 0) g.fill(0);
        else        g.fill(255);
        g.text("JUNGLE", device.offsetWidth/2, device.offsetHeight/2 - y_spacing);
        g.text("IS", device.offsetWidth/2, device.offsetHeight/2);
        g.text("MASSIVE", device.offsetWidth/2, device.offsetHeight/2 + y_spacing);
        


        //put some shapes along the top and bottom
        let shape_size = 40;
        let shape_padding = 10;
        let shape_y_dist = y_spacing/2;

        for (let x=0; x<=device.offsetWidth; x+=shape_size + shape_padding){
            for (let k=0; k<2; k++){

                let y = shape_y_dist;
                if (k==1)   y = device.offsetHeight-shape_y_dist;
                
                //g.circle(x, y, shape_size);

                g.push();
                g.translate(x,y);
                if (k==0)   g.scale(1,-1);
                g.triangle(-shape_size/2,shape_size/2, shape_size/2,shape_size/2, 0,-shape_size/2 );
                g.pop();

                // if (sketch.userShape == "square"){
                //     g.square(x-shape_size/2, y, shape_size);
                // }
                // else if (sketch.userShape == "circle"){
                //     g.circle(x, y, shape_size);
                // }
                // else{
                //     sketch.triangle(device.offsetWidth / 2, device.offsetHeight / 2, device.offsetWidth / 2 - size / 2, device.offsetHeight / 2 + size, device.offsetWidth / 2 + size / 2, device.offsetHeight / 2 + size);
                // }
            }
        }

        //add it
        imgs.push(g);


      }
      
    };

    sketch.draw = () => {

        sketch.setColor();
        sketch.background(bgColor);
        sketch.fill(color);


        let time = sketch.millis() / 1000;
        //move y divide up and down, going a little out of frame
        let y_divide = device.offsetHeight/2 + Math.sin( time * 3 ) * (device.offsetHeight*0.6);
        //clamp it
        y_divide = Math.min(y_divide, device.offsetHeight);
        //y_divide = Math.min(Math.max(y_divide, 0), device.offsetHeight);
        
        sketch.noStroke();
        sketch.rect(0,0, device.offsetWidth, y_divide);

        sketch.image(imgs[1], 0,0);
        sketch.image(imgs[0], 0,0, device.offsetWidth,y_divide, 0,0, device.offsetWidth,y_divide);

        
    };

    sketch.setColor = () => {
        if (sketch.userColor == "red"){
            color = "red";
            bgColor = '#9e1b11';
        }
        else if (sketch.userColor == "blue"){
            bgColor = "blue";
            color = '#8bb7d6';
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
  
  
  