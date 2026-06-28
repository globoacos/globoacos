import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const localSourceRoot = path.resolve(process.cwd(), 'imgs');
const workspaceSourceRoot = path.resolve(process.cwd(), '..', 'imgs');
const sourceRoot = existsSync(localSourceRoot) ? localSourceRoot : workspaceSourceRoot;
const publicRoot = path.resolve(process.cwd(), 'public');
const destinationRoot = path.resolve(publicRoot, 'images', 'states');
const flagsSourceRoot = path.resolve(sourceRoot, 'bandeiras');
const flagsDestinationRoot = path.resolve(publicRoot, 'images', 'flags');
const allowedExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);
const locations = JSON.parse(await readFile(path.resolve(process.cwd(), 'scripts', 'city-locations.json'), 'utf8'));

if (!destinationRoot.startsWith(`${publicRoot}${path.sep}`)) {
  throw new Error('Destino de imagens inválido.');
}

if (!flagsDestinationRoot.startsWith(`${publicRoot}${path.sep}`)) {
  throw new Error('Destino de bandeiras inválido.');
}

if (!existsSync(sourceRoot) || !existsSync(flagsSourceRoot)) {
  console.log('Pasta de imagens fonte não encontrada; mantendo imagens públicas já sincronizadas.');
  process.exit(0);
}

await rm(destinationRoot, { recursive: true, force: true });
await mkdir(destinationRoot, { recursive: true });

await rm(flagsDestinationRoot, { recursive: true, force: true });
await mkdir(flagsDestinationRoot, { recursive: true });

const manifest = {};
const folders = (await readdir(sourceRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && entry.name.toLowerCase() !== 'bandeiras')
  .sort((a, b) => a.name.localeCompare(b.name));

const flagFiles = (await readdir(flagsSourceRoot, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && allowedExtensions.has(path.extname(entry.name).toLowerCase()))
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }));

await Promise.all(flagFiles.map((file) => cp(path.join(flagsSourceRoot, file), path.join(flagsDestinationRoot, file))));

for (const folder of folders) {
  const stateId = folder.name.toLowerCase();
  const stateSource = path.join(sourceRoot, folder.name);
  const stateDestination = path.join(destinationRoot, stateId);
  const files = (await readdir(stateSource, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && allowedExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }));

  manifest[stateId] = files.map((file) => {
    const city = path.basename(file, path.extname(file)).toLowerCase();
    const location = locations[`${stateId}/${city}`];
    return {
      file,
      city,
      label: location?.label ?? city.replaceAll('_', ' '),
      coordinates: location?.coordinates ?? null,
    };
  });
  if (files.length === 0) continue;
  await mkdir(stateDestination, { recursive: true });
  await Promise.all(files.map((file) => cp(path.join(stateSource, file), path.join(stateDestination, file))));
}

await writeFile(path.join(destinationRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Imagens sincronizadas: ${Object.values(manifest).flat().length} arquivo(s), ${folders.length} UF(s). Bandeiras: ${flagFiles.length}.`);
