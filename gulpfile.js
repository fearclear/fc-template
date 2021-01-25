const { src, dest, series, task, watch } = require('gulp')
const gulpI18nWxml = require('@miniprogram-i18n/gulp-i18n-wxml')
const gulpI18nLocales = require('@miniprogram-i18n/gulp-i18n-locales')
const ts = require('gulp-typescript')
const tsProject = ts.createProject('tsconfig.json')
const alias = require('gulp-ts-alias')
const del = require('del')
const replace = require('gulp-replace')
const chalk = require('chalk')

const envConfig = require('./dotenv')

function mergeAndGenerateLocales() {
  return src('src/**/i18n/*.json')
    .pipe(
      gulpI18nLocales({
        defaultLocale: 'zh-CN',
        fallbackLocale: 'zh-CN'
      })
    )
    .pipe(dest('dist/i18n/'))
}

function transpileWxml() {
  return src('src/**/*.wxml')
    .pipe(gulpI18nWxml())
    .pipe(dest('dist/'))
}

function transpileTypescript() {
  const stream = src('src/**/*.ts', { cwd: './' })
  stream.pipe(alias({ configuration: tsProject.config }))
  stream.pipe(
    replace('process.env.NODE_ENV', JSON.stringify(process.env.NODE_ENV))
  )
  for (const i in envConfig) {
    stream.pipe(replace(`process.env.${i}`, JSON.stringify(envConfig[i])))
  }
  stream.pipe(
    replace(/process\.env\.\w+/gi, function(match, pl, offset) {
      console.log(chalk.yellow(`warning: ${match} will not be replaced.`))
      return 'undefined'
    })
  )

  return stream.pipe(tsProject()).js.pipe(dest('dist/'))
}

function copyToDist() {
  return src([
    'src/**/*',
    '!src/**/*.wxml',
    '!src/**/*.ts',
    '!src/**/i18n/*.json'
  ]).pipe(dest('dist/'))
}

function cleanDist() {
  return del(['dist/**/*', '!dist/miniprogram_npm'])
}

task(
  'default',
  series(
    cleanDist,
    copyToDist,
    transpileTypescript,
    transpileWxml,
    mergeAndGenerateLocales
  )
)

task('watch', () => {
  watch('src/**/*', series('default'))
})
