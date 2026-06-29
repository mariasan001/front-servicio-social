import localFont from "next/font/local";

export const gotham = localFont({
  src: [
    {
      path: "../../public/font/Gotham Thin.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/font/Gotham Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/font/Gotham Book.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/font/Gotham Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/font/Gotham Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/font/Gotham Black.otf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../../public/font/Gotham Bold Italic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-gotham",
  display: "swap",
});
