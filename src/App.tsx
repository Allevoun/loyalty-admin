import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { ThemeProvider } from '@/store/theme'
import { ExportsProvider } from '@/store/exports'
import { TooltipProvider } from '@/components/ui/overlays'
import { AppLayout } from '@/components/AppLayout'
import { EmptyState } from '@/components/ui/misc'
import { SearchPage } from '@/pages/SearchPage'
import { UserLookupPage } from '@/pages/UserLookupPage'
import { UserPage } from '@/pages/UserPage'
import { OperationPage } from '@/pages/OperationPage'
import { RidPage } from '@/pages/RidPage'
import { PromosPage } from '@/pages/PromosPage'
import { PromoPage } from '@/pages/PromoPage'
import { SegmentsPage } from '@/pages/SegmentsPage'
import { SegmentPage } from '@/pages/SegmentPage'
import { BlockedPage } from '@/pages/BlockedPage'
import { ExportsPage } from '@/pages/ExportsPage'
import { BatchPage } from '@/pages/BatchPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/search" replace /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'user', element: <UserLookupPage /> },
      { path: 'users/:id', element: <UserPage /> },
      { path: 'operations/:id', element: <OperationPage /> },
      { path: 'rids/:rid', element: <RidPage /> },
      { path: 'promos', element: <PromosPage /> },
      { path: 'promos/:id', element: <PromoPage /> },
      { path: 'segments', element: <SegmentsPage /> },
      { path: 'segments/:id', element: <SegmentPage /> },
      { path: 'blocked', element: <BlockedPage /> },
      { path: 'exports', element: <ExportsPage /> },
      { path: 'batches/:id', element: <BatchPage /> },
      {
        path: '*',
        element: (
          <EmptyState title="Страница не найдена" hint="Проверьте адрес или вернитесь к поиску." />
        ),
      },
    ],
  },
])

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ExportsProvider>
          <TooltipProvider>
            <RouterProvider router={router} />
          </TooltipProvider>
        </ExportsProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
