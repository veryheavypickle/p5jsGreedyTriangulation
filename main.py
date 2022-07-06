from p5 import *
import random
import mediapipe as mp
import cv2

# mediapipe does not work on python 3.9 (works on 3.8)
# but the whole program does not work on python 3.8 because I am using mf macOS big sur
# https://github.com/vispy/vispy/issues/1885


"""
To do list

get triangulation method to work using greedy triangulation

impliment hand tracking thing as it does not play well with
javascript, but this program does not play well with python

for hand gestures mousclicked is recognised when index and
thumb are within the area of barHeight (so a 20 x 20px square)

mouse is recognised as index finger
"""

# setup some defaults
# 0: Highlight Colour, 1: Background Colour, 2: UI Colour, 3: Shape Colour, 4: Text/Point Colour
colourSchemes = []
colourSchemes.append(["#2a9d8f", "#e9c46a", "#f4a261", "#e76f51", "#000000"])
colourSchemes.append(["#ffb4a2", "#e5989b", "#b5838d", "#6d6875", "#000000"])
colourSchemes.append(["#d6306a", "#272c3a", "#343c49", "#424d61", "#c7dbf3"])
currentColourScheme = 2
GUIHeight = 20  # in pixels - this is literally used by everything


def setup():
    global polygon, handTracking
    text_font(create_font("assets/ISOCTEUR.ttf", 16))
    size(1280, 720)
    polygon = Application(PolygonApp())
    setHandPos([0, 0])
    handTracking = Hands()


def draw():
    background(colourSchemes[currentColourScheme][1])
    polygon.display()
    handTracking.runHands()


def areCoordsInside(x, y, posX, posY, widthX, widthY):  # global function used to find out if coordinates are inside
    if posX < x < posX + widthX and posY < y < posY + widthY:
        return True
    else:
        return False


def setHandPos(IndexTipPos, ThumbTipPos):
    global thumbPos, pointerPos
    thumbPos = [ThumbTipPos[0] * width, ThumbTipPos[1] * height]
    pointerPos = [IndexTipPos[0] * width, IndexTipPos[1] * height]


def changeColourScheme():
    global currentColourScheme
    # increments colour scheme by 1
    i = currentColourScheme
    i += 1
    if i > len(colourSchemes) - 1:
        i = 0
    currentColourScheme = i


def window_resized():
    size(width, height)
    polygon.windowHasBeenResized()
    print(69)


def mouse_pressed():
    polygon.mouseHasBeenPressed(mouse_x, mouse_y)


def mouse_moved():
    polygon.mouseHasBeenMoved(mouse_x, mouse_y)


def mouse_dragged():
    polygon.mouseHasBeenDragged(mouse_x, mouse_y)


def mouse_released():
    polygon.mouseHasBeenReleased(mouse_x, mouse_y)


class Button:
    def __init__(self, i, x, y, n, m, r):
        self.ID = i
        self.posX = x
        self.posY = y
        self.title = n
        self.buttonHeight = GUIHeight
        self.mode = m  # this is the align mode - CENTER, CORNER etc
        self.textSize = int(GUIHeight / 2)
        self.buttonWidth = self.setButtonWidthAsTitle()
        self.fillColour = colourSchemes[currentColourScheme][3]
        self.rounding = r
        self.textX = x
        self.textY = y  # text posX and y
        self.setupPositions()

    def display(self):
        rect_mode(self.mode)
        no_stroke()
        fill(self.fillColour)
        rect(self.posX, self.posY, self.buttonWidth, self.buttonHeight)
        # self.rounding needs to be added to rect
        fill(colourSchemes[currentColourScheme][4])
        text_align(CENTER, CENTER)
        text_size(self.textSize)
        text(self.title, self.textX, self.textY)

    def setupPositions(self):
        if self.mode == CORNER:
            self.textX = self.posX + self.buttonWidth / 2
            self.textY = self.posY + self.buttonHeight / 2
        else:
            self.textX = self.posX
            self.textY = self.posY

    def getCoordsInside(self, x, y):
        if self.mode == CENTER:
            return areCoordsInside(x, y, self.posX - self.buttonWidth / 2, self.posY - self.buttonHeight / 2,
                                   self.buttonWidth, self.buttonHeight)
        else:
            return areCoordsInside(x, y, self.posX, self.posY, self.buttonWidth, self.buttonHeight)

    def getButtonWidth(self):
        return self.buttonWidth

    def setButtonWidthAsTitle(self):
        return text_width(self.title) + GUIHeight / 2

    def setButtonWidth(self, w):
        self.buttonWidth = w

    def setButtonHeight(self, h):
        self.buttonHeight = h

    def setPosX(self, x):
        self.posX = x
        self.setupPositions()

    def setPosY(self, y):
        self.posY = y
        self.setupPositions()

    def setFontSize(self, s):
        self.textSize = s

    def updateTitle(self, n):
        self.title = n

    def mouseHasBeenPressed(self, x, y):
        if self.getCoordsInside(x, y):
            return [True, self.ID]
        else:
            return [False, self.ID]

    def mouseHasBeenMoved(self, x, y):
        if self.getCoordsInside(x, y):
            self.fillColour = colourSchemes[currentColourScheme][0]
        else:
            self.fillColour = colourSchemes[currentColourScheme][3]


