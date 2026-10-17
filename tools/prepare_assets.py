"""Reproduce PNG assets and instrumental Ogg from the original distribution."""
from pathlib import Path
import subprocess,sys,tempfile
from PIL import Image
from extract import extract
source=Path(sys.argv[1]);dest=Path(sys.argv[2]);dest.mkdir(parents=True,exist_ok=True)
with tempfile.TemporaryDirectory() as temp:
 extract(source/'MUSTARD.PAK',temp)
 for name in ['wire','neuron','weird','sphere','phong','wipeout','alex','vic','frame','frame2','tunnel','blobby','bd2']:
  data=(Path(temp)/(name+'.raw')).read_bytes();count=len(data)-768;width=320 if count in (64000,192000) else 256;height=count//width
  palette=list(data[:768]);palette=[min(255,x*4) for x in palette] if max(palette)<=63 else palette
  im=Image.frombytes('P',(width,height),data[768:768+width*height]);im.putpalette(palette);im.save(dest/(name+'.png'))
subprocess.run(['ffmpeg','-y','-v','error','-i',str(source/'GARLIC.PAK'),'-c:a','libvorbis','-q:a','5',str(dest/'music.ogg')],check=True)
