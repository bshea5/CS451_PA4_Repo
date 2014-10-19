
//
// TODO: Implement normal mapping. This should add on to the texture mapping shader: texturing.vert/frag
//
void main()
{
	gl_FrontColor =  gl_Color;
	gl_Position = ftransform();
} 