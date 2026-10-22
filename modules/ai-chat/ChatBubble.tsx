import { Body, Spinner, YStack } from '@daroms/ui'
import { memo } from 'react'

import type { ChatMessage } from './api'

/** Bulle de message : utilisateur à droite (marque), assistant à gauche (carte). */
export const ChatBubble = memo(function ChatBubble({ message, typing = false, error = false }: { message: ChatMessage; typing?: boolean; error?: boolean }) {
  const mine = message.role === 'user'
  return (
    <YStack
      self={mine ? 'flex-end' : 'flex-start'}
      maxW="85%"
      theme={mine ? 'brand' : error ? 'danger' : undefined}
      bg={mine || error ? 'background' : 'card'}
      borderWidth={mine ? 0 : 1}
      borderColor="separator"
      rounded="card"
      px="stack"
      py="inline"
    >
      {typing ? <Spinner size="small" color="color-8" /> : <Body color="color">{message.content}</Body>}
    </YStack>
  )
})
