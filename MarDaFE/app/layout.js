import "../app/ui/globals.css";
import NextAuthProvider from "./NextAuthProvider";

export const metadata = {
  title: "ማርዳ WBMS ",
  description: "Water billing managment system",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <div className="dark:bg-boxdark-2 dark:text-bodydark">
          <NextAuthProvider>
            <main>
              <div>{children}</div>
            </main>
          </NextAuthProvider>
        </div>
      </body>
    </html>
  );
}
