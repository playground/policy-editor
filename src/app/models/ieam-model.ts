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
  SAVE,
  NONE_SELECTED,
  NO_BUCKET,
  NOT_EDITOR,
  NETWORK,
  JSON_MODIFIED
}
export const Navigate = {
  home: 'home',
  bucket: 'bucket',
  editor: 'editor',
  about: 'about',
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

