#!/bin/bash
USER=demo; PASSWORD=zaq12WSX; KEYFILE=demo
URL=192.168.0.5:8002
MYDOMAIN=pratum; GWADDR=leithertest.link
MYAPP=pratum	# not important

function readInput {
    # take 2 params, 1st is the variable name for user to input, 2nd is the description of the variable
    local t=$1
    echo Please input $2 "(default: ${!t})"
    local i
    read i
    if [ -n "$i" ]; then
        eval $1=$i
    fi
    echo $2: ${!t}
}
#readInput USER "User Name"
#readInput PASSWORD "Password"
#readInput KEYFILE "key file name"
#readInput MYAPP "local APP directory"
#readInput URL "local URL"
#readInput MYDOMAIN "user domain"

#echo ./Leither lpki runscript -s "local auth=require('auth'); return auth.Register('$USER', '$PASSWORD');"
#./Leither lpki runscript -s "local auth=require('auth'); return auth.Register('$USER', '$PASSWORD');"
#echo ./Leither lpki runscript -s "local node=require('mimei'); return node.MMSetRight(request.sid, 'mmroot', '', 0x07276707);"
#./Leither lpki runscript -s "local node=require('mimei'); return node.MMSetRight(request.sid, 'mmroot', '', 0x07276707);"
#echo "User "$USER" created and authorized"

#echo ./Leither lpki genkey -o $KEYFILE.key
#./Leither lpki genkey -o $KEYFILE.key
#echo ./Leither lpki gencert -k $KEYFILE.key -m "name=forapp" -o $KEYFILE.cert
#./Leither lpki gencert -k $KEYFILE.key -m "name=forapp" -o $KEYFILE.cert
#echo ./Leither lpki addkey -i $KEYFILE.key
#./Leither lpki addkey -i $KEYFILE.key
#echo ./Leither lpki signppt -c $KEYFILE.cert -m "CertFor=Self" -o ${KEYFILE}login.ppt
#./Leither lpki signppt -c $KEYFILE.cert -m "CertFor=Self" -o ${KEYFILE}login.ppt

URL=http://$URL/
#URL=h4V196PipVUv8gf-Zwj9HQLWfV-
#URL=http://[2001:b011:e608:383d:afa3:1537:65bd:9984]:4800/
echo -e "\n./Leither lpki reqservice -c $KEYFILE.cert -m RequestService=mimei -n $URL"
./Leither lpki reqservice -c $KEYFILE.cert -m RequestService=mimei -n $URL

echo -e "\nupload APP to service node"
echo ./Leither lapp uploadapp -p ${KEYFILE}login.ppt -i ./$MYAPP -n $URL
./Leither lapp uploadapp -p ${KEYFILE}login.ppt -i ./$MYAPP -n $URL

#echo ./Leither lapp setdomain -d $MYDOMAIN.$GWADDR -n $URL -a $MYAPP -p ${KEYFILE}login.ppt -m gwaddr=$GWADDR
#./Leither lapp setdomain -d $MYDOMAIN.$GWADDR -n $URL -a $MYAPP -p ${KEYFILE}login.ppt -m gwaddr=$GWADDR
echo ./Leither lapp backup -a $MYAPP -p ${KEYFILE}login.ppt -n $URL
./Leither lapp backup -a $MYAPP -p ${KEYFILE}login.ppt -n $URL
#./Leither mimei publish p6nO2plU9RsMWR2Iz53lYpOi1GH
echo "APP published successfully"