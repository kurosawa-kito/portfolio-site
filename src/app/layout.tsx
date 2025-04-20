"use client";

import { ReactNode } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "../styles/globals.css";
import TaskHeader from "@/components/TaskHeader";
import { AuthProvider } from "@/contexts/AuthContext";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import Head from "next/head";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// MUIのデフォルトテーマ
const muiTheme = createMuiTheme({
  palette: {
    primary: {
      main: "#3182CE",
    },
  },
  typography: {
    fontFamily: "var(--font-inter), sans-serif",
  },
  zIndex: {
    modal: 2000, // デフォルトより高い値
    tooltip: 1600, // モーダルより下、通常のコンテンツより上
  },
  // @ts-ignore - MuiPickersModalは実際のプロパティではないがスタイルに適用したい
  overrides: {
    MuiDialog: {
      root: {
        zIndex: 9999,
      },
      paper: {
        zIndex: 9999,
      },
    },
    MuiPopover: {
      root: {
        zIndex: 9999,
      },
      paper: {
        zIndex: 9999,
      },
    },
  },
});

function LayoutContent({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <TaskHeader />
      <main className="flex-grow pt-[120px]">{children}</main>
      <Footer />
    </div>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" className={inter.variable}>
      <Head>
        <style>{`
          .MuiPopover-root {
            z-index: 9999 !important;
          }
          .MuiDialog-root {
            z-index: 9999 !important;
          }
          .MuiPickersPopper-root {
            z-index: 9999 !important;
          }
          .MuiPickersModal-dialogRoot {
            z-index: 9999 !important;
          }
          .MuiPaper-root {
            z-index: 9999 !important;
          }
        `}</style>
      </Head>
      <body className="min-h-screen bg-white dark:bg-gray-900">
        <ThemeProvider theme={muiTheme}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <Providers>
              <AuthProvider>
                <LayoutContent>{children}</LayoutContent>
              </AuthProvider>
            </Providers>
          </MuiPickersUtilsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
