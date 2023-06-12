import { filter } from 'rxjs/operators';
import { resolve } from 'node:path';
import fs from 'fs';
import { shouldFilterBaseDirName } from './constant';

/**
 * 判断是不是文件夹
 */
export const isDirectory = (path: string) => fs.statSync(path).isDirectory()

/**
 * 获取文件夹里的文件名称
 */
export const getDirFiles = (path: string) => fs.readdirSync(path, {
  encoding: 'utf-8'
})

/**
 * 获取文档所在目录
 */
export const getBaseDocsPath = () => resolve(__dirname, '../../../hooks')

/**
 * 过滤
 */
export const isShouldFilter = (baseDocsPath: string, fileName: string) => {
  return !isDirectory(`${baseDocsPath}/${fileName}`) || shouldFilterBaseDirName.includes(fileName)
}

export const getBaseDocsGroup = () => {
  const baseDocsPath = getBaseDocsPath()
  const baseGroups = getDirFiles(baseDocsPath)
    .filter(fileName => !isShouldFilter(baseDocsPath, fileName))

  return baseGroups
}