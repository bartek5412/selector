"use client";
import { Font } from "@react-pdf/renderer";
import { useEffect } from "react";

export default function FontRegistry() {
  useEffect(() => {
    Font.register({
      family: "Roboto",
      fonts: [{ src: "/fonts/Roboto/static/Roboto-Light.ttf" }],
    });
  }, []);
  return null;
}
