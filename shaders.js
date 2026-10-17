export const vertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
export const fragment=`precision highp float;
varying vec2 vUv;uniform sampler2D map;uniform float time,local,mode,fade;uniform vec2 resolution;
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
vec3 tex(vec2 p){return texture2D(map,fract(p)).rgb;}
void main(){vec2 p=(vUv-.5)*vec2(1.3333,1.);float r=length(p),a=atan(p.y,p.x);vec3 col=vec3(0.);
if(mode<.5){
 vec2 center=vec2(sin(time*.39),cos(time*.31))*.12;p-=center;r=max(length(p),.006);a=atan(p.y,p.x);
 vec2 uv=vec2(a/6.283+time*.035+sin(r*7.-time)*.035,.18/r+time*.19);
 col=tex(uv);col*=smoothstep(.015,.28,r);col*=1.2+.45*sin(uv.y*5.+time*.7);
 if(time<92.)col=col.grb*vec3(.8,1.12,1.04);
}else if(mode<1.5){
 a=abs(mod(a+time*.15,1.0472)-.5236);vec2 uv=vec2(cos(a),sin(a))*r*(2.2+sin(time*.4))+.5+vec2(time*.035);
 col=tex(uv);col+=tex(uv*rot(.12)+vec2(.012))*0.25;
}else if(mode<2.5){
 vec2 uv=vUv;uv.y+=sin(uv.x*9.+time*2.)*.22;uv.x+=sin(uv.y*4.+time)*.12;col=tex(uv);
 col*=.55+.45*sin(vUv.y*400.+time*5.);
}else if(mode<3.5){
 vec2 uv=vUv;float wave=sin(r*34.-time*3.)*.018;
 uv=(uv-.5)*rot(sin(time*.3)*.2)*(1.+.18*sin(time))+ .5;uv+=normalize(p+vec2(.001))*wave;
 col=texture2D(map,clamp(uv,0.,1.)).rgb;
 float grid=step(.97,fract(vUv.x*8.+sin(time)*.4))+step(.97,fract(vUv.y*6.));col*=1.-grid*.7;
}else if(mode<4.5){
 for(int i=0;i<6;i++){float f=float(i);vec2 uv=(vUv-.5)*rot(f*.05+sin(time*.2)*.25)*(1.+f*.22+.12*sin(time))+.5;uv+=p*sin(r*30.-time*3.+f)*.045;col+=tex(uv)*(.34/(1.+f*.5));}
}else if(mode<5.5){
 vec2 uv=p*rot(time*.14);float z=exp2(mod(local*.38,4.));uv*=z;col=tex(uv+.5);
 vec3 layer=tex(uv*.5+.5);col=mix(col,layer,smoothstep(10.,16.,z));
}else if(mode<6.5){
 vec2 uv=vUv;float page=mod(floor(local/4.),3.);uv.y=(1.-uv.y+page)/3.;col=texture2D(map,uv).rgb;
}else{col=vec3(.018,.015,.035)+tex(p*rot(time*.1)+.5)*.15;}
float vig=clamp(1.3-dot(p,p)*.8,.3,1.);col*=vig;col*=.96+.04*sin(vUv.y*resolution.y*3.14159);col=pow(max(col,0.),vec3(.9));gl_FragColor=vec4(col*fade,1.);
}`;
