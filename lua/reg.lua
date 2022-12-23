local sid =request['sid'];
--local auth=require('auth'); 
local mm = require('mimei');
local mid = "aWrd8Pne7tT2FUWM3pkfxdRkGeB";

--auth.Register('lsb', '123456');
--mm.MMSetRight(sid, 'mmroot', '', 0x07276707);

local fsid, err = mm.MFOpenByPath(sid, "mmroot", "/", 0)
if (err ~=nil) then
	print("MFOpen err=", err);
	return err;
end
print ("fsid=", fsid)

local fi, err = mm.MFStat(fsid);
if (err ~=nil) then
        print("MFStat err=", err);
        return err;
end
print (fi)_