import { renderOg } from "@/lib/og";

export const alt = "OCTOM One – Știi cui să scrii azi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOg("ro");
}
