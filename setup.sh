#!/bin/bash
USER=lsb; PASSWORD=123456; KEYFILE=my
URL=192.168.1.101:4800
MYDOMAIN=fsca; GWADDR=leithertest.link
MYAPP=fireshare

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
readInput USER "User Name"
readInput PASSWORD "Password"
readInput KEYFILE "key file name"
readInput MYAPP "local APP directory"
readInput URL "local URL"
readInput MYDOMAIN "user domain"

#./Leither lpki runscript -s "local auth=require('auth'); return auth.Register('$USER', '$PASSWORD');"
#./Leither lpki runscript -s "local node=require('mimei'); return node.MMSetRight(request.sid, 'mmroot', '', 0x07276707);"
#echo "User "$USER" created and authorized"

#./Leither lpki genkey -o $KEYFILE.key
#./Leither lpki genca -k $KEYFILE.key -m "name=$KEYFILE" -o $KEYFILE.ca
#./Leither lpki gencert -k $KEYFILE.key -m "name=forapp" -o $KEYFILE.cert
./Leither lpki signppt -c $KEYFILE.cert -m "CertFor=Self" -o ${KEYFILE}login.ppt
echo ./Leither lpki signppt -c $KEYFILE.cert -m "CertFor=Self" -o ${KEYFILE}login.ppt
echo "Credential files created"

URL=http://$URL/
#URL=h4V196PipVUv8gf-Zwj9HQLWfV-
#URL=http://[2001:b011:e608:383d:afa3:1537:65bd:9984]:4800/
./Leither lpki reqservice -c $KEYFILE.cert -m RequestService=mimei -n $URL
echo "./Leither lpki reqservice -c $KEYFILE.cert -m RequestService=mimei -n $URL"

echo "APP uploaded to service node"
./Leither lapp uploadapp -p ${KEYFILE}login.ppt -i ./$MYAPP -n $URL
echo ./Leither lapp uploadapp -p ${KEYFILE}login.ppt -i ./$MYAPP -n $URL

#./Leither lapp setdomain -d $MYDOMAIN.$GWADDR -n $URL -a $MYAPP -p ${KEYFILE}login.ppt -m gwaddr=$GWADDR
./Leither lapp backup -a $MYAPP -p ${KEYFILE}login.ppt -n $URL
echo "APP published successfully"