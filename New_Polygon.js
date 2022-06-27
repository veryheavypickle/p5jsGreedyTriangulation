let colourScheme = [];
let currentColourScheme;
let barHeight;
let polygon;

/*
To do list
 
 get triangulation method to work
 
 impliment hand tracking thing as it does not play well with
 javascript, but this program does not play well with python
 
 for hand gestures mousclicked is recognised when index and
 thumb are within the area of barHeight (so a 20 x 20px square)
 
 mouse is recognised as index finger
 
 */

function setup() {
  createCanvas(windowWidth, windowHeight);
  setDefaults();
  polygon = new Aplication(new PolygonApp(), 0);
  pythonLoad();
}

function setDefaults() {
  //0: Highlight Colour, 1: Background Colour, 2: UI Colour, 3: Shape Colour, 4: Text/Point Colour
  append(colourScheme, ["#2a9d8f", "#e9c46a", "#f4a261", "#e76f51", "#000000"]);
  append(colourScheme, ["#ffb4a2", "#e5989b", "#b5838d", "#6d6875", "#000000"]);
  append(colourScheme, ["#d6306a", "#272c3a", "#343c49", "#424d61", "#c7dbf3"]);
  currentColourScheme = 2;
  barHeight = 20; //in pixels - this is literally used by everything
}


function draw() {
  background(colourScheme[currentColourScheme][1]);
  polygon.display();

  //cursor
  fill(colourScheme[currentColourScheme][0]);
  noCursor();
  ellipse(mouseX, mouseY, barHeight, barHeight);
}

function pythonLoad() {
  //ajax stuff
}

function areCoordsInside(x, y, posX, posY, widthX, widthY) {
  if (x > posX && x < posX + widthX && y > posY && y < posY + widthY) {
    return true;
  } else {
    return false;
  }
}

function changeColourScheme() {
  //this increments the colourscheme by 1.
  let i = currentColourScheme;
  i++;
  if (i > colourScheme.length - 1) {
    i = 0;
  }
  currentColourScheme = i;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  polygon.windowHasBeenResized();
}

function mousePressed() {
  polygon.mouseHasBeenPressed(mouseX, mouseY);
}

function mouseMoved() {
  polygon.mouseHasBeenMoved(mouseX, mouseY);
}

function mouseDragged() {
  polygon.mouseHasBeenDragged(mouseX, mouseY);
}

function mouseReleased() {
  polygon.mouseHasBeenReleased(mouseX, mouseY);
}

class Button {
  constructor(id, x, y, n, m, r) {
    this.ID = id;
    this.posX = x;
    this.posY = y;
    this.title = n;
    this.buttonHeight = barHeight;
    this.mode = m;  //this is the align mode - CENTER, CORNER etc
    this.textSize = barHeight/2;
    this.setButtonWidthAsTitle();
    this.fillColour = colourScheme[currentColourScheme][3];
    this.rounding = r;
    this.textX = x;
    this.textY = y;  //text posX and y;
    this.setupPositions();
  }

  display() {
    rectMode(this.mode);
    noStroke();
    fill(this.fillColour);
    rect(this.posX, this.posY, this.buttonWidth, this.buttonHeight, this.rounding);
    fill(colourScheme[currentColourScheme][4]);
    textAlign(CENTER, CENTER);
    textSize(this.textSize);
    text(this.title, this.textX, this.textY);
  }

  setupPositions() {
    if (this.mode == CORNER) {
      this.textX = this.posX + this.buttonWidth/2;
      this.textY = this.posY + this.buttonHeight/2;
    } else {
      this.textX = this.posX;
      this.textY = this.posY;
    }
  }

  getCoordsInside(x, y) {	//this is inefficient since it is called everytime mouse is moved
    if (this.mode == CENTER) {
      if (areCoordsInside(x, y, this.posX - this.buttonWidth/2, this.posY - this.buttonHeight/2, this.buttonWidth, this.buttonHeight)) {
        return true;
      } else {
        return false;
      }
    } else {
      if (areCoordsInside(x, y, this.posX, this.posY, this.buttonWidth, this.buttonHeight)) {
        return true;
      } else {
        return false;
      }
    }
  }

