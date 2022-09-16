/* Helpers */
function invoke(f) {
  return f();
}

function pushPop(f) {
  push();
  f();
  pop();
}

function degToRad (ang) {
  return ang * Math.PI / 180;
}
// ┌─────────┐
// │ GLOBALS │
// └─────────┘

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;
const SIDE_LENGTH = 60;
const SIXTY_IN_RAD = degToRad(60);
const TRIANGLE_WIDTH = SIDE_LENGTH * Math.cos(SIXTY_IN_RAD);
const TRIANGLE_HEIGHT = SIDE_LENGTH * Math.sin(SIXTY_IN_RAD);
const NUMPAR = 12;

const ONE_OVER_NUMPAR = 1/NUMPAR;
const MOVING_PARALLELOGRAM_COLOUR = 150;
const COLOURS = [
  [255,0,0], /* red */
  [255,255,0], /* yellow */
  [0,255,0], /* green */
]

var slider;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  angleMode(DEGREES);
  frameRate(60);

  slider = createSlider(-1/12,1.001, -1/12, 0.001);
  slider.style('width', "400px");
}

function rotatePoint(x0,y0,xP,yP,rot) {
  let rad = degToRad(rot);
  let cosFact = Math.cos(rad);
  let sinFact = Math.sin(rad);
  
  return [(xP - x0) * cosFact - (yP - y0) * sinFact + x0,
          (xP - x0) * sinFact + (yP - y0) * cosFact + y0];
}

/*
Calculates the following parallelogram points:

            Top
            .o.
         .*^   ^*.
  Left o. (x0,y0) .o Right
         ^*.   .*^ 
            ^o^
           Bottom
           
*/
function calculateParallelogramPoints(rot=0, x0=0, y0=0, sideLength=SIDE_LENGTH) {
  let points = [
    [ /* left point */
      x0 - TRIANGLE_HEIGHT,
      y0
    ],
    [ /* top point */
      x0,
      y0 - TRIANGLE_WIDTH
    ],
    [ /* bottom point */
      x0,
      y0 + TRIANGLE_WIDTH
    ],
    [ /* right point */
      x0 + TRIANGLE_HEIGHT,
      y0
    ],
  ];
  
  rotatedPoints = points.map(([x,y]) => rotatePoint(x0,y0,x,y,rot));
  return rotatedPoints.flat();
}

function generateParallelogramPattern() {
  /* by how many triangle widths should parallelogram[i].x be displaced? */
  const xPosSequence = [0, 1, 3, 2, 3, 1,
                        0,-1,-3,-2,-3,-1];
  /* by how many triangle heights should parallelogram[i].y be displaced? */
  const yPosSequence = [0, 1, 1, 2, 3, 3,
                        4, 3, 3, 2, 1, 1];
  
  let pointSets = [];
  
  for (let i = 0; i < NUMPAR; i++) {
    let degreesRotation = -60 * i;
    let xDisplacement = TRIANGLE_WIDTH  * xPosSequence[i];
    let yDisplacement = TRIANGLE_HEIGHT * yPosSequence[i];
    
    pointSets.push(calculateParallelogramPoints(
      degreesRotation,
      xDisplacement,
      yDisplacement
    ));
  }
  
  return pointSets;
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

function drawParallelogram(points, colour) {
  let [left, right] = parallelogramPointsToTriangles(points);

  pushPop(() => {
    stroke(colour);
    fill(colour);
    triangle(...left);
    triangle(...right);
  });
}

function generateLerpingPatternGenerators(pointSets) {
  let generators = [];
  
  for (let i = 0; i < NUMPAR; i++) {
    generators.push(
      lerpingParallelogramGenerators(
        pointSets[i],
        pointSets[(i+1) % NUMPAR]
      )
    );
  }
  
  return generators;
}

const POINT_SETS = generateParallelogramPattern();

function draw() {
  background(0);
  text(`Transition Amount: ${slider.value()}`, 10, 380);
  
  let animationProgress = slider.value();
  
  pushPop(() => {
    translate(200, 100);

    let generators = generateLerpingPatternGenerators(POINT_SETS);

    for (let [i, gen] of generators.entries()) {
      let [min, max] = invoke(() => {
        if (animationProgress >= 0) {
          return [ONE_OVER_NUMPAR * i, ONE_OVER_NUMPAR*(i+1)];
        }
        return [-ONE_OVER_NUMPAR, 0];
      });

      if (animationProgress >= min) {
        let revealedCol = COLOURS[i % COLOURS.length];

        /* let t = animation progress
         * if t E [-1/12, 0), the fade-in is happening 
         * otherwise, we draw paralleograms */
        if (animationProgress >= 0) {
          drawParallelogram(POINT_SETS[i], revealedCol);
        }

        let constrained = Math.min(Math.max(animationProgress, min), max);
        let currentParProgress = map(constrained, min, max, 0, 1);
        
        let points = invoke(() => {
          if (animationProgress < 0) return POINT_SETS[0]; // fade in on first parallelogram
          if (i < NUMPAR-1) return gen(currentParProgress); // generate next lerp
          return POINT_SETS[NUMPAR-1]; // fade out on last parallelogram
        });

        let movingParColour = invoke(() => {
          if (animationProgress < 0) return currentParProgress * MOVING_PARALLELOGRAM_COLOUR; // fade from black
          if (i < NUMPAR-1) return MOVING_PARALLELOGRAM_COLOUR; // stay one colour for the body of the animation
          return revealedCol.map(v => v - (v - MOVING_PARALLELOGRAM_COLOUR) * (1 - currentParProgress)); // fade out on last par
        });

        drawParallelogram(points, movingParColour);
      }
    }
  });
    
}