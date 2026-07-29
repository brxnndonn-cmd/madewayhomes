import { Link } from 'react-router-dom';

const SERVICES = [
  {
    name: 'Emergency Repairs',
    description: '24/7 rapid response for burst pipes, gas leaks, sewer backups, and water heater failures. Our team arrives within 60 minutes — day or night.',
    icon: '🚨',
  },
  {
    name: 'Water Heater Installation',
    description: 'Expert installation and replacement of tank and tankless water heaters. We help you choose the right unit for your home and budget.',
    icon: '🔥',
  },
  {
    name: 'Drain Cleaning',
    description: 'Professional drain snaking, hydro-jetting, and camera inspections to clear stubborn clogs and prevent future backups.',
    icon: '🪠',
  },
  {
    name: 'Pipe Repair',
    description: 'Leak detection, pipe replacement, and repiping services. We handle copper, PEX, PVC, and galvanized steel — old homes are our specialty.',
    icon: '🔧',
  },
  {
    name: 'Bathroom Remodeling',
    description: 'Full bathroom plumbing for renovations: fixture installation, rough-in work, shower and tub upgrades, and custom vanity plumbing.',
    icon: '🚿',
  },
];

const SERVICE_AREAS = [
  { city: 'Lenoir', zip: '28645' },
  { city: 'Hudson', zip: '28638' },
  { city: 'Granite Falls', zip: '28630' },
  { city: 'Sawmills', zip: '28645' },
  { city: 'Gamewell', zip: '28645' },
];

const GALLERY_IMAGES = [
  { label: 'Water Heater Installation', color: 'from-blue-400 to-blue-600' },
  { label: 'Bathroom Remodel', color: 'from-emerald-400 to-emerald-600' },
  { label: 'Pipe Repair Job', color: 'from-amber-400 to-amber-600' },
  { label: 'Drain Cleaning', color: 'from-violet-400 to-violet-600' },
];

