![alt text](https://github.com/gaelanmcmillan/tmu-acc-logo-animation/blob/master/media/logo.png)<br>
Our club logo.<br>
(Disclaimer: I am not the artist who created the geometric pattern in this image. If you know who did, please let me know! Credit goes to Robin Nash for adding text to the image above.)
<br><br>
See the final animation [here](https://gaelanmcmillan.github.io/tmu-acc-logo-animation/).
<br><br>
My [first approach](https://editor.p5js.org/gaelanmcmillan/sketches/ueJ0T-W_S) was to calculate the
points of a single parallelogram, then position each shape in the pattern by simply changing the canvas drawing orientation using calls to p5's `translate` and `rotate`. This worked in a pinch, but my original goal was to animate a moving parallelogram flipping through the pattern to reveal each shape. Something akin to the [classic Nintendo Gamecube intro](https://www.youtube.com/watch?v=CpmYW-gCSy4). 
<br><br>
The simplest way I saw to achieve this flipping illusion was by performing a point-to-point [linear interpolation](https://en.wikipedia.org/wiki/Linear_interpolation) between the positions of each neighbouring parallelogram. So, in my [second run](https://editor.p5js.org/gaelanmcmillan/sketches/d3jOizxAI), I first figured out how to calculate the points of each parallelogram based on the appropriate translation and rotation in the pattern. I then used these parallogram points to create parametrized animation functions so each flip can be performed smoothly in succession. Each animation function maps a value between zero and one to a point-to-point linear interpolation between two parallelogram geometries. The flipping illusion is achieved by lerping the "top" and "bottom" points of the origin parallelogram toward the "bottom" and "top" points of the destination parallelogram respectively.
<br><br>
If I do a third version, it'll be to either replace the moving parallelogram with a pseudo-3D cube to get closed to the Gamecube animation, or simply change the direction of the moving parallelogram's rotation to better create an illusion of 3D space. Currently the transition between red and yellow parallelograms breaks the illusion a bit, for me.
<br><br>
Sketch of the animation steps, made prior to coding.
![alt text](https://github.com/gaelanmcmillan/tmu-acc-logo-animation/blob/master/media/animation-steps.jpeg)
