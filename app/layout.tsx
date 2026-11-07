import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: {
    template: "%s | Delegato",
    default: "Delegato | Student Events & MUN Platform",
  },
  description: "Official registration, allotment, and conference management platform for student events and Model United Nations.",
  icons: {
    icon: "/branding/delegato-icon.jpg",
    apple: "/branding/delegato-icon.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function shouldReload(msg) {
                  if (!msg || typeof msg !== 'string') return false;
                  var lower = msg.toLowerCase();
                  return (
                    lower.indexOf('chunkloaderror') !== -1 ||
                    lower.indexOf('loading chunk') !== -1 ||
                    lower.indexOf('failed to fetch dynamically imported module') !== -1
                  );
                }
                function triggerReload() {
                  try {
                    var k = 'delegato_chunk_reload_ts';
                    var last = sessionStorage.getItem(k);
                    var now = Date.now();
                    if (!last || now - Number(last) > 7000) {
                      sessionStorage.setItem(k, String(now));
                      window.location.reload();
                    }
                  } catch (e) {
                    window.location.reload();
                  }
                }
                window.addEventListener('error', function(e) {
                  var m = (e && (e.message || (e.error && e.error.message))) || '';
                  if (shouldReload(m)) {
                    triggerReload();
                  }
                });
                window.addEventListener('unhandledrejection', function(e) {
                  var m = (e && e.reason && (e.reason.message || String(e.reason))) || '';
                  if (shouldReload(m)) {
                    triggerReload();
                  }
                });
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#1560BD] text-white font-body selection:bg-[#FFD23F] selection:text-[#0B1B33]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
