import "tailwindcss/tailwind.css"
import {Providers} from './providers';
import '@rainbow-me/rainbowkit/styles.css';
import Script from "next/script";

function RootLayout({children}: { children: React.ReactNode }) {
  return (
    <html lang="en">
    <Script async src="https://telegram.org/js/telegram-widget.js?22" data-telegram-login="NESTFiBot" data-size="large"
            data-onauth="onTelegramAuth(user)"></Script>
    <Script id={'onTelegramAuth'}>
      {
        `  function onTelegramAuth(user) {
    alert('Logged in as ' + user.first_name + ' ' + user.last_name + ' (' + user.id + (user.username ? ', @' + user.username : '') + ')');
  }`
      }
    </Script>
    <body>
    <Providers>{children}</Providers>
    </body>
    </html>
  );
}

export default RootLayout;
