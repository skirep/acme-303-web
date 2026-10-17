"""Isolated execution of the original LE image codec; no DOS process or OS I/O. Requires Unicorn."""
import struct,pathlib,sys
from unicorn import *
from unicorn.x86_const import *
source=pathlib.Path(sys.argv[1]);p=(source/'303.EXE').read_bytes();le=0x2c80
u=Uc(UC_ARCH_X86,UC_MODE_32);u.mem_map(0,0x1000000)
objs=[struct.unpack_from('<6I',p,le+0xc4+i*24) for i in range(2)]
for size,base,flags,first,n,res in objs:
 for j in range(n):
  ent=p[le+0xf4+(first-1+j)*4:le+0xf4+(first+j)*4];num=int.from_bytes(ent[:3],'big');flag=ent[3]
  if num:
   start=0x17a00+(num-1)*4096;data=p[start:start+(0x627 if num==67 else 4096)];u.mem_write(base+j*4096,data)
idx=struct.unpack_from('<68I',p,le+0x20c)
for pg in range(67):
 r=le+0x31c+idx[pg];end=le+0x31c+idx[pg+1]
 ob=objs[0] if pg<55 else objs[1];base=ob[1]+(pg-(ob[3]-1))*4096
 while r<end:
  st,fl=p[r:r+2];r+=2;so=struct.unpack_from('<h',p,r)[0];r+=2
  obj=p[r];r+=1
  if fl&0x40:raise ValueError('obj16')
  off=0
  if st&15!=2:
   n=4 if fl&0x10 else 2;off=int.from_bytes(p[r:r+n],'little');r+=n
  if fl&3:raise ValueError(('import',fl))
  typ=st&15;address=base+so;target=objs[obj-1][1]+off
  if typ==7:u.mem_write(address,struct.pack('<I',target))
  elif typ==2:u.mem_write(address,struct.pack('<H',0))
  elif typ==6:u.mem_write(address,struct.pack('<IH',target,0))
  else:raise ValueError((typ,fl))
stack=0xf00000;ret=0xe00000
heap=0x300000
quant=12

def hook(uc,addr,size,ud):
 global heap
 if addr in [0x32c83,0x32adb,0x111b0,0x115f8]:
  if addr==0x32c83:
   n=uc.reg_read(UC_X86_REG_EAX);uc.reg_write(UC_X86_REG_EAX,heap);heap+=((n+65535)//65536)*65536
  elif addr==0x111b0:uc.reg_write(UC_X86_REG_EAX,0x280000)
  elif addr==0x115f8:uc.mem_write(uc.reg_read(UC_X86_REG_EDX),bytes([quant]))
  sp=uc.reg_read(UC_X86_REG_ESP);target=struct.unpack('<I',uc.mem_read(sp,4))[0];uc.reg_write(UC_X86_REG_ESP,sp+4);uc.reg_write(UC_X86_REG_EIP,target)

for addr in [0x32c83,0x32adb,0x111b0,0x115f8]:u.hook_add(UC_HOOK_CODE,hook,begin=addr,end=addr)

def call(addr,eax=0,ebx=0,ecx=0,edx=0):
 u.reg_write(UC_X86_REG_ESP,stack);u.mem_write(stack,struct.pack('<I',ret));u.reg_write(UC_X86_REG_EAX,eax);u.reg_write(UC_X86_REG_EBX,ebx);u.reg_write(UC_X86_REG_ECX,ecx);u.reg_write(UC_X86_REG_EDX,edx)
 try:u.emu_start(addr,ret,count=10000000)
 except UcError as e:print('ERROR',e,hex(u.reg_read(UC_X86_REG_EIP)));raise
 if u.reg_read(UC_X86_REG_EIP)!=ret:raise ValueError(('timeout',hex(u.reg_read(UC_X86_REG_EIP))))

