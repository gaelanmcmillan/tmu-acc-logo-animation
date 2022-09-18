// ┌───────────┐
// │ Utilities │
// └───────────┘
function pushPop(f) {
  push();
  f();
  pop();
}

function clamp(min, max, n) {
  return Math.min(Math.max(n, min), max);
}

function degToRad (ang) {
  return ang * Math.PI / 180;
}

/* 
Not using p5.js's lerp because I would like 
the math behind generating the parametrized animation steps
to be portable.
*/

function linearInterpolation(from, to, progress) {
  return from * (1-progress) + to * progress;
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
const FIRST_PARALLELOGRAM_POSITION = [CANVAS_WIDTH / 2, 100];
const PARALLELOGRAM_COUNT = 12;
const ANIMATION_STEP_COUNT = 13;
const TIME_PER_STEP = 1 / ANIMATION_STEP_COUNT;

// ┌────────────┐
// │ APPEARANCE │
// └────────────┘

const MOVING_PARALLELOGRAM_COLOURS = [/* fill */ 0, /* edges */ 255];

const RED = [240,20,40];
const YELLOW = [240,220,100];
const GREEN = [120,220,120];

const STATIC_PARALLELOGRAM_COLOURS = [
  RED,
  YELLOW,
  GREEN,
]

// ┌────┐
// │ UI │
// └────┘

var animationProgressSlider;
var progressTypeButton;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  angleMode(DEGREES);
  frameRate(60);

  animationProgressSlider = createSlider(0,1,0,0.001);
  animationProgressSlider.style('width', "400px");
  animationProgressSlider.attribute('disabled','');

  progressTypeButton = createCheckbox('auto-play animation', true);

  let box = progressTypeButton.elt.getElementsByTagName('input')[0];
  let label = progressTypeButton.elt.getElementsByTagName('label')[0];
  box.style.width = '50px';
  box.style.height = '50px';
  box.style['background-color:active'] = 'green';

  label.style.display = "flex";
  label.style['align-items'] = 'center';

  progressTypeButton.style('color', 'white');
  progressTypeButton.style('font-family', 'courier new');

  progressTypeButton.changed(() => {
    if (progressTypeButton.checked()) {
      animationProgressSlider.attribute('disabled', '');
    } else {
      animationProgressSlider.removeAttribute('disabled');
    }
  });
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
               .
           -       -
  Left .    (x0,y0)    . Right
           -       - 
               .
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
  
  for (let i = 0; i < PARALLELOGRAM_COUNT; i++) {
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

/*
  Returns a function which returns a set of parallelogram points,
  each point's position being determined by a linear interpolation between
  the origin points and the destination points.

  This allows us to parameterize our entire enimation by some float between 0 and 1.
*/
function makeAnimationFunctionBetween(originPoints, destinationPoints) {
  let [xL1, yL1, xT1, yT1, xB1, yB1, xR1, yR1] = originPoints;
  let [xL2, yL2, xT2, yT2, xB2, yB2, xR2, yR2] = destinationPoints;
  
  return (transitionAmount) => [
    linearInterpolation(xL1, xL2, transitionAmount),
    linearInterpolation(yL1, yL2, transitionAmount),
    linearInterpolation(xT1, xB2, transitionAmount), // tops become bottoms
    linearInterpolation(yT1, yB2, transitionAmount), // to simulate the parallelogram
    linearInterpolation(xB1, xT2, transitionAmount), // flipping about the line
    linearInterpolation(yB1, yT2, transitionAmount), // of symmetry
    linearInterpolation(xR1, xR2, transitionAmount),
    linearInterpolation(yR1, yR2, transitionAmount)
  ];
}

// assumes points are ordered [ left, top, bottom, right ]
function parallelogramPointsToTriangles(points) {
  return [points.slice(0,6), points.slice(2,8)];
}

function drawParallelogram(points, fillColour=null, edgeColour=null) {
  if (fillColour === null && edgeColour === null) return;

  let [left, right] = parallelogramPointsToTriangles(points);

  pushPop(() => {
    if (fillColour !== null) {
      stroke(fillColour);
      fill(fillColour);
    }
    
    triangle(...left);
    triangle(...right);
    
    if (edgeColour !== null) {
      stroke(edgeColour);
      fill(edgeColour);
    } else return;
    
    line(...left.slice(0,4));
    line(...left.slice(0,2), ...left.slice(4,6));
    line(...right.slice(2,6));
    line(...right.slice(0,2), ...right.slice(4,6));
  });
}

function makeParametrizedAnimationSteps(pointSets) {
  let steps = [];
  
  for (let i = 0; i < PARALLELOGRAM_COUNT; i++) {
    steps.push(
      makeAnimationFunctionBetween(
        pointSets[i],
        pointSets[(i+1) % PARALLELOGRAM_COUNT]
      )
    );
  }
  
  return steps;
}

const POINT_SETS = generateParallelogramPattern();

                        // fade into points of first parallelogram
const ANIMATION_STEPS = [(_) => POINT_SETS[0]] 
                        // flip through the rest of the parallelograms in the pattern, except from last to first
                        .concat(makeParametrizedAnimationSteps(POINT_SETS).slice(0, PARALLELOGRAM_COUNT-1))
                        // fade out on the last parallelogram
                        .concat([(_) => POINT_SETS[PARALLELOGRAM_COUNT-1]]);


function draw() {
  background(0);

  if (progressTypeButton.checked()) {
    let sliderPos = Math.sin(millis() * 0.001)/2 + 0.5;
    animationProgressSlider.value(sliderPos);
  }
  
  let animationProgress = animationProgressSlider.value();
  
  translate(200, 100);

  for (let [stepNumber, animationStepFunction] of ANIMATION_STEPS.entries()) {
    let [min, max] = [stepNumber * TIME_PER_STEP, (stepNumber+1) * TIME_PER_STEP]; 
    let revealedCol = STATIC_PARALLELOGRAM_COLOURS[Math.max(0, (stepNumber-1) % STATIC_PARALLELOGRAM_COLOURS.length)];

    // We start drawing visited parallelograms 
    // after the first animation step (the initial fade-in)
    if (stepNumber > 0 && animationProgress >= TIME_PER_STEP * stepNumber) {
      drawParallelogram(POINT_SETS[stepNumber-1], revealedCol, revealedCol);
    }
    
    // Each step of the animation is parametrized
    // by a number between 0 and 1. 
    let constrained = clamp(min, max, animationProgress)
    let currentStepProgress = map(constrained, min, max, 0, 1);
    
    // Generate the geometry of the moving parallelogram based on current progress.
    let movingPoints = animationStepFunction(currentStepProgress);
    
    let movingParallelogramColour = (/* immediately invoked function expression */ () => {
      if (animationProgress < TIME_PER_STEP) 
        // Fade from black to colour on first step.
        return MOVING_PARALLELOGRAM_COLOURS.map(v => linearInterpolation(
          0, v, currentStepProgress));

      if (stepNumber > 0 && stepNumber < ANIMATION_STEP_COUNT-1)
        // Stay one colour from steps 1 - 12
        return MOVING_PARALLELOGRAM_COLOURS;

      // On the final step, fade out from final parallelogram's colour to black
      return MOVING_PARALLELOGRAM_COLOURS.map(from => revealedCol.map(to => linearInterpolation(
        from, to, currentStepProgress)));
    })();
  
    if (currentStepProgress > 0 && currentStepProgress < 1)
      drawParallelogram(movingPoints, ...movingParallelogramColour);
  }
}