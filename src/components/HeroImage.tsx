import { useState } from 'react';

const HERO_IMAGE_SRC = '/hero.jpg';
const HERO_IMAGE_ALT =
  'A small-scale Nigerian farmer at work in the field';

export const HeroImage = () => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex aspect-[4/3] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-earth-300 bg-earth-100 p-8 text-center">
        <svg
          viewBox="0 0 24 24"
          className="h-10 w-10 text-earth-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="8.5" cy="9.5" r="1.5" />
          <path d="M21 16l-5-5L5 20" />
        </svg>
        <p className="mt-3 font-semibold text-slate-800">Add a real photo here</p>
        <p className="mt-1 max-w-xs text-sm text-slate-600">
          Place an authentic photograph of a Nigerian farmer or market at{' '}
          <code className="rounded bg-white px-1 py-0.5 text-brand-800">
            public/hero.jpg
          </code>
          . See the README.
        </p>
      </div>
    );
  }

  return (
    <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-earth-200 shadow-lg">
      <img
        src={HERO_IMAGE_SRC}
        alt={HERO_IMAGE_ALT}
        loading="eager"
        decoding="async"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
};
