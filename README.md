# p5jsGreedyTriangulation

The purpose of our project is to implement the computation of greedy triangulation using
movement recognition software, specifically hand tracking. The project uses p5.js due to the fact that it facilitates the implementation of the program on websites. The idea for the greedy triangulation came from C. Levcopoulos, D. Krznaric’s paper [1], which describes this concept in detail and also provides useful information for the implementation itself, in the code. An easier way to understand the base notion of the project is by examining Figure 1, which can be found on in assets/constructSquare.mp4 [2]. The GIF explains how, by having a polygon in any shape, it can be split into triangles, which will be turned into rectangles using Heron's Formula [3]. The rectangles are then manipulated into becoming squares with the same area, after which the Pythagorean formula will be used to create a square that will have the same area as the initial polygon.

## Issues
The project was never fully completed as getting the hand tracking to work with p5.js was very difficult and therefore the [new version](New_Polygon.js) doesn't work at all, so the [fallback version](polygon.js) is much older.

## Inspiration
The inspiration for the project was a gif found online which has been [downloaded to this repo](assets/constructSquare.mp4) for safe keeping.

To check out the full explanation check out the [pdf](assets/Write-up_AIP_Project.pdf)
