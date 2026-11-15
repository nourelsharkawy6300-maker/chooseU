import React from "react";

export function ChooseULogoMark({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="36" height="36" rx="8" fill="#0F172A" />
      <path
        d="M23 11.5C19.5 11.5 16.5 11.5 14.5 13.5C12.5 15.5 12.5 20.5 14.5 22.5C16.5 24.5 19.5 24.5 23 24.5"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M17.5 11.5V20.5C17.5 22.7091 19.2909 24.5 21.5 24.5C23.7091 24.5 25.5 22.7091 25.5 20.5V11.5"
        stroke="#2563EB"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="25.5" cy="11.5" r="2" fill="#60A5FA" />
      <circle cx="13.2" cy="18" r="1.5" fill="#FFFFFF" />
    </svg>
  );
}
