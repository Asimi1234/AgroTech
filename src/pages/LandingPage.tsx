import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/layout/Logo';
import { Icon } from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/Icon';
import { buttonClass } from '@/components/ui/Button';
import { Reveal } from '@/components/motion/Reveal';
import { CountUp } from '@/components/motion/CountUp';
import { HeroImage } from '@/components/HeroImage';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useDocumentScrollProgress, useSectionFill } from '@/lib/animations';
import type { ProblemItem, StoryItem, TitledItem } from '@/i18n/languages';
import { cn } from '@/lib/cn';

const navMeta = [
  { href: '#why', key: 'nav.why' },
  { href: '#how', key: 'nav.how' },
  { href: '#features', key: 'nav.features' },
  { href: '#stories', key: 'nav.stories' },
] as const;

const statMeta = [
  { end: 12400, prefix: '', suffix: '+', key: 'stats.farmers' },
  { end: 18, prefix: '', suffix: '', key: 'stats.states' },
  { end: 23, prefix: '+', suffix: '%', key: 'stats.priceGain' },
] as const;

const problemIcons: IconName[] = ['marketplace', 'cloud', 'groups'];
const stepIcons: IconName[] = ['user', 'marketplace', 'phone', 'trend-up'];
const featureIcons: IconName[] = [
  'trend-up',
  'cloud',
  'edit',
  'groups',
  'phone',
  'verified',
];

const storyMeta = [
  { initials: 'AO', name: 'Adewale Ogun' },
  { initials: 'HB', name: 'Halima Bello' },
  { initials: 'EB', name: 'Effiong Bassey' },
] as const;

const footerNavMeta = [
  { href: '#why', key: 'footer.about' },
  { href: '#features', key: 'footer.features' },
  { href: '#stories', key: 'footer.stories' },
] as const;

const priceTicker = [
  { crop: 'Maize · Kaduna', price: '₦520/kg', up: true, change: '+2.1%' },
  { crop: 'Cassava · Oyo', price: '₦145/kg', up: true, change: '+2.4%' },
  { crop: 'Palm oil · Cross River', price: '₦2,480/L', up: false, change: '-1.1%' },
];

const SectionLabel = ({ children }: { children: string }) => (
  <p className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-700">
    {children}
  </p>
);

const ScrollProgressBar = () => {
  const barRef = useRef<HTMLDivElement>(null);
  useDocumentScrollProgress(barRef);
  return <div ref={barRef} className="scroll-progress bg-brand-600" aria-hidden="true" />;
};

const LandingHeader = () => {
  const { t } = useTranslation('landing');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b bg-earth-50/90 backdrop-blur transition-shadow duration-300',
        scrolled ? 'border-earth-200 shadow-sm' : 'border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="focus-ring rounded-lg">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {navMeta.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="focus-ring rounded text-sm font-semibold text-slate-700 transition-colors hover:text-brand-800"
            >
              {t(item.key)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageToggle className="hidden sm:inline-flex" />

          <Link
            to="/login"
            className="focus-ring hidden rounded-lg px-2 text-sm font-semibold text-brand-800 hover:underline sm:inline"
          >
            {t('header.signIn')}
          </Link>
          <Link to="/signup" className={buttonClass('accent', 'sm')}>
            {t('header.signUpFree')}
          </Link>
        </div>
      </div>
    </header>
  );
};

