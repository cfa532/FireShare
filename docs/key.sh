./Leither lpki genkey -o $1.key
./Leither lpki gencert -k $1.key -m "name=forapp" -o $1.cert
./Leither lpki addkey -i $1.key