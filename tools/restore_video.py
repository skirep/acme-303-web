"""Usage: python restore_video.py original-directory assets-directory. Requires numpy, Pillow, Unicorn and FFmpeg."""
import sys,pathlib,subprocess,numpy as np
import decoder303 as d
from extract import lzw
from PIL import Image
out=pathlib.Path(sys.argv[2])/'video';out.mkdir(exist_ok=True,parents=True)
for name in ['ALEX','HARL','PARANOID','VS']:
 raw=lzw((d.source/(name+'.LZW')).read_bytes());n=(len(raw)-1)//23040;d.quant=raw[0];d.call(0x12ccc,eax=0x200000);d.call(0x13244)
 palette=np.minimum(np.array(list(d.u.mem_read(0x5faa8,768)),dtype=np.uint16).reshape(256,3)*4,255).astype(np.uint8)
 proc=subprocess.Popen(['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s','320x192','-r',('35/3' if name=='HARL' else '35/4'),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',str(out/(name.lower()+'.mp4'))],stdin=subprocess.PIPE)
 for f in range(n):
  frame=raw[1+23040*f:1+23040*(f+1)]
  for off,w,h,dest in [(0,160,96,0x600000),(15360,80,48,0x604000),(19200,80,48,0x604f00)]:
   d.u.mem_write(0x500000,frame[off:off+w*h]);d.u.mem_write(0x978b8,b'\0');d.call(0x1b648,eax=0x500000,ebx=w,ecx=h,edx=dest)
  d.call(0x1b819,eax=0x600000,edx=0x604000,ebx=0x700000)
  indices=np.frombuffer(d.u.mem_read(0x700000,320*192),dtype=np.uint8);proc.stdin.write(palette[indices].tobytes())
 proc.stdin.close();assert proc.wait()==0;print(name,n,'frames',flush=True)
