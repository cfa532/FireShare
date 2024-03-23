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
local score = os.time()
local field0 = "QmZcJMzg5WDFgCZmYzgmTXpEvxFQCvBUzLYxwN21TD1ENV"     --file IPFS id

-- add to post index
local sp = scorepair.new(score, field0)
ret, err = mm.ZAdd(mmsid, key, sp);
if (err ~= nil) then
    print("ZAdd error=", err)
end

local fv0 = {
	lastModified= score,
	mid= field0,
	size= 2487754909,
	type= "video/mp4",
	name= "3.body.problem.S01E01.mkv",
	caption= "3.body.problem.S01E01"
}
-- add file to hash table
local fvs, err = mm.HSet(mmsid, key, field0, fv0)
if (err ~= nil) then
	print('HSet err=',  err);
	return err
end

--backup
--备份
local ver, err = mm.MMBackup(sid, mid, '')
if (err ~= nil) then
	print('MMBackup err=%v',  err);
	return err
end

local mmsid2, err = mm.MMOpen(sid, mid, 'last');
if (err ~= nil) then
	print('MMOpen err=',  err);
	return err
end

local fvs, err = mm.HMGet(mmsid2, key, field0)
if (err ~= nil) then
	print('HMGet err=',  err);
	return err
end