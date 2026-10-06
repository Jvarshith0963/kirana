function OfferBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-500 px-6 py-10 text-white shadow-xl md:px-12">

        <div className="relative z-10 max-w-2xl">

          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-emerald-100">
            Fresh Deals Every Day
          </p>

          <h2 className="text-3xl font-extrabold leading-tight md:text-5xl">
            Groceries you love,
            <br />
            delivered to your doorstep.
          </h2>

          <p className="mt-4 max-w-xl text-emerald-50">
            Shop everyday essentials, snacks, beverages and household
            products at great prices.
          </p>

          <button
            type="button"
            className="mt-6 rounded-xl bg-white px-6 py-3 font-bold text-emerald-700 transition hover:bg-emerald-50"
          >
            Shop Now →
          </button>

        </div>

        {/* Decorative circles */}
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />

        <div className="absolute -bottom-20 right-20 h-56 w-56 rounded-full bg-white/10" />

        <div className="absolute right-10 top-10 hidden text-8xl md:block">
          🛒
        </div>

      </div>
    </section>
  );
}

export default OfferBanner;