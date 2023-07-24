const testTemplate = ( sketch ) => {
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

        var size;
        if (sketch.userSize == "small"){
            size = 10;
        }
        else if (sketch.userSize == "medium"){
            size = 50;
        }
        else{
            size = 100;
        }

        if (sketch.userShape == "square"){
            sketch.square(device.offsetWidth / 2, device.offsetHeight / 2, size);
        }
        else if (sketch.userShape == "circle"){
            sketch.circle(device.offsetWidth / 2, device.offsetHeight / 2, size);
        }
        else{
            sketch.triangle(device.offsetWidth / 2, device.offsetHeight / 2, device.offsetWidth / 2 - size / 2, device.offsetHeight / 2 + size, device.offsetWidth / 2 + size / 2, device.offsetHeight / 2 + size);
        }
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
  
  
  