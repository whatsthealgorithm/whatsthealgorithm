const emojiGrid = ( sketch ) => {
    var bgColor;
    var color;

    

    sketch.setup = () => {
        var canvas = sketch.createCanvas(device.offsetWidth, device.offsetHeight);
        canvas.addClass("p5-content");
    
        sketch.smooth();
        sketch.noStroke();   

        
      };

    sketch.draw = () => {

        sketch.setColor();
        sketch.background(bgColor);
        sketch.fill(color);

        let spacing = 40;


        sketch.textAlign(sketch.CENTER,sketch.CENTER);
        sketch.textSize(40);

        let time = sketch.millis() / 1000;

        let period_length = 2.0;
        let period = time % period_length;
        let num_periods = Math.floor( time/period_length );

        // if (num_periods < 10){
        //     console.log(num_periods +" : "+period);
        // }

        let prc = period / period_length;

        let noise_zoom = 0.007;
        let noise_speed = 0.4;

        

        let offset = prc * spacing;
        sketch.push();
        sketch.translate(-offset, -offset);

        for (let x=-spacing; x<=device.offsetWidth+spacing; x+=spacing){
            for (let y=-spacing; y<=device.offsetHeight+spacing; y+=spacing){

                let noise_x =  x + spacing * num_periods;
                let noise_y =  y + spacing * num_periods;
                let noise_val = sketch.noise(noise_x*noise_zoom, noise_y*noise_zoom, noise_speed*time);

                //noise_val = 0;

                let emoji = "😨";
                if (noise_val > 0.25)   emoji = "😀";
                if (noise_val > 0.5)    emoji = "😍";
                if (noise_val > 0.7)    emoji = "🥵";


                sketch.text(emoji, x, y);
            }
        }

        sketch.pop();



        sketch.fill(0)
        sketch.text("fps "+sketch.frameRate(), device.offsetWidth-150, device.offsetHeight-40);
    };


    sketch.setDraw = (shouldDraw) =>{
        if (shouldDraw && !sketch.isLooping()){
            sketch.loop();
        }
        else if (!shouldDraw && sketch.isLooping()){
            sketch.noLoop();
        }
    }

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
    }
  };
  
  
  