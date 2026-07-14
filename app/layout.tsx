import type { Metadata } from "next";
import { Baskervville, Geist_Mono, Work_Sans } from "next/font/google";
import { ColorSchemeScript, MantineProvider, createTheme, mantineHtmlProps } from "@mantine/core";
import "@mantine/core/styles.css";
import "./globals.css";

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

const baskerville = Baskervville({
  variable: "--font-baskerville",
  subsets: ["latin"],
  weight: "400",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const theme = createTheme({
  primaryColor: "blue",
  defaultRadius: "md",
  fontFamily: "var(--font-work-sans), Arial, Helvetica, sans-serif",
  fontFamilyMonospace: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
  headings: {
    fontFamily: "var(--font-work-sans), Arial, Helvetica, sans-serif",
    fontWeight: "700",
  },
  colors: {
    blue: ["#eef6ff", "#dcecff", "#bad8f7", "#91c0ee", "#66a5e4", "#438bd4", "#2f73bd", "#205c9c", "#164777", "#0c3154"],
  },
  components: {
    Button: {
      defaultProps: {
        fw: 700,
      },
    },
    Card: {
      defaultProps: {
        withBorder: true,
        radius: "lg",
      },
    },
    Paper: {
      defaultProps: {
        radius: "lg",
      },
    },
  },
});

export const metadata: Metadata = {
  title: "PCI QR Studio",
  description: "Dynamic QR code management for Premier Choice International.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${workSans.variable} ${baskerville.variable} ${geistMono.variable} h-full antialiased`}
      {...mantineHtmlProps}
    >
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body className="flex min-h-full flex-col">
        <MantineProvider theme={theme} defaultColorScheme="light">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
