local mm = require('mimei');
sid =request['sid']

local filename = "/mnt/drumboy.mp4"          -- file path
local caption = "Drum boy"

mid = "OgXXWbNoNhTMXIy0juSvXtOF-Ev"	    -- demo2 db mimei
mmsid, err = mm.MMOpen(sid, mid, 'cur');
if (err ~= nil) then
	print('MMOpen err',  err);
	return err
end
print('MMOpen mmsid=', mmsid);

--local ipfs = require('net')
local ipfsid, err = lapi.IpfsAdd(sid, filename)
if (err ~= nil) then
   print("IPFS add err=", err)
end
print("IPFS ID=", ipfsid)

local ret, err = mm.MMAddRef(mmsid, mid, ipfsid)
if (err ~= nil) then
   print("IPFS addref err=", err)
end
print("Ref added", ret)

local key = "Videos"
local score = os.time()*1000
--local field0 = "QmSsAzJ3H7HuFFz7X8pCqcWiBkoHotpAS6VNkCQj1Cgswy"     --file IPFS id

-- add to post index
local sp = scorepair.new(score, ipfsid)
ret, err = mm.ZAdd(mmsid, key, sp);
if (err ~= nil) then
    print("ZAdd error=", err)
end

local fv0 = {
	lastModified= score,
	mid= ipfsid,
	size= 239094044,
	type= "video/mp4",
	name= caption..".mp4",
	caption= caption
}
-- add file to hash table
local fvs, err = mm.HSet(mmsid, key, ipfsid, fv0)
if (err ~= nil) then
	print('HSet err=',  err);
	return err
end

-- add ref to main db
local mmsid2, err = mm.MMAddRef(sid, mid, ipfsid);
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

local ver, err = lapi.MiMeiPublish(sid,'',  mid)
if (err ~= nil) then
        print('Publish err=%v',  err);
        return err
end
