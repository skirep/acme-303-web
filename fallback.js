// Low-resolution CPU fallback for browsers where WebGL is unavailable.
// Three.js still supplies all projected mesh geometry and the camera matrices.
export class SoftwareRenderer {
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.buffer=document.createElement('canvas');this.buffer.width=160;this.buffer.height=120;this.b=this.buffer.getContext('2d');this.pixels=this.b.createImageData(160,120);this.sources=new WeakMap();}
 setSize(w,h){this.canvas.width=w;this.canvas.height=h;}
 source(texture){if(this.sources.has(texture))return this.sources.get(texture);let c=document.createElement('canvas');c.width=texture.image.width;c.height=texture.image.height;let x=c.getContext('2d');x.drawImage(texture.image,0,0);let s={w:c.width,h:c.height,data:x.getImageData(0,0,c.width,c.height).data};this.sources.set(texture,s);return s;}
 render(s,t,texture,fade){const src=this.source(texture),data=this.pixels.data,l=t-s.start;const fract=x=>x-Math.floor(x);
 for(let y=0;y<120;y++)for(let x=0;x<160;x++){
 let u=x/160,v=1-y/120,px=(u-.5)*1.3333,py=v-.5,r=Math.hypot(px,py),a=Math.atan2(py,px),light=1;
 if(s.effect===0){px-=Math.sin(t*.39)*.12;py-=Math.cos(t*.31)*.12;r=Math.max(.006,Math.hypot(px,py));a=Math.atan2(py,px);u=a/(Math.PI*2)+t*.035+Math.sin(r*7-t)*.035;v=.18/r+t*.19;light=Math.min(1,r*4)*(1.2+.45*Math.sin(v*5+t*.7));}
 else if(s.effect===1){a=Math.abs(fract((a+t*.15)/1.0472)*1.0472-.5236);u=Math.cos(a)*r*(2.2+Math.sin(t*.4))+.5+t*.035;v=Math.sin(a)*r*(2.2+Math.sin(t*.4))+.5+t*.035;}
 else if(s.effect===2){v+=Math.sin(u*9+t*2)*.22;u+=Math.sin(v*4+t)*.12;}
 else if(s.effect===3||s.effect===4){let angle=Math.sin(t*.3)*.2,z=1+.18*Math.sin(t),c=Math.cos(angle),sn=Math.sin(angle),dx=u-.5,dy=v-.5;u=(dx*c-dy*sn)*z+.5;v=(dx*sn+dy*c)*z+.5;let wave=Math.sin(r*34-t*3)*.018;u+=px*wave*4;v+=py*wave*4;}
 else if(s.effect===5){let z=2**((l*.38)%4),c=Math.cos(t*.14),sn=Math.sin(t*.14);u=(px*c-py*sn)*z+.5;v=(px*sn+py*c)*z+.5;}
 else if(s.effect===6){v=(1-v+Math.floor(l/4)%3)/3;}
 else{u=px+.5;v=py+.5;light=.15;}
 let sx=Math.floor(fract(u)*src.w),sy=Math.floor((1-fract(v))*(src.h-1)),k=(sy*src.w+sx)*4,i=(y*160+x)*4;light*=fade*(.96+.04*Math.sin(y*Math.PI));
 data[i]=Math.min(255,src.data[k]*light);data[i+1]=Math.min(255,src.data[k+1]*light);data[i+2]=Math.min(255,src.data[k+2]*light);data[i+3]=255;
 }
 this.b.putImageData(this.pixels,0,0);this.ctx.imageSmoothingEnabled=false;this.ctx.drawImage(this.buffer,0,0,this.canvas.width,this.canvas.height);
 }
 mesh(mesh,camera,THREE){mesh.updateMatrixWorld();camera.updateMatrixWorld();const a=mesh.geometry.attributes.position,n=mesh.geometry.drawRange.count;let tris=[];const index=mesh.geometry.index;let count=Math.min(index?index.count:a.count,Number.isFinite(n)?n:Infinity);let world=new THREE.Vector3();
 for(let i=0;i<count;i+=3){let p=[];for(let j=0;j<3;j++){let k=index?index.getX(i+j):i+j;world.fromBufferAttribute(a,k).applyMatrix4(mesh.matrixWorld).project(camera);p.push(world.clone());}if(p.some(v=>v.z>1||v.z< -1))continue;let norm=new THREE.Vector3().subVectors(p[1],p[0]).cross(new THREE.Vector3().subVectors(p[2],p[0])).normalize();tris.push({p,z:(p[0].z+p[1].z+p[2].z)/3,light:.3+Math.abs(norm.z)*.7});}
 tris.sort((a,b)=>b.z-a.z);let c=this.ctx,w=this.canvas.width,h=this.canvas.height;
 for(let {p,light} of tris){c.beginPath();p.forEach((v,j)=>c[j?'lineTo':'moveTo']((v.x*.5+.5)*w,(.5-v.y*.5)*h));c.closePath();c.fillStyle=`rgb(${Math.round(light*192)},${Math.round(light*170)},${Math.round(light*224)})`;c.fill();}
 }
}
