const emojiTemplate = ( sketch ) => {
    var bgColor;
    var color;

    

    let characters = [];

    let grow_time = 4.0;
    let spacing = 0.5;

    //let timer = 0;

    sketch.setup = () => {
        var canvas = sketch.createCanvas(device.offsetWidth, device.offsetHeight);
        canvas.addClass("p5-content");
    
        sketch.smooth();
        sketch.noStroke();   
        
        for (let i=0; i<10; i++){
            characters.push({
                emoji : "😅",
                x : device.offsetWidth/2,
                y : device.offsetHeight/2,
                timer : i * spacing,
                order : i
            })
        }

        characters[0].emoji = "😀"
        characters[1].emoji = "💩"
        characters[2].emoji = "😈"
        characters[3].emoji = "😻"
        characters[4].emoji = "🤡"
        characters[5].emoji = "🤮"
        characters[6].emoji = "😇"
        characters[7].emoji = "🤬"
        characters[8].emoji = "🤖"
        characters[9].emoji = "😱"

        
        
      };

    sketch.draw = () => {
        sketch.setColor();
        sketch.background(bgColor);
        sketch.fill(color);


        let total_time = spacing * characters.length;

        let sketch_time = (sketch.millis() / 1000.0);

        //update them
        for (let i=0; i<characters.length; i++){
            characters[i].timer = ( sketch_time + characters[i].order * spacing) % total_time;

            // characters[i].timer += sketch.deltaTime / 1000.0;
            // if (characters[i].timer > total_time)   characters[i].timer -= total_time;
        }

        
        //sort them so larger ones are in the back- this is not the most efficient way of doing this
        characters.sort((a,b) => b.timer - a.timer);

        //draw them
        for (let i=0; i<characters.length; i++){

            if (characters[i].timer < grow_time){
                let prc = characters[i].timer / grow_time;

                let curve_prc = Math.pow(prc, 1);
                let scale = prc * 200;

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
        }

        sketch.fill(0)
        sketch.text("fps "+sketch.frameRate(), device.offsetWidth-150, device.offsetHeight-40);
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
    }
  };
  
  
  