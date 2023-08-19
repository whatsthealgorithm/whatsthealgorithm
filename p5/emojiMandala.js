const emojiMandala = ( sketch ) => {
    var bgColor;
    var color;

    

    sketch.setup = () => {
        var canvas = sketch.createCanvas(device.offsetWidth, device.offsetHeight);
        canvas.addClass("p5-content");
    
        sketch.smooth();
        sketch.noStroke();   

        
      };

    sketch.draw = () => {

        sketch.background(255);

        let emoji_size = device.offsetHeight * 0.15;
        sketch.textAlign(sketch.CENTER,sketch.CENTER);
        sketch.textSize(emoji_size);



        let time = sketch.millis() / 1000;
        time *= sketch.userSpeedF;

        //moving the whole thing to the center of the screen
        sketch.push();
        sketch.translate( device.offsetWidth/2, device.offsetHeight/2);

        let num_depth = 5;

        let end_dist = device.offsetHeight * 0.5;

        let start_num = 4;
        let end_num = 20;

        

        for (let d=0; d<num_depth; d++){
            let d_prc = d / (num_depth-1);

            let dist = d_prc * end_dist;

            let diam = Math.PI * 2 * dist;
            let num_emoji = Math.floor( diam / (emoji_size * 0.75) );
            if (num_emoji % 2 == 1) num_emoji--;    //make it even
            if (d==0)   num_emoji = 1;

            let slide_angle = time * 0.5 * (d%2==0 ? 1 : -1);

            for (let i=0; i<num_emoji; i++){
                let prc = i / num_emoji;

                let angle = Math.PI * 2 * prc + slide_angle;

                let x = Math.cos(angle) * dist;
                let y = Math.sin(angle) * dist;
                
                let scale = 0.75 + Math.sin(time*2 + d*Math.PI ) * 0.1;

                let emojis = ["😀", "😎"];
                if (sketch.userColor == "red"){
                    emojis = ["😡", "😍"];
                }
                else if (sketch.userColor == "blue"){
                    emojis = ["😨", "🥶"];
                }
                else if (sketch.userColor == "green"){
                    emojis = ["🤮", "🤢"];
                }

                let emoji = emojis[i%2];

                sketch.push();

                sketch.translate(x,y);
                //sketch.rotate(angle + Math.PI/2);

                sketch.scale(scale);

                sketch.text(emoji, 0,0);

                sketch.pop();

            }



        }



        //closing the initial push
        sketch.pop();



        sketch.fill(0)
        sketch.textSize(20)
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
  };
  
  
  