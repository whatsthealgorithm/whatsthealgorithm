const emojiBounce = ( sketch ) => {
    var bgColor;
    var color;

    sketch.setup = () => {
        var deviceScreen = document.getElementById("device-screen");
        var canvas = sketch.createCanvas(deviceScreen.offsetWidth, deviceScreen.offsetHeight);
        canvas.addClass("p5-content");
        canvas.addClass("emojiBounce");

        sketch.smooth();
        sketch.noStroke();   
    };

    var objs = [];
    


    sketch.draw = () => {

        let padding = 0;

        let emoji_size = device.offsetWidth * 0.25;

        let speed = device.offsetWidth * 0.66 ;

        let delta_time = sketch.deltaTime / 1000.0;

        //initialize if we're on frame 1
        if (objs.length == 0){
            for (let i=0; i<10; i++){

                let o = {
                    x: sketch.random(-padding, device.offsetWidth+padding),
                    y: sketch.random(-padding, device.offsetWidth+padding),
                    vx: Math.random() < 0.5 ? -1 : 1,
                    vy: Math.random() < 0.5 ? -1 : 1,
                    hit_time : 999
                }

                //make sure the spot is clear
                // let touching = true;
                // while (touching){
                //     touching = false;
                //     for (let k=0; k<objs.length; k++){
                //         if(sketch.is_touching(o, objs[k])){
                //             touching = true;
                //             console.log("NO FUCK")
                //             break;
                //         }
                //     }
                // }
                

                objs.push(o);
            }

        }

        //background etc
        sketch.setColor();
        sketch.background(bgColor);
        sketch.fill(color);


        sketch.textAlign(sketch.CENTER,sketch.CENTER);
        sketch.textSize(emoji_size);

        //draw and update
        //objs.forEach( o => {
        for (let i=0; i<objs.length; i++){
            let o = objs[i];

            o.hit_time ++;

            //update
            o.x += o.vx * speed * delta_time * sketch.userSpeedF;
            o.y += o.vy * speed * delta_time * sketch.userSpeedF;

            //bounce on walls
            if (o.x < -padding)                     o.vx = 1;
            if (o.x > device.offsetWidth + padding) o.vx = -1;
            if (o.y < -padding)                     o.vy = 1;
            if (o.y > device.offsetHeight+ padding) o.vy = -1;

            //bounce on others
            for (let k=0; k<i; k++){
                let other = objs[k];
                if (sketch.is_touching(o, other, emoji_size)){

                    let x_dist = o.x - other.x;
                    let y_dist = o.y - other.y;

                    if (Math.abs(x_dist) > Math.abs(y_dist) ){
                        o.vx *= -1;
                        other.vx *= -1;
                    }
                    else{
                        o.vy *= -1;
                        other.vy *= -1;
                    }
                    
                    o.hit_time = 0;
                    other.hit_time = 0;
                }
            }
            

            //draw
            let emoji = "😀";
            if (o.hit_time < 4){
                emoji = "😵";
            }
            sketch.text(emoji, o.x, o.y);
        }
    };

    sketch.is_touching = (a, b, size) => {
        let dist = sketch.dist(a.x, a.y, b.x, b.y);
        return dist < size ;
    }


    sketch.setDraw = (shouldDraw) =>{
        if (shouldDraw && !sketch.isLooping()){
            sketch.loop();
        }
        else if (!shouldDraw && sketch.isLooping()){
            sketch.noLoop();
        }
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
  };
  
  
  