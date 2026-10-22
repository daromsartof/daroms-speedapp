import { useModuleConfig } from '@daroms/app'
import { useDaromsT, useTranslateKey } from '@daroms/i18n'
import { Chip, EmptyState, Header, IconButton, Input, List, Screen, XStack, YStack } from '@daroms/ui'
import { Send, SquarePen, Sparkles } from '@daroms/ui/icons'
import { useState } from 'react'

import type { ChatMessage } from './api'
import { ChatBubble } from './ChatBubble'
import type { AiChatConfig } from './config'
import { useAiChatT } from './i18n'
import { useChat } from './useChat'

const ERRORS: Record<string, 'refused' | 'limit'> = { refusal: 'refused', rateLimit: 'limit' }

export function ChatScreen() {
  const t = useAiChatT()
  const core = useDaromsT()
  const translate = useTranslateKey()
  const { suggestions } = useModuleConfig<AiChatConfig>('ai-chat')
  const { messages, send, reset, streaming, error, loading } = useChat()
  const [draft, setDraft] = useState('')
  const submit = (text = draft) => {
    setDraft('')
    void send(text)
  }
  const errorText = error ? (ERRORS[error] ? t(ERRORS[error]) : core('states.errorDescription')) : null
  return (
    <Screen
      scroll={false}
      padded={false}
      keyboard
      header={<Header title={t('title')} large right={<IconButton icon={SquarePen} label={t('newChat')} onPress={reset} />} />}
      footer={
        <XStack gap="inline" items="center">
          <YStack flex={1}>
            <Input value={draft} onChangeText={setDraft} placeholder={t('placeholder')} onSubmitEditing={() => submit()} returnKeyType="send" />
          </YStack>
          <IconButton icon={Send} label={t('send')} variant="primary" disabled={!draft.trim() || streaming} onPress={() => submit()} />
        </XStack>
      }
    >
      <List<ChatMessage>
        data={messages}
        loading={loading}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatBubble message={item} typing={streaming && item.role === 'assistant' && !item.content} />}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        maintainVisibleContentPosition={{ startRenderingFromBottom: true, autoscrollToBottomThreshold: 0.2 }}
        ListFooterComponent={errorText ? <ChatBubble message={{ id: 'error', role: 'assistant', content: errorText }} error /> : null}
        ListEmptyComponent={
          <YStack gap="stack" pt="section">
            <EmptyState icon={Sparkles} title={t('emptyTitle')} description={t('emptyDescription')} />
            <XStack gap="inline" flexWrap="wrap" justify="center">
              {suggestions.map((key) => (
                <Chip key={key} label={translate(key)} onPress={() => submit(translate(key))} />
              ))}
            </XStack>
          </YStack>
        }
      />
    </Screen>
  )
}
