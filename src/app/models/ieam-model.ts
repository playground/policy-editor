export enum Enum {
  JSON_LOADED,
  GARAGE_CLOSE,
  NAVIGATE,
  REFRESH,
  THEME_CHANGED,
  LOGGED_IN,
  LOGGED_OUT,
  SHOW_FOOTER,
  DELETE,
  UPLOAD,
  CHANGE_ACCESS,
  FOLDER,
  JUMP_TO,
  LOAD_CONFIG,
  LOAD_EXISTING_CONFIG,
  TRIGGER_LOAD_CONFIG,
  LOAD_POLICY,
  LOAD_EXISTING_POLICY,
  REMOTE_POLICY,
  LOAD_TEMPLATE_POLICY,
  CONFIG_LOADED,
  ORG_SELECTED,
  EXCHANGE_SELECTED,
  SAVE,
  PUBLISH,
  NONE_SELECTED,
  NO_BUCKET,
  NOT_EDITOR,
  NOT_EXCHANGE,
  EXCHANGE_CALL,
  NETWORK,
  JSON_MODIFIED,
  INSTALL_METAMASK
}
export const Navigate = {
  home: 'home',
  bucket: 'bucket',
  editor: 'editor',
  about: 'about',
  exchange: 'exchange',
  signin: 'signin'
} as const;

export class EnumClass {
  private enum: any = {};
  constructor(private eArray: any[] = []) {
    eArray.map((el, idx) => {
      this.enum[el] = idx;
    });
  }

  getEnum(key: string) {
    return this.enum[key];
  }
}

export class Organization {
  id?: string = '';
  name?: string = '';
}

export const HeaderOptions = {
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': '*'
} as const;

export interface IOption {
  id: string;
  name: string;
}

