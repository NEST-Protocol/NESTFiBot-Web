import "tailwindcss/tailwind.css"
import {Providers} from './providers';
import '@rainbow-me/rainbowkit/styles.css';
import Script from "next/script";

function RootLayout({children}: { children: React.ReactNode }) {
  return (
    <html lang="en">
    <Script src={"https://telegram.org/js/telegram-web-app.js"}></Script>
    <body>
    <Providers>{children}</Providers>
    </body>
    </html>
  );
}

export default RootLayout;
