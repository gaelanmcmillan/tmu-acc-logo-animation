const SIDELEN = 60;
const SIXTY = 60 * Math.PI / 180;
const TRIWIDTH = SIDELEN * Math.cos(SIXTY);
const TRIHEIGHT = SIDELEN * Math.sin(SIXTY);

function degToRad (ang) {
  return ang * Math.PI / 180;
}

function rotatePoint(x0,y0,xP,yP,rot) {
  let rad = degToRad(rot);
  let cosFact = Math.cos(rad);
  let sinFact = Math.sin(rad);
  
  let xR = xP - x0;
  let yR = yP - y0;
  
  let xF = xR * cosFact - yR * sinFact;
  let yF = xR * sinFact + yR * cosFact;
  
  return [xF + x0, yF + y0];
}


function ptsP2(rot=0, x0=0, y0=0, sideLength=SIDELEN,) {
  
  // push();
  // strokeWeight(10);
  // point(x0,y0);
  // pop();
  
  let pts = [
    [ /* left point */
      x0 - TRIHEIGHT,
      y0
    ],
    [ /* top point */
      x0,
      y0 - TRIWIDTH
    ],
    [ /* bottom point */
      x0,
      y0 + TRIWIDTH
    ],
    [ /* right point */
      x0 + TRIHEIGHT,
      y0
    ],
   
  ]
  
  // console.log("Original points", pts);
  rotPts = pts.map(([x,y]) => rotatePoint(x0,y0,x,y,rot));
  // console.log("Rotated points", rotPts);
  return rotPts.flat();
}

let slider;
function setup() {
  createCanvas(400, 400);
  angleMode(DEGREES);
  slider = createSlider(-1/12,1.001, -1/12, 0.001);
  slider.style('width', "400px");
  // noLoop();
  frameRate(60);
}

function generateParallelogramPattern() {
  const xPosSequence = [0, 1, 3, 2, 3, 1,
                        0,-1,-3,-2,-3,-1];
 
  const yPosSequence = [0, 1, 1, 2, 3, 3,
                        4, 3, 3, 2, 1, 1];
  const numPars = 12;
  
  let pointSets = [];
  
  for (let i = 0; i < numPars; i++) {
    let degreesRotation = -60 * i;
    let xDisplacement = TRIWIDTH * xPosSequence[i];
    let yDisplacement = TRIHEIGHT * yPosSequence[i];
    
    pointSets.push(ptsP2(degreesRotation, xDisplacement, yDisplacement));
  }
  
  return pointSets;
}

function lerpingParallelogram(originPoints, destinationPoints, transitionAmount) {
  let [xL1, yL1, xT1, yT1, xB1, yB1, xR1, yR1] = originPoints;
  let [xL2, yL2, xT2, yT2, xB2, yB2, xR2, yR2] = destinationPoints;
  
  return [
    lerp(xL1, xL2, transitionAmount),
    lerp(yL1, yL2, transitionAmount),
    lerp(xT1, xB2, transitionAmount), // tops become bottoms
    lerp(yT1, yB2, transitionAmount), // to simulate the parallelogram
    lerp(xB1, xT2, transitionAmount), // flipping about the line
    lerp(yB1, yT2, transitionAmount), // of symmetry
    lerp(xR1, xR2, transitionAmount),
    lerp(yR1, yR2, transitionAmount)
  ];
}

function lerpingParallelogramGenerators(originPoints, destinationPoints) {
  let [xL1, yL1, xT1, yT1, xB1, yB1, xR1, yR1] = originPoints;
  let [xL2, yL2, xT2, yT2, xB2, yB2, xR2, yR2] = destinationPoints;
  
  return (transitionAmount) => [
    lerp(xL1, xL2, transitionAmount),
    lerp(yL1, yL2, transitionAmount),
    lerp(xT1, xB2, transitionAmount), // tops become bottoms
    lerp(yT1, yB2, transitionAmount), // to simulate the parallelogram
    lerp(xB1, xT2, transitionAmount), // flipping about the line
    lerp(yB1, yT2, transitionAmount), // of symmetry
    lerp(xR1, xR2, transitionAmount),
    lerp(yR1, yR2, transitionAmount)
  ];
}

// assumes points are ordered [ left, top, bottom, right ]
function parallelogramPointsToTriangles(points) {
  return [points.slice(0,6), points.slice(2,8)];
}

function generateLerpingPattern(pointSets, transitionAmt) {
  const numPar = 12;
  let lerpingTripairs = [];
  
  for (let i = 0; i < numPar; i++) {
    lerpingTripairs.push(
      parallelogramPointsToTriangles(
        lerpingParallelogram(
          pointSets[i],
          pointSets[(i+1) % numPar],
          transitionAmt)
        )
      );
  }
  
  return lerpingTripairs;
}

function generateLerpingPatternGenerators(pointSets) {
  const numPar = 12;
  let generators = [];
  
  for (let i = 0; i < numPar; i++) {
    generators.push(
      lerpingParallelogramGenerators(
        pointSets[i],
        pointSets[(i+1) % numPar]
      )
    );
  }
  
  return generators;
}

// ┌────────┐
// │ GLOBALS  │
// └────────┘

const pointSets = generateParallelogramPattern();
const baseGuideCol = 150;
const colours = [
  [255,0,0], /* red */
  [255,255,0], /* yellow */
  [0,255,0], /* green */
]
const tAmtPerParallelogram = 1/12;
const TESTING_FLIPS = false;
const SIMULTANEOUS_FLIPS = false;
const SEQUENTIAL_FLIPS = true;

