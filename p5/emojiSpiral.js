const emojiSpiral = ( sketch ) => {
    var bgColor;
    var color;

    let characters = [];

    let grow_time = 4.0;

    //changed from 0.5 to 1.3
    let spacing = 1.3;

    let timer = 0;

    sketch.setup = () => {
        var deviceScreen = document.getElementById("device-screen");
        var canvas = sketch.createCanvas(deviceScreen.offsetWidth, deviceScreen.offsetHeight);
        canvas.addClass("p5-content");
        canvas.addClass("emojiSpiral");
    
        sketch.smooth();
        sketch.noStroke();   
        
        timer = spacing;
      };

    sketch.draw = () => {

        //generic emoji choices
        emoji_choices = ["😀","💩","😈","😻","🤡","🤮","😇","🤬",,"😱"];

        //emojis tailerd to color
        if (sketch.userColor == "red"){
            emoji_choices = ["🥵","🍒","🍓","🍄","🥀","🍷","🔥","❤️","👺","🌶️","😡","😍"];
        }
        else if (sketch.userColor == "blue"){
            emoji_choices = ["🧊","💧","🐬","🥶","🐟","💎","💙","😨","😱","🤖"]
        }
        else if (sketch.userColor == "green"){
            emoji_choices = ["🤢","🥎","🎾"," 🥝","🍏","🌳","🦜","🐸","💚","🐲"]
        }
        else if (sketch.userColor == "yellow"){
            emoji_choices = ["🌻","🍋","⭐","🍯","🌕","🍌","🔔","🐥","😀","😸"]
        }

        let delta_t = sketch.deltaTime / 1000.0;
        delta_t *= sketch.userSpeedF
        timer += delta_t;

        if (timer >= spacing){
            //create a new character
            let emoji = sketch.random(emoji_choices);
            characters.push({
                emoji : emoji,
                x : device.offsetWidth/2,
                y : device.offsetHeight/2,
                timer : 0
            })

            //reset timer
            timer -= spacing;
        }

        //update and draw
        for (let i=0; i<characters.length; i++){
            characters[i].timer += delta_t;

            let prc = characters[i].timer / grow_time;

            let curve_prc = Math.pow(prc, 1);
            let scale = prc * device.offsetWidth * 0.45;

            let angle = prc * -Math.PI;// - sketch_time / 5;

            let dist = prc * 500;
            let x = Math.cos(angle) * dist;
            let y = Math.sin(angle) * dist + 100;

            sketch.push();
            sketch.translate(device.offsetWidth/2 + x, device.offsetHeight/2 + y);
            sketch.scale(scale,scale);
            sketch.rotate(angle);
            sketch.textAlign(sketch.CENTER, sketch.CENTER);
            sketch.text(characters[i].emoji, 0,0);
            sketch.pop();
            
        }

        //if it is time to kill our oldest, do that
        if (characters[0].timer > grow_time){
            characters.shift();
        }

        //fps test
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
    
  };
  
  
  