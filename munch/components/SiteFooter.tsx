import Link from "next/link";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white/80">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-slate-600 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/about" className="font-medium text-slate-700 hover:text-slate-900">
            About
          </Link>
          <Link href="/how-to-use" className="font-medium text-slate-700 hover:text-slate-900">
            How to Use
          </Link>
          <Link href="/privacy" className="font-medium text-slate-700 hover:text-slate-900">
            Privacy
          </Link>
          <Link href="/terms" className="font-medium text-slate-700 hover:text-slate-900">
            Terms & Conditions
          </Link>
        </div>
        <p className="text-slate-500">© {year} Munch. All rights reserved.</p>
      </div>
    </footer>
  );
}