function draw() {
  background(0);
  text(`Transition Amount: ${slider.value()}`, 10, 380);
  
  let [xL,  yL,  xT,  yT,  xR,  yR,  xB,  yB]  = ptsP2(0);
  let [xDL, yDL, xDT, yDT, xDR, yDR, xDB, yDB] = ptsP2(-60, TRIWIDTH, TRIHEIGHT);
  let [xGL, yGL, xGT, yGT, xGR, yGR, xGB, yGB] = ptsP2(-120, TRIWIDTH*3, TRIHEIGHT);
  let [xRL, yRL, xRT, yRT, xRR, yRR, xRB, yRB] = ptsP2(-180, TRIWIDTH*2, TRIHEIGHT*2);

  let t = slider.value();
  
  if (SEQUENTIAL_FLIPS) {
    push();
    translate(200, 100);
    
    let generators = generateLerpingPatternGenerators(pointSets);
    
    for (let [i, gen] of generators.entries()) {
      
      let [min, max] = ( /* immediately invoked lambda */ () => {
        if (t >= 0) {
          return [tAmtPerParallelogram * i, tAmtPerParallelogram*(i+1)];
          
        }
        return [-1/12, 0];
      })();
      
      if (t >= min) {

        let [shownLeft, shownRight] = parallelogramPointsToTriangles(pointSets[i]);
        
        let revealedCol = colours[i % colours.length];
        
        if (t >= 0) {
          push();
          stroke(revealedCol);
          fill(revealedCol);
          triangle(...shownLeft);
          triangle(...shownRight);
          pop();
        }
        
        let constrained = Math.min(Math.max(t, min), max);
        let modT = map(constrained, min, max, 0, 1);
        let pts = ( /* immediately invoked lambda */ () => {
          if (i != 11) return gen(modT);
          return pointSets[i];
        } )();
        
        let [left, right] = (()=> { 
          if (t >= 0) return parallelogramPointsToTriangles(pts);
          return parallelogramPointsToTriangles(pointSets[0]);
        })();
        push();
        let guideCol = ( /* immediately invoked lambda */ () => {
          if (t < 0) return modT * baseGuideCol;
          if (i != 11) return baseGuideCol;
          let [r,g,b] = revealedCol;
          return revealedCol.map( v => v - (v-baseGuideCol) * (1-modT));
        })();
        stroke(guideCol);
        fill(guideCol);
        triangle(...left);
        triangle(...right);
        pop();
      }
    }
    
    pop();
  }
  
  if (SIMULTANEOUS_FLIPS) {
    let triPairs = generateLerpingPattern(pointSets, t);
    push();
    translate(200,100);

    for (let [left, right] of triPairs) {
      triangle(...left);
      triangle(...right);
    }
    pop();
  }
  
  if (TESTING_FLIPS) {
    push();
  
    translate(200, 200);
    let redToYellow = [
      lerp(xL, xDL, t),
      lerp(yL, yDL, t),
      lerp(xT, xDB, t), // NOTE:
      lerp(yT, yDB, t), // for the red -> yellow transition
      lerp(xB, xDT, t), // top and bottom points reverse!
      lerp(yB, yDT, t), //
      lerp(xR, xDR, t),
      lerp(yR, yDR, t),
    ];

    let yellowToGreen = [
      lerp(xDL, xGL, t),
      lerp(yDL, yGL, t),
      lerp(xDT, xGB, t), // NOTE:
      lerp(yDT, yGB, t), // for the red -> yellow transition
      lerp(xDB, xGT, t), // top and bottom points reverse!
      lerp(yDB, yGT, t), //
      lerp(xDR, xGR, t),
      lerp(yDR, yGR, t),
    ];

    let greenToRed = [
      lerp(xGL, xRL, t),
      lerp(yGL, yRL, t),
      lerp(xGT, xRB, t), // NOTE:
      lerp(yGT, yRB, t), // for the red -> yellow transition
      lerp(xGB, xRT, t), // top and bottom points reverse!
      lerp(yGB, yRT, t), //
      lerp(xGR, xRR, t),
      lerp(yGR, yRR, t),
    ];

    let leftTri = redToYellow.slice(0,6);
    let rightTri = redToYellow.slice(2,8);
    let leftYTG = yellowToGreen.slice(0,6);
    let rightYTG = yellowToGreen.slice(2,8);
    let leftGTR = greenToRed.slice(0,6);
    let rightGTR = greenToRed.slice(2,8);

    // Draw the red triangle
    // fill([255,0,0]);
    // stroke([255,0,0]);
    // triangle(xL,yL,xT,yT,xB,yB);
    // triangle(xT,yT,xR,yR,xB,yB);

    // Draw the yellow triangle
    // fill([255,255,0]);
    // stroke([255,255,0]);
    // triangle(xDL, yDL, xDT, yDT, xDB, yDB);
    // triangle(xDR, yDR, xDT, yDT, xDB, yDB);

    // Draw the green triangle
    // fill([0,255,0]);
    // stroke([0,255,0]);
    // triangle(xGL, yGL, xGT, yGT, xGB, yGB);
    // triangle(xGR, yGR, xGT, yGT, xGB, yGB);

    // Draw the red-to-yellow triangle
    fill([255, 255 * t, 0]);
    stroke([255, 255 * t, 0]);
    triangle(...leftTri);
    triangle(...rightTri);

    // Draw the yellow-to-green triangle
    fill([255*(1-t), 255, 0]);
    stroke([255*(1-t), 255, 0]);
    triangle(...leftYTG);
    triangle(...rightYTG);

    fill([255*(t), 255*(1-t), 0]);
    stroke([255*(t), 255*(1-t), 0]);
    triangle(...leftGTR);
    triangle(...rightGTR);
    pop();
  }
}