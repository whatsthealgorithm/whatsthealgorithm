const textPop = ( sketch ) => {

    var index = 0;
    var bgColor;
    var color;

    var words = [];

    sketch.setup = () => {
      var canvas = sketch.createCanvas(device.offsetWidth, device.offsetHeight);
      canvas.addClass("p5-content");
  
      sketch.smooth();
      sketch.noStroke(); 
      
    };

    sketch.reset = () =>{
        //do whatever you want with this raw text!

        //let raw_text = ["give", "me", "some", "pizza"];
        let raw_text = ["can","I", "pet", "your", "dog?"];

        words = [];

        let x_wander = device.offsetWidth * 0.22;

        for (let i=0; i<raw_text.length; i++){
            words.push({
                word : raw_text[i],
                x : device.offsetWidth/2 + sketch.random(-x_wander,x_wander) ,
                y : (device.offsetHeight/(raw_text.length+1)) * (i+1),
                wiggle_speed : 1,
                timer : -i * 0.5
            })
        }
    }

    sketch.draw = () => {

        // console.log("color: "+sketch.userColor);
        // console.log("shape: "+sketch.userShape);
        // console.log("speed: "+sketch.userSpeed);

        //do initial setup
        if(words.length == 0){
            sketch.reset();
            console.log(device.offsetWidth +" , "+device.offsetHeight);
        }
        
        sketch.setColor();
        // sketch.background(bgColor);
        // sketch.fill(color);

        

        let time = sketch.millis() / 1000.0;
        time *= sketch.userSpeedF;
        let delta_time = sketch.deltaTime / 1000.0;
        delta_time *= sketch.userSpeedF;

        //background
        sketch.background(255);

        //shape grid
        let bg_spacing = device.offsetWidth * 0.1;
        let bg_period = 2;

        let bg_off_x = bg_spacing * ( (time * bg_period) % 1);
        let bg_off_y = Math.sin(time) * bg_spacing * 2;

        sketch.fill(color);

        let cols = 0;
        for(let x=-bg_spacing-bg_off_x; x<device.offsetWidth+bg_spacing; x+=bg_spacing){
            cols++;
            for(let y=-bg_spacing*2-bg_off_y; y<device.offsetHeight+bg_spacing*2; y+=bg_spacing){

                if (sketch.userShape == "square"){
                    sketch.push();
                    sketch.translate(x,y);
                    sketch.rotate(x/30 + y/30)
                    let size = bg_spacing/2
                    sketch.square(-size/2,-size/2, size);
                    sketch.pop();
                }
                else if (sketch.userShape == "circle"){
                    let size =  bg_spacing/2 + Math.sin(x/30 + y/30) * 2;
                    sketch.circle(x,y, size);
                }
                else{
                    let ts = bg_spacing*0.5;
                    sketch.push();
                    sketch.translate(x,y);
                    sketch.rotate(x/30 + y/30)
                    sketch.triangle(ts/2,ts/2, -ts/2,ts/2, 0,-ts/2 );
                    sketch.pop();
                }

            }
        }


        //words
        

        sketch.textAlign(sketch.CENTER, sketch.CENTER);
        sketch.textStyle(sketch.BOLDITALIC);
        sketch.textSize( device.offsetWidth * 0.23 );

        let grow_time = 0.7;
        let pause_time = grow_time+2.5;
        let shrink_time = pause_time + 0.4;

        words.forEach( w => {
            w.timer += delta_time;
            if (w.timer > 0){
                
                let grow_prc = Math.min( w.timer/grow_time, 1);

                if (w.timer > pause_time){
                    grow_prc = sketch.map(w.timer, pause_time, shrink_time, 1, 0, true);
                }

                let scale = grow_prc;
                let angle = Math.cos( w.timer*w.wiggle_speed) * Math.PI * 0.1;

                sketch.push();
                sketch.translate(w.x, w.y);
                sketch.scale(scale);
                sketch.rotate(angle);
                sketch.fill(bgColor);
                sketch.text(w.word, 3,3);
                sketch.fill(0);
                sketch.text(w.word, 0,0);
                sketch.pop();
            }
        })

        //reset when done
        if (words[words.length-1].timer > shrink_time){
            sketch.reset();
        }


        // sketch.fill(0)
        // sketch.textSize(20)
        // sketch.text("fps "+sketch.frameRate(), device.offsetWidth-150, device.offsetHeight-40);

        
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
  
  
  