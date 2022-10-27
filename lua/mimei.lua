--读取sid
sid =request['sid']
print("sid=", sid)
local mm = require('mimei');

--创建弥媒
mid='ilc_mDQ-vS9jRIRw2w70pyf8ASN'

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
print("fsid=", fsid)
err = mm.MFSetObject(fsid, img)
if (err ~= nil) then
	print('MMSetObject err=',  err);
	return err
end

macid, err = mm.MFTemp2MacFile(fsid, mid);
if (err ~= nil) then
	print('MFTemp2MacFile err=',  err);
	return err
end
print('MFTemp2MacFile macid=', macid);
-- remember macid of the image file

fsid, err = mm.MFOpenTempFile(sid);
FV = {name='', lastModified=1666872786042, macid="", size=40, type="page"}
function FV:new(o,macid)
   o = o or {}
   setmetatable(o, self)
   self.__index = self
   self.name = '["fwefqw","'..macid..'"]'
   return o
end
local fi = FV:new(nil,macid)            // 生成文件obj
print("FileInfo: ", fi["name"])
err = mm.MFSetObject(fsid, fi);
if (err ~= nil) then
        print('MFSetObject err=',  err);
        return err
end
macid, err = mm.MFTemp2MacFile(fsid, mid);
print("FV2MacFile, mac id=", macid, err)

// 文件obj存档
ret, err = mm.Hset(mmsid, "Test", macid, fi);
if (err ~= nil) then
        print('FV Hset err=',  err);
        return err
end
print("FV Hset ret=",ret, macid);

local sp = scorepair.new(1666868524589, macid)
print("Scorepair=", sp:getScore(), sp:getMember());
ret,err  = mm.Zadd(mmsid, "Test", sp)
print("Zadd ret=", ret, err)

err = mm.MMBackup(sid, mid, '')
if (err ~= nil) then
        print('MMBackup err=%v',  err);
        return err
end
