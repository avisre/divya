import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode
} from "react";
import { cn } from "../../lib/cn";

type Tone = "primary" | "secondary" | "ghost";

type BaseProps = {
  tone?: Tone;
  block?: boolean;
  className?: string;
  leading?: ReactNode;
};

type LinkButtonProps = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: ReactNode;
  };

type NativeButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
    children: ReactNode;
  };

type ButtonProps = LinkButtonProps | NativeButtonProps;

export function Button(props: ButtonProps) {
  const { tone = "primary", block = false, className, leading, children, ...rest } = props;
  const buttonClassName = cn(
    "button",
    `button--${tone}`,
    block && "button--block",
    className
  );

  if ("href" in props && props.href) {
    const linkProps = rest as Omit<LinkButtonProps, keyof BaseProps | "children">;
    return (
      <Link {...linkProps} href={props.href} className={buttonClassName}>
        {leading ? <span className="button__leading">{leading}</span> : null}
        <span>{children}</span>
      </Link>
    );
  }

  const nativeProps = rest as Omit<NativeButtonProps, keyof BaseProps | "children">;

  return (
    <button {...nativeProps} className={buttonClassName}>
      {leading ? <span className="button__leading">{leading}</span> : null}
      <span>{children}</span>
    </button>
  );
}
