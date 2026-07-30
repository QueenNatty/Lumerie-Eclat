import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Lumerie Éclat | Timeless Elegance",
  description: "Handcrafted jewelry and crochet, curated for the discerning eye.",
};

// Runs before React hydrates, so the correct theme class is on <html>
// before first paint — avoids a light-mode flash for users who chose dark.
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("le_theme");
    var theme = stored || "dark";
    if (theme === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen flex flex-col font-body bg-bg text-ink transition-colors">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
