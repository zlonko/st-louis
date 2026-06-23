export function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex h-[60px] items-center justify-between bg-white border-b border-gray-200 px-4 md:px-8 shadow-sm">
      {/* <span className="font-sans text-sm md:text-base font-semibold text-gray-900 truncate max-w-[50%]">
        tims.page
      </span> */}
      <a
        href="https://www.tims.page"
        className="bg-slate-200 hover:bg-slate-300 text-slate-900 text-xs md:text-sm font-semibold px-3 py-2 rounded no-underline"
      >
        Back to tims.page
      </a>
    </nav>
  );
}
