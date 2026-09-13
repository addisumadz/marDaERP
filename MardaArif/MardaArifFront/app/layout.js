import "./globals.css";

export const metadata = {
  title: "MardaArif — Central Payment Hub",
  description: "MardaArif Central Payment Hub for multi-city WBMS payment collection",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
