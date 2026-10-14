import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { App } from '@/App';
import { MotionProvider } from '@/motion/MotionProvider';
import { initI18n } from '@/i18n/i18n';
import '@/styles/globals.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}
const root = createRoot(rootElement);

// Рендерим после загрузки ресурсов стартового языка — без мигания английским
void initI18n().then((i18n) => {
  root.render(
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <MotionProvider>
          <Suspense fallback={null}>
            <App />
          </Suspense>
        </MotionProvider>
      </I18nextProvider>
    </StrictMode>,
  );
});
