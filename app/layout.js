import { Toaster } from "react-hot-toast";
import "./globals.css";
import { AdminAuthProvider } from "./context/AdminAuthContext";

export const metadata = {
	title: "ATLANTIS",
	description: "Exterior & Interior Designs Company",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<head>
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
			</body>
		</html>
	);
}
