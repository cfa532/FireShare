sid =request['sid']
local mm = require('mimei');

mid = 'iFG4GC9r0fF22jYBCkuPThybzwO';
print("mid", mid)

mmsid, err = mm.MMOpen(sid, mid, 'cur');
if (err ~= nil) then
	print('MMOpen err',  err);
	return err
end
print('MMOpen mmsid=', mmsid);

local key0 = 'data_of_author'
local f = mm.Get(mmsid, key0)

-- Function to print object contents
function printObject(obj, name)
    name = name or "object"
    print("Content of " .. name .. ":")
    print(obj)
    if type(obj) == "table" then
        print(name .. " is a table with contents:")
        for k, v in pairs(obj) do
            print("  " .. tostring(k) .. " = " .. tostring(v))
        end
    else
        print(name .. " type:", type(obj))
        print(name .. " value:", tostring(obj))
    end
end

-- Call the function to print content of f
printObject(f, "f")

-- Update f's lastLogin field with current timestamp
if type(f) == "table" then
    f.lastLogin = os.time() * 1000
    print("Updated lastLogin field with current timestamp")
    
    -- Print f again to show the updated content
    printObject(f, "f (after update)")
    
    -- Write the updated f back to the mid
    local setResult, setErr = mm.Set(mmsid, key0, f)
    if setErr ~= nil then
        print('mm.Set error:', setErr)
        return setErr
    else
        print('Successfully wrote updated f back to mid with key:', key0)
        print('Set result:', setResult)
    end
else
    print("f is not a table, cannot update lastLogin field")
end

-- Close the memory manager session
ver, err = mm.MMBackup(mmsid, mid, '')
if (err ~= nil) then
	print('MMBackup err=%v',  err);
	return err
end
