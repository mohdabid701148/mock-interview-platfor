// MockMate brand mark — an "M" in a slate rounded square with a blue accent ring.
// Matches public/favicon.svg. Use `withText` to show the wordmark beside it.
const Logo = ({
  size = 36,
  withText = false,
  className = "",
  textClassName = "text-base font-bold",
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-label="MockMate logo"
        role="img"
      >
        <rect x="2" y="2" width="60" height="60" rx="15" fill="#0f172a" />
        <rect
          x="2.5"
          y="2.5"
          width="59"
          height="59"
          rx="14.5"
          fill="none"
          stroke="#3b82f6"
          strokeOpacity="0.4"
        />
        <path
          d="M16 46 V20 L32 37 L48 20 V46"
          fill="none"
          stroke="#ffffff"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {withText && <span className={textClassName}>MockMate</span>}
    </div>
  );
};

export default Logo;
