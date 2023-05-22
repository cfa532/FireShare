sid =request['sid']
print("mimei sid", sid)
local mm = require('mimei');

mid = "-4Q6x4ZbhiNPA2Fen3ekndqV1lO"
mmsid, err = mm.MMOpen(sid, mid, 'cur');
if (err ~= nil) then
	print('MMOpen err',  err);
	return err
end
print('MMOpen mmsid=', mmsid);

local f = {}
f["name"] = "lua1";
f["key"] = "lua2";
f["3"] = 3;			--检查数据类型
f["4"] = "lua4";
f["6"] = "lua6";

local fmid, err = mm.MMCreate(sid, '', '', '{{auto}}', 1, 0x07276705)
if (err ~= nil) then
	print('MMCreate err',  err);
	return err
end
print("fmid=", fmid)

local fsid, err = mm.MMOpen(sid, fmid, "cur")
if (err ~= nil) then
	print('MMOpen err',  err);
	return err
end
print("fsid=",fsid)
err = mm.MFSetObject(fsid, f)
if (err ~= nil) then
	print('MFSetObject err',  err);
	return err
end
local ret, err = mm.MMBackup(sid, fmid, "")
if (err ~= nil) then
	print('MMBackup err',  err);
	return err
end
local ret, err = mm.Hset(mmsid, "TESTTTTT", fmid, f)
if (err ~= nil) then
    print("Hset err", err);
    return err
end
local ret, err = mm.MMBackup(sid, mid, "")
if (err ~= nil) then
	print('MMBackup2 err',  err);
	return err
end

print("f[4]", f[4])
print("f[5]", f[5])
print("f[6]", f["6"])
print("maxn", table.maxn(f))
for k,v in ipairs(f) do
        print(k,v)
end

--hset hget
n, err = mm.HSet(mmsid, 'key', 'field10', f);
print("Hset result=", n, err)

value, err = mm.HGet(mmsid, 'key', 'field10');
for k,v in ipairs(value) do
        print(k,v)
end
print(value, err)
