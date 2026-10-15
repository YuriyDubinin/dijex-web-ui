import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from './Container';
import { AnchorLink } from './AnchorLink';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { Reveal } from '@/motion/Reveal';
import { BackToTop } from './BackToTop';
import { FooterWordmark } from './FooterWordmark';
import { CONTACTS, FOOTER_COMPANY_LINKS, SOCIALS } from '@/content/nav';
import { SOLUTIONS } from '@/content/solutions';

/** Ссылки футера — с запасом по высоте (≥ 24px), чтобы в них легко попасть пальцем. */
const linkClass =
  'link-underline inline-flex min-h-6 items-center text-small text-text-secondary transition-colors hover:text-text-primary';

function FooterColumn({
  title,
  children,
  index,
}: {
  title: string;
  children: React.ReactNode;
  index: number;
}) {
  return (
    <Reveal delay={0.1 + index * 0.08}>
      <h2 className="caps-label text-text-muted">{title}</h2>
      <ul className="mt-4 space-y-2">{children}</ul>
    </Reveal>
  );
}

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-bg-base">
      <Container className="py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="font-display text-2xl font-bold tracking-tight text-text-primary">
              {t('brand')}
            </div>
            <p className="mt-4 max-w-xs text-small text-text-secondary">{t('footer.tagline')}</p>
          </div>

          <FooterColumn index={0} title={t('footer.solutionsTitle')}>
            {SOLUTIONS.map((solution) => (
              <li key={solution.key}>
                <Link viewTransition to={solution.path} className={linkClass}>
                  {t(`solutions.${solution.key}.title`)}
                </Link>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn index={1} title={t('footer.companyTitle')}>
            {FOOTER_COMPANY_LINKS.map((item) => (
              <li key={item.id}>
                <AnchorLink href={item.href} className={linkClass}>
                  {t(`nav.${item.labelKey}`)}
                </AnchorLink>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn index={2} title={t('footer.contactsTitle')}>
            {CONTACTS.map((contact) => (
              <li key={contact.href}>
                <a href={contact.href} className={linkClass}>
                  {contact.label}
                </a>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn index={3} title={t('footer.socialsTitle')}>
            {SOCIALS.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {social.label}
                </a>
              </li>
            ))}
          </FooterColumn>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 sm:flex-row sm:items-center">
          <p className="text-small text-text-muted">{t('footer.copyright', { year })}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link viewTransition to="/privacy" className={linkClass}>
              {t('footer.privacy')}
            </Link>
            <LanguageSwitcher variant="inline" />
            <BackToTop />
          </div>
        </div>
        <FooterWordmark />
      </Container>
    </footer>
  );
}
