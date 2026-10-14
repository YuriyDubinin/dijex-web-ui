import { Hero } from '@/components/sections/Hero';
import { Solutions } from '@/components/sections/Solutions';
import { Orchestrator } from '@/components/sections/Orchestrator';
import { SupportAgent } from '@/components/sections/SupportAgent';
import { DigitalProcesses } from '@/components/sections/DigitalProcesses';
import { Ecosystem } from '@/components/sections/Ecosystem';
import { Industries } from '@/components/sections/Industries';
import { About } from '@/components/sections/About';
import { Results } from '@/components/sections/Results';
import { Cases } from '@/components/sections/Cases';
import { Process } from '@/components/sections/Process';
import { Engagement } from '@/components/sections/Engagement';
import { Integrations } from '@/components/sections/Integrations';
import { Security } from '@/components/sections/Security';
import { Faq } from '@/components/sections/Faq';
import { ContactForm } from '@/components/sections/ContactForm';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

export function HomePage() {
  useDocumentMeta('home');

  return (
    <>
      <Hero />
      <Solutions />
      <Orchestrator />
      <SupportAgent />
      <DigitalProcesses />
      <Ecosystem />
      <Industries />
      <About />
      <Results />
      <Cases />
      <Process />
      <Engagement />
      <Integrations />
      <Security />
      <Faq />
      <ContactForm />
    </>
  );
}
