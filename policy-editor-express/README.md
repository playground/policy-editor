### Build Docker image
```
docker build -t playbox21/policy-editor-express_amd64:1.0.1 -f Dockerfile-amd64 .
```

### Run Anax in container
```
curl -sSL https://github.com/open-horizon/anax/releases/download/v2.30.0-902/horizon-agent-linux-deb-amd64.tar.gz -o horizon-agent-linux-deb-amd64.tar.gz && tar -zxvf horizon-agent-linux-deb-amd64.tar.gz && sudo -s -E ./agent-install.sh --container
```

### Run policy-editor-express
```
docker run -d -it --rm --detach-keys="Ctrl-d,d" --name policy-editor -v /var/run/docker.sock:/var/run/docker.sock  -v /var/run/docker.sock:/var/run/docker.sock -v $(pwd)/mms-shared:/mms-shared \
-e HZN_ORG_ID=myorg \ 
-e HZN_EXCHANGE_USER_AUTH=************************ \
-e HZN_FSS_CSSURL=http://xxx.xxx.xxx.xxx:9443/ \
-e HZN_EXCHANGE_URL=http://xxx.xxx.xxx.xxx:3090/v1 \
-e HORIZON_URL=http://host.docker.internal:8081 -p 8082:3000 \playbox21/policy-editor-express_amd64:1.0.1
```
