sid =request['sid']
print("mimei sid", sid)
local mm = require('mimei');

mid = "O6mabg95qj6WlKU105gaHMQloFW"	    -- db mimei
mmsid, err = mm.MMOpen(sid, mid, 'cur');
if (err ~= nil) then
	print('MMOpen err',  err);
	return err
end
print('MMOpen mmsid=', mmsid);

local key = "Videos"
local score = os.time() * 1000
local field0 = "QmUxtEq5wn81ANKwTnrMVEMf46dZmEZY2HWudwpJqR7smY"     --file IPFS id

-- add to post index
local sp = scorepair.new(score, field0)
ret, err = mm.ZAdd(mmsid, key, sp);
if (err ~= nil) then
    print("ZAdd error=", err)
end

local fv0 = {
	lastModified= score,
	mid= field0,
	size= 922187173,
	type= "video/mp4",
	name= "三体第一季英语版01.mp4",
	caption= "三体第一季英语版01"
}
-- add file to hash table
local fvs, err = mm.HSet(mmsid, key, field0, fv0)
if (err ~= nil) then
	print('HSet err=',  err);
	return err
end

-- add ref to main db
local mmsid2, err = mm.MMAddRef(sid, mid, field0);
if (err ~= nil) then
	print('MMAddRef err=',  err);
	return err
end

--备份
local ver, err = mm.MMBackup(sid, mid, '')
if (err ~= nil) then
	print('MMBackup err=%v',  err);
	return err
end

local ver, err = mm.MiMeiPublish(sid, '', mid)
if (err ~= nil) then
        print('Publish err=%v',  err);
        return err
end