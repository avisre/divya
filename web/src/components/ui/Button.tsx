import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary" | "ghost";
  block?: boolean;
};

export function Button({ tone = "primary", block = false, className = "", ...props }: ButtonProps) {
  return <button className={`btn btn-${tone} ${block ? "btn-block" : ""} ${className}`.trim()} {...props} />;
}
