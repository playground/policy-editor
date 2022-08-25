import { MatLabel } from "@angular/material/form-field";

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
  SAVE,
  PUBLISH,
  NONE_SELECTED,
  NO_BUCKET,
  NOT_EDITOR,
  EXCHANGE_SELECTED,
  EXCHANGE_CALL_REFRESH,
  NOT_EXCHANGE,
  EXCHANGE_CALL,
  SET_EXCHANGE_CALL,
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

export enum NextAction {
  CLEAR,
  RELOAD
}
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
  contentType?: string;
  nextAction?: string | NextAction;
  callHzn?: boolean;
}
export const Exchange = {
  admintatus: {name: 'Admin Status', path: 'admin/status', method: 'GET', run: true},
  adminVersion: {name: 'Admin Version', path: 'admin/version', run: true},
  adminOrgStatus: {name: 'Admin Org Status', path: 'admin/orgstatus', run: true},

  addOrg: {name: 'Add/Update Org', path: 'orgs/${orgId}', method: 'POST', type: 'organization', role: Role.hubAdmin, title: 'Enter org name', placeholder: 'Organization Name', editable: true, template: true, callB4: 'getOrg', description: 'Creates an org resource. This can only be called by the root user or a hub admin.'},
  getOrg: {name: 'Get Org By Name', path: 'orgs/${orgId}', method: 'GET', type: 'organization', role: Role.hubAdmin, run: true, editable: true, description: 'Returns the org with the specified id. Can be run by any user in this org or a hub admin.'},
  getOrgs: {name: 'Get All Orgs', path: 'orgs', method: 'GET', type: 'organization', role: Role.hubAdmin, run: true, description: 'Returns some or all org definitions. Can be run by any user if filter orgType=IBM is used, otherwise can only be run by the root user or a hub admin.'},
  getMyOrgs: {name: 'Get My Orgs', path: 'orgs', method: 'GET', type: 'organization', role: Role.user, run: true, editable: true, template: true, description: 'Returns all the org definitions in the exchange that match the accounts the caller has access too. Can be run by any user. Request body is the response from /idmgmt/identity/api/v1/users/<user_ID>/accounts API.'},
  getOrgStatus: {name: 'Get Org Status', path: 'orgs/${orgId}/status', method: 'GET', type: 'organization', run: true, description: 'Returns the totals of key resources in the org. Can be run by any id in this org or a hub admin.'},
  getOrgNodesHealth: {name: 'Get Org Nodes Health', path: 'orgs/${orgId}/search/nodehealth', method: 'POST', type: 'organization', role: Role.user, run: true, editable: true, template: true, description: 'Returns the lastHeartbeat and agreement times for all nodes in this org that do not have a pattern and have changed since the specified lastTime. Can be run by a user or agbot (but not a node).'},
  deleteOrg: {name: 'Delete Org By Name', path: 'orgs/${orgId}', method: 'DELETE', type: 'organization', role: Role.hubAdmin, run: true, description: 'Deletes an org. This can only be called by root or a hub admin.'},
  patchOrg: {name: 'Patch Org By Name', path: 'orgs/${orgId}', method: 'PATCH', type: 'organization', role: Role.hubAdmin, run: true, editable: true, template: true, description: 'Updates one attribute of a org. This can only be called by root, a hub admin, or a user in the org with the admin role.'},
  getErrorOrg: {name: 'Get Nodes in Error State', path: 'orgs/${orgId}/search/nodes/error', method: 'POST', type: 'organization', role: Role.user, run: true, description: 'Returns a list of the id\'s of nodes in an error state. Can be run by a user or agbot (but not a node). No request body is currently required.'},
  getOrgNodeService: {name: 'Get Nodes by service in org', path: 'orgs/${orgId}/search/nodes/service', method: 'POST', type: 'organization', role: Role.user, run: true, editable: true, template: true, description: 'Returns a list of all the nodes a service is running on. Can be run by a user or agbot (but not a node).'},
  getOrgChanges: {name: 'Get Org Max Resouce Changes', path: 'changes/maxchangeid', method: 'GET', type: 'organization', role: Role.user, run: true, description: 'Returns the max changeid of the resource changes. Can be run by any user, node, or agbot.'},
  validAgreement: {name: 'Confirm Org Agbot Agreement', path: 'orgs/${orgId}/agreements/confirm', method: 'POST', type: 'organization', role: Role.user, run: true, editable: true, template: true, description: 'Confirms whether or not this agreement id is valid, is owned by an agbot owned by this same username, and is a currently active agreement. Can only be run by an agbot or user.'},

  addNode: {name: 'Add/Update Node', path: 'orgs/${orgId}/nodes/${nodeId}', method: 'PUT', type: 'node', run: true, editable: true, template: true, description: 'Adds a new edge node, or updates an existing node. This must be called by the user to add a node, and then can be called by that user or node to update itself.'},
  getNode: {name: 'Get Node By Name', path: 'orgs/${orgId}/nodes/${nodeId}', method: 'GET', type: 'node', run: true, editable: true, description: 'Returns the node (edge device) with the specified id. Can be run by that node, a user, or an agbot.'},
  getNodes: {name: 'Get All Nodes', path: 'orgs/${orgId}/nodes', method: 'GET', type: 'node', run: true},
  patchNode: {name: 'Patch Node', path: 'orgs/${orgId}/nodes/${nodeId}', method: 'PATCH', type: 'node', run: true, editable: true, template: true, description: 'Updates some attributes of a node. This can be called by the user or the node.'},
  deleteNode: {name: 'Delete Node By Name', path: 'orgs/${orgId}/nodes/${nodeId}', method: 'DELETE', type: 'node', run: true},
  getNodeDetail: {name: 'Get All Nodes Details', path: 'orgs/${orgId}/node-details', method: 'GET', type: 'node', run: true},
  getNodeHeartbeat: {name: 'Send Node Heartbeat', path: 'orgs/${orgId}/nodes/${nodeId}/heartbeat', method: 'POST', type: 'node', run: true, description: 'Lets the exchange know this node is still active so it is still a candidate for contracting. Can be run by the owning user or the node.'},
  setNodeConfig: {name: 'Change Service Config State', path: 'orgs/${orgId}/nodes/${nodeId}/services_configstate', method: 'POST', type: 'node', run: true, description: 'Suspends (or resumes) 1 or more services on this edge node. Can be run by the node owner or the node.'},
  updateNode: {name: 'Update Node Attribute', path: 'orgs/${orgId}/nodes/${nodeId}', method: 'PATCH', type: 'node'},

  // addService: {name: 'Add/Update Service', path: 'orgs/${orgId}/services', method: 'POST', type: 'service|topLevelService', signature: 'signDeployment', editable: true, template: true, callB4: 'getService', nextAction: NextAction.RELOAD},
  // addTopLevelService: {name: 'Add/Update Top Level Service', path: 'orgs/${orgId}/services', method: 'POST', type: 'service|topLevelService', signature: 'signDeployment', editable: true, template: true, callB4: 'getService', nextAction: NextAction.RELOAD},
  addService: {name: 'Add/Update Service', path: 'publishService', method: 'POST', type: 'service|topLevelService', callHzn: true, editable: true, template: true, run: true, description: 'A service resource contains the metadata that Horizon needs to deploy the docker images that implement this service. A service can either be an edge application, or a lower level edge service that provides access to sensors or reusable features. The service can require 1 or more other services that Horizon should also deploy when deploying this service. If public is set to true, the service can be shared across organizations. This can only be called by a user.  If services exists, does a full replace of an existing service. See the description of the body fields in the POST method. This can only be called by the user that originally created it.'},
  addTopLevelService: {name: 'Add/Update Top Level Service', path: 'publishService', method: 'POST', type: 'service|topLevelService', callHzn: true, editable: true, template: true, run: true, description: 'A service resource contains the metadata that Horizon needs to deploy the docker images that implement this service. A service can either be an edge application, or a lower level edge service that provides access to sensors or reusable features. The service can require 1 or more other services that Horizon should also deploy when deploying this service. If public is set to true, the service can be shared across organizations. This can only be called by a user.  If services exists, does a full replace of an existing service. See the description of the body fields in the POST method. This can only be called by the user that originally created it.'},
  getService: {name: 'Get Service By Name', path: 'orgs/${orgId}/services/${service}', method: 'GET', type: 'service|topLevelService', run: true, editable: true, description: 'Returns the service with the specified id. Can be run by a user, node, or agbot.'},
  getServices: {name: 'Get All Services', path: 'orgs/${orgId}/services', method: 'GET', type: 'service|topLevelService', run: true, description: 'Returns all service definitions in this organization. Can be run by any user, node, or agbot.'},
  patchService: {name: 'Patch Service', path: 'orgs/${orgId}/services/${service}', method: 'PATCH', type: 'service|topLevelService', run: true, editable: true, template: true, description: 'Updates one attribute of a service. This can only be called by the user that originally created this service resource.'},
  deleteService: {name: 'Delete Service By Name', path: 'orgs/${orgId}/services/${service}', method: 'DELETE', type: 'service|topLevelService', run: true, description: 'Deletes a service. Can only be run by the owning user.'},

  // addServiceCert: {name: 'Add/Update Service Cert', path: 'orgs/${orgId}/services/${service}/keys/${keyId}', method: 'PUT', type: 'serviceCert|service|topLevelService', signature: 'getPublicKey', description: 'Adds a new signing public key/cert, or updates an existing key/cert, for this service. This can only be run by the service owning user.'},
  getServiceCert: {name: 'Get Service Cert', path: 'orgs/${orgId}/services/${service}/keys/${keyId}', method: 'GET', type: 'serviceCert', run: true, editable: true, contentType: 'text/plan', description: 'Returns the signing public key/cert with the specified keyid for this service. The raw content of the key/cert is returned, not json. Can be run by any credentials able to view the service.'},
  putServiceCert: {name: 'Add/Update Service Cert', path: 'orgs/${orgId}/services/${service}/keys/${keyId}', method: 'PUT', type: 'serviceCert', run: true, editable: true, template: true, contentType: 'text/plan', description: 'Adds a new signing public key/cert, or updates an existing key/cert, for this service. This can only be run by the service owning user.'},
  deleteServiceCert: {name: 'Delete Service Cert', path: 'orgs/${orgId}/services/${service}/keys/${keyId}', method: 'DELETE', type: 'serviceCert', run: true, description: 'Deletes a key/cert for this service. This can only be run by the service owning user.'},
  getServiceCerts: {name: 'Get All Service Certs', path: 'orgs/${orgId}/services/${service}/keys', method: 'GET', type: 'serviceCert', run: true, description: 'Returns all the signing public keys/certs for this service. Can be run by any credentials able to view the service.'},
  deleteServiceCerts: {name: 'Delete All Service Certs', path: 'orgs/${orgId}/services/${service}/keys', method: 'DELETE', type: 'serviceCert', run: true, description: 'Deletes all of the current keys/certs for this service. This can only be run by the service owning user.'},

  addNodePolicy: {name: 'Add/Update Node Policy', path: 'orgs/${orgId}/nodes/${nodeId}/policy', method: 'PUT', type: 'nodePolicy', editable: true, template: true, run: true, description: 'Adds or updates the policy of a node. This is called by the node or owning user.'},
  getNodePolicy: {name: 'Get Node Policy By Name', path: 'orgs/${orgId}/nodes/${nodeId}/policy', method: 'GET', type: 'nodePolicy', run: true, description: 'Returns the node run time policy. Can be run by a user or the node.'},
  deleteNodePolicy: {name: 'Delete Node Policy By Name', path: 'orgs/${orgId}/nodes/${nodeId}/policy', method: 'DELETE', type: 'nodePolicy', run: true, description: 'Deletes the policy of a node. Can be run by the owning user or the node.'},

  getNodeStatus: {name: 'Get Node Status', path: 'orgs/${orgId}/nodes/${nodeId}/status', method: 'GET', type: 'nodeStatus', run: true, editable: true, description: 'Returns the node run time status, for example service container status. Can be run by a user or the node.'},
  putNodeStatus: {name: 'Add/Update Node Status', path: 'orgs/${orgId}/nodes/${nodeId}/status', method: 'PUT', type: 'nodeStatus', run: true, editable: true, description: 'Adds or updates the run time status of a node. This is called by the node or owning user.'},
  deleteNodeStatus: {name: 'Delete Node Status', path: 'orgs/${orgId}/nodes/${nodeId}/status', method: 'DELETE', type: 'nodeStatus', run: true, description: 'Deletes the status of a node. Can be run by the owning user or the node.'},

  addNodeAgreement: {name: 'Add/Update Node Agreement', path: 'orgs/${orgId}/nodes/${nodeId}/agreements/${agId}', method: 'PUT', type: 'nodeAgreement', editable: true, template: true, run: true, description: 'Adds a new agreement of a node, or updates an existing agreement. This is called by the node or owning user to give their information about the agreement.'},
  getNodeAgreement: {name: 'Get Node Agreement By Id', path: 'orgs/${orgId}/nodes/${nodeId}/agreements/${agId}', method: 'GET', type: 'nodeAgreement', run: true, editable: true, description: 'Returns the agreement with the specified agid for the specified node id. Can be run by a user or the node.'},
  getNodeAgreements: {name: 'Get Node Agreements', path: 'orgs/${orgId}/nodes/${nodeId}/agreements', method: 'GET', type: 'nodeAgreement', run: true, description: 'Returns all agreements that this node is part of. Can be run by a user or the node.'},
  deleteNodeAgreement: {name: 'Delete Node Agreement By Id', path: 'orgs/${orgId}/nodes/${nodeId}/agreements/${agId}', method: 'DELETE', type: 'nodeAgreement', run: true, description: 'Deletes an agreement of a node. Can be run by the owning user or the node.'},
  deleteNodeAgreements: {name: 'Delete All Node Agreements', path: 'orgs/${orgId}/nodes/${nodeId}/agreements', method: 'DELETE', type: 'nodeAgreement', run: true, description: 'Deletes all of the current agreements of a node. Can be run by the owning user or the node.'},

  getNodeError: {name: 'Get Node Errors', path: 'orgs/${orgId}/nodes/${nodeId}/errors', method: 'GET', type: 'nodeError', run: true, description: 'Returns any node errors. Can be run by any user or the node.'},
  addNodeError: {name: 'Add/Update Node Errors', path: 'orgs/${orgId}/nodes/${nodeId}/errors', method: 'PUT', type: 'nodeError', run: true, editable: true, template: true, description: 'Adds or updates any error of a node. This is called by the node or owning user.'},
  deleteNodeError: {name: 'Delete Node Errors', path: 'orgs/${orgId}/nodes/${nodeId}/errors', method: 'DELETE', type: 'nodeError', run: true, description: 'Deletes the policy of a node. Can be run by the owning user or the node.'},

  addManagementPolicy: {name: 'Add/Update Mgmt Policy', path: 'orgs/${orgId}/nodes/${nodeId}/policy', method: 'PUT', type: 'nodePolicy', description: 'Creates a node management policy resource. A node management policy controls the updating of the edge node agents. This can only be called by a user.'},
  getManagementPolicy: {name: 'Get Mgmt Policy By Name', path: 'orgs/${orgId}/managementpolicies/${managementPolicy}', method: 'GET', type: 'managementPolicy'},
  getManagementPolicies: {name: 'Get All Mgmt Policies', path: 'orgs/${orgId}/managementpolicies', method: 'GET', type: 'managementPolicy', run: true},
  deleteManagementPolicy: {name: 'Delete Mgmt Policy By Name', path: 'orgs/${orgId}/managementpolicies/${managementPolicy}', method: 'DELETE', type: 'managementPolicy'},

  addDeploymentPolicy: {name: 'Add/Update Deployment Policy', path: 'orgs/${orgId}/business/policies/${deploymentPolicy}', method: 'POST', type: 'deploymentPolicy', editable: true, template: true, run: true, callB4: 'getDeploymentPolicy', description: 'Creates a deployment policy resource. A deployment policy resource specifies the service that should be deployed based on the specified properties and constraints. This can only be called by a user.'},
  getDeploymentPolicy: {name: 'Get Deployment Policy By Name', path: 'orgs/${orgId}/business/policies/${deploymentPolicy}', method: 'GET', type: 'deploymentPolicy', run: true, description: 'Returns the deployment policy with the specified id. Can be run by a user, node, or agbot.'},
  getDeploymentPolicies: {name: 'Get All Deployment Policies', path: 'orgs/${orgId}/business/policies', method: 'GET', type: 'deploymentPolicy', run: true, description: 'Returns all deployment policy definitions in this organization. Can be run by any user, node, or agbot.'},
  deleteDeploymentPolicy: {name: 'Delete Deployment Policy By Name', path: 'orgs/${orgId}/business/${deploymentPolicy}', method: 'DELETE', type: 'deploymentPolicy', run: true, description: ''},

  addServicePolicy: {name: 'Add/Update Service Policy', path: 'orgs/${orgId}/services/${servicePolicy}/policy', method: 'PUT', type: 'servicePolicy', template: true, editable: true, run: true, description: 'Adds or updates the policy of a service. This can be called by the owning user.'},
  getServicePolicy: {name: 'Get Service Policy By Name', path: 'orgs/${orgId}/services/${servicePolicy}/policy', method: 'GET', type: 'servicePolicy', run: true, description: 'Returns the service policy. Can be run by a user, node or agbot.'},
  deleteServicePolicy: {name: 'Delete Service Policy By Name', path: 'orgs/${orgId}/services/${servicePolicy}/policy', method: 'DELETE', type: 'servicePolicy', run: true, description: 'Deletes the policy of a service. Can be run by the owning user.'},

  addPattern: {name: 'Add Pattern', path: 'orgs/${orgId}/patterns/${pattern}', method: 'POST', type: 'servicePattern|topLevelServicePattern', template: true, editable: true, description: 'Creates a pattern resource. A pattern resource specifies all of the services that should be deployed for a type of node. When a node registers with Horizon, it can specify a pattern name to quickly tell Horizon what should be deployed on it. This can only be called by a user.'},
  getPattern: {name: 'Get Pattern By Name', path: 'orgs/${orgId}/patterns/${pattern}', method: 'GET', type: 'servicePattern|topLevelServicePattern', run: true},
  addTopLevelPattern: {name: 'Add Top Level Pattern', path: 'orgs/${orgId}/patterns/${pattern}', method: 'POST', type: 'servicePattern|topLevelServicePattern', template: true, editable: true, description: 'Creates a pattern resource. A pattern resource specifies all of the services that should be deployed for a type of node. When a node registers with Horizon, it can specify a pattern name to quickly tell Horizon what should be deployed on it. This can only be called by a user.'},
  patchPattern: {name: 'Update Pattern', path: 'orgs/${orgId}/patterns/${pattern}', method: 'PATCH', type: 'servicePattern|topLevelServicePattern', run: true, template: true, editable: true, description: 'Updates one attribute of a pattern. This can only be called by the user that originally created this pattern resource.'},
  getPatterns: {name: 'Get All Patterns', path: 'orgs/${orgId}/patterns', method: 'GET', type: 'servicePattern|topLevelServicePattern', run: true, description: 'Returns all pattern definitions in this organization. Can be run by any user, node, or agbot.'},
  deletePattern: {name: 'Delete Pattern By Name', path: 'orgs/${orgId}/patterns/${pattern}', method: 'DELETE', type: 'servicePattern|topLevelServicePattern', run: true, description: ''},
  updatePattern: {name: 'Update Pattern Attribute', path: 'orgs/${orgId}/patterns/${pattern}', method: 'PATCH', type: 'servicePattern|topLevelServicePattern', run: true, description: 'Updates one attribute of a pattern. This can only be called by the user that originally created this pattern resource.'},
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
  getNode: {mapTo: 'patchNode'},
  // getNode: {mapTo: 'addNode'},
  servicePattern: {mapTo: 'addPattern'},
  getService: {mapTo: 'addService'},
  topLevelServicePattern: {mapTo: 'addPattern'},
  topLevelService: {mapTo: 'addService'},
  deploymentPolicy: {mapTo: 'addDeploymentPolicy'},
  servicePolicy: {mapTo: 'addServicePolicy'},
  nodePolicy: {mapTo: 'addNodePolicy'},
  getPattern: {mapTo: 'addPattern'},
  getServiceCert: {mapTo: 'putServiceCert'},
  getNodeAgreement: {mapTo: 'addNodeAgreement'}
}
export const JsonKeyMap = {
  // agreementService: {mapTo: 'agrService'}
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
  contentNode?: string;
  policy?: string;
  attributes?: string;
}
export const JsonSchema = {
  addNode: {name: 'Add Service Json', file: 'assets/templates/node.json'},
  getNode: {name: 'Node Json', file: 'assets/templates/node.patch.json', policy: 'assets/templates/policy.string.json', contentNode: 'nodes.${orgId}/${nodeId}'},
  patchNode: {name: 'Patch Node Json', attributes: 'nodeName|nodeType|nodePattern|nodeArch|nodeRegServices|nodeInput|nodeMsgEndPoint|nodeSoftwareVersion|nodePublicKey|nodeHeartbeat'},
  getService: {name: 'Service Json', file: 'assets/templates/service.json', contentNode: 'services.${orgId}/${service}'},
  addService: {name: 'Add Service Json', file: 'assets/templates/service.json'},
  addServicePolicy: {name: 'Add Service Policy', file: 'assets/templates/service.policy.json'},
  addDeploymentPolicy: {name: 'Add Deployment Policy', file: 'assets/templates/deployment.policy.json'},
  addTopLevelService: {name: 'Add Service Json', file: 'assets/templates/top-level-service.json'},
  patchService: {name: 'Add Service Json', attributes: 'serviceLabel|serviceServices|serviceDesc|servicePublic|serviceDoc|serviceUrl|serviceVersion|serviceArch|serviceSharable|serviceInput|serviceDeployment|serviceSig|serviceCluster|serviceClusterSig|serviceImageStore'},
  addPattern: {name: 'Add Service Pattern', file: 'assets/templates/service.pattern.json'},
  addTopLevelPattern: {name: 'Add Top Level Service Pattern', file: 'assets/templates/top-level-service.pattern.json'},
  patchPattern: {name: 'Patch Pattern', attributes: 'patternLabel|patternServices|patternDesc|patternPublic|patternInput|patternSecret|patternAgreement'},
  addNodePolicy: {name: 'Add Node Policy Json', file: 'assets/templates/node.policy.json'},
  addNodeAgreement: {name: 'Add Node Agreement Json', file: 'assets/templates/node.agreement.json'},
  addNodeError: {name: 'Add/Update Node Json', file: 'assets/templates/node.error.json'},
  getOrg: {name: 'Org Json', contentNode: 'orgs.${orgId}'},
  getMyOrgs: {name: 'Add My Org Json', file: 'assets/templates/org.my.json'},
  addOrg: {name: 'Add Org Json', file: 'assets/templates/addorg.json'},
  patchOrg: {name: 'Patch Org', attributes: 'orgType|orgLabel|orgDesc|orgTags|orgLimits|orgHeartbeat'},
  getOrgNodesHealth: {name: 'Org Nodes Health Json', file: 'assets/templates/org.nodes.health.json'},
  getOrgNodeService: {name: 'Org Nodes With Running Service Json', file: 'assets/templates/org.nodes.service.json'},
  validAgreement: {name: 'Org Confirmed Agreement', file: 'assets/templates/org.agreement.confirm.json'},
  putServiceCert: {name: 'Service Key Json', file: 'assets/templates/service.key.json'},
  getNodeAgreement: {name: 'Agreement Json', file: 'assets/templates/agreement.add.json', contentNode: 'agreements.${agId}'}
} as const;

