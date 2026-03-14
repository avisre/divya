import { cn } from "../../lib/cn";

export function OmMark({
  className,
  title = "Prarthana sacred Om mark"
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("om-mark", className)}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <circle cx="16" cy="16" r="16" fill="currentColor" opacity="0.08" />
      <text
        x="16"
        y="22"
        textAnchor="middle"
        fontSize="22"
        fill="currentColor"
        fontFamily="'Noto Serif Devanagari', 'Nirmala UI', serif"
      >
        ॐ
      </text>
    </svg>
  );
}
