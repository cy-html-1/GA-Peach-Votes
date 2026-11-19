
let pg;

let cycleStart = 0;
let popStart = -1;

let isPressingPeach = false;
let pressStartedOnPeach = false;
let pressStartFrame = 0;
let releaseScale = 1;
let lastTouch = -1000;

// Responsive layout
let designScale = 1;
let canvasW, canvasH;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);

  pg = createGraphics(400, 400);
  pg.textFont('Montserrat');
  pg.textStyle(BOLD);
  pg.textAlign(CENTER, CENTER);

  updateLayout();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateLayout();
}

function updateLayout() {
  // Original design reference: 1920 x 1080
  designScale = min(width /300, height /300);

  canvasW = 750 * designScale;
  canvasH = 750 * designScale;
}

function popIn(t, start, dur = 12) {
  let k = constrain((t - start) / dur, 0, 1);
  return 1 - pow(1 - k, 3);
}

function drawLetter(ch, x, t, start) {
  let s = popIn(t, start);
  if (s <= 0) return;

  pg.push();
  pg.translate(x + 200, 200);
  pg.scale(s);
  pg.fill('navy');
  pg.text(ch, 0, 0);
  pg.pop();
}

function overPeach() {
  let t = frameCount - cycleStart;

  if (t < 55 || popStart >= 0) return false;

  let peachX = width / 2 - 40 * designScale;
  let peachY = height / 2;

  return dist(mouseX, mouseY, peachX, peachY) < 90 * designScale;
}

function beginPress() {
  if (overPeach()) {
    isPressingPeach = true;
    pressStartedOnPeach = true;
    pressStartFrame = frameCount;
  }
}

function releasePress() {
  if (isPressingPeach && pressStartedOnPeach) {
    releaseScale = getHeldScale();
    popStart = frameCount;
  }

  isPressingPeach = false;
  pressStartedOnPeach = false;
}

function getHeldScale() {
  let heldFrames = frameCount - pressStartFrame;
  let growth = Math.exp(heldFrames * 0.025);

  // Allow the peach to grow large enough to fill the screen
  let maxScale = max(width / 68, height / 76);

  return min(growth, maxScale);
}

function mousePressed() {
  if (millis() - lastTouch < 500) return;
  beginPress();
}

function mouseReleased() {
  if (millis() - lastTouch < 500) return;
  releasePress();
}

function touchStarted() {
  lastTouch = millis();
  beginPress();
  return false;
}

function touchEnded() {
  lastTouch = millis();
  releasePress();
  return false;
}

function draw() {
  background('#D6EAF8');

  let t = frameCount - cycleStart;

  // Center the original 1920 x 1080 composition
  push();
  scale(designScale);
  translate(0, 0, 0);

  // Letters
  pg.clear();
  pg.noStroke();
  pg.fill('navy');
  pg.textFont('Montserrat');
  pg.textStyle(BOLD);
  pg.textAlign(CENTER, CENTER);

  // Responsive font size
  let responsiveFontSize = 100;
  pg.textSize(responsiveFontSize);

  drawLetter('V', -120, t, 20);
  drawLetter('T', 40, t, 100);
  drawLetter('E', 120, t, 130);

  // Scale graphics buffer to match composition
  image(pg, -200, -200, 400, 400);

  // Restart after pop animation finishes
  if (popStart >= 0 && frameCount - popStart >= 42) {
    cycleStart = frameCount;
    popStart = -1;
    isPressingPeach = false;
    pressStartedOnPeach = false;
    releaseScale = 1;
    t = 0;
  }

  let s = popIn(t, 55, 15);

  let elapsed = popStart < 0
    ? -1
    : frameCount - popStart;

  if (s > 0 && (elapsed < 0 || elapsed < 34)) {
    ambientLight(150);
    directionalLight(255, 255, 255, -0.5, 0.5, -1);

    let fruitScale = 1;

    if (isPressingPeach && pressStartedOnPeach) {
      fruitScale = getHeldScale();
    }

   if (elapsed >= 0 && elapsed < 26) {
  let progress = elapsed / 26;
  fruitScale = releaseScale * (1 + 0.9 * progress * progress);
} else if (elapsed >= 26) {
  fruitScale = releaseScale * 1.9 *
    (1 - (elapsed - 26) / 8);
}

// Allow the peach to fill the screen without excessively
// enlarging the stem and other geometry
let maxScreenScale = max(width / 68, height / 76);
fruitScale = min(fruitScale, maxScreenScale * 1.9);

    push();
    translate(-40, 0, 0);
    scale(s * max(0, fruitScale));
    rotateY(sin(frameCount * 0.025) * 0.15);
    noStroke();

    // Peach body
    fill(245, 135, 85);
    ellipsoid(34, 38, 25);

    // Center crease
    push();
    translate(0, 3, 26);
    fill(190, 75, 65);
    ellipsoid(1.5, 28, 5);
    pop();

   // Stem and leaf gradually fade as peach expands
let stemAlpha = map(fruitScale, 8, 12, 255, 0);
stemAlpha = constrain(stemAlpha, 0, 255);

if (stemAlpha > 0) {

  // Stem
  push();
  translate(0, -39, 0);
  rotateZ(-0.18);
  fill(110, 70, 40, stemAlpha);
  cylinder(2, 13);
  pop();

  // Leaf
  push();
  translate(9, -41, 0);
  rotateZ(-0.55);
  fill(65, 140, 65, stemAlpha);
  ellipsoid(12, 4.5, 6);
  pop();
}
  }

  // Particle burst
  if (elapsed >= 26 && elapsed < 38) {
    let burst = elapsed - 26;

    for (let i = 0; i < 12; i++) {
      let angle = TWO_PI * i / 12;
      let distance = burst * 5;

      let x = -40 + cos(angle) * distance;
      let y = sin(angle) * distance;

      push();
      translate(x, y, 5);
      noStroke();
      fill(i % 2 === 0 ? '#F08B59' : '#F5B2A6');
      sphere(max(1, 4 - burst * 0.2));
      pop();
    }
  }

  pop();
}
