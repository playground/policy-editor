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
  prompt: boolean;
  title: string;
  placeholder: string;
  signature: boolean;
  callB4: string;
  description: string;
  type: string;
}
export const Exchange = {
  admintatus: {name: 'Admin Status', path: 'admin/status', method: 'GET'},
  adminVersion: {name: 'Admin Version', path: 'admin/version'},
  adminOrgStatus: {name: 'Admin Org Status', path: 'admin/orgstatus'},
  addOrg: {name: 'Add Org', path: 'orgs', prompt: true, title: 'Enter org name', placeholder: 'Organization Name'},
  addService: {name: 'Add/Update Service', path: 'orgs/${orgid}/services', method: 'POST', type: 'service', signature: true, callB4: 'getService'},
  getService: {name: 'Get Service By Name', path: 'orgs/${orgid}/services/${service}', method: 'GET', type: 'service'},
  getServices: {name: 'Get All Services', path: 'orgs/${orgid}/services', method: 'GET', type: 'service'},
  deleteService: {name: 'Delete Service By Name', path: 'orgs/${orgid}/services/${service}', method: 'DELETE', type: 'service'},
  addNodePolicy: {name: 'Add/Update Mgmt Policy', path: 'orgs/${orgid}/managementpolicies/${managementPolicy}', method: 'POST', type: 'managementPolicy', callB4: 'getNodePolicy', description: 'Creates a node management policy resource. A node management policy controls the updating of the edge node agents. This can only be called by a user.'},
  getNodePolicy: {name: 'Get Mgmt Policy By Name', path: 'orgs/${orgid}/managementpolicies/${managementPolicy}', method: 'GET', type: 'managementPolicy'},
  getNodePolicies: {name: 'Get All Mgmt Policies', path: 'orgs/${orgid}/managementpolicies', method: 'GET', type: 'managementPolicy'},
  deleteNodePolicy: {name: 'Delete Mgmt Policy By Name', path: 'orgs/${orgid}/managementpolicies/${managementPolicy}', method: 'DELETE', type: 'managementPolicy'},
  addBusinessPolicy: {name: 'Add/Update Business Policy', path: 'orgs/${orgid}/business/policies/${businesPolicy}', method: 'POST', type: 'businessPolicy', callB4: 'getBusinessPolicy', description: 'Creates a business policy resource. A business policy resource specifies the service that should be deployed based on the specified properties and constraints. This can only be called by a user.'},
  getBusinessPolicy: {name: 'Get Business Policy By Name', path: 'orgs/${orgid}/business/policies/${businesPolicy}', method: 'GET', type: 'businessPolicy', description: 'Returns the business policy with the specified id. Can be run by a user, node, or agbot.'},
  getBusinessPolicies: {name: 'Get All Business Policies', path: 'orgs/${orgid}/business/policies', method: 'GET', type: 'businessPolicy', description: 'Returns all business policy definitions in this organization. Can be run by any user, node, or agbot.'},
  deleteBusinessPolicy: {name: 'Delete Business Policy By Name', path: 'orgs/${orgid}/business/${businesPolicy}', method: 'DELETE', type: 'businessPolicy', description: ''},
  addServicePolicy: {name: 'Add/Update Service Policy', path: 'orgs/${orgid}/services/${servicePolicy}/policy', method: 'PUT', type: 'servicePolicy', description: 'Adds or updates the policy of a service. This can be called by the owning user.'},
  getServicePolicy: {name: 'Get Service Policy By Name', path: 'orgs/${orgid}/services/${servicePolicy}/policy', method: 'GET', type: 'servicePolicy', description: 'Returns the service policy. Can be run by a user, node or agbot.'},
  deleteServicePolicy: {name: 'Delete Service Policy By Name', path: 'orgs/${orgid}/services/${servicePolicy}/policy', method: 'DELETE', type: 'servicePolicy', description: 'Deletes the policy of a service. Can be run by the owning user.'},
} as const;

export const Loader = {
  service: {name: 'Service Definition', file: 'assets/templates/service.json', template: true},
  topLevelService: {name: 'Top Level Service', file: 'assets/templates/top-level-service.json', template: true},
  servicePolicy: {name: 'Service Policy', file: 'assets/templates/service.policy.json', template: true},
  businessPolicy: {name: 'Business Policy', file: 'assets/templates/deployment.policy.json', template: true},
  managementPolicy: {name: 'Node Policy', file: 'assets/templates/node.policy.json', template: true},
  hznConfig: {name: 'hzn Config File'},
  localPolicy: {name: 'Local File'},
  remotePolicy: {name: 'Remote File'}
} as const;

export const UrlToken = {
  orgid: '${orgid}',
  service: '${service}',
  servicePolicy: '${servicePolicy}',
  managementPolicy: '${managementPolicy}',
  businessPolicy: '${businessPolicy}'
} as const;
