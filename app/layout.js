import { Tajawal } from 'next/font/google'; // Optimized font loader
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { GoogleAnalytics } from '@next/third-parties/google';

// Configure the font once
const tajawal = Tajawal({
    subsets: ['latin', 'arabic'], // Downloads only what you need
    weight: ['400', '700'],
    variable: '--font-tajawal',   // Optional: useful for Tailwind
    display: 'swap',
});

export const metadata = {
    title: {
        default: "ATLANTIS",
        template: "%s | ATLANTIS" // Creates titles like "About | ATLANTIS" automatically
    },
    description: "Exterior & Interior Designs Company",
    verification: {
        google: "r85ymFdlzbgXaLsNprhlxr1nwzUC4wUhWqPICWEU0DI",
    },
    // Added OpenGraph for better social sharing on WhatsApp/Twitter
    openGraph: {
        title: 'ATLANTIS',
        description: 'Exterior & Interior Designs Company',
        type: 'website',
    }
};

export default function RootLayout({ children }) {
    return (
        // The lang should be 'ar' if your content is mainly Arabic, or 'en' for English
        <html lang="en">
            {/* The <head> link is removed because we use the import above */}
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