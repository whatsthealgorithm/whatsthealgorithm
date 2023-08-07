const vaporwaveTemplate = ( sketch ) => {

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

        // sketch.setColor();
        // sketch.background(bgColor);
        // sketch.fill(color);

        sketch.colorMode(sketch.HSB, 360, 100, 100);


        let time = sketch.millis() / 1000;

        // sketch.push();
        // sketch.translate(-device.offsetWidth/2, -device.offsetHeight/2 - 150);


        //draw the bg
        let bg_step = 3;
        sketch.strokeWeight(bg_step);

        for (let y=0; y<device.offsetHeight; y+=bg_step){

            let prc = y / device.offsetHeight;

            let c1 = {
                h: 187,
                s: 64,
                b: 100
            }

            let c2 = {
                h: 275,
                s: 96,
                b: 31
            }

            // let c1 = {
            //     h: 32,
            //     s: 67,
            //     b: 98
            // }

            // let c2 = {
            //     h: 32,
            //     s: 90,
            //     b: 80
            // }

            // let c2 = {
            //     h: 32,
            //     s: 0,
            //     b: 100
            // }
            // let c2 = {
            //     h: 225,
            //     s: 88,
            //     b: 71
            // }

            let color_angle = prc * Math.PI * 1 - time * 0.5;
            let color_prc = 0.5 + Math.sin(color_angle) * 0.5;
            let hue = (1.0-color_prc)*c1.h + color_prc*c2.h;
            let sat = (1.0-color_prc)*c1.s + color_prc*c2.s;
            let bri = (1.0-color_prc)*c1.b + color_prc*c2.b;

            sketch.stroke(hue%360, sat, bri);

            sketch.line(0,y, device.offsetWidth, y);
        }

        
        //grid
        sketch.strokeWeight(1);
        sketch.stroke(64, 62, 100);

        let grid_size = 50;

        let y_padding = 100;
        let grid_time = time % 1;
        let grid_offset = grid_time * grid_size;
        for (let y=y_padding+grid_offset; y<=device.offsetHeight+grid_offset; y+=grid_size){
            let prc = (y-y_padding) / (device.offsetHeight-y_padding);
            prc = Math.pow(prc, 6);
            let mod_y = y_padding +  (device.offsetHeight-y_padding) * prc;
            sketch.line(0,mod_y, device.offsetWidth, mod_y);
            
        }

        let x_dist = device.offsetWidth * 2;
        let start_x = device.offsetWidth/2 - x_dist;
        let end_x = device.offsetWidth/2 + x_dist;

        grid_size = 80;
        for (let x=start_x; x<=end_x; x+=grid_size){

            let prc = sketch.map(x, start_x,end_x, -1,1);
            let sign = Math.sign(prc);
            prc = Math.pow( Math.abs(prc), 1.5) * sign;

            let top_x = sketch.map(prc, -1, 1, start_x, end_x);

            sketch.line(top_x, y_padding, x, device.offsetHeight);
        }
       

        //draw a triangle

        sketch.push();
        sketch.translate(device.offsetWidth/2, device.offsetHeight/2);
        let step = 1;
        sketch.strokeWeight(step);
        let height = 250;
        let start_y = -height/2;


        for (let i=0; i<height; i+=step){
            let prc = i / height;

            let y = start_y + i;

            let line_angle = prc * Math.PI * 2 + time * 2;
            let w = i;
            let x = -w/2;

            let c1 = {
                h: 275,
                s: 96,
                b: 31
            }

            let c2 = {
                h: 337,
                s: 78,
                b: 98
            }

            let color_angle = prc * Math.PI * 2 + time * 2;
            let color_prc = 0.5 + Math.sin(color_angle) * 0.5;
            
            let hue = (1.0-color_prc)*c1.h + color_prc*c2.h;
            let sat = (1.0-color_prc)*c1.s + color_prc*c2.s;
            let bri = (1.0-color_prc)*c1.b + color_prc*c2.b;

            sketch.stroke(hue, sat, bri);
            sketch.line(x,y, x+w, y);
        }

        sketch.pop();


        //put the color mode back
        sketch.colorMode(sketch.RGB, 255);

        //fps test
        sketch.fill(0)
        sketch.text("fps "+sketch.frameRate(), device.offsetWidth-150, device.offsetHeight-40);

        //sketch.pop();
        
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
  
  
  