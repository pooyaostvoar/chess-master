import { Link } from "react-router-dom";

type LogoProps = {
  className?: string;
  iconClassName?: string;
  showText?: boolean;
  textClassName?: string;
  to?: string;
  style?: React.CSSProperties;
};

export function Logo({
  className = "",
  iconClassName = "h-8 w-auto",
  showText = true,
  textClassName = "",
  to = "/home",
  style,
}: LogoProps) {
  const content = (
    <>
      <img
        src="/logo_transparent.png"
        alt="Chess With Masters"
        className={iconClassName}
      />
      {showText && (
        <span className={textClassName}>Chess With Masters</span>
      )}
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className={`inline-flex items-center gap-2.5 no-underline ${className}`}
        style={style}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {content}
    </div>
  );
}
