export type HeaderTheme = {
  id: string;
  logoSrc: string;
  logoAlt: string;
  bgSrc: string;
  accentText: string;
};

export const HEADER_THEMES: HeaderTheme[] = [
  {
    id: "chrome",
    logoSrc: "/images/header-themes/logo-chrome.png",
    logoAlt: "Morphose Éditions",
    bgSrc: "/images/header-themes/bg-stars.jpg",
    accentText: "text-saffron",
  },
  {
    id: "psyche",
    logoSrc: "/images/header-themes/logo-psyche.png",
    logoAlt: "Morphose Éditions",
    bgSrc: "/images/header-themes/bg-nebula.jpg",
    accentText: "text-teal",
  },
];

export function pickRandomHeaderTheme(): HeaderTheme {
  return HEADER_THEMES[Math.floor(Math.random() * HEADER_THEMES.length)];
}
