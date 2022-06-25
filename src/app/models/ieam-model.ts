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
  addNode: {name: 'Add/Update Node', path: 'orgs/${orgId}/nodes/${nodeId}', method: 'PUT', type: 'node', run: true},
  getNode: {name: 'Get Node By Name', path: 'orgs/${orgId}/nodes/${nodeId}', method: 'GET', type: 'node', run: true},
  getNodes: {name: 'Get All Nodes', path: 'orgs/${orgId}/nodes', method: 'GET', type: 'node', run: true},
  deleteNode: {name: 'Delete Node By Name', path: 'orgs/${orgId}/nodes/${nodeId}', method: 'DELETE', type: 'node', run: true},
  getNodeDetail: {name: 'Get All Nodes Details', path: 'orgs/${orgId}/node-details', method: 'GET', type: 'node', run: true},
  getNodeHeartbeat: {name: 'Get Node Heartbeat', path: 'orgs/${orgId}/nodes/${nodeId}/heartbeat', method: 'POST', type: 'node'},
  setNodeConfig: {name: 'Change Node Config State', path: 'orgs/${orgId}/nodes/${nodeId}/services_configstate', method: 'POST', type: 'node'},
  updateNode: {name: 'Update Node Attribute', path: 'orgs/${orgId}/nodes/${nodeId}', method: 'PATCH', type: 'node'},
  addService: {name: 'Add/Update Service', path: 'orgs/${orgId}/services', method: 'POST', type: 'service|topLevelService', signature: true, callB4: 'getService'},
  getService: {name: 'Get Service By Name', path: 'orgs/${orgId}/services/${service}', method: 'GET', type: 'service|topLevelService'},
  getServices: {name: 'Get All Services', path: 'orgs/${orgId}/services', method: 'GET', type: 'service|topLevelService', run: true},
  deleteService: {name: 'Delete Service By Name', path: 'orgs/${orgId}/services/${service}', method: 'DELETE', type: 'service|topLevelService'},
  addNodePolicy: {name: 'Add/Update Node Policy', path: 'orgs/${orgId}/nodes/${nodeId}/policy', method: 'PUT', type: 'nodePolicy', run: true, description: 'Adds or updates the policy of a node. This is called by the node or owning user.'},
  getNodePolicy: {name: 'Get Node Policy By Name', path: 'orgs/${orgId}/nodes/${nodeId}/policy', method: 'GET', type: 'nodePolicy', run: true},
  deleteNodePolicy: {name: 'Delete Node Policy By Name', path: 'orgs/${orgId}/nodes/${nodeId}/policy', method: 'DELETE', type: 'nodePolicy', run: true},
  addNodeAgreement: {name: 'Add/Update Node Agreement', path: 'orgs/${orgId}/nodes/${nodeId}/agreements/${agId}', method: 'PUT', type: 'nodeAgreement', run: true, description: 'Adds a new agreement of a node, or updates an existing agreement. This is called by the node or owning user to give their information about the agreement.'},
  getNodeAgreement: {name: 'Get Node Agreement By Name', path: 'orgs/${orgId}/nodes/${nodeId}/agreements/${agId}', method: 'GET', type: 'nodeAgreement', run: true},
  getNodeAgreements: {name: 'Get Node Agreements', path: 'orgs/${orgId}/nodes/${nodeId}/agreements', method: 'GET', type: 'nodeAgreement', run: true},
  deleteNodeAgreement: {name: 'Delete Node Agreement By Name', path: 'orgs/${orgId}/nodes/${nodeId}/agreements/${agId}', method: 'DELETE', type: 'nodeAgreement', run: true},
  deleteNodeAgreements: {name: 'Delete All Node Agreements', path: 'orgs/${orgId}/nodes/${nodeId}/agreements', method: 'DELETE', type: 'nodeAgreement', run: true},

  addManagementPolicy: {name: 'Add/Update Mgmt Policy', path: 'orgs/${orgId}/nodes/${nodeId}/policy', method: 'PUT', type: 'nodePolicy', description: 'Creates a node management policy resource. A node management policy controls the updating of the edge node agents. This can only be called by a user.'},
  getManagementPolicy: {name: 'Get Mgmt Policy By Name', path: 'orgs/${orgId}/managementpolicies/${managementPolicy}', method: 'GET', type: 'managementPolicy'},
  getManagementPolicies: {name: 'Get All Mgmt Policies', path: 'orgs/${orgId}/managementpolicies', method: 'GET', type: 'managementPolicy', run: true},
  deleteManagementPolicy: {name: 'Delete Mgmt Policy By Name', path: 'orgs/${orgId}/managementpolicies/${managementPolicy}', method: 'DELETE', type: 'managementPolicy'},

  addDeploymentPolicy: {name: 'Add/Update Deployment Policy', path: 'orgs/${orgId}/business/policies/${deploymentPolicy}', method: 'POST', type: 'deploymentPolicy', callB4: 'getDeploymentPolicy', description: 'Creates a deployment policy resource. A deployment policy resource specifies the service that should be deployed based on the specified properties and constraints. This can only be called by a user.'},
  getDeploymentPolicy: {name: 'Get Deployment Policy By Name', path: 'orgs/${orgId}/business/policies/${deploymentPolicy}', method: 'GET', type: 'deploymentPolicy', description: 'Returns the deployment policy with the specified id. Can be run by a user, node, or agbot.'},
  getDeploymentPolicies: {name: 'Get All Deployment Policies', path: 'orgs/${orgId}/business/policies', method: 'GET', type: 'deploymentPolicy', run: true, description: 'Returns all deployment policy definitions in this organization. Can be run by any user, node, or agbot.'},
  deleteDeploymentPolicy: {name: 'Delete Deployment Policy By Name', path: 'orgs/${orgId}/business/${deploymentPolicy}', method: 'DELETE', type: 'deploymentPolicy', description: ''},

  addServicePolicy: {name: 'Add/Update Service Policy', path: 'orgs/${orgId}/services/${servicePolicy}/policy', method: 'PUT', type: 'servicePolicy', description: 'Adds or updates the policy of a service. This can be called by the owning user.'},
  getServicePolicy: {name: 'Get Service Policy By Name', path: 'orgs/${orgId}/services/${servicePolicy}/policy', method: 'GET', type: 'servicePolicy', description: 'Returns the service policy. Can be run by a user, node or agbot.'},
  deleteServicePolicy: {name: 'Delete Service Policy By Name', path: 'orgs/${orgId}/services/${servicePolicy}/policy', method: 'DELETE', type: 'servicePolicy', description: 'Deletes the policy of a service. Can be run by the owning user.'},

  addPattern: {name: 'Add/Update Pattern', path: 'orgs/${orgId}/patterns/${pattern}', method: 'POST', type: 'pattern', description: 'Creates a pattern resource. A pattern resource specifies all of the services that should be deployed for a type of node. When a node registers with Horizon, it can specify a pattern name to quickly tell Horizon what should be deployed on it. This can only be called by a user.'},
  getPattern: {name: 'Get Pattern By Name', path: 'orgs/${orgId}/patterns/${pattern}', method: 'GET', type: 'pattern'},
  getPatterns: {name: 'Get All Patterns', path: 'orgs/${orgId}/patterns', method: 'GET', type: 'pattern', run: true, description: 'Returns all deployment policy definitions in this organization. Can be run by any user, node, or agbot.'},
  deletePattern: {name: 'Delete Pattern By Name', path: 'orgs/${orgId}/patterns/${pattern}', method: 'DELETE', type: 'pattern', description: ''},
  updatePattern: {name: 'Update Pattern Attribute', path: 'orgs/${orgId}/patterns/${pattern}', method: 'PATCH', type: 'pattern', description: 'Updates one attribute of a pattern. This can only be called by the user that originally created this pattern resource.'},
  getPatternNodes: {name: 'Get All Nodes of Pattern', path: 'orgs/${orgId}/patterns/${pattern}/search', method: 'POST', type: 'pattern', description: 'Returns the matching nodes that are using this pattern and do not already have an agreement for the specified service. Can be run by a user or agbot (but not a node).'},
  getPatternNodeHealth: {name: 'Get Health Nodes of Pattern', path: 'orgs/${orgId}/patterns/${pattern}/nodehealth', method: 'POST', type: 'pattern', description: 'Returns the lastHeartbeat and agreement times for all nodes that are this pattern and have changed since the specified lastTime. Can be run by a user or agbot (but not a node).'},

  addObject: {name: 'Add/Update Object', path: 'api/vi/destinations/${orgId}/${objectType}/${objectId}', method: 'PUT', type: 'css', description: 'Update/create the object of the specified object type and object ID.  If an object with the same type and ID exists that object is updated, otherwise a new object is created.'},
  getDestination: {name: 'Get All Destinations', path: 'api/vi/destinations/${orgId}', method: 'GET', type: 'css', run: true, description: 'Provides a list of destinations for an organization, i.e., ESS nodes (belonging to orgID) that have registered with the CSS.'},
  getObjects: {name: 'Get All Objects By Destination', path: 'api/vi/destinations/${orgId}/${destType}/${destId}/objects', method: 'GET', type: 'css', description: 'Provides a list of objects that are in use by the destination ESS node.'},
  getCssHealth: {name: 'Get Sync Service Health', path: 'api/vi/health', method: 'GET', type: 'css', run: true, description: 'Get health status of the sync service node.'},
  getObjectsByType: {name: 'Get Objects By Type', path: 'api/vi/objects/${orgId}/${objectType}', method: 'GET', type: 'css', description: 'Get objects of the specified object type. Either get all of the objects or just those objects that have pending (unconsumed) updates. An application would typically invoke the latter API periodically to check for updates (an alternative is to use a webhook).'},
  getObject: {name: 'Get Objects By Type', path: 'api/vi/objects/${orgId}/${objectType}/${objectId}', method: 'GET', type: 'css', description: 'Get the metadata of an object of the specified object type and object ID.  The metadata indicates if the objects includes data which can then be obtained using the appropriate API.'},
  updateWebhook: {name: 'Register/Delete Webhook', path: 'api/vi/objects/${orgId}/${objectType}', method: 'PUT', type: 'css', description: 'Register or delete a webhook for the specified object type.  A webhook is used to process notifications on updates for objects of the specified object type.'},
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
  orgId: '${orgId}',
  service: '${service}',
  servicePolicy: '${servicePolicy}',
  managementPolicy: '${managementPolicy}',
  deploymentPolicy: '${deploymentPolicy}',
  nodeId: '${nodeId}',
  agId: '${agId}',
  pattern: '${pattern}',
  objectId: '${objectId}',
  objectType: '${objectType}'
} as const;