  mouseHasBeenPressed(x, y) {
    if (this.getCoordsInside(x, y)) {
      return [true, this.ID];
    } else {
      return [false, this.ID];
    }
  }

  mouseHasBeenMoved(x, y) {
    if (this.getCoordsInside(x, y)) {
      this.fillColour = colourScheme[currentColourScheme][0];
    } else {
      this.fillColour = colourScheme[currentColourScheme][3];
    }
  }

  getButtonWidth() {
    return this.buttonWidth;
  }

  setButtonWidthAsTitle() {
    this.buttonWidth = textWidth(this.title) + barHeight/2;
  }

  setButtonWidth(w) {
    this.buttonWidth = w;
  }

  setButtonHeight(h) {
    this.buttonHeight = h;
  }

  setPosX(x) {
    this.posX = x;
    this.setupPositions();
  }

  setPosY(y) {
    this.posY = y;
    this.setupPositions();
  }

  setFontSize(f) {
    this.textSize = f;
  }

  updateTitle(n) {
    this.title = n;
  }
}

class Application {
  constructor(App, id) {
    this.id = id;
    this.app = App;
    this.buttons = [];
    this.setupButtons();
  }

  display() {
    this.app.display(0, 0);
    for (let i = 0; i < this.buttons.length; i++) {
      this.buttons[i].display();
    }
  }

  setupButtons() {
    let names = this.app.getButtonNames();
    let currentWidth = 0;
    for (let i = 0; i < names.length; i++) {
      this.buttons.push(new Button(names.length, currentWidth, 0, names[i], CORNER, 0));
      currentWidth += this.buttons[i].getButtonWidth();
    }
  }

  getAppName() {
    return this.app.getAppName();
  }

  windowHasBeenResized() {
    this.app.windowHasBeenResized();
  }

  mouseHasBeenPressed(x, y) {
    this.app.mouseHasBeenPressed(x, y);
    for (let i = 0; i < this.buttons.length; i++) {
      if (this.buttons[i].mouseHasBeenPressed(x, y)[0]) {
        this.app.menuButtonPressed(i);
      }
    }
  }

  mouseHasBeenMoved(x, y) {
    this.app.mouseHasBeenMoved(x, y);
    for (let i = 0; i < this.buttons.length; i++) {
      this.buttons[i].mouseHasBeenMoved(x, y);
    }
  }

  mouseHasBeenDragged(x, y) {
    this.app.mouseHasBeenDragged(x, y);
  }

  mouseHasBeenReleased(x, y) {
    this.app.mouseHasBeenReleased(x, y);
  }
}

class PolygonApp {
  /*
References
   https://www.mathsisfun.com/algebra/trig-solving-sss-triangles.html
   https://www.mathsisfun.com/geometry/herons-formula.html
   
   Inspiration
   https://imgur.com/f80NRUP
   */
  constructor() {  //This is an application so some requirements are needed, like name and mouse functions
    this.isDraw = false;
    this.currentPolyCoords = [];
    this.polyPointDiameter = barHeight/4;
    this.beingDragged = [-1, false];  /* -1 is the poly point id from the poly coords list,*/
    this.coloursList = [];  // list of colours
    this.triangles = [];  //in format [[[x1, y1], [x2, y2], [x3, y3]], [[x1, y1], [x2, y2], [x3, y3]]]
    this.resetPolygon();
    this.newColourRandomness = 10;  // the extent of the randomness, reccomended not to go above 255
    this.buttonNames = ["Change Colour Scheme", "Toggle Fullscreen", "Draw Polygon"];
    this.sqrtEquivalentArea = 0;    //square root of the equivalent area
  }

