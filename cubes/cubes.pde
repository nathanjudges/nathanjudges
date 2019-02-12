// Size of outer cube
float bounds = random(300, 500);
float edges = random(50, 200);
float red = random(200, 255);
float green = 0;
float blue = random(50, 100);


void setup() 
{
  size(1400, 900, P3D);
  frameRate(30);
  strokeWeight(2);
  lights();
}

void draw() { 
  background(#f6f6f6);



  // Center in display window
  translate(width/2, height/2);

  // Rotate everything, including external large cube
  rotateX(frameCount * 0.01);
  rotateY(frameCount * 0.005);
  rotateZ(frameCount * 0.001);
  stroke(#2d2d2d);

  if (mousePressed == true) {
    rotateX(pmouseX * 0.001);
    rotateY(mouseX * 0.0001);
    rotateZ(pmouseY * 0.001);
  }

  // Outer transparent cube, just using box() method

  noFill(); 
  box(bounds);


  //Inner filled cube

  if (mousePressed == true) {
    rotateX(pmouseX * 0.01);
    rotateY(pmouseX * 0.01);
    rotateZ(pmouseY * 0.01);
    fill(blue, green, red, 100);
    noStroke();
    box(edges);
  }
  fill(red, green, blue, 100);
  noStroke();
  box(edges);
}

void mouseMoved() {

  //Inner cube
    
   
    
   if (mouseX < width/2) {
    rotateX(pmouseX * 0.001);
    rotateY(mouseX * 0.0001);
    rotateZ(pmouseY * 0.001);
    noStroke();
    translate(random(-25, 25), random(-10, 10), random(-10, 10));
   }
   
   if (mouseX > width/2) {
    float red = (0.3 * pmouseY);
    float blue = (pmouseY);
    float green = (0.1 * pmouseX);
    fill(red, green, blue);
   }
   
    
    box(edges);
}
