//
// TODO: Implement texture mapping. This should add on to the spotlight shader: spotlight_shading.vert/frag
//

uniform sampler2D color_texture;

varying vec4 diffuse,ambientGlobal, ambient;
varying vec3 normal,lightDir,halfVector;
varying float dist;
 
void main() 
{
	gl_FragColor = texture2D(color_texture, gl_TexCoord[0].st); //texture

	//--lighting variables--------------
	vec3 n,halfV;
	float NdotL,NdotHV;
	vec4 color = vec4(0); //ambientGlobal;
	float att,spotEffect;
	int get_light=0;
	//---------------------------------

	//--lighting------------------------------------------------------
	/* a fragment shader can't write a verying variable, hence we need
	a new variable to store the normalized interpolated normal */
	n = normalize(normal);
	
	/* compute the dot product between normal and ldir */
	NdotL = max(dot(n,normalize(lightDir)),0.0);

	if (NdotL > 0.0) 
	{
		spotEffect = dot(normalize(gl_LightSource[0].spotDirection), normalize(-lightDir));
		
		float threshold = cos(gl_LightSource[0].spotCosCutoff); //spotCosCutoff is in radian

		if (spotEffect >threshold ) 
		{
			spotEffect = pow(spotEffect, gl_LightSource[0].spotExponent);
			att = spotEffect / (gl_LightSource[0].constantAttenuation +
			                    gl_LightSource[0].linearAttenuation * dist +
		                        gl_LightSource[0].quadraticAttenuation * dist * dist);


			color += att * (diffuse * NdotL + ambient);

			halfV = normalize(halfVector);
			NdotHV = max(dot(n,halfV),0.0);
			color += att * gl_FrontMaterial.specular * gl_LightSource[0].specular * pow(NdotHV,gl_FrontMaterial.shininess);
			get_light=1;
		}
	}

	if(get_light==0)
	{		
		att = 0.1 / (gl_LightSource[0].constantAttenuation +
			         gl_LightSource[0].linearAttenuation * dist +
		             gl_LightSource[0].quadraticAttenuation * dist * dist);		
		color = att * ambient;
	}

	//apply texture with color
	gl_FragColor = color * texture2D(color_texture, gl_TexCoord[0].st);	

}
//void main()
//{ gl_FragColor = gl_Color; }