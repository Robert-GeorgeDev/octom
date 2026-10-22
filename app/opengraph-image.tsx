import { renderOg } from "@/lib/og";

export const alt = "OCTOM One – Know who to contact today";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOg("en");
}
