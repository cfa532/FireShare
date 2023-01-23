sid =request['sid']
print("mimei sid", sid)
local mm = require('mimei');
print('create mimei');

mid, err = mm.MMCreate(sid, '', '', 'testHMset', 2, 0x07276705);
if (err ~= nil) then
	print('MMCreate err=',  err);
	return err
end
print("mid", mid)

mmsid, err = mm.MMOpen(sid, mid, 'cur');
if (err ~= nil) then
	print('MMOpen err',  err);
	return err
end
print('MMOpen mmsid=', mmsid);


local fv0 = fvpair.new('field0', 'value0')

--hmset hmget
err = mm.HMSet(mmsid, 'hkey', fv0);
if (err ~= nil) then
	print("HMSet result=", err)
end

local fvs, err = mm.HMGet(mmsid, "hkey", "field0")
if (err ~= nil) then
	print('HMGet err=',  err);
	return err
end

print("read fvs")
for k,v in ipairs(fvs) do
        print(k,v)
end

--backup
--备份
err = mm.MMBackup(sid, mid, '')
if (err ~= nil) then
	print('MMBackup err=%v',  err);
	return err
end


--异步接收备份消息
local ver
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
	reg = "(%a+)=(.*)"
	_, _, key, value = string.find(info, reg)
	
	if (key=="ver") then
		--print("ver", value)
		ver = value
		break
	end
	if (key=="err") then
		print("err", value)
		return value
	end	
	
	print(key, value)
end

print("ver", ver)

local mmsid2, err = mm.MMOpen(sid, mid, 'last');
if (err ~= nil) then
	print('MMOpen err=',  err);
	return err
end

local fvs, err = mm.HMGet(mmsid2, "hkey", "field0")
if (err ~= nil) then
	print('HMGet err=',  err);
	return err
end

print("read fvs")
for k,v in ipairs(fvs) do
        print(k,v)
end
