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
  CONFIG_LOADED,
  ORG_SELECTED,
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

export class Option {
  id?: string = '';
  name?: string = '';
}

export interface IExchange {
  name: string;
  path: string;
  method: string;
  prompt: boolean;
  title: string;
  placeholder: string;
}
export const Exchange = {
  Admintatus: {name: 'Admin Status', path: 'admin/status', method: 'GET'},
  adminVersion: {name: 'Admin Version', path: 'admin/version'},
  adminOrgStatus: {name: 'Admin Org Status', path: 'admin/orgstatus'},
  addOrg: {name: 'Add Org', path: 'orgs', prompt: true, title: 'Enter org name', placeholder: 'Organization Name'}
} as const;
