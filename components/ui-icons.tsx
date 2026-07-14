import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "archive"
  | "barChart"
  | "bolt"
  | "clone"
  | "download"
  | "edit"
  | "externalLink"
  | "fileText"
  | "filter"
  | "globe"
  | "grid"
  | "home"
  | "image"
  | "layers"
  | "link"
  | "logOut"
  | "mail"
  | "menu"
  | "palette"
  | "phone"
  | "plus"
  | "qr"
  | "scan"
  | "search"
  | "shield"
  | "sparkle"
  | "tag"
  | "trash"
  | "type"
  | "wifi";

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
};

export function Icon({ name, className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className ?? "h-4 w-4"}
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

const paths: Record<IconName, ReactNode> = {
  archive: <path d="M4 7h16M6 7v12h12V7M9 11h6M5 4h14v3H5z" />,
  barChart: <path d="M4 19V5M8 17v-6M13 17V8M18 17v-9M4 19h17" />,
  bolt: <path d="m13 2-8 12h6l-1 8 8-12h-6z" />,
  clone: <path d="M8 8h10v10H8zM6 16H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />,
  download: <path d="M12 3v11M7 10l5 5 5-5M5 20h14" />,
  edit: <path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16zM14 6l4 4" />,
  externalLink: <path d="M14 4h6v6M20 4l-9 9M19 14v5H5V5h5" />,
  fileText: <path d="M6 3h9l3 3v15H6zM14 3v4h4M9 12h6M9 16h6" />,
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  globe: <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21M12 3C9.8 5.4 8.7 8.4 8.7 12S9.8 18.6 12 21" />,
  grid: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />,
  home: <path d="M4 10.5 12 4l8 6.5V20h-5v-6H9v6H4z" />,
  image: <path d="M4 5h16v14H4zM8 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM20 16l-5-5-4 4-2-2-5 5" />,
  layers: <path d="m12 3 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5" />,
  link: <path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" />,
  logOut: <path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9" />,
  mail: <path d="M4 6h16v12H4zM4 7l8 6 8-6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  palette: <path d="M12 21a9 9 0 1 1 8.7-6.8c-.4 1.5-1.8 2.3-3.3 2.1h-1.1c-.8 0-1.3.8-.9 1.5.8 1.5-.3 3.2-2 3.2zM7.5 11h.1M9.5 7.8h.1M14.5 7.8h.1M16.7 11h.1" />,
  phone: <path d="M8 3h8v18H8zM11 18h2" />,
  plus: <path d="M12 5v14M5 12h14" />,
  qr: <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2M18 14h2M14 18h6M18 16v4M6 6h2M16 6h2M6 16h2" />,
  scan: <path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2M7 12h10" />,
  search: <path d="m20 20-4.2-4.2M18 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />,
  shield: <path d="M12 3 5 6v5c0 4.4 2.8 8.3 7 10 4.2-1.7 7-5.6 7-10V6zM9 12l2 2 4-4" />,
  sparkle: <path d="M12 3l1.8 5.1L19 10l-5.2 1.9L12 17l-1.8-5.1L5 10l5.2-1.9zM19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />,
  tag: <path d="M4 12V5h7l9 9-7 7zM8 8h.1" />,
  trash: <path d="M5 7h14M10 11v6M14 11v6M8 7l1-3h6l1 3M7 7l1 14h8l1-14" />,
  type: <path d="M4 6V4h16v2M9 20h6M12 4v16" />,
  wifi: <path d="M5 9a10 10 0 0 1 14 0M8 12a6 6 0 0 1 8 0M11 15a2 2 0 0 1 2 0M12 19h.1" />,
};
