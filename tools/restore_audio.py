"""Restore MPEG vocal PCM into PTM sample slots 48–90, preserving tracker note timing. Usage: python restore_audio.py original-directory assets-directory."""
from pathlib import Path
import struct,numpy as np,subprocess
import sys,tempfile
source=Path(sys.argv[1]);dest=Path(sys.argv[2]);dest.mkdir(exist_ok=True,parents=True)
temp=tempfile.TemporaryDirectory();raw=Path(temp.name)/'vocals.s8'
subprocess.run(['ffmpeg','-y','-v','error','-i',str(source/'KETCHUP.PAK'),'-f','s8','-ar','32000','-ac','1',str(raw)],check=True)
p=bytearray((source/'GARLIC.PAK').read_bytes());pcm=np.frombuffer(raw.read_bytes(),dtype=np.int8);cursor=0
for i in range(47,90):
 h=608+i*80;n=struct.unpack_from('<I',p,h+22)[0]
 block=pcm[cursor:cursor+n].astype(np.int16);assert len(block)==n
 delta=np.diff(block,prepend=0).astype(np.uint8).tobytes();struct.pack_into('<I',p,h+18,len(p));p.extend(delta);cursor+=n
assert cursor==len(pcm),(cursor,len(pcm))
(Path(temp.name)/'restored.ptm').write_bytes(p)
subprocess.run(['ffmpeg','-y','-v','error','-i',str(Path(temp.name)/'restored.ptm'),'-c:a','libvorbis','-q:a','5',str(dest/'soundtrack.ogg')],check=True)
print('Restored',cursor,'vocal samples into 43 tracker slots')
