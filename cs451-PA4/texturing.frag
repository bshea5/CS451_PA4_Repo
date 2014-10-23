//
// TODO: Implement texture mapping. This should add on to the spotlight shader: spotlight_shading.vert/frag
//

varying vec4 texCoords;
uniform sampler2D color_texture;
 
void main(void) {
    vec2 longitudeLatitude = vec2((atan(texCoords.y, texCoords.x) / 3.1415926 + 1.0) * 0.5,
                                  (asin(texCoords.z) / 3.1415926 + 0.5));
        // processing of the texture coordinates;
        // this is unnecessary if correct texture coordinates are specified by the application
 
    gl_FragColor = texture2D(color_texture, longitudeLatitude);
        // look up the color of the texture image specified by the uniform "mytexture"
        // at the position specified by "longitudeLatitude.x" and
        // "longitudeLatitude.y" and return it in "gl_FragColor"
}

//void main()
//{ gl_FragColor = gl_Color; }