attribute vec4 a_position;
uniform mat4 u_mvpMatrix;
attribute vec4 a_color;
varying vec4 v_color;

//void main(void){
    gl_Position = u_mvpMatrix * a_position;
    v_color = a_color;
//}

