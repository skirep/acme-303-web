export const DURATION=244.97;
export const scenes=[
 [0,'WIRE TUNNEL',0,'wire'],[16,'KALEIDOSCOPE',1,'neuron'],[32,'WIPEOUT',2,'wipeout'],[46,'WINDOW',3,'alex'],[60,'CIRCLE ZOOM',4,'weird'],[76,'LINE FX',0,'wire'],[92,'CREDITS',1,'neuron'],[108,'HARLEQUIN / BREAKDANCE',3,'vic'],[126,'GRID ZOOM',5,'neuron'],[136,'PARANOID / VIDEO',3,'alex'],[140,'TYPE COLLAGE',6,'bd2'],[156,'TEXTURE TUNNEL',0,'tunnel'],[174,'SPIKEY',7,'weird'],[194,'METABALLS',8,'sphere'],[208,'VIC + SIMSTIM / VIDEO',3,'vic'],[225,'ALEX / VIDEO',3,'alex'],[231,'FINALPART',5,'neuron']
].map(([start,name,effect,texture],index)=>({start,name,effect,texture,index,end:0}));
scenes.forEach((s,i)=>{s.end=scenes[i+1]?.start??DURATION;const clips={'HARLEQUIN / BREAKDANCE':'harl','PARANOID / VIDEO':'paranoid','VIC + SIMSTIM / VIDEO':'vs','ALEX / VIDEO':'alex'};s.video=clips[s.name]??null;});
export function sceneAt(t){return scenes.find(s=>t>=s.start&&t<s.end)??scenes[scenes.length-1]}
