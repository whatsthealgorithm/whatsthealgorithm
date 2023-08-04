const andyTemplate = ( sketch ) => {
    var bgColor;
    var color;

    

    sketch.setup = () => {
      var canvas = sketch.createCanvas(device.offsetWidth, device.offsetHeight);
      canvas.addClass("p5-content");
  
      sketch.smooth();
      sketch.noStroke();      
      
    };

    var t=0
    sketch.draw = () => {
        sketch.setColor();
        sketch.background(bgColor);
        sketch.fill(color);


        t+=.003
        let shapes_per_row = 50;
        //t = sketch.millis / 1000.0;
        let w = device.offsetWidth;
        let h = device.offsetHeight;
        for(d=15;d<530/2;d*=1.1){
            for(i=0;i<shapes_per_row;i++){
                a=t+sketch.TAU/shapes_per_row*i+d/(900+sketch.sin(t*4)*300) 
                x=sketch.quick_map(a)*d
                y=sketch.quick_map(a+sketch.PI/2)*d
                s=2+d/20+(sketch.abs(x)-sketch.abs(y))/20
                //sketch.fill(0)
                sketch.rect(w/2+x,h/2+y,s,s)
            }
        }

        sketch.fill(0)
        sketch.text("fps "+sketch.frameRate(), w-150, device.offsetHeight-40);
    };


    sketch.quick_map = (n) => {
        return sketch.map(sketch.sin(n),-.5,.5,-1,1,1);
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
  
  
  