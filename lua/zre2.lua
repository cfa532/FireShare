sid =request['sid']
print("sid=", sid)
local mm = require('mimei');

mid="CNyB67yd4h9Gt-wJRep2aRgZyAD"

mmsid, err = mm.MMOpen(sid, mid, 'cur');
if (err ~= nil) then
        print('MMOpen err=',  err);
        return err
end
print('MMOpen mmsid=', mmsid);

ret, err = mm.Zrange(mmsid, "Test", 0, -1)
if (err ~= nil) then
        print("Zrange err", err)
        return err
end
print("ret len=", table.getn(ret))

ret, err = mm.Zrem(mmsid, "Test", "8DnWRHiDx1zcyGtzmgyCEPpno_U")
if (err ~= nil) then
        print("Zrem err", err);
        return err
end
print("Zrem ret=", ret)

ret, err = mm.Zrange(mmsid, "Test", 0, -1)
if (err ~= nil) then
        print("Zrange err", err)
        return err
end
print("ret len=", table.getn(ret))
print("Loop value", table.getn(ret))
for k,v in pairs(ret)
do
        print(k, v)
end

--备份
err = mm.MMBackup(sid, mid, '')
if (err ~= nil) then
	print('MMBackup err=%v',  err);
	return err
end