export interface IEditorStorage {
  content: Object;
  original: Object;
  filename: string;
  modified: boolean;
  remote: boolean;
}
export interface IExchange {
  name: string;
  path: string;
  method: string;
  prompt: boolean;        // prompt for input
  title: string;
  placeholder: string;
  signature: boolean;
  callB4: string;
  description: string;
  type: string;
  run: boolean;          // available to run regardless
}
export const Exchange = {
  admintatus: {name: 'Admin Status', path: 'admin/status', method: 'GET', run: true},
  adminVersion: {name: 'Admin Version', path: 'admin/version', run: true},
  adminOrgStatus: {name: 'Admin Org Status', path: 'admin/orgstatus', run: true},
  addOrg: {name: 'Add Org', path: 'orgs', prompt: true, title: 'Enter org name', placeholder: 'Organization Name', run: true},
  addNode: {name: 'Add/Update Node', path: 'orgs/${orgid}/nodes/${nodeid}', method: 'PUT', type: 'node', run: true},
  getNode: {name: 'Get Node By Name', path: 'orgs/${orgid}/nodes/${nodeid}', method: 'GET', type: 'node', run: true},
  getNodes: {name: 'Get All Nodes', path: 'orgs/${orgid}/nodes', method: 'GET', type: 'node', run: true},
  deleteNode: {name: 'Delete Node By Name', path: 'orgs/${orgid}/nodes/${nodeid}', method: 'DELETE', type: 'node', run: true},
  getNodeDetail: {name: 'Get All Nodes Details', path: 'orgs/${orgid}/node-details', method: 'GET', type: 'node', run: true},
  getNodeHeartbeat: {name: 'Get Node Heartbeat', path: 'orgs/${orgid}/nodes/${nodeid}/heartbeat', method: 'POST', type: 'node'},
  setNodeConfig: {name: 'Change Node Config State', path: 'orgs/${orgid}/nodes/${nodeid}/services_configstate', method: 'POST', type: 'node'},
  updateNode: {name: 'Update Node Attribute', path: 'orgs/${orgid}/nodes/${nodeid}', method: 'PATCH', type: 'node'},
  addService: {name: 'Add/Update Service', path: 'orgs/${orgid}/services', method: 'POST', type: 'service|topLevelService', signature: true, callB4: 'getService'},
  getService: {name: 'Get Service By Name', path: 'orgs/${orgid}/services/${service}', method: 'GET', type: 'service|topLevelService'},
  getServices: {name: 'Get All Services', path: 'orgs/${orgid}/services', method: 'GET', type: 'service|topLevelService', run: true},
  deleteService: {name: 'Delete Service By Name', path: 'orgs/${orgid}/services/${service}', method: 'DELETE', type: 'service|topLevelService'},
  addNodePolicy: {name: 'Add/Update Node Policy', path: 'orgs/${orgid}/nodes/${nodeid}/policy', method: 'PUT', type: 'nodePolicy', run: true, description: 'Adds or updates the policy of a node. This is called by the node or owning user.'},
  getNodePolicy: {name: 'Get Node Policy By Name', path: 'orgs/${orgid}/nodes/${nodeid}/policy', method: 'GET', type: 'nodePolicy', run: true},
  deleteNodePolicy: {name: 'Delete Node Policy By Name', path: 'orgs/${orgid}/nodes/${nodeid}/policy', method: 'DELETE', type: 'nodePolicy', run: true},

  addManagementPolicy: {name: 'Add/Update Mgmt Policy', path: 'orgs/${orgid}/nodes/${nodeid}/policy', method: 'PUT', type: 'nodePolicy', description: 'Creates a node management policy resource. A node management policy controls the updating of the edge node agents. This can only be called by a user.'},
  getManagementPolicy: {name: 'Get Mgmt Policy By Name', path: 'orgs/${orgid}/managementpolicies/${managementPolicy}', method: 'GET', type: 'managementPolicy'},
  getManagementPolicies: {name: 'Get All Mgmt Policies', path: 'orgs/${orgid}/managementpolicies', method: 'GET', type: 'managementPolicy', run: true},
  deleteManagementPolicy: {name: 'Delete Mgmt Policy By Name', path: 'orgs/${orgid}/managementpolicies/${managementPolicy}', method: 'DELETE', type: 'managementPolicy'},
  addDeploymentPolicy: {name: 'Add/Update Deployment Policy', path: 'orgs/${orgid}/business/policies/${deploymentPolicy}', method: 'POST', type: 'deploymentPolicy', callB4: 'getDeploymentPolicy', description: 'Creates a deployment policy resource. A deployment policy resource specifies the service that should be deployed based on the specified properties and constraints. This can only be called by a user.'},
  getDeploymentPolicy: {name: 'Get Deployment Policy By Name', path: 'orgs/${orgid}/business/policies/${deploymentPolicy}', method: 'GET', type: 'deploymentPolicy', description: 'Returns the deployment policy with the specified id. Can be run by a user, node, or agbot.'},
  getDeploymentPolicies: {name: 'Get All Deployment Policies', path: 'orgs/${orgid}/business/policies', method: 'GET', type: 'deploymentPolicy', run: true, description: 'Returns all deployment policy definitions in this organization. Can be run by any user, node, or agbot.'},
  deleteDeploymentPolicy: {name: 'Delete Deployment Policy By Name', path: 'orgs/${orgid}/business/${deploymentPolicy}', method: 'DELETE', type: 'deploymentPolicy', description: ''},
  addServicePolicy: {name: 'Add/Update Service Policy', path: 'orgs/${orgid}/services/${servicePolicy}/policy', method: 'PUT', type: 'servicePolicy', description: 'Adds or updates the policy of a service. This can be called by the owning user.'},
  getServicePolicy: {name: 'Get Service Policy By Name', path: 'orgs/${orgid}/services/${servicePolicy}/policy', method: 'GET', type: 'servicePolicy', description: 'Returns the service policy. Can be run by a user, node or agbot.'},
  deleteServicePolicy: {name: 'Delete Service Policy By Name', path: 'orgs/${orgid}/services/${servicePolicy}/policy', method: 'DELETE', type: 'servicePolicy', description: 'Deletes the policy of a service. Can be run by the owning user.'},
} as const;

export const Loader = {
  service: {name: 'Service Definition', file: 'assets/templates/service.json', template: true},
  topLevelService: {name: 'Top Level Service', file: 'assets/templates/top-level-service.json', template: true},
  servicePolicy: {name: 'Service Policy', file: 'assets/templates/service.policy.json', template: true},
  deploymentPolicy: {name: 'Deployment Policy', file: 'assets/templates/deployment.policy.json', template: true},
  nodePolicy: {name: 'Node Policy', file: 'assets/templates/node.policy.json', template: true},
  managementPolicy: {name: 'Mgmt Policy', file: 'assets/templates/node.policy.json', template: true},
  hznConfig: {name: 'hzn Config File'},
  localPolicy: {name: 'Local File'},
  remotePolicy: {name: 'Remote File'}
} as const;

export const UrlToken = {
  orgid: '${orgid}',
  service: '${service}',
  servicePolicy: '${servicePolicy}',
  managementPolicy: '${managementPolicy}',
  deploymentPolicy: '${deploymentPolicy}',
  nodeid: '${nodeid}'
} as const;
