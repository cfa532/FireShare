local sid =request['sid']
print("sid=", sid)
local mm = require('mimei');
local auth = require('auth');

user='lsb2'
passwd='123456'

local reply, err = auth.Login(user, passwd)
if (err ~= nil) then
	print(err)
	return err
end

local sidlsb = reply:getSid()
print("lsb login ok reply sid ", sidlsb)
print("uid=", reply:getUid())

local param = {}
param['name'] = user
param['passwd'] = passwd
param['newname'] = "namethatwillneverbeused_0"
param['newpass'] = '123456'

err = auth.SetUserInfo(sidlsb, param)
if (err ~= nil) then
	print(err)
	return err
end