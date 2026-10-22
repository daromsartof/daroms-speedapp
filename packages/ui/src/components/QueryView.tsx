import type { ReactNode } from 'react'

import { EmptyState, type EmptyStateProps } from './EmptyState'
import { ErrorState } from './ErrorState'
import { SkeletonList } from './Skeleton'

type QueryLike<T> = { data: T | undefined; isPending: boolean; error: unknown; refetch: () => unknown }

const defaultIsEmpty = (data: unknown) => data === null || (Array.isArray(data) && data.length === 0)

export type QueryViewProps<T> = {
  query: QueryLike<T>
  children: (data: T) => ReactNode
  skeleton?: ReactNode
  empty?: EmptyStateProps
  isEmpty?: (data: T) => boolean
}

/**
 * @catalog QueryView
 * @props query (useQuery) · children(data) · skeleton · empty (EmptyState) · isEmpty. Gère les 4 états d'un écran.
 * @example <QueryView query={todos} empty={{ title: t('todos.empty') }}>{(items) => <TodoList items={items} />}</QueryView>
 */
export function QueryView<T>({ query, children, skeleton, empty, isEmpty = defaultIsEmpty }: QueryViewProps<T>) {
  if (query.isPending) return <>{skeleton ?? <SkeletonList />}</>
  if (query.error) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />
  if (query.data === undefined || isEmpty(query.data)) return <EmptyState {...empty} />
  return <>{children(query.data)}</>
}
