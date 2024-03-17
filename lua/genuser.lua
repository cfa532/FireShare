local log = require('log')
local auth = require('auth')
local mm = require('mimei')

local sid =request['sid']
print("sid=", sid)

user='demo'
passwd='123456'

local param = {}
param['name'] = user
param['passwd'] = passwd

err = auth.SetUserInfo(sid, param)
--err=nil
if (err ~= nil) then
	print(err)
        return err
else
	print("register user ok")
end

local reply, err = auth.Login(user, passwd)
if (err ~= nil) then
	print(err)
	return err
end
local sidlsb = reply:getSid()
print("uid=", reply:getUid())