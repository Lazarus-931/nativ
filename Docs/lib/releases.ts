export type ReleaseSummary = {
  version: string;
  date: string;
  href: string;
  summary: string;
};

export const releases: ReleaseSummary[] = [
  {
    version: 'Nativ 0.3.6',
    date: 'Aug 31, 2026',
    href: 'https://github.com/Blaizzy/nativ/releases/tag/v0.3.6',
    summary: 'Agent file & terminal tools, custom Kits, and multi-window support.',
  },
  {
    version: 'Nativ 0.3.5',
    date: 'Aug 26, 2026',
    href: 'https://github.com/Blaizzy/nativ/releases/tag/v0.3.5',
    summary: 'GLM-5.3-Flash (Z.ai), a safe file-reading tool, and Homebrew tool discovery.',
  },
  {
    version: 'Nativ 0.3.4',
    date: 'Aug 24, 2026',
    href: 'https://github.com/Blaizzy/nativ/releases/tag/v0.3.4',
    summary: 'Temperature/fan/power stats, Keychain HF token, and a reworked control panel.',
  },
];
