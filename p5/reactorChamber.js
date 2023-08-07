const reactorChamber = ( sketch ) => {

    var index = 0;
    var bgColor;
    var color;

    sketch.setup = () => {
      var canvas = sketch.createCanvas(device.offsetWidth, device.offsetHeight, sketch.WEBGL);

    //   let fov = 60 / 180 * Math.PI;
    //   sketch.perspective(fov, device.offsetWidth / device.offsetHeight, 0, 500);

      canvas.addClass("p5-content");
  
    //   sketch.smooth();
    //   sketch.noStroke();      

    console.log("device height "+device.offsetHeight)
      
    };

    t=0;

    let scale = 0.5;

    sketch.draw = () => {

        sketch.setColor();
        sketch.background(bgColor);
        sketch.fill(color);

        s=400 * scale

        t-=.004
        //m=sketch.translate
        //x=sketch.rotateX
        w = device.offsetHeight
        let y_spacing = device.offsetHeight / 2.5;

        for(k=-1;k<=1;k+=2){
            sketch.push();
            let y_pos =  y_spacing * k ;//200;  // w-w*k

            sketch.translate(0, y_pos, 60);
            sketch.rotateX(t);
            sketch.sphere(s)
            sketch.randomSeed(0)
            for(i=0;i<150;i++){
                h=sketch.random(120)+sketch.noise(t*6,sketch.random(9))*70
                sketch.push()
                sketch.rotateX(sketch.random(6) )
                sketch.rotateZ(sketch.random(6))
                
                sketch.translate(0,-s)

                if (sketch.userShape == "square"){
                    sketch.box(50,h,50)
                }
                else if (sketch.userShape == "circle"){
                    let sphere_res  = 5;
                    sketch.sphere(h*0.4, sphere_res,sphere_res)
                }
                else{
                    sketch.scale(1,-1);
                    sketch.cone(70, h*1.3);

                }

                

                
                sketch.pop()
            }
            sketch.pop()
        }

        //r=sketch.random
        // for(k=0;k<3;k++){
        //     if (k==1)   continue;
        //     sketch.push();
        //     let y_pos =  -y_spacing + y_spacing * k ;//200;  // w-w*k


        //     sketch.translate(0, y_pos, k==1 ? 140 : 60);
        //     sketch.rotateX(t);
        //     sketch.sphere(s)
        //     sketch.randomSeed(0)
        //     for(i=0;i<s;i++){
        //         h=sketch.random(130* scale)+sketch.noise(t*6,sketch.random(9))*80*scale
        //         sketch.push()
        //         sketch.rotateX(sketch.random(6))
        //         sketch.rotateZ(sketch.random(6))
        //         sketch.translate(0,-s)
        //         sketch.box(50*scale,h,50*scale)
        //         sketch.pop()
        //     }
        //     sketch.pop()
        // }


        //fps test
        // sketch.fill(0)
        // sketch.text("fps "+sketch.frameRate(), device.offsetWidth-150, device.offsetHeight-40);

        
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
  
  
  