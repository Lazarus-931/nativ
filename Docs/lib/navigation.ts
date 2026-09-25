export type NavLink = { title: string; href: string; logo?: string; accent?: boolean };
export type NavGroup = { title: string; href?: string; logo?: string; links: NavLink[] };
export type NavSection = { title: string; href?: string; links?: NavLink[]; groups?: NavGroup[] };
export type NavItem = NavLink | NavSection;

export function isSection(item: NavItem): item is NavSection {
  return (item as NavSection).links !== undefined || (item as NavSection).groups !== undefined;
}

const P = '/assets/logos/providers';
const I = '/assets/logos/integrations';

export const navigation: NavItem[] = [
  { title: 'New', href: '/new', accent: true },
  {
    title: 'Get Started',
    href: '/getting-started',
    links: [
      { title: 'Installation', href: '/getting-started/installation' },
      { title: 'Downloading Models', href: '/getting-started/downloading-models' },
      { title: 'Starting Server', href: '/getting-started/starting-server' },
      { title: 'Your First Chat', href: '/getting-started/first-chat' },
      { title: 'Customization', href: '/getting-started/customization' },
      { title: 'Build from Source', href: '/getting-started/build-from-source' },
      { title: 'Server Details', href: '/getting-started/server-details' },
    ],
  },
  {
    title: 'Features',
    groups: [
      {
        title: 'Artifacts',
        href: '/features/artifacts',
        links: [
          { title: 'Reuse and Organize', href: '/features/artifacts/reuse-and-organize' },
          { title: 'Gallery Controls', href: '/features/artifacts/controls' },
        ],
      },
      {
        title: 'Audio',
        href: '/features/audio',
        links: [
          { title: 'Dictate into any app', href: '/features/audio/dictate-anywhere' },
          { title: 'Audio controls', href: '/features/audio/controls' },
          { title: 'Recordings & Privacy', href: '/features/audio/recordings-and-privacy' },
        ],
      },
      {
        title: 'Model Configuration',
        href: '/features/model-configuration',
        links: [
          { title: 'Reduce Memory Use', href: '/features/model-configuration/reduce-memory' },
          { title: 'Produce Structured JSON', href: '/features/model-configuration/structured-output' },
          { title: 'Model Controls', href: '/features/model-configuration/controls' },
        ],
      },
    ],
  },
  {
    title: 'Models',
    groups: [
      {
        title: 'Cohere',
        href: '/models/cohere',
        logo: `${P}/cohere.svg`,
        links: [
          { title: 'Command A', href: '/models/cohere/command-a' },
          { title: 'Command A Vision', href: '/models/cohere/command-a-vision' },
          { title: 'Aya Vision', href: '/models/cohere/aya-vision' },
        ],
      },
      {
        title: 'Liquid AI',
        href: '/models/liquid',
        logo: `${P}/liquid.svg`,
        links: [
          { title: 'LFM2.5-VL', href: '/models/liquid/lfm2-5-vl' },
          { title: 'LFM2.5', href: '/models/liquid/lfm2-5' },
          { title: 'LFM2', href: '/models/liquid/lfm2' },
        ],
      },
      {
        title: 'Z.ai',
        href: '/models/zai',
        logo: `${P}/zai.svg`,
        links: [
          { title: 'GLM-5.3', href: '/models/zai/glm-5-3' },
          { title: 'GLM-5.3-Flash', href: '/models/zai/glm-5-3-flash' },
          { title: 'GLM-4.7', href: '/models/zai/glm-4-7' },
        ],
      },
      {
        title: 'Google DeepMind',
        href: '/models/google-deepmind',
        logo: `${P}/google.svg`,
        links: [],
      },
      {
        title: 'Poolside',
        href: '/models/poolside',
        logo: `${P}/poolside.svg`,
        links: [
          { title: 'Laguna', href: '/models/poolside/laguna' },
          { title: 'Laguna S', href: '/models/poolside/laguna-s' },
          { title: 'Laguna XS', href: '/models/poolside/laguna-xs' },
        ],
      },
      {
        title: 'Qwen',
        href: '/models/qwen',
        logo: `${P}/qwen.svg`,
        links: [
          { title: 'Qwen3.8-27B', href: '/models/qwen/qwen3-8-27b' },
          { title: 'Qwen3.8-Flash-Next', href: '/models/qwen/qwen3-8-flash-next' },
          { title: 'Qwen3.5-VL', href: '/models/qwen/qwen3-5-vl' },
        ],
      },
      {
        title: 'DeepSeek',
        href: '/models/deepseek',
        logo: `${P}/deepseek.svg`,
        links: [
          { title: 'DeepSeek-V4', href: '/models/deepseek/deepseek-v4' },
          { title: 'DeepSeek-V4-Flash-Vision-Exp', href: '/models/deepseek/deepseek-v4-flash-vision-exp' },
          { title: 'DeepSeek-V3.2', href: '/models/deepseek/deepseek-v3-2' },
        ],
      },
      {
        title: 'Moonshot',
        href: '/models/moonshot',
        logo: `${P}/moonshot.svg`,
        links: [{ title: 'Kimi K3', href: '/models/moonshot/kimi-k3' }],
      },
    ],
  },
  {
    title: 'Integrations',
    links: [
      { title: 'Claude Code', href: '/integrations/claude-code', logo: `${I}/claude-code.svg` },
      { title: 'Codex', href: '/integrations/codex', logo: `${I}/codex.svg` },
      { title: 'OpenCode', href: '/integrations/opencode', logo: `${I}/opencode.svg` },
      { title: 'Pi', href: '/integrations/pi', logo: `${I}/pi.svg` },
      { title: 'Hermes', href: '/integrations/hermes', logo: `${I}/hermes.svg` },
    ],
  },
  {
    title: 'Blogs',
    links: [{ title: 'Introducing Nativ', href: '/blogs/introducing-nativ' }],
  },
];

export function documentPages(): NavLink[] {
  const pages: NavLink[] = [];

  for (const item of navigation) {
    if (!isSection(item)) {
      pages.push(item);
      continue;
    }

    if (item.href) pages.push({ title: item.title, href: item.href });
    pages.push(...(item.links ?? []));

    for (const group of item.groups ?? []) {
      if (group.href) pages.push({ title: group.title, href: group.href, logo: group.logo });
      pages.push(...group.links);
    }
  }

  return pages;
}
