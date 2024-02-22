local log = require('log')
local auth = require('auth')
local mm = require('mimei')
local sid =request['sid']
print("sid=", sid)

user='lsb2'
passwd='123456'

local param = {}
param['newname'] = user
param['newpass'] = passwd

-- set a password user for cross-node writing
err = auth.SetUserInfo(sid, param)

if (err ~= nil) then
	print(err)
        return err
else
	print("register lsb ok")
end

local reply, err = auth.Login(user, passwd)
if (err ~= nil) then
	print(err)
	return err
end
local sidlsb = reply:getSid()
print("uid=", reply:getUid())

mid, err = mm.MMCreate(sidlsb, 'Fireshare', '', 'user demo', 2, 0x07276704);
if (err ~= nil) then
	print('MMCreate err=',  err);
	return err
end
print("MMCreate mid=", mid)