class Application:
    def __init__(self, App):
        self.app = App
        self.buttons = []
        self.setupButtons()

    def display(self):
        self.app.display()
        for i in range(len(self.buttons)):
            self.buttons[i].display()

    def setupButtons(self):
        names = self.app.getButtonNames()
        currentWidth = 0
        for i in range(len(names)):
            self.buttons.append(Button(len(names), currentWidth, 0, names[i], CORNER, 0))
            currentWidth += self.buttons[i].getButtonWidth()

    def getAppName(self):
        return self.app.getAppName()

    def windowHasBeenResized(self):
        self.app.windowHasBeenResized()

    def mouseHasBeenPressed(self, x, y):
        self.app.mouseHasBeenPressed(x, y)
        for i in range(len(self.buttons)):
            if self.buttons[i].mouseHasBeenPressed(x, y)[0]:
                self.app.menuButtonPressed(i)

    def mouseHasBeenMoved(self, x, y):
        self.app.mouseHasBeenMoved(x, y)
        for i in range(len(self.buttons)):
            self.buttons[i].mouseHasBeenMoved(x, y)

    def mouseHasBeenDragged(self, x, y):
        self.app.mouseHasBeenDragged(x, y)

    def mouseHasBeenReleased(self, x, y):
        self.app.mouseHasBeenReleased(x, y)


