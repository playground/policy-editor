interface IRequiredService {
  org: string;
  url: string;
  version: string;
  arch: string;
}
interface IUserInput {
  name: string;
  label: string;
  type: string;
  defaultValue: string;
}

export interface IService extends IDeploymentPolicy {
  label: string;
  description: string;
  public: boolean;
  documentation: string;
  url: string;
  version: string;
  arch: string;
  sharable: string;
  requiredServices: IRequiredService[],
  userInput: IUserInput[],
  deployment: any;
  deploymentSignature: string;
  clusterDeployment: any;
  clusterDeploymentSignature: string;
  imageStore: {
    storeType: string;
  }
}

export interface IVersion {
  version: string;
  priority: any;
}
export interface IProperty {
  name: string;
  value: string;
}
export interface IDeploymentService {
  name: string;
  org: string;
  arch: string;
  serviceVersions: IVersion;
}
export interface IDeploymentPolicy {
  label: string;
  description: string;
  service: IDeploymentService;
  properties: IProperty[];
  constraints: string[];
  userInput: any;
}

