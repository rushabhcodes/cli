import { expect, test } from "bun:test"
import fs from "node:fs"
import path from "node:path"
import JSZip from "jszip"
import { temporaryDirectory } from "tempy"
import { createKicadProjectZip } from "cli/build/create-kicad-project-zip"

test("createKicadProjectZip zips the full project directory", async () => {
  const tmpDir = temporaryDirectory()
  const projectDir = path.join(tmpDir, "kicad")
  fs.mkdirSync(path.join(projectDir, "3dmodels", "demo.3dshapes"), {
    recursive: true,
  })
  fs.writeFileSync(path.join(projectDir, "demo.kicad_pcb"), "(kicad_pcb)")
  fs.writeFileSync(path.join(projectDir, "demo.kicad_pro"), "{}")
  fs.writeFileSync(
    path.join(projectDir, "3dmodels", "demo.3dshapes", "demo.step"),
    "STEPDATA",
  )

  const outputZipPath = path.join(tmpDir, "kicad.zip")
  await createKicadProjectZip({ projectDir, outputZipPath })

  const zipBuffer = fs.readFileSync(outputZipPath)
  const zip = await JSZip.loadAsync(zipBuffer)
  const zipFiles = Object.keys(zip.files).sort()

  expect(zipFiles).toEqual([
    "3dmodels/",
    "3dmodels/demo.3dshapes/",
    "3dmodels/demo.3dshapes/demo.step",
    "demo.kicad_pcb",
    "demo.kicad_pro",
  ])
})
