export interface SeasonalTheme {
  monthIndex: number;
  monthName: string;
  themeName: string;
  seasonLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  accentClass: string;
  accentHoverClass: string;
  accentTextClass: string;
  accentBorderClass: string;
  accentGlowClass: string;
  hexColor: string;
  description: string;
}

export const seasonalPalettes: Record<number, SeasonalTheme> = {
  0: { // Jan
    monthIndex: 0,
    monthName: 'January',
    themeName: 'Midnight Onyx & Gold',
    seasonLabel: 'New Year Glow',
    badgeBg: 'bg-amber-950/70',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-700/50',
    accentClass: 'bg-amber-600',
    accentHoverClass: 'hover:bg-amber-500',
    accentTextClass: 'text-amber-400',
    accentBorderClass: 'border-amber-500/30',
    accentGlowClass: 'shadow-amber-900/30',
    hexColor: '#d97706',
    description: 'Golden radiance and warm champagne accents celebrating the New Year.'
  },
  1: { // Feb
    monthIndex: 1,
    monthName: 'February',
    themeName: 'Velvet Rose & Romance',
    seasonLabel: 'Valentine Pampering',
    badgeBg: 'bg-rose-950/70',
    badgeText: 'text-rose-300',
    badgeBorder: 'border-rose-700/50',
    accentClass: 'bg-rose-600',
    accentHoverClass: 'hover:bg-rose-500',
    accentTextClass: 'text-rose-400',
    accentBorderClass: 'border-rose-500/30',
    accentGlowClass: 'shadow-rose-900/30',
    hexColor: '#e11d48',
    description: 'A deep velvet rose palette with soft blush highlights for Valentine luxury.'
  },
  2: { // Mar
    monthIndex: 2,
    monthName: 'March',
    themeName: 'Emerald Silk Bloom',
    seasonLabel: 'Spring Renewal',
    badgeBg: 'bg-emerald-950/70',
    badgeText: 'text-emerald-300',
    badgeBorder: 'border-emerald-700/50',
    accentClass: 'bg-emerald-600',
    accentHoverClass: 'hover:bg-emerald-500',
    accentTextClass: 'text-emerald-400',
    accentBorderClass: 'border-emerald-500/30',
    accentGlowClass: 'shadow-emerald-900/30',
    hexColor: '#059669',
    description: 'Lush emerald green and fresh botanical tones representing vitality and scalp wellness.'
  },
  3: { // Apr
    monthIndex: 3,
    monthName: 'April',
    themeName: 'Amethyst & Lavender',
    seasonLabel: 'Easter Glow',
    badgeBg: 'bg-purple-950/70',
    badgeText: 'text-purple-300',
    badgeBorder: 'border-purple-700/50',
    accentClass: 'bg-purple-600',
    accentHoverClass: 'hover:bg-purple-500',
    accentTextClass: 'text-purple-400',
    accentBorderClass: 'border-purple-500/30',
    accentGlowClass: 'shadow-purple-900/30',
    hexColor: '#9333ea',
    description: 'Soft lavender violet and shimmering amethyst hues for springtime freshness.'
  },
  4: { // May
    monthIndex: 4,
    monthName: 'May',
    themeName: 'Champagne Honey Gold',
    seasonLabel: 'Mother’s Day Tribute',
    badgeBg: 'bg-amber-950/70',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-700/50',
    accentClass: 'bg-amber-500',
    accentHoverClass: 'hover:bg-amber-400',
    accentTextClass: 'text-amber-400',
    accentBorderClass: 'border-amber-500/30',
    accentGlowClass: 'shadow-amber-900/30',
    hexColor: '#f59e0b',
    description: 'Rich champagne gold reflecting warmth and maternal pampering.'
  },
  5: { // Jun
    monthIndex: 5,
    monthName: 'June',
    themeName: 'Coral Sunfire',
    seasonLabel: 'Midyear Solstice',
    badgeBg: 'bg-orange-950/70',
    badgeText: 'text-orange-300',
    badgeBorder: 'border-orange-700/50',
    accentClass: 'bg-orange-600',
    accentHoverClass: 'hover:bg-orange-500',
    accentTextClass: 'text-orange-400',
    accentBorderClass: 'border-orange-500/30',
    accentGlowClass: 'shadow-orange-900/30',
    hexColor: '#ea580c',
    description: 'Vibrant coral orange inspired by glowing twilight sunsets.'
  },
  6: { // Jul
    monthIndex: 6,
    monthName: 'July',
    themeName: 'Royal Ruby & Solar Gold',
    seasonLabel: 'High Summer Glam',
    badgeBg: 'bg-rose-950/70',
    badgeText: 'text-rose-300',
    badgeBorder: 'border-rose-700/50',
    accentClass: 'bg-rose-600',
    accentHoverClass: 'hover:bg-rose-500',
    accentTextClass: 'text-rose-400',
    accentBorderClass: 'border-rose-500/30',
    accentGlowClass: 'shadow-rose-900/30',
    hexColor: '#e11d48',
    description: 'Bright ruby rose paired with warm solar gold undertones.'
  },
  7: { // Aug
    monthIndex: 7,
    monthName: 'August',
    themeName: 'Golden Safari Amber',
    seasonLabel: 'Savanna Radiance',
    badgeBg: 'bg-amber-950/70',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-700/50',
    accentClass: 'bg-amber-600',
    accentHoverClass: 'hover:bg-amber-500',
    accentTextClass: 'text-amber-400',
    accentBorderClass: 'border-amber-500/30',
    accentGlowClass: 'shadow-amber-900/30',
    hexColor: '#d97706',
    description: 'Warm golden amber inspired by East African savanna sunsets.'
  },
  8: { // Sep
    monthIndex: 8,
    monthName: 'September',
    themeName: 'Warm Copper Bronze',
    seasonLabel: 'Equinox Elegance',
    badgeBg: 'bg-orange-950/70',
    badgeText: 'text-orange-300',
    badgeBorder: 'border-orange-700/50',
    accentClass: 'bg-orange-600',
    accentHoverClass: 'hover:bg-orange-500',
    accentTextClass: 'text-orange-400',
    accentBorderClass: 'border-orange-500/30',
    accentGlowClass: 'shadow-orange-900/30',
    hexColor: '#c2410c',
    description: 'Rich copper and metallic bronze tones for understated sophistication.'
  },
  9: { // Oct
    monthIndex: 9,
    monthName: 'October',
    themeName: 'Plum Velvet & Gold',
    seasonLabel: 'Twilight Soirée',
    badgeBg: 'bg-purple-950/70',
    badgeText: 'text-purple-300',
    badgeBorder: 'border-purple-700/50',
    accentClass: 'bg-purple-600',
    accentHoverClass: 'hover:bg-purple-500',
    accentTextClass: 'text-purple-400',
    accentBorderClass: 'border-purple-500/30',
    accentGlowClass: 'shadow-purple-900/30',
    hexColor: '#7e22ce',
    description: 'Deep plum and champagne gold accents for autumn luxury.'
  },
  10: { // Nov
    monthIndex: 10,
    monthName: 'November',
    themeName: 'Terracotta Rose Gold',
    seasonLabel: 'Pre-Holiday Warmth',
    badgeBg: 'bg-rose-950/70',
    badgeText: 'text-rose-300',
    badgeBorder: 'border-rose-700/50',
    accentClass: 'bg-rose-700',
    accentHoverClass: 'hover:bg-rose-600',
    accentTextClass: 'text-rose-400',
    accentBorderClass: 'border-rose-500/30',
    accentGlowClass: 'shadow-rose-900/30',
    hexColor: '#be123c',
    description: 'Warm terracotta and rose gold tones creating cozy, welcoming salon vibes.'
  },
  11: { // Dec
    monthIndex: 11,
    monthName: 'December',
    themeName: 'Festive Emerald & Ruby',
    seasonLabel: 'Holiday Gala',
    badgeBg: 'bg-emerald-950/70',
    badgeText: 'text-emerald-300',
    badgeBorder: 'border-emerald-700/50',
    accentClass: 'bg-emerald-600',
    accentHoverClass: 'hover:bg-emerald-500',
    accentTextClass: 'text-emerald-400',
    accentBorderClass: 'border-emerald-500/30',
    accentGlowClass: 'shadow-emerald-900/30',
    hexColor: '#059669',
    description: 'Celebratory emerald green and festive ruby gold accents.'
  }
};

