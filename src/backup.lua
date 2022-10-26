--读取sid
sid =request['sid']
print("sid=", sid)

--print(string.format("test%d", 1))

--return "test";

local mm = require('mimei');

--创建弥媒
mid, err = mm.MMCreate(sid, '', '', 'testBackup', 2, 0x07276705);
if (err ~= nil) then
	print('MMCreate err=',  err);
	return err
end
print("MMCreate mid=", mid)


--打开弥媒
mmsid, err = mm.MMOpen(sid, mid, 'cur');
if (err ~= nil) then
	print('MMOpen err=',  err);
	return err
end
print('MMOpen mmsid=', mmsid);


--写100个值
for i=0, 100, 1 do
	local key = string.format("key%d", i)
	local value =string.format("value%d", i)
	print("set", key, value)
	err = mm.Set(mmsid, key, value);
	if (err ~= nil) then
		print('Set err=%v',  err);
		return err
	end
end

--显示值
for i=0, 100, 1 do
	local key = string.format("key%d", i)
	value, err = mm.Get(mmsid, key);
	if (err ~= nil) then
		print('Set err=%v',  err);
		return err
	end

	print("Get", key, value);
end

--备份
--	MMBackup(sid, mid, memo string)error
err = mm.MMBackup(sid, mid, '')
if (err ~= nil) then
	print('MMBackup err=%v',  err);
	return err
end

--异步接收备份消息
local msg = require('msg');
while true
do
	strmsg, err = msg.PullMsg(sid, 3)
	if (err ~= nil) then
		print('PullMsg err=%v',  err);
		return err
	end

	info = strmsg:getMsg()
	reg = "(%a+)=(.*)"
	_, _, key, value = string.find(info, reg)
	
	if (key=="ver") then
		print("ver", value)
		return value
	end
	if (key=="err") then
		print("err", value)
		return value
	end	
	
	print(key, value)
end
return "exit";
