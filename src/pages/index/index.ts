// index.ts
import dayjs from 'dayjs'
import create from '@/store/utils/create'
import { getI18nInstance } from '@miniprogram-i18n/core'
// @ts-ignore
wx.instance = getI18nInstance()

console.log(dayjs().toISOString(), process.env.MINI_APP_URL)
create.I18nPage(
  { data: { a: 1 } },
  {
    data: {
      a: 3
    },
    onLoad() {}
  }
)
