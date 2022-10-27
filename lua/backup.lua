--读取sid
sid =request['sid']
print("sid=", sid)
local mm = require('mimei');

--创建弥媒
mid='ilc_mDQ-vS9jRIRw2w70pyf8ASN'

--打开弥媒
mmsid, err = mm.MMOpen(sid, mid, 'cur');
if (err ~= nil) then
	print('MMOpen err=',  err);
	return err
end
print('MMOpen mmsid=', mmsid);

-- load image file
local inp = assert(io.open('gir.jpg', 'rb'))
local img = inp:read("*a")
print(#img)

fsid, err = mm.MFOpenTempFile(sid);
err = mm.MFSetObject(fsid, img, 0)
if (err ~= nil) then
	print('MMSetObject err=',  err);
	return err
end

macid, err = mm.MFTemp2MacFile(fsid, mid);
if (err ~= nil) then
	print('MFTemp2MacFile err=',  err);
	return err
end
print('MFTemp2MacFile macid=', mmsid);


--备份
err = mm.MMBackup(sid, mid, '')
if (err ~= nil) then
	print('MMBackup err=%v',  err);
	return err
end

--异步接收备份消息
local msg = require('msg');
while true
do
 repeat
  strmsg, err = msg.PullMsg(sid, 3)
  if (err ~= nil) then
   print('PullMsg err=%v',  err);
   return err
  end
 until(strmsg ~= nil)
 info = strmsg:getMsg()
end
return "exit";
