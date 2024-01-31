const textSpotlight = (sketch) => {

var essays = ["From this quote, code - the language of software - loses its rigidity and luster; it is no longer infallible. Trust in the power of the computer fades. Ultimately, if humans write the code, and humans are prone to error, then the code cannot be perfect. Although this may sound didactic, it is important to articulate in the context of the digitization of archives and development of online libraries. It is easy for researchers or scholars working with archives to assume that the \'computer knows more\'; however, given this is not always true, continuously working towards understanding how algorithms work and improving them is key to developing more robust research output. The task of the coders seems clear, namely to 'work through, understand, and modify the code by reading and playing with it\' — a task that is facilitated by conversations with and feedback from researchers who use such databases (which is why an algorithm can do a lot, even if it doesn\’t in its current state — it has the potential to be improved). Taking a few steps back, however, consciousness about how software works is crucial for the researcher relying on digital research tools. For technical literacy will ensure the researcher does not become subordinate to the software. In other words, acknowledging the agency of the computer, and its limitations, proves crucial in making the most out of it, even if it seems that a seamless experience would be the goal.",
 "Negotiating borders and barriers is an inevitable reality for exiles. Those include language barriers, cultural and religious barriers, country borders, and more. With time, and over generations of exile, some barriers become more prominent than others. Ideally, on the internet, lots of these barriers are meant to be broken: we can access information and connect in many forms to different points all around the world. What this means is that I can have access to my exilic homeland and the people of my exilic homeland can also have access to me via the thoughts and media we can share online. All of this can alleviate the overwhelming feeling of estrangement that is at the center of the exilic experience. However, realistically, while the internet removes many barriers, it still allows many others to exist and even thrive. One important barrier is language as we experience the internet differently depending on the language(s) we operate in. Many diasporic communities no longer operate in their native tongues — at least not online, especially if they speak English, a lingua franca — and thus cannot afford this ease of access to the content and people of their exilic homelands, who still largely operate in their native tongues, and vice versa. Studies have shown that Twitter users largely restrict their interactions to those who speak the same online language as them. Thus, our ideas and thoughts are mostly restricted to those of us who are similarly a part of the diaspora, and how much we actually know about the experiences and thoughts of the people in our exilic homelands is quite limited. Content moderation and recommendation systems are additional examples of barriers that exist in cyberspace. Whether it’s actual human beings as moderators or machine learning algorithms, social media companies seem to have repeatedly failed to appropriately moderate content, while simultaneously not violating people’s democatric rights to speak freely.",
  "We reached out to peers with an outline of an idea and asked them to help us color in the details. We considered Multiplicity a holistic curation from the start, meaning we had general themes and regions to keep in mind, yet left most of it for writers to tell us what mattered to them most. The prompt was relatively broad: how has the internet impacted you growing up, or the societies you grew up in, on a socioeconomic, political, or personal level? The goal was always for our backgrounds, identities, and experiences to inform the topics we discuss, while maintaining a high standard of credibility and research. Growing up online has profoundly impacted our upbringings, morphed our identities, and spearheaded our passions in ways we seldomly acknowledge. And in the spirit of the connectedness, information access, and diversity of the internet, we wanted to contribute to conversations on the internet and society by acknowledging the diversity of our own experiences, and of course, that many do not have internet access at all. As a curation, we wanted to discuss and draft all these articles simultaneously, before any of them went live, and have them benefit and grow from each other. Topics like exile, injustice, surveillance, and climate change meant we were discussing a lot of overwhelming problems. As necessary as these problems are to tackle and learn about, more problems often feels like the last thing we need in 2020. We thus decided to adopt a critical yet forward-looking perspective, rather than a technophobic, utopic, or counter-productive one, by trying to discuss solutions and ways forward without trivializing complex issues.",
     "It’s important to acknowledge that this may not just be a product of the internet, but also a capitalist consumer culture, driven by personalized ads and marketing campaigns at every corner of the web. This evolving relationship with fandom can be best understood by drawing parallels to broader analysis on fandoms, including those of TV and film media. Varsity writer Siyang Wei drew on Mark Duffet’s 'Understanding Fandoms' to explain that while highly dedicated fans were previously seen as a niche subset, they now present a \'central mode of consumption.\' Media and advertising agencies recognized fans’ potential to bolster sales and exposure through social media and decided it was an asset to marketing campaigns. Media Studies Professor Abigail De Kosnik argues that the internet economy now depends on \'free labor\' — the amount of coverage and commentary provided by fans often far outweighs that which paid laborers are capable of producing. Keidra Chaney linked fandom’s role in marketing campaigns to its relationship to highly commodified rankings such as sales, box office, and polls. In music, this influence is undeniable, with fans often leaping to help their favorite artists rise on the Billboard and streaming charts. Many viral tweets are now followed with “stream [name of artist]” replies, a signal of both the user’s love of an artist and an attempt to help often very mainstream artists rise up the streaming charts. This has been amplified by social media’s influence on music charts, most recently including TikTok, which is also further explored in Youssef Azzam’s article. Observing the relationship between fandom and commercialization isn’t to disregard it as a marketing ploy or undermine those who try to support their favorite artists on the internet, but to better understand the nuances of online fandoms and subcultures."];


var start = 0;

var text_x = 5;

const spots = [];

var bgColor;
var color;

var angle = 0;

var essay;

sketch.setup = () => {

  essay = sketch.random(essays);

  var deviceScreen = document.getElementById("device-screen");
  var canvas = sketch.createCanvas(deviceScreen.offsetWidth, deviceScreen.offsetHeight);
 
  canvas.addClass("p5-content");
  canvas.addClass("textSpotlight");

  sketch.noStroke();


  for(let i = 0; i<20;i++) {
    let s = new Spotlight();
    spots.push(s);
  }

}


sketch.draw = () => {

  sketch.setColor();

  sketch.background(bgColor);

  sketch.fill(color);



for (let i =0;i<spots.length;i++) {
  spots[i].update();
  spots[i].show();
}
  sketch.noStroke();
  // console.log(circle.x); 

  // sketch.circle(init_x,init_y,radius);
  // sketch.circle(init_x2,init_y2,250);


  sketch.fill(bgColor);

  sketch.textSize(20);
  sketch.textStyle(sketch.BOLDITALIC);

  sketch.rotate(sketch.sin(angle)*.1);

  for(var i =0;i<essay.length; i= i+40){
    sketch.text(essay.substring(start,i),text_x,i*.6);
   start = i;
  }

angle+=.05;

// if (Math.abs(text_x) < device.offsetWidth / 2) {
//   text_x+= 1;
// }

}

class Spotlight {
  constructor() {
    this.x = sketch.random(0, device.offsetWidth);
    this.y = sketch.random(0,device.offsetHeight);

    switch(sketch.userSpeed) {
    case "slow":
        this.x_speed = sketch.random(-3,3);
        this.y_speed = sketch.random(-3,3);
        break;

    case "medium":
        this.x_speed = sketch.random(-4,4);
        this.y_speed = sketch.random(-4,4);
        break;

    case "fast":
        this.x_speed = sketch.random(-5,5);
        this.y_speed = sketch.random(-5,5);
        break;
    default:
      this.x_speed = sketch.random(-4,4);
        this.y_speed = sketch.random(-4,4);
        break;
    }



    this.radius = sketch.random(10,100);
  }

  update() {
    if(this.x > this.radius/2 && this.x <= device.offsetWidth - this.radius/2) {
          this.x += this.x_speed;
    }

    if(this.x > device.offsetWidth - this.radius / 2) {
      this.x -= 10;
      this.x_speed *= -1;
    }

    if(this.x < this.radius/2) {
      this.x += 10;
      this.x_speed *= -1;
    }

    if(this.y > this.radius/2 && this.y <= device.offsetHeight - this.radius/2) {
          this.y += this.y_speed;
    }

    if(this.y > device.offsetHeight - this.radius / 2) {
      this.y -= 10;
      this.y_speed *= -1;
    }

    if(this.y < this.radius/2) {
      this.y += 10;
      this.y_speed *= -1;
    }



  }
  show() {

    switch(sketch.userShape) {
    case "circle":
      sketch.circle(this.x,this.y,this.radius);
      break;

    case "triangle":
      sketch.triangle(this.x, this.y, (this.x+this.radius), (this.y-this.radius*2),this.x+this.radius*2, this.y);
      break;

    case "square":
     sketch.square(this.x,this.y,this.radius);
     break;
    }


  }

}

    sketch.setColor = () => {
        
        if (sketch.userColor == "red"){
            color = "#EE4813";
            bgColor = "darkred";
        }
        else if (sketch.userColor == "blue"){
            bgColor = "#2251F8";
            color = 'darkblue';
        }
        else if (sketch.userColor == "green"){
            color = "#20E864";
            bgColor = 'darkgreen';
        }
    }



// make a class for the spotlights??


sketch.setDraw = (shouldDraw) =>{
        if (shouldDraw && !sketch.isLooping()){
            sketch.loop();
        }
        else if (!shouldDraw && sketch.isLooping()){
            sketch.noLoop();
        }
    }

};