const fs = require('fs')
const path = require('path')
const { mainModule } = require('process')

function main() {
  const mode = process.env.NODE_ENV || 'development'

  const env = fs.readFileSync(path.resolve(process.cwd(), `.env.${mode}`))

  const envConfig = require('dotenv').parse(env)

  if (!envConfig) {
    throw new Error('环境变量解析错误')
  } else {
    for (const i in envConfig) {
      if (i.includes('MINI_APP_')) {
        process.env[i] = envConfig[i]
      } else {
        Reflect.deleteProperty(envConfig, i)
      }
    }
  }
  return envConfig
}

const envConfig = main()
module.exports = envConfig
