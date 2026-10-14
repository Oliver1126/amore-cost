import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const imgBase64 = `data:image/png;base64,${readFileSync(join(process.cwd(), "public/brand-mark.png")).toString("base64")}`;

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          borderRadius: 7,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgBase64} width={28} height={17} alt="" />
      </div>
    ),
    { ...size }
  );
}
