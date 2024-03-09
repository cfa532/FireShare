local net = require('net')
sid =request['sid']
print('sid=',  sid);

addrs, err = net.DhtFindPeer(sid, '12D3KooWB11KnPZz1ygqq4b6b9WBkbzXiBLVmFLedDymKrzLF6ZA');
if (err ~= nil) then
	print('DhtFindPeer err=',  err);
	return err
end
print("DhtFindPeer addrs=", addrs)