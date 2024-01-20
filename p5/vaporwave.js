const vaporwave = ( sketch ) => {

    var index = 0;
    var bgColor;
    var color;

    sketch.setup = () => {
        var deviceScreen = document.getElementById("device-screen");
        var canvas = sketch.createCanvas(deviceScreen.offsetWidth, deviceScreen.offsetHeight);
        canvas.addClass("p5-content");
        canvas.addClass("vaporwave");
    
        sketch.smooth();
        sketch.noStroke();
    };

    let time = 0;
    sketch.draw = () => {

        sketch.colorMode(sketch.HSB, 360, 100, 100);


        time += (sketch.deltaTime / 1000) * sketch.userSpeedF;




        let bg_c1 = {
            h: 187,
            s: 64,
            b: 100
        }

        let bg_c2 = {
            h: 275,
            s: 96,
            b: 31
        }

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

        let lines_color = "#f4ff61";

        sketch.userColor = "green"

        if (sketch.userColor == "red"){
            bg_c1.h = 0;
            bg_c2.h = 50;
            
            c1.h = 10;
            c2.h = 80;

            lines_color = "#68ff61";
        }
        else if (sketch.userColor == "blue"){
            bg_c1.h = 187;
            bg_c2.h = 275;
            
            c1.h = 275;
            c2.h = 337;

            lines_color = "#f4ff61";
        }
        else if (sketch.userColor == "green"){
            bg_c1.h = 100;
            bg_c2.h = 165;
            
            c1.h = 28;
            c2.h = 69;

            lines_color = "#ff8661";
        }


        //draw the bg
        let bg_step = 3;
        sketch.strokeWeight(bg_step);

        for (let y=0; y<device.offsetHeight; y+=bg_step){

            let prc = y / device.offsetHeight;

            

            let color_angle = prc * Math.PI * 1 - time * 0.5;
            let color_prc = 0.5 + Math.sin(color_angle) * 0.5;
            let hue = (1.0-color_prc)*bg_c1.h + color_prc*bg_c2.h;
            let sat = (1.0-color_prc)*bg_c1.s + color_prc*bg_c2.s;
            let bri = (1.0-color_prc)*bg_c1.b + color_prc*bg_c2.b;

            sketch.stroke(hue%360, sat, bri);

            sketch.line(0,y, device.offsetWidth, y);
        }

        
        //grid
        sketch.strokeWeight(1);


        sketch.stroke(lines_color);

        let grid_size = device.offsetHeight * 0.07;

        let y_padding = device.offsetHeight * 0.15;
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

        grid_size = device.offsetHeight * 0.15;
        for (let x=start_x; x<=end_x; x+=grid_size){

            let prc = sketch.map(x, start_x,end_x, -1,1);
            let sign = Math.sign(prc);
            prc = Math.pow( Math.abs(prc), 1.5) * sign;

            let top_x = sketch.map(prc, -1, 1, start_x, end_x);

            sketch.line(top_x, y_padding, x, device.offsetHeight);
        }
       

        //draw a shape

        sketch.push();
        sketch.translate(device.offsetWidth/2, device.offsetHeight/2);
        let step = 2;
        sketch.strokeWeight(1.5);


        let height = device.offsetWidth * 0.8;
       

        if (sketch.userShape == "square"){
            height *= 0.8;
        }
        if (sketch.userShape == "circle"){
            height *= 0.9;
        }


        let start_y = -height/2;



        for (let i=0; i<height; i+=step){
            

            let prc = i / height;
            let color_angle = prc * Math.PI * 2 + time * 2;
            let color_prc = 0.5 + Math.sin(color_angle) * 0.5;

            let hue = (1.0-color_prc)*c1.h + color_prc*c2.h;
            let sat = (1.0-color_prc)*c1.s + color_prc*c2.s;
            let bri = (1.0-color_prc)*c1.b + color_prc*c2.b;

            sketch.stroke(hue, sat, bri);

            let y = start_y + i;
            let  w;

            //circle
            if (sketch.userShape == "circle"){
                
                //thanks https://stackoverflow.com/questions/34185725/how-do-you-find-the-width-of-a-circle-from-any-given-y-position
                let radius = height/2;

                //dist from the center Y
                let relative_y = Math.abs(sketch.map(prc, 0, 1, -height/2, height/2));
                let sq_width = radius*radius - relative_y*relative_y;
                w =  Math.sqrt( radius*radius - relative_y*relative_y ) * 2;
            }
            //square
            else if (sketch.userShape == "square"){
                w = height;
            }

            //triangle
            else{
                //let line_angle = prc * Math.PI * 2 + time * 2;
                w = i;
            }
            
            let x = -w/2;
            sketch.line(x,y, x+w, y);
        }

        sketch.pop();


        //put the color mode back
        sketch.colorMode(sketch.RGB, 255);

        //fps test
        sketch.fill(0)
        // sketch.text("fps "+sketch.frameRate(), device.offsetWidth-150, device.offsetHeight-40);

        //sketch.pop();
        
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
  
  
  