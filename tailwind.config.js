/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                "dark-background": "#212529", // ✅ Define your custom dark background color
                "primary": "#023047", // ✅ Primary Theme Color
                "secondary": "#219ebc", // ✅ Secondary Theme Color
                "text": "#212529", // ✅ Text Color
                "text2": "#555", // ✅ Secondary Text
                "background": "#f8f9fa", // ✅ Light Background
                "background2": "#c9f2ec",
            },
        },
    },
    plugins: [],
};
