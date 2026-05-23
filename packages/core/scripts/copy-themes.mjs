import { copyFile, mkdir, readdir } from 'fs/promises'
import { resolve } from 'path'

const sourceDir = resolve('src/themes')
const targetDir = resolve('dist/themes')

await mkdir(targetDir, { recursive: true })

const files = await readdir(sourceDir)

for (const file of files) {
  if (!file.endsWith('.css')) continue

  await copyFile(resolve(sourceDir, file), resolve(targetDir, file))
}

console.log('Copied theme CSS files to dist/themes')