const Hero = () => {
  const { t } = useTranslation('landing');
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-14 md:pb-28 md:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-800">
                <span className="h-2 w-2 rounded-full bg-brand-600" />
                {t('hero.badge')}
              </span>
            </Reveal>

            <Reveal delay={100}>
              <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl">
                {t('hero.line1')}
                <br />
                {t('hero.line2')}
                <br />
                <span className="text-brand-600">{t('hero.line3')}</span>
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-5 max-w-xl text-lg text-slate-600">{t('hero.subtitle')}</p>
            </Reveal>

            <Reveal delay={300}>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/signup?role=farmer"
                  className={cn(buttonClass('accent', 'lg'), 'cta-deepen gap-2')}
                >
                  <Icon name="dashboard" className="h-5 w-5" />
                  {t('hero.ctaFarmer')}
                </Link>
                <Link
                  to="/signup?role=supplier"
                  className={cn(buttonClass('outline', 'lg'), 'cta-deepen gap-2')}
                >
                  <Icon name="marketplace" className="h-5 w-5" />
                  {t('hero.ctaSupplier')}
                </Link>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <dl className="mt-9 grid max-w-md grid-cols-3 gap-4 border-t border-earth-200 pt-6">
                {statMeta.map((stat) => (
                  <div key={stat.key}>
                    <dt className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                      <CountUp end={stat.end} prefix={stat.prefix} suffix={stat.suffix} />
                    </dt>
                    <dd className="mt-0.5 text-xs font-medium text-slate-500">{t(stat.key)}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal delay={150} className="space-y-5">
            <HeroImage />

            <div className="rounded-2xl border border-earth-200 bg-white p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-900">{t('hero.todaysPrices')}</p>
                <span className="flex items-center gap-2 text-xs font-semibold text-brand-700">
                  <span className="h-2 w-2 rounded-full bg-brand-500" />
                  {t('hero.live')}
                </span>
              </div>
              <ul className="mt-3 divide-y divide-earth-100">
                {priceTicker.map((row) => (
                  <li key={row.crop} className="flex items-center justify-between py-3">
                    <span className="font-medium text-slate-700">{row.crop}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{row.price}</span>
                      <span
                        className={cn(
                          'flex items-center gap-0.5 text-sm font-semibold',
                          row.up ? 'text-green-700' : 'text-red-700',
                        )}
                      >
                        <Icon name={row.up ? 'trend-up' : 'trend-down'} className="h-4 w-4" />
                        {row.change}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

const ProblemSolution = () => {
  const { t } = useTranslation('landing');
  const items = t('why.items', { returnObjects: true }) as unknown as ProblemItem[];
  return (
    <section id="why" className="border-y border-earth-200 bg-white py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <SectionLabel>{t('why.label')}</SectionLabel>
          <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-slate-900">
            {t('why.heading')}
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={item.problem} delay={i * 100}>
              <div className="hover-lift h-full rounded-xl border border-earth-200 p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                  <Icon name={problemIcons[i]} className="h-6 w-6" />
                </span>
                <p className="mt-4 text-sm font-bold uppercase tracking-wide text-earth-700">
                  {t('why.problemTag')}
                </p>
                <p className="text-lg font-bold text-slate-900">{item.problem}</p>
                <p className="mt-3 text-sm font-bold uppercase tracking-wide text-brand-700">
                  {t('why.solutionTag')}
                </p>
                <p className="text-slate-600">{item.solution}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const { t } = useTranslation('landing');
  const items = t('how.items', { returnObjects: true }) as unknown as TitledItem[];
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  useSectionFill(trackRef, fillRef);

  return (
    <section id="how" className="py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <SectionLabel>{t('how.label')}</SectionLabel>
          <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-slate-900">
            {t('how.heading')}
          </h2>
        </Reveal>

        <div ref={trackRef} className="relative mt-14">
          <div className="absolute inset-x-[12.5%] top-6 hidden h-0.5 bg-earth-200 lg:block">
            <div ref={fillRef} className="progress-fill h-full bg-brand-600" />
          </div>

          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((step, i) => (
              <Reveal
                key={step.title}
                delay={i * 150}
                as="li"
                className="flex flex-col items-start text-left lg:items-center lg:text-center"
              >
                <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-brand-700 text-white ring-4 ring-earth-50">
                  <Icon name={stepIcons[i]} className="h-6 w-6" />
                </span>
                <span className="mt-4 text-sm font-extrabold text-brand-600">
                  {t('how.step')} {i + 1}
                </span>
                <h3 className="mt-1 text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-600 lg:max-w-[15rem]">{step.detail}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const { t } = useTranslation('landing');
  const items = t('features.items', { returnObjects: true }) as unknown as TitledItem[];
  return (
    <section id="features" className="border-y border-earth-200 bg-white py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <SectionLabel>{t('features.label')}</SectionLabel>
          <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-slate-900">
            {t('features.heading')}
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((feature, i) => (
            <Reveal key={feature.title}>
              <div className="icon-scale-host flex h-full gap-4 rounded-xl border border-earth-200 p-6">
                <span className="icon-scale flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                  <Icon name={featureIcons[i]} className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900">{feature.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{feature.detail}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const { t } = useTranslation('landing');
  const items = t('stories.items', { returnObjects: true }) as unknown as StoryItem[];
  return (
    <section id="stories" className="py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <SectionLabel>{t('stories.label')}</SectionLabel>
          <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-slate-900">
            {t('stories.heading')}
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map((story, i) => (
            <Reveal key={storyMeta[i].name} delay={i * 100}>
              <figure className="quote-card flex h-full flex-col rounded-xl border border-earth-200 bg-white p-6">
                <blockquote className="flex-1 text-slate-700">
                  <span className="quote-underline">“{story.quote}”</span>
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-earth-200 text-sm font-bold text-earth-800">
                    {storyMeta[i].initials}
                  </span>
                  <span>
                    <span className="block font-semibold text-slate-900">
                      {storyMeta[i].name}
                    </span>
                    <span className="block text-sm text-slate-500">{story.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const ctaButtonBase =
  'focus-ring inline-flex min-h-[52px] items-center justify-center gap-2 rounded-lg px-6 text-lg font-semibold transition-colors';

const CallToAction = () => {
  const { t } = useTranslation('landing');
  return (
    <section className="bg-brand-800 py-24 md:py-28">
      <Reveal className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {t('cta.heading')}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-brand-100">{t('cta.subtitle')}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/signup?role=farmer"
            className={cn(ctaButtonBase, 'cta-deepen bg-accent-500 text-white hover:bg-accent-600')}
          >
            {t('cta.farmer')}
          </Link>
          <Link
            to="/signup?role=supplier"
            className={cn(
              ctaButtonBase,
              'cta-deepen border-2 border-white text-white hover:bg-brand-700',
            )}
          >
            {t('cta.supplier')}
          </Link>
        </div>
        <a
          href="#how"
          className="focus-ring mt-6 inline-flex items-center gap-1 rounded text-sm font-semibold text-brand-100 hover:text-white"
        >
          {t('cta.seeHow')}
          <Icon name="chevron-right" className="h-4 w-4" />
        </a>
      </Reveal>
    </section>
  );
};

const Footer = () => {
  const { t } = useTranslation('landing');
  return (
    <footer className="bg-brand-900 py-14 text-brand-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo onDark />
          <p className="mt-3 max-w-xs text-sm text-brand-200">{t('footer.tagline')}</p>
        </div>
        <nav className="flex gap-6 text-sm font-semibold" aria-label="Footer">
          {footerNavMeta.map((item) => (
            <a key={item.href} href={item.href} className="focus-ring rounded hover:text-white">
              {t(item.key)}
            </a>
          ))}
          <Link to="/login" className="focus-ring rounded hover:text-white">
            {t('footer.signIn')}
          </Link>
        </nav>
      </div>
      <div className="mx-auto mt-8 max-w-6xl border-t border-brand-800 px-4 pt-6 text-sm text-brand-300">
        {t('footer.rights')}
      </div>
    </footer>
  );
};

export const LandingPage = () => (
  <div className="min-h-screen bg-earth-50">
    <ScrollProgressBar />
    <LandingHeader />
    <main>
      <Hero />
      <ProblemSolution />
      <HowItWorks />
      <Features />
      <Testimonials />
      <CallToAction />
    </main>
    <Footer />
  </div>
);

export default LandingPage;
