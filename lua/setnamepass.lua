--读取sid
local sid =request['sid']
print("sid=", sid)

local auth = require('auth')

local param = {}
param['newname'] = "lsb2"
param['newpass'] = '1234567'
err = auth.SetUserInfo(sid, param)
if (err ~= nil) then
	print(err)
	return err
end

--登录这个用户
local reply, err = auth.Login('lsb2', '1234567')
if (err ~= nil) then
	print(err)
	return "test fail"
end
print("login ok reply=", reply)

return "test ok"
