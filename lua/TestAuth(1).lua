local log = require('log');

--读取sid
--不指定密钥的情况下，缺省使用节点密钥生成sid, 是系统用户身份，有特权的
sid =request['sid']
print('sid=',  sid);

local auth = require('auth');

--注册一个新用户, lsb 密钥为123456
local uid, err = auth.Register('lsb', '123456');
if (err ~= nil) then
	--可能已经存在了，这里只显示一下错误
	--return err
	print(err)
else
	print("register lsb ok uid is ", uid)
end

--登录这个用户
local reply, err = auth.Login('lsb', '123456')
if (err ~= nil) then
	print(err)
	return err
end

local sidlsb = reply:getSid()
--返回值中的sid可以操作这个用户。
print("lsb login ok reply sid ", sidlsb, "uid", reply:getUid())

--使用lsb的用户身份修改用户名
--生成一个map,存放用户信息
local param = {}
param['name'] = 'lsb'
param['passwd'] = '123456'
param['newname'] = "lsb2"
param['newpass'] = '123456'
err = auth.SetUserInfo(sidlsb, param)
if (err ~= nil) then
	print(err)
	return err
end

--登录这个用户
local reply, err = auth.Login('lsb2', '123456')
if (err ~= nil) then
	print(err)
	return err
end

--返回值中的sid可以操作这个用户。
print("lsb2 login ok reply sid ", reply:getSid(), "uid", reply:getUid())

sid = reply:getSid()
local mm = require('mimei');
local opt = {}
--创建弥媒。2是数据库
local mid, err = mm.MMCreate(sid, '', '', 'test Backup', 2, 0x07276705);
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

--开始写数据
n, err = mm.Hset(mmsid, 'hkey', 'field', 'test value here');
if (err ~= nil) then
	print("Hset err=", err)
	return "hset error"
end
print("n=", n)

local value, err = mm.Hget(mmsid, "hkey", 'field')
if (err ~= nil) then
	print('Hget err=',  err);
	return err
end
print("read value", value)


return 'TestAuth ok'