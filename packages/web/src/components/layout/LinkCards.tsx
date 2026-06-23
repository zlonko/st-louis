const links = [
  {
    title: 'Forward Through Ferguson',
    href: 'https://forwardthroughferguson.org/report/signature-priorities/racial-equity/',
  },
  {
    title: 'St. Louis Equity Indicators',
    href: 'https://stlequity.org/',
  },
  {
    title: 'United Way of Greater St. Louis',
    href: 'https://helpingpeople.org/',
  },
] as const;

export function LinkCards() {
  return (
    <section className="px-5 lg:px-10 py-12 lg:py-20 border-t border-gray-200/70">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col justify-between items-start bg-white p-6 min-h-[200px] no-underline shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-serif text-2xl lg:text-3xl font-bold text-heading leading-snug text-left">
              {link.title}
            </h3>
            <span className="mt-8 bg-accent-orange hover:bg-accent-orange-hover text-white text-sm font-semibold px-4 py-2 rounded">
              Learn more
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
