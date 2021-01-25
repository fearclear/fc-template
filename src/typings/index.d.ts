/// <reference path="./types/index.d.ts" />
declare module '@miniprogram-i18n/core' {
  export const I18nPage = (x: any) => any
  export const I18n = ''
  export const getI18nInstance = () => any
}

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}
