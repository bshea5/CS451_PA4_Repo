//
// TODO: Implement normal mapping. This should add on to the texture mapping shader: texturing.vert/frag
//

uniform sampler2D color_texture; 
uniform sampler2D norml_map;  //added for bump mapping

varying vec4 diffuse,ambientGlobal, ambient;
varying vec3 normal,lightDir,halfVector;
varying float dist;

//function from: http://www.thetenthplanet.de/archives/1180
//get the cotangent matrix
mat3 cotangent_frame( vec3 N, vec3 p, vec2 uv )
{
    // get edge vectors of the pixel triangle
    vec3 dp1 = dFdx( p );
    vec3 dp2 = dFdy( p );
    vec2 duv1 = dFdx( uv );
    vec2 duv2 = dFdy( uv );
 
    // solve the linear system
    vec3 dp2perp = cross( dp2, N );
    vec3 dp1perp = cross( N, dp1 );
    vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;
    vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;
 
    // construct a scale-invariant frame 
    float invmax = inversesqrt( max( dot(T,T), dot(B,B) ) );
    return mat3( T * invmax, B * invmax, N );
}

//function from: http://www.thetenthplanet.de/archives/1180
//use the cotangent to perturb the interpolated vertex normal
vec3 perturb_normal( vec3 N, vec3 V, vec2 texcoord )
{
    // assume N, the interpolated vertex normal and 
    // V, the view vector (vertex to eye)
    vec3 map = texture2D( norml_map, texcoord ).xyz;
#ifdef WITH_NORMALMAP_UNSIGNED
    map = map * 255./127. - 128./127.;
#endif
#ifdef WITH_NORMALMAP_2CHANNEL
    map.z = sqrt( 1. - dot( map.xy, map.xy ) );
#endif
#ifdef WITH_NORMALMAP_GREEN_UP
    map.y = -map.y;
#endif
    mat3 TBN = cotangent_frame( N, -V, texcoord );
    return normalize( TBN * map );
}

void main() {  
	  
	vec4 norm_mapping = vec4(0);
	//--lighting variables--------------
	vec3 n,halfV;
	float NdotL,NdotHV;
	vec4 color = vec4(0); //ambientGlobal;
	float att,spotEffect;
	int get_light=0;
	//---------------------------------

	//--normal mapping----------------------------------------------------------------
	n = normalize(texture2D(norml_map, gl_TexCoord[0].st).rgb * 2.0 - 1.0);
	n = perturb_normal( n, lightDir, gl_TexCoord[0].st);	//handles cotangent
	
	/* compute the dot product between normal and ldir */
	NdotL = max(dot(n,normalize(lightDir)),0.0);

	n = NdotL * texture2D(color_texture, gl_TexCoord[0].st).rgb;
	norm_mapping = vec4(n, 1.0);
	//----------------------------------------------------------------------------------

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
		if (spotEffect >threshold ) //withing the spotlight thresh hold?
		{	
			//append all light effects to variable color

			spotEffect = pow(spotEffect, gl_LightSource[0].spotExponent);
			att = spotEffect / (gl_LightSource[0].constantAttenuation +
			                    gl_LightSource[0].linearAttenuation * dist +
		                        gl_LightSource[0].quadraticAttenuation * dist * dist);

			color += att * (diffuse * NdotL + ambient); //add ambient and diffuse light

			halfV = normalize(halfVector);
			NdotHV = max(dot(n,halfV),0.0);
			color +=	att	* gl_FrontMaterial.specular 
							* gl_LightSource[0].specular 
							* pow(NdotHV,gl_FrontMaterial.shininess); //add specular and shinies
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
	//--end lighting------------------------------------------------------------------

	// Set the output color of our current pixel  
	gl_FragColor = color * norm_mapping;
}  