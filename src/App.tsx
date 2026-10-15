import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { RouteError } from '@/components/layout/RouteError';
import { HomePage } from '@/pages/HomePage';

const SolutionPage = lazy(() =>
  import('@/pages/SolutionPage').then((module) => ({ default: module.SolutionPage })),
);
const PrivacyPage = lazy(() =>
  import('@/pages/PrivacyPage').then((module) => ({ default: module.PrivacyPage })),
);
const ThanksPage = lazy(() =>
  import('@/pages/ThanksPage').then((module) => ({ default: module.ThanksPage })),
);
/** Dev-галерея визуалов: в прод-сборке условие ложно и чанк не создаётся. */
const VisualsGalleryPage = import.meta.env.DEV
  ? lazy(() =>
      import('@/pages/VisualsGalleryPage').then((module) => ({
        default: module.VisualsGalleryPage,
      })),
    )
  : null;
/** Dev-превью ссылки (og:image) — снимается скриптом og:generate; в прод-сборку не попадает. */
const OgCoverPage = import.meta.env.DEV
  ? lazy(() => import('@/pages/OgCoverPage').then((module) => ({ default: module.OgCoverPage })))
  : null;
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
);

/** Data-роутер: нужен для нативных View Transitions между страницами (Link/navigate с viewTransition). */
const router = createBrowserRouter(
  [
    // Превью ссылки — отдельно от общей раскладки: без шапки, футера и интро
    ...(OgCoverPage
      ? [
          {
            path: '/dev/og',
            element: (
              <Suspense fallback={null}>
                <OgCoverPage />
              </Suspense>
            ),
          },
        ]
      : []),
    {
      element: <RootLayout />,
      errorElement: <RouteError />,
      children: [
        { path: '/', element: <HomePage /> },
        { path: '/solutions/:slug', element: <SolutionPage /> },
        { path: '/privacy', element: <PrivacyPage /> },
        { path: '/thanks', element: <ThanksPage /> },
        ...(VisualsGalleryPage ? [{ path: '/dev/visuals', element: <VisualsGalleryPage /> }] : []),
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  },
);

export function App() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}
