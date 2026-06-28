// Dados editáveis de cada estado brasileiro
// Edite value, description e cta conforme suas métricas reais

export interface StateData {
  name: string;
  region: 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';
  value: number;           // métrica principal (ex: obras, clientes)
  metricLabel?: string;    // rótulo da métrica (default: "obras")
  description: string;
  cta?: { label: string; href: string };
  color?: string;          // cor override opcional (hex)
}

export const brazilStatesData: Record<string, StateData> = {
  AC: { name: 'Acre',              region: 'Norte',        value: 2,   description: 'Expansão em infraestrutura industrial na região amazônica.' },
  AL: { name: 'Alagoas',           region: 'Nordeste',     value: 4,   description: 'Projetos de cobertura metálica no litoral nordestino.' },
  AM: { name: 'Amazonas',          region: 'Norte',        value: 8,   description: 'Atendimento à Zona Franca com coberturas industriais de grande porte.' },
  AP: { name: 'Amapá',             region: 'Norte',        value: 1,   description: 'Projetos pontuais em infraestrutura portuária.' },
  BA: { name: 'Bahia',             region: 'Nordeste',     value: 18,  description: 'Grande demanda industrial no corredor petroquímico de Camaçari.' },
  CE: { name: 'Ceará',             region: 'Nordeste',     value: 12,  description: 'Crescimento expressivo no polo industrial de Maracanaú.' },
  DF: { name: 'Distrito Federal',  region: 'Centro-Oeste', value: 14,  description: 'Cobertura arquitetônica em centros empresariais e governamentais.' },
  ES: { name: 'Espírito Santo',    region: 'Sudeste',      value: 16,  description: 'Projetos logísticos e portuários no corredor de Vitória.' },
  GO: { name: 'Goiás',             region: 'Centro-Oeste', value: 22,  description: 'Forte presença no agronegócio e galpões logísticos.' },
  MA: { name: 'Maranhão',          region: 'Nordeste',     value: 7,   description: 'Crescimento industrial impulsionado pelo Porto de Itaqui.' },
  MG: { name: 'Minas Gerais',      region: 'Sudeste',      value: 48,  description: 'Região estratégica de crescimento com operações em BH, Uberlândia e Juiz de Fora.',
        cta: { label: 'Ver obras em MG', href: '#contato' } },
  MS: { name: 'Mato Grosso do Sul',region: 'Centro-Oeste', value: 11,  description: 'Galpões agroindustriais e frigoríficos de grande porte.' },
  MT: { name: 'Mato Grosso',       region: 'Centro-Oeste', value: 9,   description: 'Coberturas para armazéns de grãos e complexos do agronegócio.' },
  PA: { name: 'Pará',              region: 'Norte',        value: 6,   description: 'Projetos ligados a mineração e infraestrutura portuária.' },
  PB: { name: 'Paraíba',           region: 'Nordeste',     value: 5,   description: 'Expansão no setor têxtil e de calçados em Campina Grande.' },
  PE: { name: 'Pernambuco',        region: 'Nordeste',     value: 14,  description: 'Porto Industrial do Recife e Complexo de Suape.' },
  PI: { name: 'Piauí',             region: 'Nordeste',     value: 3,   description: 'Projetos iniciais em energia renovável e armazéns.' },
  PR: { name: 'Paraná',            region: 'Sul',          value: 38,  description: 'Complexos logísticos em Curitiba, Londrina e Maringá.',
        cta: { label: 'Ver obras no PR', href: '#contato' } },
  RJ: { name: 'Rio de Janeiro',    region: 'Sudeste',      value: 31,  description: 'Coberturas industriais e projetos especiais no corredor petroquímico.' },
  RN: { name: 'Rio Grande do Norte',region: 'Nordeste',    value: 6,   description: 'Crescimento em energia eólica e projetos industriais costeiros.' },
  RO: { name: 'Rondônia',          region: 'Norte',        value: 4,   description: 'Projetos agroindustriais e de armazenagem no estado.' },
  RR: { name: 'Roraima',           region: 'Norte',        value: 1,   description: 'Projetos iniciais de infraestrutura em Boa Vista.' },
  RS: { name: 'Rio Grande do Sul',  region: 'Sul',         value: 29,  description: 'Forte presença industrial em Porto Alegre, Caxias do Sul e Pelotas.' },
  SC: { name: 'Santa Catarina',    region: 'Sul',          value: 33,  description: 'Polo industrial do Vale do Itajaí e Joinville — alta demanda.' },
  SE: { name: 'Sergipe',           region: 'Nordeste',     value: 4,   description: 'Projetos industriais em Aracaju e polo petroquímico.' },
  SP: { name: 'São Paulo',         region: 'Sudeste',      value: 120, description: 'Maior concentração de operações do país — sede em Americana/SP.',
        cta: { label: 'Ver obras em SP', href: '#contato' } },
  TO: { name: 'Tocantins',         region: 'Norte',        value: 5,   description: 'Expansão em logística e agronegócio ao longo da BR-153.' },
};

// Paleta de cores por região
export const regionColors: Record<string, string> = {
  'Norte':        '#1a4a6e',
  'Nordeste':     '#1a5c4a',
  'Centro-Oeste': '#3a4a1e',
  'Sudeste':      '#1a2b6e',
  'Sul':          '#2a1a6e',
};

// Cor base dos estados (pode ser sobrescrita por state.color)
export const STATE_BASE_COLOR  = '#1e3a6a';
export const STATE_HOVER_COLOR = '#2a5a9e';
export const STATE_SELECT_COLOR = '#3a9e48';
export const BORDER_COLOR      = '#3a6aae';
