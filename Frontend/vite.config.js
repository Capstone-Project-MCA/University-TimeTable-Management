import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [
        react(),
        tailwindcss({
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        primary: "#256af4",
                        secondary: "#475569",
                        "background-light": "#f8fafc",
                        "background-dark": "#0f172a",
                        surface: "#ffffff",
                        "surface-dark": "#1e293b",
                    },
                    fontFamily: {
                        sans: ["Inter", "sans-serif"],
                    },
                    boxShadow: {
                        soft: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
                        hover: "0 10px 25px -5px rgba(37, 106, 244, 0.15)",
                    },
                },
            },
        }),
    ],
});
