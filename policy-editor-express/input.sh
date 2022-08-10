#!/bin/bash

if [ "${HZN_ORG_ID}" = "" ] || [ "${HZN_EXCHANGE_USER_AUTH}" = "" ] || [ "${HZN_EXCHANGE_URL}" = "" ] || [ "${HZN_FSS_CSSURL}" = "" ]
then
  echo "Input HZN_ORG_ID"
  read org_id
  export HZN_ORG_ID=${org_id}
  echo "Input HZN_EXCHANGE_USER_AUTH"
  read user_auth
  export HZN_EXCHANGE_USER_AUTH=${user_auth}
  echo "Input HZN_EXCHANGE_URL"
  read exchange_url
  export HZN_EXCHANGE_URL=${exchange_url}
  echo "Input HZN_FSS_CSSURL"
  read css_url
  export HZN_FSS_CSSURL=${css_url}
fi

ARCH=$(uname -m)
echo $ARCH
FILE="horizon-agent-linux-deb-amd64.tar.gz"
if [ "${ARCH}" = "x86_64" ]
then
 FILE="horizon-agent-linux-deb-amd64.tar.gz"
elif [ "${ARCH}" = "armv7l" ]
then
 FILE="horizon-agent-linux-deb-armhf.tar.gz"
elif [ "${ARCH}" = "aarch64" ]
then
 FILE="horizon-agent-linux-deb-arm64.tar.gz"
else
 FILE="horizon-agent-linux-deb-amd64.tar.gz"
fi

export HORIZON_URL="http://host.docker.internal:8510"

echo ${version}
echo ${css}
if [ "${css}" = "true" ]
then
  /bin/bash ./agent-install.sh -i css: -C
elif [ "${version}" = "" ]
then
  echo curl -sSL https://github.com/open-horizon/anax/releases/latest/download/${FILE} -o ${FILE}
  curl -sSL https://github.com/open-horizon/anax/releases/latest/download/${FILE} -o ${FILE}
  tar -zxvf ${FILE}
  /bin/bash ./agent-install.sh -C
else
  echo curl -sSL https://github.com/open-horizon/anax/releases/download/${version}/${FILE} -o ${FILE}
  curl -sSL https://github.com/open-horizon/anax/releases/download/${version}/${FILE} -o ${FILE}
  tar -zxvf ${FILE}
  /bin/bash ./agent-install.sh -C
fi

npm start
