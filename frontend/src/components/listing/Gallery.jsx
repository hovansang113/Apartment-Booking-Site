export default function Gallery({ images, title }) {
  const [cover, ...rest] = images;
  const thumbs = rest.slice(0, 4);

  return (
    <div className="relative grid grid-cols-1 gap-2 overflow-hidden rounded-xl sm:grid-cols-4 sm:grid-rows-2 sm:gap-2">
      <div className="sm:col-span-2 sm:row-span-2">
        <img
          src={cover}
          alt={title}
          className="h-64 w-full object-cover sm:h-full"
          loading="eager"
        />
      </div>
      {thumbs.map((src, i) => (
        <div key={src + i} className="hidden sm:block">
          <img
            src={src}
            alt={`${title} — ảnh ${i + 2}`}
            className="h-full max-h-[196px] w-full object-cover"
            loading="lazy"
          />
        </div>
      ))}
      <button
        type="button"
        className="absolute bottom-4 right-4 hidden rounded-lg border border-neutral-900 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-neutral-50 sm:block"
      >
        Xem tất cả ảnh
      </button>
    </div>
  );
}
