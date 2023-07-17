const heartContent = ( sketch ) => {
  sketch.setup = () => {
    var canvas = sketch.createCanvas(device.offsetWidth, device.offsetHeight);
    canvas.addClass("p5-content");

    sketch.smooth();
    sketch.noStroke();
    sketch.fill(sketch.random(255), sketch.random(255), sketch.random(255));
  };

  let h = 0;

  sketch.draw = () => {
    heart(device.offsetWidth / 2, 100, h);
    if (h > 50 * sketch.heartSize){
      h = 0;
      sketch.fill(sketch.random(255), sketch.random(255), sketch.random(255));
    }
    else {
      h += 3;
    }
  };

  function heart(x, y, size) {
    sketch.beginShape();
    sketch.vertex(x, y);
    sketch.bezierVertex(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size);
    sketch.bezierVertex(x + size, y + size / 3, x + size / 2, y - size / 2, x, y);
    sketch.endShape(sketch.CLOSE);
  }
};