export function getCurrentMonthPalette(): SeasonalTheme {
  const month = new Date().getMonth();
  return seasonalPalettes[month] || seasonalPalettes[6];
}

export function hexToRgba(hex: string, opacity: number): string {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function lightenHex(hex: string, percent: number = 30): string {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;
  r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
  g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
  b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function darkenHex(hex: string, percent: number = 20): string {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;
  r = Math.max(0, Math.floor(r * (1 - percent / 100)));
  g = Math.max(0, Math.floor(g * (1 - percent / 100)));
  b = Math.max(0, Math.floor(b * (1 - percent / 100)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function applySeasonalThemeToDom(theme: SeasonalTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const hex = theme.hexColor || '#e11d48';

  const textHex = lightenHex(hex, 35);
  const hoverHex = lightenHex(hex, 15);
  const darkHex = hex;
  const darkerHex = darkenHex(hex, 25);
  const borderHex = darkenHex(hex, 15);
  const bgDarkHex = darkenHex(hex, 35);
  const bgHex = darkenHex(hex, 50);

  root.style.setProperty('--salon-accent', hex);
  root.style.setProperty('--salon-accent-text', textHex);
  root.style.setProperty('--salon-accent-hover', hoverHex);
  root.style.setProperty('--salon-accent-dark', darkHex);
  root.style.setProperty('--salon-accent-darker', darkerHex);
  root.style.setProperty('--salon-accent-border', borderHex);
  root.style.setProperty('--salon-accent-bg-dark', bgDarkHex);
  root.style.setProperty('--salon-accent-bg', bgHex);
}
