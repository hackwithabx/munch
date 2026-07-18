type MunchLogoProps = {
  compact?: boolean;
  className?: string;
};

export default function MunchLogo({ compact = false, className = "" }: MunchLogoProps) {
  return (
    <h1
      className={`logo-font font-extrabold tracking-tight ${
        compact ? "text-4xl sm:text-5xl" : "text-6xl sm:text-7xl"
      } ${className}`}
      aria-label="Munch"
    >
      <span style={{ color: "var(--munch-blue)" }}>M</span>
      <span style={{ color: "var(--munch-red)" }}>u</span>
      <span style={{ color: "var(--munch-green)" }}>n</span>
      <span style={{ color: "var(--munch-blue)" }}>c</span>
      <span style={{ color: "var(--munch-red)" }}>h</span>
    </h1>
  );
}
