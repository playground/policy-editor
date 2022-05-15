export enum Enum {
  JSON_LOADED,
  GARAGE_CLOSE,
  NAVIGATE,
  REFRESH,
  THEME_CHANGED,
  LOGGED_IN,
  LOGGED_OUT,
  SHOW_FOOTER
}
export const Navigate = {
  home: 'home',
  bucket: 'bucket',
  editor: 'editor',
  about: 'about',
  signin: 'signin'
} as const;
