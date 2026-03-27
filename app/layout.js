import { Tajawal } from 'next/font/google'; 
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { GoogleAnalytics } from '@next/third-parties/google';

// 1. Import our new telemetry script
import { sendServerTelemetry } from '@/lib/telemetry'; // Adjust the path if you put it elsewhere!

const tajawal = Tajawal({
    subsets: ['latin', 'arabic'], 
    weight: ['400', '700'],
    variable: '--font-tajawal',   
    display: 'swap',
});

export const metadata = {
    title: {
        default: "ATLANTIS",
        template: "%s | ATLANTIS" 
    },
    description: "Exterior & Interior Designs Company",
    verification: {
        google: "r85ymFdlzbgXaLsNprhlxr1nwzUC4wUhWqPICWEU0DI",
    },
    openGraph: {
        title: 'ATLANTIS',
        description: 'Exterior & Interior Designs Company',
        type: 'website',
    }
};

export default function RootLayout({ children }) {
    // 2. Fire the telemetry in the background. 
    // No 'await' here means 0 milliseconds added to the page load time.
    sendServerTelemetry();

    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://res.cloudinary.com" />
                <link rel="dns-prefetch" href="https://res.cloudinary.com" />
            </head>
            <body className={tajawal.className}>
                <AdminAuthProvider>
                    {children}
                </AdminAuthProvider>
                
                <Toaster position="bottom-right" reverseOrder={false} />
                <GoogleAnalytics gaId="G-BX1G329QJ0" />
            </body>
        </html>
    );
}