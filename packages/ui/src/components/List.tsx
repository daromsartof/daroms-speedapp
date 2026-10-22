import { FlashList, type FlashListProps } from '@shopify/flash-list'
import { RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Separator } from 'tamagui'

import { EmptyState, type EmptyStateProps } from './EmptyState'
import { ErrorState } from './ErrorState'
import { SkeletonList } from './Skeleton'

export type ListProps<T> = Omit<FlashListProps<T>, 'refreshControl'> & {
  loading?: boolean
  error?: unknown
  onRetry?: () => void
  empty?: EmptyStateProps
  onRefresh?: () => void
  refreshing?: boolean
  separators?: boolean
  skeletonRows?: number
}

/**
 * @catalog List
 * @props data · renderItem (item mémoïsé) · keyExtractor · loading · error · onRetry · empty (ou ListEmptyComponent) · onRefresh · refreshing · separators
 * @example <List data={todos.data} loading={todos.isPending} error={todos.error} onRetry={todos.refetch} renderItem={renderTodo} />
 */
export function List<T>({ loading, error, onRetry, empty, onRefresh, refreshing = false, separators = false, skeletonRows, ListEmptyComponent, ...props }: ListProps<T>) {
  const insets = useSafeAreaInsets()
  if (loading) return <SkeletonList rows={skeletonRows} />
  if (error) return <ErrorState error={error} onRetry={onRetry} />
  return (
    <FlashList
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      ItemSeparatorComponent={separators ? () => <Separator borderColor="separator" /> : undefined}
      ListEmptyComponent={ListEmptyComponent ?? <EmptyState {...empty} />}
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined}
      keyboardShouldPersistTaps="handled"
      {...props}
    />
  )
}
