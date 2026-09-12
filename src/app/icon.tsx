import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <svg
        width={32}
        height={32}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M11 6C7.5 6 5 9 5 12.5v7C5 23 7.5 26 11 26"
          stroke="#4f46e5"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M21 6c3.5 0 6 3 6 6.5v7c0 3.5-2.5 6.5-6 6.5"
          stroke="#10b981"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="16" cy="16" r="2.75" fill="#4f46e5" />
      </svg>
    ),
    { ...size }
  );
}
