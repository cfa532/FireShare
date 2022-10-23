--生成弥媒，测试guest权限
--读取sid
sid =request['sid']
print("sid=", sid)

local mm = require('mimei');

--创建弥媒
mid, err = mm.MMCreate(sid, '', '', 'testguest', 2, 0x07276705);
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

err = mm.Set(mmsid, 'key0', 'value0');
if (err ~= nil) then
	log.Debug('Set err=%v',  err);
	return err
end

--guest用户打开弥媒
mmsid1, err = mm.MMOpen('', mid, 'cur');
if (err ~= nil) then
	print('guest MMOpen err=',  err);
	return err
end
print('guest MMOpen mmsid1=', mmsid1);


value, err = mm.Get(mmsid1, 'key0');
if (err ~= nil) then
	log.Debug('Get err=%v',  err);
	return err
end

print('Get key0', value);

return "test guest ok"
