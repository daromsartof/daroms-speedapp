import { haptic } from '@daroms/lib/haptics'
import { ScrollView, SizableText, XStack, YStack } from 'tamagui'

export type TabItem<V extends string> = { value: V; label: string; count?: number }

export type TabsProps<V extends string> = { tabs: readonly TabItem<V>[]; value: V; onChange: (value: V) => void }

/**
 * @catalog Tabs
 * @props tabs [{ value, label, count }] · value · onChange (onglets soulignés, défilants)
 * @example <Tabs tabs={[{ value: 'all', label: t('tabs.all') }]} value={tab} onChange={setTab} />
 */
export function Tabs<V extends string>({ tabs, value, onChange }: TabsProps<V>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} flexGrow={0} borderBottomWidth={1} borderColor="separator">
      <XStack px="gutter" gap="section" role="tablist">
        {tabs.map((tab) => {
          const selected = tab.value === value
          return (
            <YStack
              key={tab.value}
              py="stack"
              role="tab"
              aria-selected={selected}
              borderBottomWidth={2}
              borderColor={selected ? 'brand-500' : 'transparent'}
              onPress={() => {
                haptic('selection')
                onChange(tab.value)
              }}
            >
              <SizableText size="4" fontWeight={selected ? '600' : '500'} color={selected ? 'color' : 'color-8'}>
                {tab.count === undefined ? tab.label : `${tab.label} ${tab.count}`}
              </SizableText>
            </YStack>
          )
        })}
      </XStack>
    </ScrollView>
  )
}