  display() {
    //show EquivalentArea
    rectMode(CENTER);
    fill(colourScheme[currentColourScheme][0]);
    rect(windowWidth/2, windowHeight/2, this.sqrtEquivalentArea, this.sqrtEquivalentArea);
    
    //display currentPolygon
    noStroke();
    beginShape();
    fill(colourScheme[currentColourScheme][3]);
    for (let i = 0; i < this.currentPolyCoords.length; i++) {
      vertex(this.currentPolyCoords[i][0], this.currentPolyCoords[i][1]);
    }
    endShape(CLOSE);

    //display triangles
    for (let i = 0; i < this.triangles.length; i++) {
      fill(this.coloursList[i]);
      triangle(this.triangles[i][0][0], this.triangles[i][0][1], this.triangles[i][1][0], this.triangles[i][1][1], this.triangles[i][2][0], this.triangles[i][2][1]);
    }
    fill(colourScheme[currentColourScheme][4]);
    for (let i = 0; i < this.currentPolyCoords.length; i++) {
      ellipse(this.currentPolyCoords[i][0], this.currentPolyCoords[i][1], this.polyPointDiameter, this.polyPointDiameter);
    }
    for (let i = 0; i < this.triangles.length; i ++) {    //if there are triangles
      ellipse(this.triangles[i][0][0], this.triangles[i][0][1], this.polyPointDiameter, this.polyPointDiameter);
      ellipse(this.triangles[i][1][0], this.triangles[i][1][1], this.polyPointDiameter, this.polyPointDiameter);
      ellipse(this.triangles[i][2][0], this.triangles[i][2][1], this.polyPointDiameter, this.polyPointDiameter);
    }
  }

  triangulation(polygon) {
    //polygon is coordinate array with format [x1, y1], [x2, y2] 

    //current method
    /*
     if polygon has 3 coords
     then new triangle is polygon
     if polygon has more than 3 coords
     then pick a random point polygon(randomPoint1)
     pick a second random point that is not adjacent to the first one polygon(randomPoint2)
     new triangle is polygon(randomPoint1), polygon(randomPoint2), polygon(randomPoint2 - 1)
     */

    if (polygon.length == 3) {  //then polygon has been fully triangulated
      append(this.triangles, polygon);
      append(this.coloursList, this.newColour(colourScheme[currentColourScheme][3]));
    } else if (polygon.length > 3) {
      let rP1 = int(random(0, polygon.length));
      let rP2 = rP1;
      let P3;
      let rP2cantBe = [];
      if (rP1 == polygon.length) {
        rP2cantBe = [rP1 - 1, rP1, 0];
      } else if (rP1 == 0) {
        rP2cantBe = [polygon.length, rP1, rP1 + 1];
      } else {
        rP2cantBe = [rP1 - 1, rP1, rP1 + 1];
      }
      while (rP2cantBe.includes(rP2)) {
        rP2 = int(random(0, polygon.length));
      }

      if (rP2 == 0) {
        P3 = polygon.length - 1;
      } else {
        P3 = rP2 - 1;
      }
      append(this.triangles, [polygon[rP1], polygon[rP2], polygon[P3]]);  //add new triangle
      append(this.coloursList, this.newColour(colourScheme[currentColourScheme][3]));
      //as polygon is split into two, you need to triangulate each new polygon
      let newPoly1 = [];
      let newPoly2 = [];
      if (P3 < rP1) {
        newPoly1 = polygon.slice(rP2, rP1 + 1);
        newPoly2 = polygon.slice(rP1).concat(polygon.slice(0, P3 + 1));
      } else {  // p3 is bigger
        newPoly1 = polygon.slice(rP1, P3 + 1);
        newPoly2 = polygon.slice(rP2).concat(polygon.slice(0, rP1 + 1));
      }
      this.triangulation(newPoly1);
      this.triangulation(newPoly2);
    }

    return [];
  }

  pythagoras(pos1, pos2) {
    //pos1 and pos2 in format pos1 = [x1, y1], pos2 = [x2, y2]
    return sqrt(sq(pos1[0] - pos2[0]) + sq(pos1[1] - pos2[1]));
  }

