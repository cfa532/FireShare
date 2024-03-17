local log = require('log')
local auth = require('auth')
local mm = require('mimei')

local reply, err = auth.Login('gen8', '123456')
if (err ~= nil) then
    print(err)
    return err
end

sid = reply:getSid()
uid = reply:getUid()
print("sid=", sid)

--创建弥媒
mid, err = mm.MMCreate(sid, 'Fireshare', '', 'user gen8', 2, 0x07276704);
if (err ~= nil) then
	print('MMCreate err=',  err);
	return err
end
print("MMCreate mid=", mid)

mmsid, err = mm.MMOpen(sid, mid, 'cur');
if (err ~= nil) then
	print('MMOpen err',  err);
	return err
end
print('MMOpen mmsid=', mmsid);

local field0 = 'QmTmkJ7HProViFAeSHhVnNnCXecKCVg2HNEDy5tQNZo2F4'
local fv0 = fvpair.new(field0, 'test value here')
--hmset hmget
err = mm.HSet(mmsid, 'hkey', field0, 'test value here');
if (err ~= nil) then
	print("HMSet result=", err)
end

local fvs, err = mm.HGet(mmsid, "hkey", field0)
if (err ~= nil) then
	print('HMGet err=',  err);
	return err
end
print("read fvs", fvs)

ret, err = mm.MMBackup(sid, mid, '')
if (err ~= nil) then
	print('MMBackup err=',  err);
	return err
end
return 'Test OK'