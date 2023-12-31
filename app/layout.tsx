import "tailwindcss/tailwind.css"
import {Providers} from './providers';
import '@rainbow-me/rainbowkit/styles.css';

function RootLayout({children}: { children: React.ReactNode }) {
  return (
    <html lang="en">
    <body className={'flex justify-center bg-[#171A1F]'}>
    <Providers>{children}</Providers>
    </body>
    </html>
  );
}

export default RootLayout;