class PolygonApp:
    """
    References
    https://www.mathsisfun.com/algebra/trig-solving-sss-triangles.html
    https://www.mathsisfun.com/geometry/herons-formula.html

    Inspiration
    https://imgur.com/f80NRUP
    """

    def __init__(self):
        self.isDraw = False
        self.currentPolyCoords = []
        self.polyPointDiameter = GUIHeight / 4
        self.beingDragged = [-1, False]  # -1 is the poly point id from the poly coords list
        self.coloursList = []  # list of colours
        self.triangles = []  # in format [[[x1, y1], [x2, y2], [x3, y3]], [[x1, y1], [x2, y2], [x3, y3]]]
        self.resetPolygon()
        self.buttonNames = ["Quit", "Change Colour Scheme", "Draw Polygon"]
        self.sqrtEquivalentArea = 0  # square root of the equivalent area
        self.bgSquarePos = [width / 2, height / 2]  # position for the "equivalent" square

    def display(self):
        # show EquivalentArea
        rect_mode(CENTER)
        fill(colourSchemes[currentColourScheme][0])
        rect(self.bgSquarePos[0], self.bgSquarePos[1], self.sqrtEquivalentArea, self.sqrtEquivalentArea)

        # display currentPolygon
        no_stroke()
        fill(colourSchemes[currentColourScheme][3])
        if len(self.currentPolyCoords) > 0:
            begin_shape()
            for i in range(len(self.currentPolyCoords)):
                vertex(self.currentPolyCoords[i][0], self.currentPolyCoords[i][1])
            end_shape(CLOSE)

        # display triangles
        for i in range(len(self.triangles)):
            fill(self.coloursList[i])
            triangle(self.triangles[i][0][0], self.triangles[i][0][1],
                     self.triangles[i][1][0], self.triangles[i][1][1],
                     self.triangles[i][2][0], self.triangles[i][2][1])
        fill(colourSchemes[currentColourScheme][4])
        for i in range(len(self.currentPolyCoords)):
            ellipse(self.currentPolyCoords[i][0], self.currentPolyCoords[i][1],
                    self.polyPointDiameter, self.polyPointDiameter)
        for i in range(len(self.triangles)):  # if there are triangles
            ellipse(self.triangles[i][0][0], self.triangles[i][0][1], self.polyPointDiameter, self.polyPointDiameter)
            ellipse(self.triangles[i][1][0], self.triangles[i][1][1], self.polyPointDiameter, self.polyPointDiameter)
            ellipse(self.triangles[i][2][0], self.triangles[i][2][1], self.polyPointDiameter, self.polyPointDiameter)

        # display hands
        fill(colourSchemes[currentColourScheme][0])
        stroke(colourSchemes[currentColourScheme][2])
        ellipse_mode(CENTER)
        ellipse(pointerPos[0], pointerPos[1], GUIHeight, GUIHeight)

        if pointerPos[0] > thumbPos[0] - GUIHeight or pointerPos[0] > thumbPos[0] + GUIHeight:
            self.mouseHasBeenPressed(pointerPos[0], pointerPos[1])
            # if your pointer and thumb are close to each other, it registers a mouse pressed

    def triangulation(self, poly):
        """
        polygon is coordinate array with format [x1, y1], [x2, y2]

        current method
        if polygon has 3 coords
            then new triangle is polygon
        else if polygon has more than 3 coords
            then pick a random point polygon(randomPoint1)
            pick a second random point that is not adjacent to the first one polygon(randomPoint2)
            new triangle is polygon(randomPoint1), polygon(randomPoint2), polygon(randomPoint2 - 1)
        """

        # Original method that works but is not greedy
        """
        if len(poly) == 3:  # then polygon has been fully triangulated
            self.triangles.append(poly)
            self.coloursList.append(self.newColour(colourSchemes[currentColourScheme][3]))
        elif len(poly) > 3:
            rP1 = int(random.randint(0, len(poly) - 1))
            rP2 = rP1
            if rP1 == len(poly):
                rP2cantBe = [rP1 - 1, rP1, 0]
            elif rP1 == 0:
                rP2cantBe = [len(poly), rP1, rP1 + 1]
            else:
                rP2cantBe = [rP1 - 1, rP1, rP1 + 1]

            while rP2 in rP2cantBe:
                rP2 = int(random.randint(0, len(poly)))

            if rP2 == 0:
                P3 = len(poly) - 1
            else:
                P3 = rP2 - 1
            self.triangles.append([poly[rP1], poly[rP2], poly[P3]])
            self.coloursList.append(self.newColour(colourSchemes[currentColourScheme][3]))
            # as polygon is split into two, you need to triangulate each new polygon
            if P3 < rP1:
                newPoly1 = poly[rP2:rP1]
                newPoly2 = poly[rP1:] + poly[:P3]
            else:  # P3 is bigger
                newPoly1 = poly[rP1:P3]
                newPoly2 = poly[rP2:] + poly[:rP1]
            self.triangulation(newPoly1)
            self.triangulation(newPoly2)
        return []
        """
        self.findGreedyDiagonals(poly)

    def findGreedyDiagonals(self, poly):
        letsLoop = True
        self.resetPolygon()
        visited = []
        target = None
        if len(poly) != 0:
            target = min(poly[0])
        while len(poly) > 0 or letsLoop:
            currentNode = poly.pop()
            if currentNode != target:
                if currentNode not in visited:
                    visited.append(currentNode)
                    for next_node in len(poly):
                        if next_node not in visited:
                            letsLoop = False

        """
        reference: https://core.ac.uk/download/pdf/82620126.pdf
        """

    def pythagoras(self, pos1, pos2):
        # pos1 and pos2 in format pos1 = [x1, y1], pos2 = [x2, y2]
        return sqrt(sq(pos1[0] - pos2[0]) + sq(pos1[1] - pos2[1]))

    def angle(self, posA, posB, posC):
        # length a is opposite angle A, so forth so on...
        a = self.pythagoras(posB, posC)
        b = self.pythagoras(posA, posC)
        c = self.pythagoras(posA, posB)
        return acos((sq(c) + sq(a) - sq(b)) / (2 * c * a))

    def area(self, posA, posB, posC):
        # length a is opposite angle A, so forth so on...
        a = self.pythagoras(posB, posC)
        b = self.pythagoras(posA, posC)
        c = self.pythagoras(posA, posB)
        s = (a + b + c) / 2  # half of perimeter
        return sqrt(s * (s - a) * (s - b) * (s - c))

    def toggleDraw(self):
        if self.isDraw:
            self.isDraw = False
            self.currentPolyCoords = self.triangulation(self.currentPolyCoords)
            self.sqrtEquivalentArea = self.calculateEquivalentArea(self.triangles)
        else:
            self.isDraw = True
            self.resetPolygon()

    def calculateEquivalentArea(self, triangles):
        currentArea = 0
        for i in range(len(triangles)):
            currentArea += self.area(self.triangles[i][0], self.triangles[i][1], self.triangles[i][2])
        return sqrt(currentArea)

    def newColour(self, colour):
        # the colour every new colour is based on. in #FFFFFF format
        newColourRandomness = 10  # the extent of the randomness, reccomended not to go above 255
        rgb = [int(colour[1:3], 16), int(colour[3:5], 16), int(colour[5:7], 16)]
        rgb[0] = constrain(rgb[0] + random.randint(-newColourRandomness, newColourRandomness), 0, 255)
        rgb[1] = constrain(rgb[1] + random.randint(-newColourRandomness, newColourRandomness), 0, 255)
        rgb[2] = constrain(rgb[2] + random.randint(-newColourRandomness, newColourRandomness), 0, 255)
        colour = "#" + hex(rgb[0])[2:4] + hex(rgb[1])[2:4] + hex(rgb[2])[2:4]
        return colour

    def resetPolygon(self):
        self.currentPolyCoords = []  # reset polygon
        self.coloursList = [self.newColour(colourSchemes[currentColourScheme][3])]  # add first colour to list
        self.triangles = []

    # Application Specific Functions

    def menuButtonPressed(self, i):
        # this runs a function based on which menu button was pressed, id (i) is of type int
        if i == 0:
            quit()
        elif i == 1:
            changeColourScheme()
        elif i == 2:
            self.toggleDraw()
        # i tried the switcher implimentation, it would just call every function as the dict was created :/

    def getAppName(self):
        return "Polygon"

    def getButtonNames(self):
        return self.buttonNames

    def windowHasBeenResized(self):
        pass

    def mouseHasBeenPressed(self, x, y):
        if self.isDraw and areCoordsInside(x, y, 0, GUIHeight, width, height):  # if currently drawing poly
            self.currentPolyCoords.append([x, y])

    def mouseHasBeenDragged(self, x, y):
        # this.beingDragged is in format of list, where first item in list is the nth coordinate of the polygon
        # and the second item in the list is a boolean which states if that current point is being dragged or not
        if self.beingDragged[1]:
            self.currentPolyCoords[self.beingDragged[0]] = [x,
                                                            y]  # if is being dragged, maps mouse coords to a position
        else:  # if something is not being dragged
            for i in range(len(self.currentPolyCoords)):
                # this is relatively inefficient
                if areCoordsInside(x, y, self.currentPolyCoords[i][0] - GUIHeight / 2,
                                   self.currentPolyCoords[i][1] - GUIHeight / 2, GUIHeight, GUIHeight):
                    self.beingDragged = [i, True]

    def mouseHasBeenReleased(self, x, y):
        if self.beingDragged[1]:
            self.beingDragged = [-1, False]

    def mouseHasBeenMoved(self, x, y):
        pass


