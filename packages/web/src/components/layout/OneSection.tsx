export function OneSection() {
  return (
    <section className="flex min-h-[calc(100vh-100px)] flex-col items-center justify-center border-b border-gray-200 px-5 md:min-h-[calc(100vh-60px)] lg:px-10">
      <figure className="m-0 flex w-full flex-col items-center">
        <img
          src="/images/stl-map.png"
          alt="Map of St. Louis City and St. Louis County census tracts"
          className="block w-full max-h-[min(75vh,calc(100vh-140px))] object-contain"
        />
        <figcaption className="mt-12 text-center font-sans text-sm italic text-article-text">
          Map of St. Louis City and St. Louis County census tracts.
        </figcaption>
      </figure>
    </section>
  );
}
