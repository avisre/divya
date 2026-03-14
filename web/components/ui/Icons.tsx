import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

function baseProps({ title, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : "presentation"}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return baseProps({
    ...props,
    children: (
      <>
        <path d="M3.5 10.5 12 3l8.5 7.5" />
        <path d="M6.5 9.5V20h11V9.5" />
      </>
    )
  });
}

export function PrayerIcon(props: IconProps) {
  return baseProps({
    ...props,
    children: (
      <>
        <path d="M4.5 6.5h6a3 3 0 0 1 3 3V19h-6a3 3 0 0 0-3 3Z" />
        <path d="M19.5 6.5h-6a3 3 0 0 0-3 3V19h6a3 3 0 0 1 3 3Z" />
        <path d="M10.5 9h3" />
      </>
    )
  });
}

export function TempleIcon(props: IconProps) {
  return baseProps({
    ...props,
    children: (
      <>
        <path d="M4 20h16" />
        <path d="M7 20V9l5-5 5 5v11" />
        <path d="M9.5 9.5h5" />
        <path d="M12 4v-2" />
      </>
    )
  });
}

export function PujaIcon(props: IconProps) {
  return baseProps({
    ...props,
    children: (
      <>
        <path d="M12 3c1.5 2 2.2 3.6 2.2 5a2.2 2.2 0 1 1-4.4 0c0-1.4.7-3 2.2-5Z" />
        <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <path d="M8.5 14.5 7 12" />
        <path d="m15.5 14.5 1.5-2.5" />
      </>
    )
  });
}

export function SessionsIcon(props: IconProps) {
  return baseProps({
    ...props,
    children: (
      <>
        <circle cx="8" cy="8" r="2.5" />
        <circle cx="16" cy="8" r="2.5" />
        <path d="M4.5 19c.8-2.5 2.6-4 5.5-4s4.7 1.5 5.5 4" />
        <path d="M12.5 15c2.4.1 4 1.4 5 4" />
      </>
    )
  });
}

export function CalendarIcon(props: IconProps) {
  return baseProps({
    ...props,
    children: (
      <>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3.5v4" />
        <path d="M16 3.5v4" />
        <path d="M4 9.5h16" />
        <path d="M8 13h.01" />
        <path d="M12 13h.01" />
        <path d="M16 13h.01" />
        <path d="M8 17h.01" />
        <path d="M12 17h.01" />
      </>
    )
  });
}

export function LotusIcon(props: IconProps) {
  return baseProps({
    ...props,
    children: (
      <>
        <path d="M12 6c2 1.7 3 3.7 3 5.8 0 1.9-1.3 3.2-3 3.2s-3-1.3-3-3.2C9 9.7 10 7.7 12 6Z" />
        <path d="M7 9.5c1.6 1.4 2.4 3 2.4 4.7 0 1.4-1 2.3-2.4 2.3s-2.5-.9-2.5-2.3c0-1.7.9-3.3 2.5-4.7Z" />
        <path d="M17 9.5c1.6 1.4 2.5 3 2.5 4.7 0 1.4-1 2.3-2.5 2.3s-2.4-.9-2.4-2.3c0-1.7.8-3.3 2.4-4.7Z" />
        <path d="M6 19h12" />
      </>
    )
  });
}

export function ChevronLeftIcon(props: IconProps) {
  return baseProps({
    ...props,
    children: <path d="m14.5 6-5 6 5 6" />
  });
}

export function ChevronRightIcon(props: IconProps) {
  return baseProps({
    ...props,
    children: <path d="m9.5 6 5 6-5 6" />
  });
}

export function SearchIcon(props: IconProps) {
  return baseProps({
    ...props,
    children: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="m16 16 4 4" />
      </>
    )
  });
}

export function ClockIcon(props: IconProps) {
  return baseProps({
    ...props,
    children: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7.5v5l3 1.8" />
      </>
    )
  });
}
