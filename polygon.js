let colourScheme = [];
let currentColourScheme;
let barHeight;
let systemFont;
let systemAndUI;

function preload() {
  systemFont = loadFont("assets/ISOCTEUR.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  setDefaults();
  systemAndUI = new Application(new UIAndSystemApp(), -1);
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
  systemAndUI.display();
}

function areCoordsInside(x, y, posX, posY, widthX, widthY) {
  if (x > posX && x < posX + widthX && y > posY && y < posY + widthY) {
    return true;
  } else {
    return false;
  }
}

function reqPosX(x) {
}

function reqPosY(y) {
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  systemAndUI.windowHasBeenResized();
}

function mousePressed() {
  systemAndUI.mouseHasBeenPressed(mouseX, mouseY);
}

function mouseMoved() {
  systemAndUI.mouseHasBeenMoved(mouseX, mouseY);
}

function mouseDragged() {
  systemAndUI.mouseHasBeenDragged(mouseX, mouseY);
}

function mouseReleased() {
  systemAndUI.mouseHasBeenReleased(mouseX, mouseY);
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
    this.setupPositions();
    this.textX = x;
    this.textY = y;  //text posX and y;
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

  getCoordsInside(x, y) {
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

class Window {
  constructor(id, x, y, n) {
    this.ID = id;
    this.posX = x;
    this.posY = y;
    this.title = n;
    this.windowWidth = windowWidth - barHeight*2;
    this.windowHeight = windowHeight - barHeight*3;
    this.clickable = false;
    this.windowDragged = false;
    this.cornerDragged = false;
    this.setShadowOffset();
    this.buttons = [];
  }

  display() {
    //shadows
    noFill();
    for (let i = 0; i < barHeight; i++) {
      stroke(0, barHeight - i);
      rectMode(CENTER);
      rect(this.shadowOffsetX, this.shadowOffsetY, this.windowWidth + i, this.windowHeight + barHeight + i, barHeight/2);
    }
    //top bar
    let topColour = color(colourScheme[currentColourScheme][3]);
    topColour.setAlpha(200);
    fill(topColour);
    rectMode(CORNER);
    rect(this.posX, this.posY, this.windowWidth, barHeight, barHeight/2, barHeight/2, 0, 0);
    fill(color(252, 96, 92));
    ellipseMode(CENTER);
    ellipse(this.posX + barHeight/2, this.posY + barHeight/2, barHeight/2, barHeight/2);
    if (this.clickable) {
      fill(0);
      ellipse(this.posX + barHeight/2, this.posY + barHeight/2, barHeight/6, barHeight/6);
    }
    textAlign(CENTER, CENTER);
    textSize(3 * barHeight/4);
    fill(colourScheme[currentColourScheme][4]);
    text(this.title, this.posX + this.windowWidth/2, this.posY + barHeight/2);

    //body
    fill(colourScheme[currentColourScheme][2]);
    rect(this.posX, this.posY + barHeight, this.windowWidth, this.windowHeight, 0, 0, barHeight/2, barHeight/2);

    //display buttons
    for (let i = 0; i < this.buttons.length; i++) {
      this.buttons[i].display();
    }
  }

  setupButtons(names) {
    let mode = CORNER;
    for (let i = 0; i < names.length; i++) {
      this.buttons.push(new Button(this.buttons.length, this.posX, this.posY, names[i], mode, 0));
    }
    this.reloadButtons(mode);
  }

  reloadButtons(mode) {
    let currentLength = 0;
    let posY = this.getPosY() + barHeight;
    let posX = this.getPosX();
    for (let i = 0; i < this.buttons.length; i++) {
      this.buttons[i].setPosX(posX + currentLength);
      this.buttons[i].setPosY(posY);
      currentLength += this.buttons[i].getButtonWidth();
    }
  }

  dragWindowBar(x, y) {
    this.posX = x - this.dragOffset[0];
    this.posY = y - this.dragOffset[1];
    //logic
    if (this.posY < 0) {
      this.posY = 0;
    }
    this.setShadowOffset();
  }

  dragCorner(x, y) {
    this.windowWidth = x + this.dragOffset[0];
    this.windowHeight = y + this.dragOffset[1];
    //logic
    if (this.windowWidth < 10 * barHeight) {
      this.windowWidth = 10 * barHeight;
    }
    if (this.windowHeight < 10 * barHeight) {
      this.windowHeight = 10 * barHeight;
    }
    this.setShadowOffset();
  }

  setShadowOffset() {
    this.shadowOffsetX = this.windowWidth/2 + this.posX;
    this.shadowOffsetY = (barHeight + this.windowHeight) / 2 + this.posY;
  }

  canChangeWindowSize(x, y) {  //if over bottom right corner
    if (areCoordsInside(x, y, this.posX + this.windowWidth - barHeight/2, this.posY + this.windowHeight + barHeight/2, barHeight, barHeight)) {
      return true;
    } else {
      return false;
    }
  }

  mouseHasBeenMoved(x, y) {
    if (areCoordsInside(x, y, this.posX, this.posY, barHeight, barHeight)) {  //if are over the cross button
      this.clickable = true;
    } else {
      this.clickable = false;
    }
    if (this.canChangeWindowSize(x, y)) {
      cursor("nwse-resize");
    } else {
      cursor(AUTO);
    }
    for (let i = 0; i < this.buttons.length; i++) {
      this.buttons[i].mouseHasBeenMoved(x, y);
    }
  }

  mouseHasBeenPressed(x, y) {  // returns true or false if the app window can be closed
    // Command types, "Close" and any int means a menu button was pressed
    if (this.clickable) {
      return [true, "Close"];
    } 
    for (let i = 0; i < this.buttons.length; i++) {
      let hasBeenClicked = this.buttons[i].mouseHasBeenPressed(x, y);
      if (hasBeenClicked[0]) {
        return hasBeenClicked;
      }
    }
    return [false, "None"];
  }

  mouseHasBeenDragged(x, y) {
    if (this.windowDragged) {  // if window being dragged
      this.dragWindowBar(x, y);
      this.reloadButtons();
    }
    if (areCoordsInside(x, y, this.posX, this.posY, this.windowWidth, barHeight)) {  //if over top bar
      this.dragOffset = [x - this.posX, y - this.posY];
      this.windowDragged = true;
    }
    if (this.cornerDragged) {
      this.dragCorner(x, y);
    }
    if (this.canChangeWindowSize(x, y)) {
      this.dragOffset = [this.posX + this.windowWidth - x, this.posY + this.windowHeight - y];
      this.cornerDragged = true;
    }
  }

  mouseHasBeenReleased() {
    if (this.windowDragged) {
      this.windowDragged = false;
    }
    if (this.cornerDragged) {
      this.cornerDragged = false;
    }
  }

  getTitle() {
    return this.title;
  }

  getPosX() {
    return this.posX;
  }

  getPosY() {
    return this.posY;
  }

  getWinWidth() {
    return this.windowWidth;
  }

  getWinHeight() {
    return this.windowHeight;
  }
}

class Application {
  constructor(App, id) {
    this.id = id;
    this.app = App;
    this.appWindow = [new Window(id, barHeight, barHeight, this.getAppName())];
    if (id == -1) {
      // if the app is the SystemUI
      this.appWindow = [];
    }
    this.buttons = [];
    this.setupButtons();
  }

  display() {
    for (let i = 0; i < this.appWindow.length; i++) {
      this.appWindow[i].display();
    }
    this.app.display(this.getPosX(), this.getPosY());
  }

  setupButtons() {
    let names = this.app.getButtonNames();
    for (let i = 0; i < this.appWindow.length; i++) {
      this.appWindow[i].setupButtons(names);
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

    for (let i = 0; i < this.appWindow.length; i++) {
      let windowPressed = this.appWindow[i].mouseHasBeenPressed(x, y);
      if (windowPressed[0]) {
        if (windowPressed[1] == "Close") {
          return true;
        } else {
          this.app.menuButtonPressed(windowPressed[1]);
        }
      }
    }
    return false;
  }

  mouseHasBeenMoved(x, y) {
    this.app.mouseHasBeenMoved(x, y);
    for (let i = 0; i < this.appWindow.length; i++) {
      this.appWindow[i].mouseHasBeenMoved(x, y);
    }
  }

  mouseHasBeenDragged(x, y) {
    this.app.mouseHasBeenDragged(x, y);
    for (let i = 0; i < this.appWindow.length; i++) {
      this.appWindow[i].mouseHasBeenDragged(x, y);
    }
  }

  mouseHasBeenReleased(x, y) {
    this.app.mouseHasBeenReleased(x, y);
    for (let i = 0; i < this.appWindow.length; i++) {
      this.appWindow[i].mouseHasBeenReleased(x, y);
    }
  }

  getPosX() {    //get pos x and y of window
    for (let i = 0; i < this.appWindow.length; i++) {
      return this.appWindow[i].getPosX();
    }
  }

  getPosY() {
    for (let i = 0; i < this.appWindow.length; i++) {
      return this.appWindow[i].getPosY();
    }
  }
  
  reqPosX(x) {
    return x + getPosX();
  }
  
  reqPosY(y) {
    return y + getPosY();
  }
}

class UIAndSystemApp {
  constructor() {
    this.programs = [];
    this.programButtons = [];
    this.appNames = [];
    this.fontSize = barHeight * 4;
    this.appBarWidth = windowWidth/4;
    this.appBarHeight = windowHeight - 2 * barHeight;
    this.timeXpos = windowWidth/8 + barHeight;
    this.timeYpos = windowHeight/8 + barHeight * 2;
    this.installApps();
  }

  display(x, y) {
    // Background
    background(colourScheme[currentColourScheme][1]);
    noStroke();
    rectMode(CORNER);
    fill(colourScheme[currentColourScheme][2]);
    rect(barHeight, barHeight, this.appBarWidth, this.appBarHeight, barHeight);

    //Time
    fill(colourScheme[currentColourScheme][4]);
    textSize(this.fontSize);
    textAlign(CENTER, CENTER);
    text(this.setupTime(), this.timeXpos, this.timeYpos);

    //App Launcher
    for (let i = 0; i < this.programButtons.length; i++) {
      this.programButtons[i].display();
    }

    //display Apps
    for (let i = 0; i < this.programs.length; i++) {
      this.programs[i].display();
    }
  }

  openApp(appName) {
    if (this.appNames[0] == appName) {
      this.programs.push(new Application(new SettingsApp(), this.programs.length));
    } else if (this.appNames[1] == appName) {
      this.programs.push(new Application(new PolygonApp(), this.programs.length));
    } else if (this.appNames[2] == appName) {
      this.programs.push(new Application(new HandDetectApp(), this.programs.length));
    }
    console.log("Opened " + appName);
  }

  closeApp(appName) {
    for (let i = 0; i < this.programs.length; i++) {
      if (appName == this.programs[i].getAppName()) {
        this.programs.splice(i, 1);
        console.log("Closed " + appName);
      }
    }
  }

  installApps() {
    // This list of programs here should be in the same order as in open apps
    this.programs.push(new Application(new SettingsApp(), this.programs.length));
    this.programs.push(new Application(new PolygonApp(), this.programs.length));
    this.programs.push(new Application(new HandDetectApp(), this.programs.length));
    for (let i = 0; i < this.programs.length; i++) {
      this.appNames.push(this.programs[i].getAppName());
      this.programButtons.push(new Button(i, 0, 0, this.programs[i].getAppName(), CENTER, barHeight/2));
    }
    this.setupButtons();
    this.programs = [];
  }

  getTime(f) {
    if (f < 10) {
      return "0" + f;
    } else {
      return f;
    }
  }

  setupButtons() {
    // change button attributes
    let firstButtonPos = barHeight;
    let lastPosition = windowHeight - barHeight;
    let nextButtonOffset = (lastPosition - firstButtonPos) / (this.programButtons.length + 1);
    let fontSize = barHeight;
    let buttonWidth = this.appBarWidth - 2 * barHeight;
    let buttonHeight = 50;
    for (let i = 0; i < this.programButtons.length; i++) {
      this.programButtons[i].setPosX(this.timeXpos);
      this.programButtons[i].setPosY(firstButtonPos + nextButtonOffset * (i + 1));
      this.programButtons[i].setFontSize(fontSize);
      this.programButtons[i].setButtonWidth(buttonWidth);
      this.programButtons[i].setButtonHeight(buttonHeight);
    }
  }

  setupTime() {
    let t = this.getTime(hour()) + ":" + this.getTime(minute());
    if (textWidth(t) + barHeight > this.appBarWidth) {
      t = this.getTime(hour()) + "\n" + this.getTime(minute());
    }
    return t;
  }

  setupWidthandHeight() {
    this.appBarWidth = windowWidth/4;
    this.appBarHeight = windowHeight - 2 * barHeight;
    this.timeXpos = windowWidth/8 + barHeight;
    this.timeYpos = windowHeight/8 + barHeight * 2;
  }

  menuButtonPressed(id) {
    //this runs a function based on which menu button was pressed, id is of type int
  }

  getAppName() {
    return "UI & System";
  }

  getButtonNames() {
    return [""];
  }

  windowHasBeenResized() {
    this.setupWidthandHeight();
    this.setupButtons();
    for (let i = 0; i < this.programs.length; i++) {
      this.programs[i].windowHasBeenResized();
    }
  }

  mouseHasBeenPressed(x, y) {

    for (let i = 0; i < this.programButtons.length; i++) {
      let appLaunchButtonPressed = this.programButtons[i].mouseHasBeenPressed(x, y);
      // buttonPressed is in format [boolean, ID]
      if (appLaunchButtonPressed[0]) {  //if the mouse has been pressed on a button, return its ID and open corresponding App.
        this.openApp(this.appNames[appLaunchButtonPressed[1]]);
      }
    }
    for (let i = 0; i < this.programs.length; i++) {
      if (this.programs[i].mouseHasBeenPressed(x, y)) {  //if the mouse has been pressed on window closed, return its ID and open close App.
        this.closeApp(this.programs[i].getAppName());
      }
    }
  }

  mouseHasBeenDragged(x, y) {
    for (let i = 0; i < this.programs.length; i++) {
      this.programs[i].mouseHasBeenDragged(x, y);
    }
  }

  mouseHasBeenReleased(x, y) {
    for (let i = 0; i < this.programs.length; i++) {
      this.programs[i].mouseHasBeenReleased(x, y);
    }
  }

  mouseHasBeenMoved(x, y) {
    for (let i = 0; i < this.programButtons.length; i++) {
      this.programButtons[i].mouseHasBeenMoved(x, y);
    }
    for (let i = 0; i < this.programs.length; i++) {
      this.programs[i].mouseHasBeenMoved(x, y);
    }
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
    this.buttonNames = ["Draw Polygon"];
  }

  display(x, y) {
    //display currentPolygon
    noStroke();
    beginShape();
    fill(colourScheme[currentColourScheme][3]);
    for (let i = 0; i < this.currentPolyCoords.length; i++) {
      vertex(this.currentPolyCoords[i][0] + x, this.currentPolyCoords[i][1] + y);
    }
    endShape(CLOSE);

    //display triangles
    for (let i = 0; i < this.triangles.length; i++) {
      fill(this.coloursList[i]);
      triangle(this.triangles[i][0][0] + x, this.triangles[i][0][1] + y, this.triangles[i][1][0] + x, this.triangles[i][1][1] + y, this.triangles[i][2][0] + x, this.triangles[i][2][1] + y);
    }
    fill(colourScheme[currentColourScheme][4]);
    for (let i = 0; i < this.currentPolyCoords.length; i++) {
      ellipse(this.currentPolyCoords[i][0] + x, this.currentPolyCoords[i][1] + y, this.polyPointDiameter, this.polyPointDiameter);
    }
    for (let i = 0; i < this.triangles.length; i ++) {
      ellipse(this.triangles[i][0][0] + x, this.triangles[i][0][1] + y, this.polyPointDiameter, this.polyPointDiameter);
      ellipse(this.triangles[i][1][0] + x, this.triangles[i][1][1] + y, this.polyPointDiameter, this.polyPointDiameter);
      ellipse(this.triangles[i][2][0] + x, this.triangles[i][2][1] + y, this.polyPointDiameter, this.polyPointDiameter);
    }
  }

  triangulation(polygon) {
    //polygon is coordinate array with format [x1, y1], [x2, y2] 

    /* method 2
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
      topButtons[2].updateTitle(buttonTitles[2]);
      this.currentPolyCoords = this.triangulation(this.currentPolyCoords);
    } else {
      this.isDraw = true;
      topButtons[2].updateTitle("Done");
      this.resetPolygon();
    }
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

class SettingsApp {
  constructor() {
  }

  display(x, y) {
    text("Hmm", x + 50, y + 50);
  }

  toggleFullscreen() {
    let fs = fullscreen();
    fullscreen(!fs);
  }

  menuButtonPressed(id) {
    //this runs a function based on which menu button was pressed, id is of type int
    if (id == 0) {
      this.toggleFullscreen();
    }
  }

  getAppName() {
    return "Settings";
  }

  getButtonNames() {
    return ["Full Screen"];
  }

  windowHasBeenResized() {
  }

  mouseHasBeenPressed(x, y) {
  }

  mouseHasBeenDragged(x, y) {
  }

  mouseHasBeenReleased(x, y) {
  }

  mouseHasBeenMoved(x, y) {
  }
}

class HandDetectApp {
  constructor() {
    const canvasElement = document.getElementsByClassName('output_canvas')[0];
  }

  display(x, y) {
      //const camera = new Camera(capture, {onFrame: async () => {await hands.send({image: videoElement})},width: 1280, height: 720});
      //camera.start();
      let capture = createCapture(VIDEO);
      image(capture);
  }

  onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);
    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, 
        {
        color: 
        '#00FF00', lineWidth: 
          5
        }
        );
        drawLandmarks(canvasCtx, landmarks, {
        color: 
        '#FF0000', lineWidth: 
          2
        }
        );
      }
    }
    canvasCtx.restore();
  }

  menuButtonPressed(id) {
    //this runs a function based on which menu button was pressed, id is of type int
  }

  getAppName() {
    return "Hands";
  }

  getButtonNames() {
    return [];
  }

  windowHasBeenResized() {
  }

  mouseHasBeenPressed(x, y) {
  }

  mouseHasBeenDragged(x, y) {
  }

  mouseHasBeenReleased(x, y) {
  }

  mouseHasBeenMoved(x, y) {
  }
}

class EmptyApp {
  constructor() {
  }

  display(x, y) {
  }

  menuButtonPressed(id) {
    //this runs a function based on which menu button was pressed, id is of type int
  }

  getAppName() {
    return "App Name";
  }

  getButtonNames() {
    return [];
  }

  windowHasBeenResized() {
  }

  mouseHasBeenPressed(x, y) {
  }

  mouseHasBeenDragged(x, y) {
  }

  mouseHasBeenReleased(x, y) {
  }

  mouseHasBeenMoved(x, y) {
  }
}
