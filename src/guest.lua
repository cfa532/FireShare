--生成弥媒，测试guest权限
--读取sid
sid =request['sid']
print("sid=", sid)

local mm = require('mimei');

--创建弥媒
mid, err = mm.MMCreate(sid, '', '', 'fireshare', 2, 0x07276707);
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

Fi = {}
Fi.new = function()
    self = {}
    self.name='ffhjhhhh'
    return self
end
f=Fi.new()

mmsid = 'f81d70735abc1063a0b8c967e11c22bcb2ea3441'
ret, err = mm.HSet(mmsid, 'Test', 'E9BJr32Rn4kHG1VSJqVbjHE44ky',f);
if (err ~= nil) then
	print('Set err=%v',  err);
	return err
end
print ('Hset ret=', ret);

--guest用户打开弥媒
mmsid1, err = mm.MMOpen('', mid, 'cur');
if (err ~= nil) then
	print('guest MMOpen err=',  err);
	return err
end
print('guest MMOpen mmsid1=', mmsid1);


value, err = mm.HGet(mmsid1, 'key0', 'field0');
if (err ~= nil) then
	print('Get err=%v',  err);
	return err
end
print('HGet key0', value);

return "test guest ok"
