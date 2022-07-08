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
  EDIT_EXCHANGE_FILE,
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
  active: 'active',
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
export const Role = {
  hubAdmin: 'HUB_ADMIN',
  orgAdmin: 'ORG_ADMIN',
  user: 'HZN_EXCHANGE_USER_AUTH'
} as const;
export interface IExchange {
  name: string;
  path: string;
  method: string;
  prompt?: string;        // prompt for input
  title?: string;
  placeholder?: string;
  signature: string;
  callB4?: string;
  description: string;
  type: string;
  run?: boolean;          // available to run regardless
  editable?: boolean;
  template?: boolean;
  role?: string;
}
export const Exchange = {
  admintatus: {name: 'Admin Status', path: 'admin/status', method: 'GET', run: true},
  adminVersion: {name: 'Admin Version', path: 'admin/version', run: true},
  adminOrgStatus: {name: 'Admin Org Status', path: 'admin/orgstatus', run: true},

  addOrg: {name: 'Add/Update Org', path: 'orgs/${orgId}', method: 'POST', type: 'organization', role: Role.hubAdmin, title: 'Enter org name', placeholder: 'Organization Name', editable: true, template: true, callB4: 'getOrg'},
  getOrg: {name: 'Get Org By Name', path: 'orgs/${orgId}', method: 'GET', type: 'organization', role: Role.hubAdmin, run: true, editable: true},
  getOrgs: {name: 'Get All Orgs', path: 'orgs', method: 'GET', type: 'organization', role: Role.hubAdmin, run: true},
  getOrgStatus: {name: 'Get Org Status', path: 'orgs/${orgId}/status', method: 'GET', type: 'organization', run: true},
  getOrgNodesHealth: {name: 'Get Org Nodes Health', path: 'orgs/${orgId}/search/nodehealth', method: 'POST', type: 'organization', role: Role.user, run: true, editable: true, template: true, description: 'Returns the lastHeartbeat and agreement times for all nodes in this org that do not have a pattern and have changed since the specified lastTime. Can be run by a user or agbot (but not a node).'},
  deleteOrg: {name: 'Delete Org By Name', path: 'orgs/${orgId}', method: 'DELETE', type: 'organization', role: Role.hubAdmin, run: true},

  addNode: {name: 'Add/Update Node', path: 'orgs/${orgId}/nodes/${nodeId}', method: 'PUT', type: 'node', run: true},
  getNode: {name: 'Get Node By Name', path: 'orgs/${orgId}/nodes/${nodeId}', method: 'GET', type: 'node', run: true, editable: true},
  getNodes: {name: 'Get All Nodes', path: 'orgs/${orgId}/nodes', method: 'GET', type: 'node', run: true},
  deleteNode: {name: 'Delete Node By Name', path: 'orgs/${orgId}/nodes/${nodeId}', method: 'DELETE', type: 'node', run: true},
  getNodeDetail: {name: 'Get All Nodes Details', path: 'orgs/${orgId}/node-details', method: 'GET', type: 'node', run: true},
  getNodeHeartbeat: {name: 'Get Node Heartbeat', path: 'orgs/${orgId}/nodes/${nodeId}/heartbeat', method: 'POST', type: 'node'},
  setNodeConfig: {name: 'Change Node Config State', path: 'orgs/${orgId}/nodes/${nodeId}/services_configstate', method: 'POST', type: 'node'},
  updateNode: {name: 'Update Node Attribute', path: 'orgs/${orgId}/nodes/${nodeId}', method: 'PATCH', type: 'node'},
  addService: {name: 'Add/Update Service', path: 'orgs/${orgId}/services', method: 'POST', type: 'service|topLevelService', signature: 'signDeployment', callB4: 'getService'},
  getService: {name: 'Get Service By Name', path: 'orgs/${orgId}/services/${service}', method: 'GET', type: 'service|topLevelService'},
  getServices: {name: 'Get All Services', path: 'orgs/${orgId}/services', method: 'GET', type: 'service|topLevelService', run: true},
  deleteService: {name: 'Delete Service By Name', path: 'orgs/${orgId}/services/${service}', method: 'DELETE', type: 'service|topLevelService'},

  addServiceCert: {name: 'Add/Update Service Cert', path: 'orgs/${orgId}/services/${service}/keys/${keyId}', method: 'PUT', type: 'serviceCert|service|topLevelService', signature: 'getPublicKey', description: 'Adds a new signing public key/cert, or updates an existing key/cert, for this service. This can only be run by the service owning user.'},
  getServiceCert: {name: 'Get Service Cert', path: 'orgs/${orgId}/services/${service}/keys/${keyId}', method: 'GET', type: 'serviceCert', run: true, description: 'Returns the signing public key/cert with the specified keyid for this service. The raw content of the key/cert is returned, not json. Can be run by any credentials able to view the service.'},
  deleteServiceCert: {name: 'Delete Service Cert', path: 'orgs/${orgId}/services/${service}/keys/${keyId}', method: 'DELETE', type: 'serviceCert', run: true, description: 'Deletes a key/cert for this service. This can only be run by the service owning user.'},
  getServiceCerts: {name: 'Get All Service Certs', path: 'orgs/${orgId}/services/${service}/keys', method: 'GET', type: 'serviceCert', run: true, description: 'Returns all the signing public keys/certs for this service. Can be run by any credentials able to view the service.'},
  deleteServiceCerts: {name: 'Delete All Service Certs', path: 'orgs/${orgId}/services/${service}/keys', method: 'DELETE', type: 'serviceCert', run: true, description: 'Deletes all of the current keys/certs for this service. This can only be run by the service owning user.'},

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

  addPattern: {name: 'Add/Update Pattern', path: 'orgs/${orgId}/patterns/${pattern}', method: 'POST', type: 'servicePattern|topLevelServicePattern', description: 'Creates a pattern resource. A pattern resource specifies all of the services that should be deployed for a type of node. When a node registers with Horizon, it can specify a pattern name to quickly tell Horizon what should be deployed on it. This can only be called by a user.'},
  getPattern: {name: 'Get Pattern By Name', path: 'orgs/${orgId}/patterns/${pattern}', method: 'GET', type: 'servicePattern|topLevelServicePattern'},
  getPatterns: {name: 'Get All Patterns', path: 'orgs/${orgId}/patterns', method: 'GET', type: 'servicePattern|topLevelServicePattern', run: true, description: 'Returns all deployment policy definitions in this organization. Can be run by any user, node, or agbot.'},
  deletePattern: {name: 'Delete Pattern By Name', path: 'orgs/${orgId}/patterns/${pattern}', method: 'DELETE', type: 'servicePattern|topLevelServicePattern', description: ''},
  updatePattern: {name: 'Update Pattern Attribute', path: 'orgs/${orgId}/patterns/${pattern}', method: 'PATCH', type: 'servicePattern|topLevelServicePattern', description: 'Updates one attribute of a pattern. This can only be called by the user that originally created this pattern resource.'},
  getPatternNodes: {name: 'Get All Nodes of Pattern', path: 'orgs/${orgId}/patterns/${pattern}/search', method: 'POST', type: 'servicePattern|topLevelServicePattern', description: 'Returns the matching nodes that are using this pattern and do not already have an agreement for the specified service. Can be run by a user or agbot (but not a node).'},
  getPatternNodeHealth: {name: 'Get Health Nodes of Pattern', path: 'orgs/${orgId}/patterns/${pattern}/nodehealth', method: 'POST', type: 'servicePattern|topLevelServicePattern', description: 'Returns the lastHeartbeat and agreement times for all nodes that are this pattern and have changed since the specified lastTime. Can be run by a user or agbot (but not a node).'},

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
  servicePattern: {name: 'Service Pattern', file: 'assets/templates/service.pattern.json', template: true},
  topLevelService: {name: 'Top Level Service', file: 'assets/templates/top-level-service.json', template: true},
  topLevelServicePattern: {name: 'Top Level Service Pattern', file: 'assets/templates/top-level-service.pattern.json', template: true},
  servicePolicy: {name: 'Service Policy', file: 'assets/templates/service.policy.json', template: true},
  deploymentPolicy: {name: 'Deployment Policy', file: 'assets/templates/deployment.policy.json', template: true},
  nodePolicy: {name: 'Node Policy', file: 'assets/templates/node.policy.json', template: true},
  edgeNode: {name: 'Edge Node', file: 'assets/templates/node.json', template: true},
  managementPolicy: {name: 'Mgmt Policy', file: 'assets/templates/node.policy.json', template: true},
  hznConfig: {name: 'hzn Config File'},
  localPolicy: {name: 'Local File'},
  remotePolicy: {name: 'Remote File'}
} as const;

