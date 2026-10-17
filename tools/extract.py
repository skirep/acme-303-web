"""Extract ACME's ALEX PAK (MSB LZW with explicit width/reset codes)."""
import struct, pathlib

def lzw(data):
 bits=0; acc=0; pos=0; width=9; table=[bytes([x]) for x in range(256)]+[b'']*3; prev=None; out=bytearray()
 while True:
  while bits<width:
   if pos>=len(data):return bytes(out)
   acc=(acc<<8)|data[pos];bits+=8;pos+=1
  bits-=width; code=(acc>>bits)&((1<<width)-1)
  if code==256:return bytes(out)
  if code==257:width+=1;continue
  if code==258:width=9;table=table[:259];prev=None;continue
  entry=table[code] if code<len(table) else prev+prev[:1] if code==len(table) and prev else None
  if entry is None:raise ValueError((code,len(table),pos))
  out.extend(entry)
  if prev is not None:table.append(prev+entry[:1])
  prev=entry

def extract(path,dest):
 p=pathlib.Path(path).read_bytes();n,d=struct.unpack_from('<II',p,4);dest=pathlib.Path(dest);dest.mkdir(exist_ok=True,parents=True)
 for i in range(n):
  name,o,s,l=struct.unpack_from('<12sIII',p,d+i*24);name=name.split(b'\0')[0].decode();raw=lzw(p[o:o+s]);assert len(raw)>=l,(name,len(raw),l);raw=raw[:l];(dest/name).write_bytes(raw)
if __name__=='__main__':
 import sys
 extract(*sys.argv[1:])
