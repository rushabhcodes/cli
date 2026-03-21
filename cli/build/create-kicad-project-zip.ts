import fs from "node:fs"
import path from "node:path"
import JSZip from "jszip"

function addDirectoryToZip(opts: {
  zip: JSZip
  dirPath: string
  zipPath: string
}): void {
  const { zip, dirPath, zipPath } = opts
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)
    const entryZipPath = zipPath ? `${zipPath}/${entry.name}` : entry.name

    if (entry.isDirectory()) {
      addDirectoryToZip({ zip, dirPath: fullPath, zipPath: entryZipPath })
    } else {
      zip.file(entryZipPath, fs.readFileSync(fullPath))
    }
  }
}

export const createKicadProjectZip = async ({
  projectDir,
  outputZipPath,
}: {
  projectDir: string
  outputZipPath: string
}) => {
  const zip = new JSZip()
  addDirectoryToZip({ zip, dirPath: projectDir, zipPath: "" })

  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  })

  fs.writeFileSync(outputZipPath, zipBuffer)
}