export const ActionMap = {
  getOrg: {mapTo: 'addOrg'},
  getNode: {mapTo: 'addNode'},
  getPattern: {name: 'Pattern'},
  getPatterns: {name: 'Patterns'}
}
export const UrlToken = {
  orgId: '${orgId}',
  service: '${service}',
  keyId: '${keyId}',
  servicePolicy: '${servicePolicy}',
  managementPolicy: '${managementPolicy}',
  deploymentPolicy: '${deploymentPolicy}',
  nodeId: '${nodeId}',
  agId: '${agId}',
  pattern: '${pattern}',
  objectId: '${objectId}',
  objectType: '${objectType}'
} as const;

export interface IJsonSchema {
  name: string;
  file?: string;
  contentNode: string;
  policy?: string;
}
export const JsonSchema = {
  getNode: {name: 'Node Json', file: 'assets/templates/node.json', policy: 'assets/templates/policy.string.json', contentNode: 'nodes.${orgId}/${nodeId}'},
  getService: {name: 'Service Json', file: 'assets/templates/service.json'},
  getOrg: {name: 'Org Json', contentNode: 'orgs.${orgId}'},
  addOrg: {name: 'Add Org Json', file: 'assets/templates/addorg.json'},
  getOrgNodesHealth: {name: 'Org Nodes Health Json', file: 'assets/templates/org.nodes.health.json'}

} as const;

export const JsonToken = {
  orgId: '${orgId}',
  service: '${service}',
  hzVersion: '${hzVersion}',
  version: '${version}',
  arch: '${arch}',
  cpus: '${cpus}',
  ram: '${ram}'
} as const;
