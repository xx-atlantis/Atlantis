import { Tajawal } from 'next/font/google'; 
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import Script from 'next/script';

// 1. Import our new telemetry script
import { sendServerTelemetry } from '@/lib/telemetry'; // Adjust the path if you put it elsewhere!

const tajawal = Tajawal({
    subsets: ['latin', 'arabic'], 
    weight: ['400', '700'],
    variable: '--font-tajawal',   
    display: 'swap',
});

export const metadata = {
    metadataBase: new URL('https://atlantis.sa'),

    title: {
        default: "Atlantis Design | Exterior & Interior Design",
        template: "%s | Atlantis Design",
    },
    description: "Premium exterior and interior design company in Saudi Arabia. Transform your space with expert designers.",
    keywords: ["interior design", "exterior design", "Saudi Arabia", "home decor", "تصميم داخلي", "ديكور", "أتلانتس"],

    openGraph: {
        title: "Atlantis Design | Exterior & Interior Design",
        description: "Premium exterior and interior design company in Saudi Arabia. Transform your space with expert designers.",
        url: "https://atlantis.sa",
        siteName: "Atlantis Design",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "Atlantis Interior & Exterior Design",
            },
        ],
        locale: "en_US",
        type: "website",
    },

    twitter: {
        card: "summary_large_image",
        title: "Atlantis Design | Exterior & Interior Design",
        description: "Premium exterior and interior design company in Saudi Arabia.",
        images: ["/og-image.jpg"],
    },

    icons: {
        icon: "/favicon.ico",
    },

    verification: {
        google: "r85ymFdlzbgXaLsNprhlxr1nwzUC4wUhWqPICWEU0DI",
    },
};

export default function RootLayout({ children }) {
    // 2. Fire the telemetry in the background. 
    // No 'await' here means 0 milliseconds added to the page load time.
    sendServerTelemetry();

    return (
        <html lang="en">
            <head>
                <link rel="dns-prefetch" href="https://res.cloudinary.com" />
            </head>
            <body className={tajawal.className}>
                <AdminAuthProvider>
                    {children}
                </AdminAuthProvider>
                
                <Toaster position="bottom-right" reverseOrder={false} />

                {/* TikTok Pixel */}
                <Script id="tiktok-pixel" strategy="afterInteractive">{`
                  !function (w, d, t) {
                    w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
                    ttq.load('D7P1RUBC77U1UDE5FLNG');
                    ttq.page();
                  }(window, document, 'ttq');
                `}</Script>

                {/* Load GA only after the page is fully idle — avoids blocking main thread */}
                <Script
                  src="https://www.googletagmanager.com/gtag/js?id=G-BX1G329QJ0"
                  strategy="lazyOnload"
                />
                <Script id="ga-init" strategy="lazyOnload">{`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'G-BX1G329QJ0');
                `}</Script>
            </body>
        </html>
    );
}