class Hands:
    def __init__(self):
        pass

    def runHands(self):
        mp_drawing = mp.solutions.drawing_utils
        mp_hands = mp.solutions.hands
        # For webcam input:
        hands = mp_hands.Hands(
            min_detection_confidence=0.5, min_tracking_confidence=0.5)
        cap = cv2.VideoCapture(0)
        while cap.isOpened():
            success, image = cap.read()
            if not success:
                print("Ignoring empty camera frame.")
                # If loading a video, use 'break' instead of 'continue'.
                continue

            # Flip the image horizontally for a later selfie-view display, and convert
            # the BGR image to RGB.
            image = cv2.cvtColor(cv2.flip(image, 1), cv2.COLOR_BGR2RGB)
            # To improve performance, optionally mark the image as not writeable to
            # pass by reference.
            image.flags.writeable = False
            results = hands.process(image)

            # Draw the hand annotations on the image.
            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    mp_drawing.draw_landmarks(
                        image, hand_landmarks, mp_hands.HAND_CONNECTIONS)
                    setHandPos(hand_landmarks[8], hand_landmarks[4])
            cv2.imshow('MediaPipe Hands', image)
            print(results.multi_hand_landmarks)
            if cv2.waitKey(5) & 0xFF == 27:
                break
        hands.close()
        cap.release()

run()
