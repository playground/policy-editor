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

export interface IService {
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
