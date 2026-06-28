import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const stateCodes = {
  ac: '12', al: '27', am: '13', ap: '16', ba: '29', ce: '23', df: '53', es: '32',
  go: '52', ma: '21', mg: '31', ms: '50', mt: '51', pa: '15', pb: '25', pe: '26',
  pi: '22', pr: '41', rj: '33', rn: '24', ro: '11', rr: '14', rs: '43', sc: '42',
  se: '28', sp: '35', to: '17',
};

const aliases = {
  'ac/brasilia': 'brasileia',
  'ma/paco_do_luminar': 'paco do lumiar',
  'pb/souza': 'sousa',
  'rn/assu': 'acu',
};

const manualLocations = {
  'df/brasilia': { label: 'Brasília', coordinates: [-47.8828, -15.7939] },
  'df/samambaia': { label: 'Samambaia', coordinates: [-48.0856, -15.8757] },
  'df/taguatinga': { label: 'Taguatinga', coordinates: [-48.0562, -15.8321] },
};

const normalize = (value) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

function levenshtein(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
}

function flattenCoordinates(coordinates, output = []) {
  if (typeof coordinates?.[0] === 'number') output.push(coordinates);
  else coordinates?.forEach((item) => flattenCoordinates(item, output));
  return output;
}

function geometryCenter(geometry) {
  const points = flattenCoordinates(geometry.coordinates);
  const longitudes = points.map(([lon]) => lon);
  const latitudes = points.map(([, lat]) => lat);
  return [
    Number(((Math.min(...longitudes) + Math.max(...longitudes)) / 2).toFixed(5)),
    Number(((Math.min(...latitudes) + Math.max(...latitudes)) / 2).toFixed(5)),
  ];
}

const sourceRoot = path.resolve(process.cwd(), '..', 'imgs');
const folders = (await readdir(sourceRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory());
const output = {};
const uncertain = [];

await Promise.all(folders.map(async (folder) => {
  const uf = folder.name.toLowerCase();
  const stateCode = stateCodes[uf];
  if (!stateCode) return;
  const files = (await readdir(path.join(sourceRoot, folder.name), { withFileTypes: true }))
    .filter((entry) => entry.isFile() && /^\.(png|jpe?g|webp|avif)$/i.test(path.extname(entry.name)));
  if (files.length === 0) return;

  const [municipalities, mesh] = await Promise.all([
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateCode}/municipios`).then((response) => response.json()),
    fetch(`https://servicodados.ibge.gov.br/api/v3/malhas/estados/${stateCode}?formato=application/vnd.geo+json&qualidade=minima&intrarregiao=municipio`).then((response) => response.json()),
  ]);
  const featuresByCode = new Map(mesh.features.map((feature) => [String(feature.properties.codarea), feature]));

  for (const file of files) {
    const slug = path.basename(file.name, path.extname(file.name)).toLowerCase();
    const key = `${uf}/${slug}`;
    if (manualLocations[key]) {
      output[key] = manualLocations[key];
      continue;
    }
    const wanted = normalize(aliases[key] ?? slug.replaceAll('_', ' '));
    const ranked = municipalities
      .map((municipality) => ({ municipality, distance: levenshtein(wanted, normalize(municipality.nome)) }))
      .sort((a, b) => a.distance - b.distance);
    const match = ranked[0];
    const feature = featuresByCode.get(String(match.municipality.id));
    if (!feature) continue;
    output[key] = { label: match.municipality.nome, coordinates: geometryCenter(feature.geometry) };
    if (match.distance > 2) uncertain.push(`${key} → ${match.municipality.nome} (distância ${match.distance})`);
  }
}));

const destination = path.resolve(process.cwd(), 'scripts', 'city-locations.json');
await writeFile(destination, `${JSON.stringify(Object.fromEntries(Object.entries(output).sort()), null, 2)}\n`, 'utf8');
console.log(`Localizações geradas: ${Object.keys(output).length}.`);
if (uncertain.length) console.warn(`Correspondências para revisar:\n${uncertain.join('\n')}`);
