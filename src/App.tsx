import { lazy } from 'react';
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
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
);

/** Data-роутер: нужен для нативных View Transitions между страницами (Link/navigate с viewTransition). */
const router = createBrowserRouter(
  [
    {
      element: <RootLayout />,
      errorElement: <RouteError />,
      children: [
        { path: '/', element: <HomePage /> },
        { path: '/solutions/:slug', element: <SolutionPage /> },
        { path: '/privacy', element: <PrivacyPage /> },
        { path: '/thanks', element: <ThanksPage /> },
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
