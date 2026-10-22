import { Fragment } from 'react'
import { Separator, Switch, YStack } from 'tamagui'

import { Check, type IconComponent } from '../icons'
import { Card } from './Card'
import { ListItem } from './ListItem'
import { Caption } from './Text'

export type SettingsItem = {
  key: string
  label: string
  icon?: IconComponent
  description?: string
  /** link : chevron ; toggle : interrupteur ; action : simple appui. */
  type?: 'link' | 'toggle' | 'action'
  value?: string
  checked?: boolean
  /** Choix courant d'une liste (coche à droite). */
  selected?: boolean
  onToggle?: (checked: boolean) => void
  onPress?: () => void
  destructive?: boolean
}

export type SettingsSection = { key: string; title?: string; items: SettingsItem[] }

/**
 * @catalog SettingsList
 * @props sections[{ key, title, items[{ key, label, icon, type: link|toggle|action, value, checked, selected, onToggle, onPress, destructive }] }]
 * @example <SettingsList sections={sections} /> (utilisé par le module settings)
 */
export function SettingsList({ sections }: { sections: SettingsSection[] }) {
  return (
    <YStack gap="section">
      {sections.map((section) => (
        <YStack key={section.key} gap="tight">
          {section.title ? <Caption px="tight" weight="medium">{section.title.toUpperCase()}</Caption> : null}
          <Card padded={false} gap="0">
            {section.items.map((item, i) => (
              <Fragment key={item.key}>
                {i > 0 ? <Separator borderColor="separator" ml="section" /> : null}
                <ListItem
                  title={item.label}
                  subtitle={item.description}
                  icon={item.icon}
                  value={item.value}
                  destructive={item.destructive}
                  chevron={item.type === 'link'}
                  onPress={item.type === 'toggle' ? () => item.onToggle?.(!item.checked) : item.onPress}
                  trailing={
                    item.type === 'toggle' ? (
                      <Switch size="md" checked={Boolean(item.checked)} onCheckedChange={(checked) => item.onToggle?.(checked)} aria-label={item.label}>
                        <Switch.Thumb transition="fast" />
                      </Switch>
                    ) : item.selected ? (
                      <Check size="5" color="brand-500" />
                    ) : undefined
                  }
                />
              </Fragment>
            ))}
          </Card>
        </YStack>
      ))}
    </YStack>
  )
}
