import * as THREE from 'three';
import {MarchingCubes} from './vendor/MarchingCubes.js';
import {SoftwareRenderer} from './fallback.js';
import {vertex,fragment} from './shaders.js';
import {scenes,sceneAt,DURATION} from './timeline.js';
const $=s=>document.querySelector(s),canvas=$('#screen'),overlay=$('#overlay'),ctx=overlay.getContext('2d');
let renderer,software=null,ready=false,started=false,current=-1,last=0,clock=0;
const audio=new Audio('./assets/music.ogg');audio.preload='auto';
const textures={},loader=new THREE.TextureLoader();
const uniforms={map:{value:null},time:{value:0},local:{value:0},mode:{value:0},fade:{value:1},resolution:{value:new THREE.Vector2(640,480)}};
const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,uniforms,depthTest:false,depthWrite:false})));
const objects=new THREE.Scene(),cam3=new THREE.PerspectiveCamera(48,4/3,.1,100);cam3.position.z=5;
objects.add(new THREE.AmbientLight(0xa7a9dd,1));
const light=new THREE.PointLight(0xeee7ff,70);light.position.set(-3,3,4);objects.add(light);
const rim=new THREE.PointLight(0xf25f7d,35);rim.position.set(3,-2,1);objects.add(rim);
const geometry=new THREE.IcosahedronGeometry(1,2),pos=geometry.attributes.position,base=pos.array.slice();
const metal=new THREE.MeshPhongMaterial({color:0xd5cde6,shininess:100,specular:0xffffff});
const spikey=new THREE.Mesh(geometry,metal);objects.add(spikey);
const blobs=new MarchingCubes(28,new THREE.MeshPhongMaterial({color:0xa695cf,shininess:100,specular:0xffffff}),false,false,24000);blobs.scale.setScalar(1.8);objects.add(blobs);
function resolution(){const w=Number($('#quality').value);renderer.setSize(w,w*.75,false);uniforms.resolution.value.set(w,w*.75);overlay.width=640;overlay.height=480;}
function text(value,x,y,size=46,color='#e8e7ed',align='center'){
 ctx.textAlign=align;ctx.font=`italic 900 ${size}px Arial`;ctx.lineWidth=3;ctx.strokeStyle='#131218';ctx.strokeText(value,x,y);ctx.fillStyle=color;ctx.fillText(value,x,y);
}
function drawOverlay(s,t){ctx.clearRect(0,0,640,480);let l=t-s.start;
 if(s.index===0){ctx.globalAlpha=Math.min(1,l/3)*Math.min(1,(16-l)/2);text('ACME',320,205,66);text('303',320,313,142);ctx.globalAlpha=1;}
 if(s.name==='CREDITS'){const rows=[['STATIX','CODE'],['AAP','GRAPHICS & DESIGN'],['VIC','MUSIC']];const row=rows[Math.floor(l/5)%3];text(row[0],320,235,70);text(row[1],320,280,18,'#bfbdcb');}
 if(s.index===5){text('ACME',320+Math.sin(l)*35,250,100,'#d7e5db');}
 if(s.index===8){text('303',320,270,Math.min(220,70+l*10));}
 if(s.index===14){ctx.fillStyle='#03010699';ctx.fillRect(0,0,640,480);text('303',320,215,130);text('ACME',320,275,42);text('VIC + STATIX + AAP',320,343,22);text('X’97  /  THANK YOU',320,380,15);}
 if(t>DURATION-3){ctx.fillStyle=`rgba(0,0,0,${(t-DURATION+3)/3})`;ctx.fillRect(0,0,640,480);}
}
function render(t){const s=sceneAt(t);if(s.index!==current){current=s.index;uniforms.map.value=textures[s.texture];$('#scene-name').textContent=`${String(s.index+1).padStart(2,'0')} / ${s.name}`;document.body.dataset.scene=s.name;}
 const l=t-s.start;uniforms.time.value=t;uniforms.local.value=l;uniforms.mode.value=s.effect;uniforms.fade.value=Math.min(1,l/0.65,(s.end-t)/.65);
 if(software)software.render(s,t,textures[s.texture],uniforms.fade.value);else{renderer.autoClear=true;renderer.render(scene,camera);}
 if(s.effect>=7){
 spikey.visible=s.effect===7;blobs.visible=s.effect===8;
 if(spikey.visible){for(let i=0;i<pos.count;i++){let x=base[i*3],y=base[i*3+1],z=base[i*3+2];let f=1.+.3*Math.sin(x*8.+t*2.)*Math.cos(y*7.-t)*Math.sin(z*6.+t);pos.setXYZ(i,x*f,y*f,z*f);}pos.needsUpdate=true;geometry.computeVertexNormals();spikey.rotation.set(t*.35,t*.49,t*.16);spikey.scale.setScalar(.9+.1*Math.sin(t*2));}
 if(blobs.visible){blobs.reset();for(let i=0;i<6;i++){const a=i*1.0472+t*.6;blobs.addBall(.5+Math.sin(a)*.21,.5+Math.cos(a*1.3)*.20,.5+Math.sin(a*.7)*.21,.55,12);}blobs.update();blobs.rotation.set(t*.15,t*.23,0);}
 if(software)software.mesh(spikey.visible?spikey:blobs,cam3,THREE);else{renderer.autoClear=false;renderer.clearDepth();renderer.render(objects,cam3);}
 }
 drawOverlay(s,t);
 $('#seek').value=t;$('#clock').textContent=`${format(t)} / 04:05`;
}
function format(t){return `${Math.floor(t/60).toString().padStart(2,'0')}:${Math.floor(t%60).toString().padStart(2,'0')}`;}
function frame(now){requestAnimationFrame(frame);if(!ready)return;if(started){clock=Math.min(DURATION,audio.currentTime);if(audio.ended){$('#play').textContent='↺';$('#play').setAttribute('aria-label','Tornar a començar');}}if(now-last>30){render(clock);last=now;}}
function fail(message){$('#error').hidden=false;$('#error').textContent=message;}
async function start(){try{await audio.play();started=true;document.body.classList.add('playing');$('#play').disabled=false;$('#play').textContent='Ⅱ';}catch(e){$('#status').textContent='No s’ha pogut iniciar l’àudio. Torna-ho a provar.';console.error(e);}}
async function toggle(){if(!started)return start();if(audio.ended){audio.currentTime=0;await audio.play();}else if(audio.paused)await audio.play();else audio.pause();$('#play').textContent=audio.paused?'▶':'Ⅱ';}
function seek(t){if(!ready)return;audio.currentTime=Math.max(0,Math.min(DURATION,t));clock=audio.currentTime;render(clock);}
function mute(){audio.muted=!audio.muted;$('#mute').textContent=audio.muted?'SO OFF':'SO ON';$('#mute').setAttribute('aria-pressed',audio.muted);}
async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await $('#stage').requestFullscreen();}catch{}}
$('#start').onclick=start;$('#play').onclick=()=>toggle().catch(console.error);$('#mute').onclick=mute;$('#full').onclick=fullscreen;$('#seek').oninput=e=>seek(Number(e.target.value));$('#quality').onchange=resolution;
document.addEventListener('keydown',e=>{if(['INPUT','SELECT','BUTTON'].includes(e.target.tagName))return;if(e.code==='Space'){e.preventDefault();toggle().catch(console.error);}if(e.code==='ArrowRight'){e.preventDefault();seek(clock+5);}if(e.code==='ArrowLeft'){e.preventDefault();seek(clock-5);}if(e.code==='KeyM')mute();if(e.code==='KeyF')fullscreen();});
for(const s of scenes){let b=document.createElement('button');b.textContent=`${format(s.start)} ${s.name}`;b.onclick=()=>{seek(s.start+.7);if(!started)start();};$('#chapters').append(b);}
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();audio.pause();fail('S’ha perdut el context gràfic. Recarrega la pàgina per reprendre la demo.');});
try{
 try{renderer=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance'});renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.LinearSRGBColorSpace;}catch{software=new SoftwareRenderer(canvas);renderer=software;document.body.dataset.renderer='software';}resolution();
 await Promise.all([...new Set(scenes.map(s=>s.texture))].map(async n=>{const tex=await loader.loadAsync(`./assets/${n}.png`);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.magFilter=THREE.LinearFilter;textures[n]=tex;}));
 await new Promise((resolve,reject)=>{if(audio.readyState>=2)return resolve();audio.addEventListener('loadeddata',resolve,{once:true});audio.addEventListener('error',reject,{once:true});audio.load();});
 ready=true;render(0);$('#status').textContent=software?'Mode compatible Canvas 2D. Recursos preparats.':'Recursos preparats. Puja el volum.';$('#start').disabled=false;
}catch(e){console.error(e);fail('No s’ha pogut carregar la demo. Comprova la connexió i que el navegador admeti WebGL 2.');}
requestAnimationFrame(frame);
