sid =request['sid']
print("sid=", sid)
local mm = require('mimei');

mid="u_iKj5EchsWqL2JQFgLOKSgSArq"

mmsid, err = mm.MMOpen(sid, mid, 'cur');
if (err ~= nil) then
        print('MMOpen err=',  err);
        return err
end
print('MMOpen mmsid=', mmsid);

local o = scorepair.new(212315, "3rd")
local o = scorepair.new(212316, "4th")
local ret, err = mm.Zadd(mmsid, "Test", o)
if (err ~= nil) then
        print("Zadd err=", err)
        return err
end

local ret, err = mm.Zrange(mmsid, "Test", 0, -1)
if (err ~= nil) then
        print("ZRange err=", err)
        return err
end
print("Loop value", table.getn(ret))
for k,v in pairs(ret)
do
        print(k, v)
end

ret, err = mm.Zrem(mmsid, "Test", "1st")
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