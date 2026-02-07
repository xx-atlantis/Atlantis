import { Toaster } from "react-hot-toast";
import "./globals.css";
import { AdminAuthProvider } from "./context/AdminAuthContext";
// 1. Import the Google Analytics component
import { GoogleAnalytics } from '@next/third-parties/google';

export const metadata = {
    title: "ATLANTIS",
    description: "Exterior & Interior Designs Company",
    // 2. Add Search Console Verification here
    verification: {
        google: "r85ymFdlzbgXaLsNprhlxr1nwzUC4wUhWqPICWEU0DI",
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                {/* Note: In Next.js, it is recommended to use 'next/font' instead of manual links, 
                    but this works for now. */}
                <link
                    href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <AdminAuthProvider>
                    {children}
                </AdminAuthProvider>
                
                <Toaster position="bottom-right" reverseOrder={false} />
                
                {/* 3. Add the Analytics Component with your Measurement ID */}
                <GoogleAnalytics gaId="G-BX1G329QJ0" />
            </body>
        </html>
    );
}