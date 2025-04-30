local log = require('log')
local auth = require('auth')
local mm = require('mimei')
local sid =request['sid']
print("sid=", sid)

local userid = 'iFG4GC9r0fF22jYBCkuPThybzwO'
local key1 = 'StaDIuVDcy-Ly5fJlvbLvX8I3H5'
local mmsid = mm.MMOpen(sid, userid,'last')
local rank = mm.Zrank(mmsid, 'followings_tweets', key1)
print("rank=", rank)