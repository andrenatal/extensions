const fs = require('fs')
const path = require('path')

const cwd =  process.cwd()
const folder = process.argv[2]
const apiURL = process.argv[3]
const websiteURL = process.argv[4]
const basePath = path.join(cwd, 'src')
const distPath = path.join(cwd, 'dist', folder)

console.log(`Building ${folder} with API URL ${apiURL} and Website URL ${websiteURL}`)

const files = fs.readdirSync(path.join(cwd, 'src'))

const substitutions = {
  'http://localhost:5000': apiURL,
  'http://localhost:3000': websiteURL || 'https://www.fakerfact.org',
}

files.forEach(file => {
  const filePath = path.join(basePath, file)
  if (fs.lstatSync(filePath).isDirectory()) return

  const destinationPath = path.join(distPath, file)

  if (file.endsWith('.js') || file.endsWith('.json')) {
    console.log(`Copying ${filePath.replace(`${cwd}/`,'./')} => ${destinationPath.replace(`${cwd}/`,'./')} with substitutions`);
    let contents = fs.readFileSync(filePath, 'utf8')
    for (key in substitutions) {
      contents = contents.split(key).join(substitutions[key])
    }
    fs.writeFileSync(destinationPath, contents)
  } else {
    console.log(`Copying ${filePath.replace(`${cwd}/`,'./')} => ${destinationPath.replace(`${cwd}/`,'./')} as-is`);
    const contents = fs.readFileSync(filePath)
    fs.writeFileSync(destinationPath, contents)
  }
})
