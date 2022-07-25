# PolicyEditor

The goal of this project is to create an user friendly UI to streamline the process of managing different tasks that one can perform on any nodes in different organization or even on a different exchange.

## Development server
### Frontend server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Backend server
CD into policy-editor-express and run `npm run watch:deploy`.  The application will automatically reload if you change any of the source files.

### Run all servers at once
Run `npm run dev:servers` will start both frontend and backend servers.  Navigate to `https://localhost:3000`.  Both frontend and backend  will automatically reload if you change any of the source files. 

## Build Docker image
CD into policy-editor-express and run 
`docker build -t playbox21/policy-editor-express:1.0.0 -f Dockerfile-amd64 .`

## Run Docker image
docker run -it --rm --privileged -v /var/run/docker.sock:/var/run/docker.sock -v /usr/bin/docker:/usr/bin/docker -p 3000:3000 playbox21/policy-editor-express:1.0.0.  Navigate to `http://localhost:3000`

## Handy config file
Create a config file name env-hzn.json with the following structure.  You can have as many org's as you want.
```
  "myorg": {
    "envVars": {
      "SERVICE_NAME": "chunk-saved-model-service",
      "SERVICE_CONTAINER_NAME": "chunk-saved-model-service",
      "SERVICE_VERSION": "1.0.0",
      "SERVICE_VERSION_RANGE_UPPER": "1.0.0",
      "SERVICE_VERSION_RANGE_LOWER": "1.0.0",
      "SERVICE_CONTAINER_CREDS": "-k ~/.ssh/ieam_private -K ~/.ssh/ieam_public -v",
      "VOLUME_MOUNT": "/mms-shared",
      "MMS_SHARED_VOLUME": "mms_shared_volume",
      "MMS_OBJECT_TYPE": "object_detection",
      "MMS_OBJECT_ID": "config.json",
      "MMS_OBJECT_FILE": "config/config.json",
      "MMS_CONTAINER_CREDS": "-k ~/.ssh/ieam_private -K ~/.ssh/ieam_public -v",
      "MMS_CONTAINER_NAME": "chunk-mms-service",
      "MMS_SERVICE_NAME": "chunk-mms-service",
      "MMS_SERVICE_VERSION": "1.0.0",
      "MMS_SERVICE_FALLBACK_VERSION": "1.0.0",
      "UPDATE_FILE_NAME": "model.zip"
    },
    "credential": {
      "HZN_EXCHANGE_USER_AUTH": "**************************",
      "HZN_EXCHANGE_URL": "http://mgmt-hub-ip:3090/v1",
      "HZN_FSS_CSSURL": "http://mgmt-hub-ip:9443/",
      "ANAX": "https://github.com/open-horizon/anax/releases/latest/download",
      "HUB_ADMIN": "root/jeff:jeff"
    },
    "metaVars": {}
  },
```

## Managment Hub
For testing purpose, `exchange-api1.fyre.ibm.com` is setup as Manage Hub with the modified exchang-api that enables communication between Policy-editor and this Manage Hub via HTTP requests.

If you would like to setup your own local Management Hub, you can do so by providing the following environment variables:
```
Run as root `sudo -i` 
export HZN_TRANSPORT=http
export HZN_LISTEN_IP=<ip of the device>
export EXCHANGE_USER_ORG=<name of org>
export EXCHANGE_IMAGE_NAME=playbox21/exchange-api

Then run `curl -sSL https://raw.githubusercontent.com/open-horizon/devops/master/mgmt-hub/deploy-mgmt-hub.sh | bash`
```