export const AttributeMap = {
  nodeName: {name: 'Name', file: 'assets/templates/node.name.json'},
  nodeType: {name: 'Type', file: 'assets/templates/node.type.json'},
  nodePattern: {name: 'Pattern', file: 'assets/templates/node.pattern.json'},
  nodeArch: {name: 'Architecture', file: 'assets/templates/node.arch.json'},
  nodeRegServices: {name: 'Registered Services', file: 'assets/templates/node.registered.services.json'},
  nodeInput: {name: 'User Input', file: 'assets/templates/node.userinput.json'},
  nodeMsgEndPoint: {name: 'Message End Point', file: 'assets/templates/node.msg.endpoint.json'},
  nodeSoftwareVersion: {name: 'Software Version', file: 'assets/templates/node.software.version.json'},
  nodePublicKey: {name: 'Public Key', file: 'assets/templates/node.public.key.json'},
  nodeHeartbeat: {name: 'Heartbeat Intervals', file: 'assets/templates/node.heartbeat.intervals.json'},
  serviceLabel: {name: 'Label', file: 'assets/templates/service.label.json'},
  serviceServices: {name: 'Required Services', file: 'assets/templates/service.required.services.json'},
  serviceDesc: {name: 'Description', file: 'assets/templates/service.description.json'},
  servicePublic: {name: 'Public', file: 'assets/templates/service.public.json'},
  serviceDoc: {name: 'Documentation', file: 'assets/templates/service.documentation.json'},
  serviceUrl: {name: 'Url', file: 'assets/templates/service.url.json'},
  serviceVersion: {name: 'Version', file: 'assets/templates/service.version.json'},
  serviceArch: {name: 'Arch', file: 'assets/templates/service.arch.json'},
  serviceSharable: {name: 'Sharable', file: 'assets/templates/service.sharable.json'},
  serviceInput: {name: 'User Input', file: 'assets/templates/service.userinput.json'},
  serviceDeployment: {name: 'Deployment', file: 'assets/templates/service.deployment.json'},
  serviceSig: {name: 'Deplyment Signature', file: 'assets/templates/service.deployment.signature.json'},
  serviceCluster: {name: 'Cluster Deployment', file: 'assets/templates/service.cluster.deployment.json'},
  serviceClusterSig: {name: 'Cluster Deployment Signature', file: 'assets/templates/service.cluster.deployment.signature.json'},
  serviceImageStore: {name: 'Image Store', file: 'assets/templates/service.imagestore.json'},
  orgType: {name: 'Type', file: 'assets/templates/org.type.json'},
  orgLabel: {name: 'Label', file: 'assets/templates/org.label.json'},
  orgDesc: {name: 'Description', file: 'assets/templates/org.description.json'},
  orgTags: {name: 'Tags', file: 'assets/templates/org.tags.json'},
  orgLimits: {name: 'Limits', file: 'assets/templates/org.limits.json'},
  orgHeartbeat: {name: 'Heartbeat intervals', file: 'assets/templates/org.heartbeat.intervals.json'},
  patternServices: {name: 'Services', file: 'assets/templates/pattern.services.json'},
  patternLabel: {name: 'Label', file: 'assets/templates/pattern.label.json'},
  patternDesc: {name: 'Description', file: 'assets/templates/pattern.description.json'},
  patternPublic: {name: 'Public', file: 'assets/templates/pattern.public.json'},
  patternInput: {name: 'User Input', file: 'assets/templates/pattern.userinput.json'},
  patternSecret: {name: 'Secret Binding', file: 'assets/templates/pattern.secretbinding.json'},
  patternAgreement: {name: 'Agreement Protocols', file: 'assets/templates/pattern.agreementprotocols.json'}
}
export const JsonToken = {
  orgId: '${orgId}',
  service: '${service}',
  hzVersion: '${hzVersion}',
  version: '${version}',
  arch: '${arch}',
  cpus: '${cpus}',
  ram: '${ram}'
} as const;

export const TemplateToken = {
  $ARCH: {name: 'Architecture'},
  $HZN_ORG_ID: {name: 'Org Id'},
  $MMS_SERVICE_NAME: {name: 'Top Level Service Name'},
  $MMS_SERVICE_VERSION: {name: 'Top Level Service version'},
  $MMS_CONTAINER_NAME: {name: 'Top Level Service container name'},
  $SERVICE_NAME: {name: 'Service name'},
  $SERVICE_VERSION: {name: 'Service version'},
  $SERVICE_CONTAINER_NAME: {name: 'Service container name'},
  $MMS_SHARED_VOLUME: {name: 'Shared volume name'},
  $VOLUME_MOUNT: {name: 'Volume mount name'},
  $AGREEMENT_ID: {name: 'Agreement Id'},
  $PATTERN_NAME: {name: 'Pattern name'}
}
