export interface IEnvVars {
  SERVICE_NAME: string;
  SERVICE_CONTAINER_NAME: string;
  SERVICE_VERSION: string;
  SERVICE_VERSION_RANGE_UPPER: string;
  SERVICE_VERSION_RANGE_LOWER: string;
  SERVICE_CONTAINER_CREDS: string;
  VOLUME_MOUNT: string;
  MMS_SHARED_VOLUME: string;
  MMS_OBJECT_TYPE: string;
  MMS_OBJECT_ID: string;
  MMS_OBJECT_FILE: string;
  MMS_CONTAINER_CREDS: string;
  MMS_CONTAINER_NAME: string;
  MMS_SERVICE_NAME: string;
  MMS_SERVICE_VERSION: string;
  MMS_SERVICE_FALLBACK_VERSION: string;
  UPDATE_FILE_NAME: string;
}

export interface ICredential {
  HZN_EXCHANGE_USER_AUTH: string;
  HZN_EXCHANGE_URL: string;
  HZN_FSS_CSSURL: string;
  ANAX: string;
}

export interface IMetaVars {
  ARCH: string;
}
export interface IHznConfig {
  envVars: IEnvVars;
  credential: ICredential;
  metaVars: IMetaVars;
}
