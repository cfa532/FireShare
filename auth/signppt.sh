#!/bin/bash
KEYFILE=gen8
URL=5XSHw1czHOZfeNz_RvXCaywKqbS
MYDOMAIN=ks; GWADDR=fireshare.xyz
MYAPP=ppt	# not important

#./Leither lpki genkey -o $KEYFILE.key
#./Leither lpki gencert -k $KEYFILE.key -m "name=forapp" -o $KEYFILE.cert
#./Leither lpki addkey -i $KEYFILE.key

#echo ./Leither lpki signppt -c $KEYFILE.cert -m "CertFor=Self" -o ${KEYFILE}login.ppt
#./Leither lpki signppt -c $KEYFILE.cert -m "CertFor=Self" -o ${KEYFILE}login.ppt
#echo "PPT files created"

echo -e "\n./Leither lpki reqservice -c $KEYFILE.cert -m RequestService=mimei -n $URL"
./Leither lpki reqservice -c $KEYFILE.cert -m RequestService=mimei -n $URL

echo -e "\nupload APP to service node"
echo ./Leither lapp uploadapp -k $KEYFILE.key -i ./$MYAPP -n $URL
./Leither lapp uploadapp -k $KEYFILE.key -i ./$MYAPP -n $URL

#echo ./Leither mimei setdomain. Need to publish the mid after set domain.

echo -e "\n Backup App"
echo ./Leither lapp backup -a $MYAPP -k $KEYFILE.key -n $URL
./Leither lapp backup -a $MYAPP -k $KEYFILE.key -n $URL
./Leither mimei publish ZJZoWhGBcQNnX0vCw60t7R7C3q3 -k $KEYFILE.key
echo "APP published successfully"