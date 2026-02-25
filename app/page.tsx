"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";

function cleanPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return digits.startsWith("00") ? digits.slice(2) : digits;
}

export default function Home() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const link = useMemo(() => {
    const p = cleanPhone(phone);
    if (!p) return "";
    const base = `https://wa.me/${p}`;
    const msg = message.trim();
    return msg ? `${base}?text=${encodeURIComponent(msg)}` : base;
  }, [phone, message]);

  const isValid = cleanPhone(phone).length >= 8;

  useEffect(() => {
    let cancelled = false;

    async function makeQr() {
      if (!link || !isValid) {
        setQrDataUrl("");
        return;
      }

      const url = await QRCode.toDataURL(link, { margin: 1, scale: 8 });
      if (!cancelled) setQrDataUrl(url);
    }

    makeQr();
    return () => {
      cancelled = true;
    };
  }, [link, isValid]);

  async function copyLink() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold tracking-tight">
          WhatsApp Link + QR Generator
        </h1>
        <p className="mt-3 text-neutral-300">
          Create a click to chat link and a QR code you can print on flyers,
          menus, business cards, or shop windows.
        </p>

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          {/* Left card */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6">
            <label className="block text-sm text-neutral-300 mb-2">
              WhatsApp number (include country code)
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+44 7123 456789"
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 outline-none focus:border-neutral-600"
            />
            <p className="mt-2 text-xs text-neutral-400">
              We remove spaces and symbols automatically. Example: +44 7123 456789 → 447123456789
            </p>

            <label className="block text-sm text-neutral-300 mt-6 mb-2">
              Prefilled message (optional)
            </label>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I’d like to book an appointment"
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 outline-none focus:border-neutral-600"
            />

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={link || "#"}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  if (!isValid || !link) e.preventDefault();
                }}
                className={`rounded-xl px-4 py-3 font-semibold ${
                  isValid && link
                    ? "bg-white text-black"
                    : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                }`}
              >
                Test link
              </a>

              <button
                onClick={copyLink}
                disabled={!isValid || !link}
                className={`rounded-xl px-4 py-3 font-semibold border ${
                  isValid && link
                    ? "border-neutral-700 hover:bg-neutral-900"
                    : "border-neutral-800 text-neutral-500 cursor-not-allowed"
                }`}
              >
                {copied ? "Copied ✅" : "Copy link"}
              </button>
            </div>

            <div className="mt-6">
              <p className="text-sm text-neutral-300 font-semibold">Your link</p>
              <div className="mt-2 rounded-xl bg-neutral-950 border border-neutral-800 p-4">
                <p className="text-sm break-all text-neutral-200">
                  {isValid && link ? link : "Enter a valid number to generate your link."}
                </p>
              </div>
            </div>
          </div>

          {/* Right card */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6">
            <h2 className="text-lg font-semibold">QR code</h2>
            <p className="mt-2 text-sm text-neutral-400">
              People scan this and go straight into WhatsApp with your message.
            </p>

            <div className="mt-5 flex items-center justify-center rounded-2xl bg-white p-6">
              {qrDataUrl && isValid ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt="WhatsApp QR code" className="w-56 h-56" />
              ) : (
                <div className="text-neutral-700 text-sm">QR will appear here.</div>
              )}
            </div>

            {qrDataUrl && isValid && (
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={qrDataUrl}
                  download="whatsapp-qr.png"
                  className="rounded-xl px-4 py-3 font-semibold bg-white text-black"
                >
                  Download QR
                </a>
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl px-4 py-3 font-semibold border border-neutral-700 hover:bg-neutral-900"
                >
                  Open WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-10 text-xs text-neutral-500">
          This MVP runs locally and does not store your data.
        </footer>
      </div>
    </main>
  );
}