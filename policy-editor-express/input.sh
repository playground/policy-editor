#!/bin/bash

echo "Input Org Id"
read org_id
export HZN_ORG_ID=${org_id}
echo "Input HZN_FSS_CSSURL"
read css_url
export HZN_FSS_CSSURL=${css_url}
echo "Input HZN_EXCHANGE_URL"
read exchange_url
export HZN_EXCHANGE_URL=${exchange_url}
echo "Input HZN_EXCHANGE_USER_AUTH"
read user_auth
export HZN_EXCHANGE_USER_AUTH=${user_auth}

ARCH=$(uname -m)
FILE="horizon-agent-linux-deb-amd64.tar.gz"
if [${ARCH} == "x86_64"]; then
 FILE="horizon-agent-linux-deb-amd64.tar.gz"
elif [${ARCH} == "armv71"]; then
 FILE="horizon-agent-linux-deb-armhf.tar.gz"
elif [${ARCH} == "arrch64"]; then
 FILE="horizon-agent-linux-deb-arm64.tar.gz"
else
 FILE="horizon-agent-linux-deb-amd64.tar.gz"
fi

curl -sSL https://github.com/open-horizon/anax/releases/latest/download/${FILE} -o ${FILE}
tar -zxvf ${FILE}
/bin/bash ./agent-install.sh -C

npm start
