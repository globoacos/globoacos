import fs from 'node:fs';
import path from 'node:path';
import Script from 'next/script';
import LazyBrazilMap from '@/components/Brazil3DMap/LazyBrazilMap';
import { publicPath } from '@/lib/publicPath';

function getLegacyFragments() {
  const source = fs.readFileSync(path.join(process.cwd(), 'src', 'legacy', 'index.html'), 'utf8');
  const body = source.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? '';
  const mapStart = '<!-- ===== MAPA BRASIL ===== -->';
  const mapEnd = '</section><!-- /mapa-section -->';
  const [beforeMap, mapAndAfter = ''] = body.split(mapStart);
  const endIndex = mapAndAfter.indexOf(mapEnd);
  const afterMap = endIndex >= 0 ? mapAndAfter.slice(endIndex + mapEnd.length) : mapAndAfter;

  const withoutOldMap = `${beforeMap}${afterMap}`
    .replace(/<script\s+src=["']app\.js["']><\/script>/i, '')
    .replaceAll('src="/images/', `src="${publicPath('/images/')}`)
    .replaceAll("src='/images/", `src='${publicPath('/images/')}`)
    .replaceAll('href="/images/', `href="${publicPath('/images/')}`)
    .replaceAll("href='/images/", `href='${publicPath('/images/')}`);
  const secondSection = '<!-- ===== SOBRE ===== -->';
  const secondSectionIndex = withoutOldMap.indexOf(secondSection);

  return {
    beforeMap: secondSectionIndex >= 0 ? withoutOldMap.slice(0, secondSectionIndex) : withoutOldMap,
    afterMap: secondSectionIndex >= 0 ? withoutOldMap.slice(secondSectionIndex) : '',
  };
}

export default function Home() {
  const { beforeMap, afterMap } = getLegacyFragments();

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: beforeMap }} />
      <LazyBrazilMap />
      <div dangerouslySetInnerHTML={{ __html: afterMap }} />
      <Script src={publicPath('/legacy/app.js')} strategy="afterInteractive" />
    </>
  );
}
