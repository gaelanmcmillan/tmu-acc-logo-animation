function parallelogram (sideLength, x0=0, y0=0, doDrawCenter=false) {
    if (doDrawCenter) {
      push();
      stroke([200,200,200]);
      strokeWeight(5);
      point(x0, y0)
      pop();
    } 
    
    let sixty = 60 * Math.PI / 180;
    let triHeight = Math.sin(sixty) * sideLength;
    let triWidth = Math.cos(sixty) * sideLength;
    
    let xOffset = triWidth/2 - sideLength;
    let yOffset = triHeight/2;
  
    let xLeft = x0 + xOffset;
    let yLeft = y0 + yOffset;
    let xTop = x0 + triWidth + xOffset;
    let yTop = y0 - triHeight + yOffset;
    let xRight = x0 + triWidth + sideLength + xOffset;
    let yRight = y0 - triHeight + yOffset;
    let xBot = x0 + sideLength + xOffset;
    let yBot = y0 + yOffset;
    
    line(xLeft,  yLeft,  xTop,   yTop);
    line(xTop,   yTop,   xRight, yRight);
    line(xRight, yRight, xBot,   yBot);
    line(xBot,   yBot,   xLeft,  yLeft);
    
    triangle(xLeft, yLeft, xTop,   yTop,   xBot, yBot);
    triangle(xTop,  yTop,  xRight, yRight, xBot, yBot);
  }
  
  /* GLOBALS */
  var revealFrames = 30;
  var firstX = 0;
  var firstY = -100;
  var sideLength = 50;
  var sixty = 60 * Math.PI / 180;
  var triHeight = Math.sin(sixty) * sideLength;
  var triWidth = Math.cos(sixty) * sideLength;
  
  /* Colors */
  var RED = [255,0,0];
  var GREEN = [0,200,0];
  var YELLOW = [255,220,0];
  
  var parallelogramParams = [
    /* x-coord                  y-coord                    rotation     color    */
    [  firstX,                  firstY,                    30,          RED      ],
    [  firstX+triWidth,         firstY+triHeight,         -30,          YELLOW   ],
    [  firstX+triWidth*3,       firstY+triHeight,          90,          GREEN    ],
    [  firstX+triWidth*2,       firstY+triHeight*2,        30,          RED      ],
    [  firstX+triWidth*3,       firstY+triHeight*3,       -30,          YELLOW   ],
    [  firstX+triWidth,         firstY+triHeight*3,        90,          GREEN    ],
    [  firstX,                  firstY+triHeight*4,        30,          RED      ],
    [  firstX-triWidth,         firstY+triHeight*3,       -30,          YELLOW   ],
    [  firstX-triWidth*3,       firstY+triHeight*3,        90,          GREEN    ],
    [  firstX-triWidth*2,       firstY+triHeight*2,        30,          RED      ],
    [  firstX-triWidth*3,       firstY+triHeight,         -30,          YELLOW   ],
    [  firstX-triWidth,         firstY+triHeight,          90,          GREEN    ]
  ];
  
  function setup() {
    createCanvas(400, 400);
    angleMode(DEGREES);
  }
  
  function drawParallelogram(x,y,rot,col) {
    push();
    fill(col);
    stroke(col);
    translate(x,y);
    rotate(rot);
    parallelogram(sideLength);
    pop();
  }
  
  function drawAllParallelograms(parallelogramParams) {
    for (let params of parallelogramParams) {
      drawParallelogram(...params);
    }
  }
  
  function fadeInParallelograms(parallelogramParams) {
    
    /* draw all parallelograms that have already been 'revealed' */
    for (let i = 0; (i+1) * revealFrames <= frameCount; i++) {
      let params = parallelogramParams[Math.floor(i)];
      drawParallelogram(...params);
    }
    
    /* reveal new parallelograms */
    let [x,y,rot,col] = parallelogramParams[Math.floor(frameCount/revealFrames)];
    let progressAmt = map(frameCount % revealFrames, 0,revealFrames,0,1);
    drawParallelogram(x,y,rot,col.map(val => val*progressAmt));
  }
  
  function draw() {
    background(0);
    
    translate(200,200);
    
    push();
    noStroke();
    fill(150);
    text(`frame: ${frameCount}`, -180,-160);
    pop();
    
    if (frameCount < 12 * revealFrames) {
      fadeInParallelograms(parallelogramParams);
    } else {
      drawAllParallelograms(parallelogramParams);
      noLoop();
    } 
  }