export default function SampleLanding() {
  return (
    <div>
      {/* ═══════════════════════════════════════════════════════
          DEMO BANNER
          ═══════════════════════════════════════════════════════ */}
      <div className="bg-brand-gold text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <span className="text-lg">✨</span>
            <span>This is a <strong>sample landing page</strong> — included with the $299 plan</span>
          </div>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold transition-colors"
          >
            View Plans
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════ */}
      <section className="hero-gradient relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-red-light/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-brand-gold/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/5" />
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            {/* Left: Text content */}
            <div className="flex-1 text-center lg:text-left">
              {/* Badge + Verified */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium px-4 py-2 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  Licensed &amp; Insured
                </div>
                <div className="inline-flex items-center gap-1.5 bg-green-500/20 backdrop-blur-sm border border-green-400/30 text-green-200 text-sm font-semibold px-4 py-2 rounded-full">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified Provider
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
                Blue Mountain
                <br />
                <span className="text-brand-gold">Plumbing</span>
              </h1>

              <p className="mt-5 text-lg sm:text-xl text-white/70 max-w-xl leading-relaxed lg:mx-0 mx-auto">
                Caldwell County's trusted plumbing experts since 2008.
                From emergency repairs to full bathroom remodels — we do it right the first time.
              </p>

              {/* Phone & CTA */}
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <a
                  href="tel:+18285550142"
                  className="btn-white text-lg !px-8 !py-4 inline-flex items-center gap-3 shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  (828) 555-0142
                </a>
                <button className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-white/40 text-white hover:bg-white/10 transition-all duration-200 active:scale-[0.98]">
                  Request Service
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>

              {/* Trust indicators */}
              <div className="mt-10 flex flex-wrap gap-6 sm:gap-10 justify-center lg:justify-start">
                <div className="stat-card text-white">
                  <div className="stat-number !text-white">16+</div>
                  <div className="stat-label !text-white/60">Years Experience</div>
                </div>
                <div className="stat-card text-white">
                  <div className="stat-number !text-white">500+</div>
                  <div className="stat-label !text-white/60">Happy Customers</div>
                </div>
                <div className="stat-card text-white">
                  <div className="stat-number !text-white">24/7</div>
                  <div className="stat-label !text-white/60">Emergency Service</div>
                </div>
              </div>
            </div>

            {/* Right: Logo placeholder */}
            <div className="flex-shrink-0">
              <div className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-3xl bg-white/10 backdrop-blur-sm border-2 border-white/20 flex flex-col items-center justify-center text-white shadow-2xl">
                <svg className="w-20 h-20 sm:w-24 sm:h-24 text-brand-gold mb-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.14 7.5A2.86 2.86 0 0116.29 10l-.53.53a.6.6 0 01-.85 0l-1.44-1.44a.6.6 0 010-.85l.53-.53a2.86 2.86 0 00-2.86-4.82L9.1 2.05a4.29 4.29 0 00.45 8.53l.31-.31a.6.6 0 01.85 0l1.44 1.44a.6.6 0 010 .85l-.31.31a4.29 4.29 0 008.53.45l.86-2.04a2.86 2.86 0 00-2.09-3.78zM4.86 16.5A2.86 2.86 0 017.71 14l.53-.53a.6.6 0 01.85 0l1.44 1.44a.6.6 0 010 .85l-.53.53a2.86 2.86 0 102.86 4.82l.86 2.04a4.29 4.29 0 01-.45-8.53l-.31.31a.6.6 0 01-.85 0L10.67 13.5a.6.6 0 010-.85l.31-.31a4.29 4.29 0 00-8.53-.45l-.86 2.04a2.86 2.86 0 002.09 3.78l.18-.71z" />
                </svg>
                <span className="text-sm text-white/50">Your Logo Here</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave / divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none" className="w-full h-8 sm:h-12">
            <path d="M0 60V0c144 20 288 30 432 25s288-15 432-10 288 25 432 15 144-20 144-20v50H0z" fill="#F5F5F5" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          ABOUT US
          ═══════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-brand-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: content */}
            <div>
              <span className="section-badge">About Us</span>
              <h2 className="section-title mb-6">
                Caldwell County's<br />
                <span className="text-brand-red">Plumbing Experts</span>
              </h2>
              <div className="space-y-4 text-brand-gray-dark leading-relaxed">
                <p>
                  Blue Mountain Plumbing has been serving Lenoir and all of Caldwell County since 2008.
                  We're a family-owned, fully licensed, and insured plumbing company dedicated to honest
                  pricing, quality workmanship, and showing up when we say we will.
                </p>
                <p>
                  Whether it's a midnight pipe burst in Hudson, a water heater replacement in Granite Falls,
                  or a full bathroom remodel in Gamewell — our team of experienced plumbers treats every home
                  like it's our own.
                </p>
                <p>
                  <strong className="text-brand-black">No overtime charges for nights or weekends.</strong>{' '}
                  We believe emergencies shouldn't bankrupt you. Same fair rates, any time of day.
                </p>
              </div>

              {/* Mini stats */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { value: '16+', label: 'Years in Business' },
                  { value: 'Fully', label: 'Licensed & Insured' },
                  { value: '60 min', label: 'Emergency Response' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm"
                  >
                    <div className="text-xl sm:text-2xl font-extrabold text-brand-red">{stat.value}</div>
                    <div className="text-xs text-brand-gray-dark mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: image placeholder */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-brand-gray-medium/30 to-brand-gray-medium/10 flex items-center justify-center border-2 border-dashed border-brand-gray-medium/50 overflow-hidden">
                <div className="text-center p-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-brand-red/10 flex items-center justify-center">
                    <svg className="w-10 h-10 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-brand-gray-dark">Your Team Photo</p>
                  <p className="text-xs text-brand-gray-medium mt-1">or work vehicle photo here</p>
                </div>
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl bg-brand-red/10 -z-10" />
              <div className="absolute -top-4 -left-4 w-16 h-16 rounded-2xl bg-brand-gold/10 -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          OUR SERVICES
          ═══════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-badge">Our Services</span>
            <h2 className="section-title mb-4">What We Do Best</h2>
            <p className="section-subtitle mx-auto">
              From emergency fixes to planned upgrades — we handle every plumbing job with care and expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {SERVICES.map((service, i) => (
              <div
                key={service.name}
                className="card-hover-lift p-6 sm:p-7 flex flex-col group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-red/10 to-brand-red/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">{service.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-brand-black mb-2 group-hover:text-brand-red transition-colors">
                  {service.name}
                </h3>
                <p className="text-sm text-brand-gray-dark leading-relaxed flex-1">
                  {service.description}
                </p>
              </div>
            ))}
          </div>

          {/* "Don't see your need?" */}
          <div className="text-center mt-8">
            <p className="text-sm text-brand-gray-dark">
              Don't see what you need?{' '}
              <span className="text-brand-red font-semibold">Call us — we probably do it.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PHOTO GALLERY
          ═══════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-brand-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-badge">Our Work</span>
            <h2 className="section-title mb-4">Photo Gallery</h2>
            <p className="section-subtitle mx-auto">
              Real jobs. Real results. Here's a look at what we do every day across Caldwell County.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
            {GALLERY_IMAGES.map((img, i) => (
              <div
                key={i}
                className="relative group cursor-pointer"
              >
                <div
                  className={`aspect-square rounded-xl bg-gradient-to-br ${img.color} flex flex-col items-center justify-center text-white shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 overflow-hidden`}
                >
                  {/* Decorative inner elements to simulate a photo */}
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute top-3 right-3 opacity-40">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
                    </svg>
                  </div>
                  <svg className="w-10 h-10 mb-3 relative z-10 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="relative z-10 text-sm font-semibold text-center px-3 leading-tight">
                    {img.label}
                  </span>
                  <span className="relative z-10 text-xs mt-1 opacity-60">Photo #{i + 1}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-brand-gray-dark mt-6">
            Upload your own project photos to showcase your best work.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SERVICE AREAS
          ═══════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-badge">Service Areas</span>
            <h2 className="section-title mb-4">Where We Work</h2>
            <p className="section-subtitle mx-auto">
              Proudly serving Lenoir and communities throughout Caldwell County, North Carolina.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Map placeholder */}
            <div className="aspect-[21/9] rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-dashed border-blue-200 flex items-center justify-center mb-8 overflow-hidden relative">
              {/* Pinned city markers */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full max-w-md">
                  {[
                    { top: '30%', left: '35%', city: 'Lenoir' },
                    { top: '20%', left: '60%', city: 'Hudson' },
                    { top: '50%', left: '25%', city: 'Granite Falls' },
                    { top: '40%', left: '50%', city: 'Sawmills' },
                    { top: '55%', left: '45%', city: 'Gamewell' },
                  ].map((marker) => (
                    <div
                      key={marker.city}
                      className="absolute"
                      style={{ top: marker.top, left: marker.left }}
                    >
                      <span className="text-xl cursor-default">📍</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center relative z-10">
                <p className="text-brand-gray-dark font-semibold">📍 Caldwell County, NC</p>
                <p className="text-sm text-brand-gray-medium mt-1">Interactive map placeholder</p>
              </div>
            </div>

            {/* City list */}
            <div className="flex flex-wrap justify-center gap-3">
              {SERVICE_AREAS.map((area) => (
                <div
                  key={area.city}
                  className="card-hover-lift px-5 py-3 flex items-center gap-2.5 cursor-default"
                >
                  <span className="text-lg">📍</span>
                  <div>
                    <span className="font-semibold text-brand-black">{area.city}</span>
                    <span className="text-brand-gray-dark text-sm ml-1.5">{area.zip}</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-brand-gray-dark mt-6">
              Don't see your town? Call us — we may still serve your area.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TESTIMONIALS
          ═══════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-brand-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-badge">Testimonials</span>
            <h2 className="section-title mb-4">What Our Customers Say</h2>
            <p className="section-subtitle mx-auto">
              Don't take our word for it — hear from homeowners across Caldwell County.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Sarah M.',
                location: 'Lenoir',
                text: 'Called at 2 AM with a burst pipe and they were here within 45 minutes. Professional, fast, and the price was completely fair. Will absolutely call again.',
                rating: 5,
              },
              {
                name: 'James T.',
                location: 'Hudson',
                text: 'Had our old water heater replaced with a tankless unit. The team explained every option, helped us pick the right one, and the install was flawless.',
                rating: 5,
              },
              {
                name: 'The Wilson Family',
                location: 'Granite Falls',
                text: 'We used Blue Mountain for our bathroom remodel and could not be happier. They handled all the plumbing rough-in and fixture installation — everything came out beautifully.',
                rating: 5,
              },
            ].map((testimonial, i) => (
              <div key={i} className="card p-6 flex flex-col">
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, s) => (
                    <svg key={s} className="w-5 h-5 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-brand-gray-dark text-sm leading-relaxed flex-1 mb-4 italic">
                  "{testimonial.text}"
                </p>
                <div className="pt-3 border-t border-gray-100">
                  <p className="font-semibold text-brand-black text-sm">{testimonial.name}</p>
                  <p className="text-xs text-brand-gray-dark">{testimonial.location}, NC</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-brand-gray-dark mt-6">
            Add your real customer reviews to build trust with new clients.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CONTACT / CTA
          ═══════════════════════════════════════════════════════ */}
      <section className="hero-dark-gradient relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-red/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-brand-gold/5 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <span className="section-badge !bg-brand-gold/20 !text-brand-gold">Get In Touch</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              Ready to get your plumbing fixed?
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Call us now for a free estimate — or fill out our request form and we'll get back to you within the hour.
            </p>

            {/* Contact cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-lg mx-auto mb-10">
              {/* Phone */}
              <a
                href="tel:+18285550142"
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-200 group text-left"
              >
                <div className="w-10 h-10 rounded-full bg-brand-red/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-brand-red-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="text-white font-bold text-lg">(828) 555-0142</div>
                <div className="text-gray-400 text-sm">Call for emergencies</div>
              </a>

              {/* Email */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 text-left">
                <div className="w-10 h-10 rounded-full bg-brand-red/20 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-brand-red-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-white font-bold text-lg">info@bluemountainplumbing.com</div>
                <div className="text-gray-400 text-sm">Estimates &amp; inquiries</div>
              </div>
            </div>

            {/* Request Service button */}
            <button className="btn-gold text-lg !px-10 !py-4 inline-flex items-center gap-3 shadow-2xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Request a Service — Free Estimate
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER SECTION
          ═══════════════════════════════════════════════════════ */}
      <footer className="bg-brand-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Footer top */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-lg bg-brand-red flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.14 7.5A2.86 2.86 0 0116.29 10l-.53.53a.6.6 0 01-.85 0l-1.44-1.44a.6.6 0 010-.85l.53-.53a2.86 2.86 0 00-2.86-4.82L9.1 2.05a4.29 4.29 0 00.45 8.53l.31-.31a.6.6 0 01.85 0l1.44 1.44a.6.6 0 010 .85l-.31.31a4.29 4.29 0 008.53.45l.86-2.04a2.86 2.86 0 00-2.09-3.78z" />
                  </svg>
                </div>
                <span className="font-bold text-white text-lg">Blue Mountain Plumbing</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Licensed, insured, and family-owned. Proudly serving Caldwell County since 2008.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Services</h4>
              <ul className="space-y-2">
                {SERVICES.map((s) => (
                  <li key={s.name}>
                    <span className="text-gray-400 text-sm hover:text-white transition-colors cursor-default">
                      {s.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Service Areas */}
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Service Areas</h4>
              <ul className="space-y-2">
                {SERVICE_AREAS.map((a) => (
                  <li key={a.city}>
                    <span className="text-gray-400 text-sm hover:text-white transition-colors cursor-default">
                      {a.city}, NC {a.zip}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="tel:+18285550142" className="hover:text-white transition-colors">
                    📞 (828) 555-0142
                  </a>
                </li>
                <li className="hover:text-white transition-colors cursor-default">
                  ✉️ info@bluemountainplumbing.com
                </li>
                <li className="hover:text-white transition-colors cursor-default">
                  📍 Lenoir, NC 28645
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Blue Mountain Plumbing. All rights reserved.</p>
            <p className="flex items-center gap-1">
              <span>Built with</span>
              <span className="text-brand-red">MadeWayHomes</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
