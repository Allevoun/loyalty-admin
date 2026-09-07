import type { ReactNode } from 'react'
import { Skeleton, EmptyState } from './ui/misc'

export function QueryBoundary<T>({
  query,
  notFoundTitle = 'Не найдено',
  notFoundHint,
  children,
}: {
  query: { isLoading: boolean; isError: boolean; data: T | null | undefined }
  notFoundTitle?: string
  notFoundHint?: string
  children: (data: NonNullable<T>) => ReactNode
}) {
  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }
  if (query.isError) {
    return <EmptyState title="Ошибка загрузки" hint="Попробуйте обновить страницу." />
  }
  if (query.data == null) {
    return <EmptyState title={notFoundTitle} hint={notFoundHint} />
  }
  return <>{children(query.data as NonNullable<T>)}</>
}