  angle(posA, posB, posC) {
    //length a is obosite angle A, so forth so on...
    let a = this.pythagoras(posB, posC);
    let b = this.pythagoras(posA, posC);
    let c = this.pythagoras(posA, posB);
    angleMode(DEGREES);
    return acos((sq(c) + sq(a) - sq(b))/(2 * c * a));
  }

  area(posA, posB, posC) {
    //length a is obosite angle A, so forth so on...
    let a = this.pythagoras(posB, posC);
    let b = this.pythagoras(posA, posC);
    let c = this.pythagoras(posA, posB);
    let s = (a + b + c)/2;  // half of perimeter
    return sqrt(s * (s - a) * (s - b) * (s - c));
  }

  toggleDraw() {
    if (this.isDraw) {
      this.isDraw = false;
      this.currentPolyCoords = this.triangulation(this.currentPolyCoords);
      this.calculateEquivalentArea(this.triangles);
    } else {
      this.isDraw = true;
      this.resetPolygon();
    }
  }

  calculateEquivalentArea(triangles) {
    let currentArea = 0;
    for (let i = 0; i < triangles.length; i++) {
      currentArea += this.area(this.triangles[i][0], this.triangles[i][1], this.triangles[i][2]);
    }
    this.sqrtEquivalentArea = sqrt(currentArea);
  }

  newColour(colour) {
    let hex = colour;  // the colour every new colour is based on. in #FFFFFF format
    let rgb = [0, 0, 0];
    // takes hex "aaaaaa" and creates a new colour similar to it
    rgb[0] = unhex(hex.slice(1, 3));
    rgb[1] = unhex(hex.slice(3, 5));
    rgb[2] = unhex(hex.slice(5, 7));
    rgb[0] = constrain(rgb[0] + random(-this.newColourRandomness, this.newColourRandomness), 0, 255);
    rgb[1] = constrain(rgb[1] + random(-this.newColourRandomness, this.newColourRandomness), 0, 255);
    rgb[2] = constrain(rgb[2] + random(-this.newColourRandomness, this.newColourRandomness), 0, 255);

    return color(rgb[0], rgb[1], rgb[2]);
  }

  resetPolygon() {
    this.currentPolyCoords = [];  //reset polygon
    this.coloursList = [this.newColour(colourScheme[currentColourScheme][3])];    // add first colour to list
    this.triangles = [];
  }

  //Application Specific Functions

  menuButtonPressed(id) {
    //this runs a function based on which menu button was pressed, id is of type int
    if (id == 0) {
      changeColourScheme();
    } else if (id == 1) {
      let fs = fullscreen();
      fullscreen(!fs);
    } else if (id == 2) {
      this.toggleDraw();
    }
  }

  getAppName() {
    return "Polygon";
  }

  getButtonNames() {
    return this.buttonNames;
  }


  windowHasBeenResized() {
  }

  mouseHasBeenPressed(x, y) {
    if (this.isDraw && areCoordsInside(x, y, 0, barHeight, windowWidth, windowHeight)) {  /* if currently drawing poly */
      append(this.currentPolyCoords, [x, y]);
    }
  }

  mouseHasBeenDragged(x, y) {
    // this.beingDragged is in format of list, where first item in list is the nth coordinate of the polygon and the second item
    // in the list is a boolean which states if that current point is being dragged or not
    if (this.beingDragged[1]) {
      this.currentPolyCoords[this.beingDragged[0]] = [x, y];  //if is being dragged, maps mouse coords to a position
    } else {//if something is not being dragged
      for (let i = 0; i < this.currentPolyCoords.length; i++) {
        if (areCoordsInside(x, y, this.currentPolyCoords[i][0] - barHeight/2, this.currentPolyCoords[i][1] - barHeight/2, barHeight, barHeight)) {
          this.beingDragged = [i, true];
        }
      }
    }
  }

  mouseHasBeenReleased(x, y) {
    if (this.beingDragged[1]) {
      this.beingDragged = [-1, false];
    }
  }

  mouseHasBeenMoved(x, y) {
  }
}
