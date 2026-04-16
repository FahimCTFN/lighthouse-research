export function Footer() {
  return (
    <footer className="mt-24 border-t border-gray-200">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-8 text-sm text-gray-500 sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} CTFN Lighthouse</span>
        <span>sits.ctfnlighthouse.com</span>
      </div>
    </footer>
  );
}
