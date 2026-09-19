export function BrandLogo({
  className = "",
  animated = false,
}: {
  className?: string;
  animated?: boolean;
}) {
  return (
    <span className={`py-star-brand ${animated ? "is-animated" : ""} ${className}`.trim()}>
      <img src="/brand/py-star-games.webp" alt="PY-STAR Games" />
    </span>
  );
}
