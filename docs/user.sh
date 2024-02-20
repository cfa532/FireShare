# 3 command-line paras: username, password, key file
# user.sh lsb 1234 my.key
./Leither lpki runscript -s "local auth=require('auth'); return auth.Register('$1', '$2');" -k $3 
./Leither lpki runscript -s "local node=require('mimei'); return node.MMSetRight(request.sid, 'mmroot', '', 0x07276707);"

./Leither lpki runscript -s "local auth=require('auth'); return auth.SetUserInfo()"