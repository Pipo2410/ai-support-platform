'use client'

import z from 'zod'
import { useForm } from 'react-hook-form'
import { useAtomValue, useSetAtom } from 'jotai'
import { useAction, useQuery } from 'convex/react'
import { ArrowLeftIcon, MenuIcon } from 'lucide-react'
import { useInfiniteScroll } from '@workspace/ui/hooks/use-infinite-scroll'
import { InfiniteScrollTrigger } from '@workspace/ui/components/infinite-scroll-trigger'
import { DicebearAvatar } from '@workspace/ui/components/dicebear-avatar'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '@workspace/backend/_generated/api'
import { WidgetHeader } from '@/modules/widget/ui/components/widget-header'
import { Button } from '@workspace/ui/components/button'
import {
  AIConversation,
  AIConversationContent,
} from '@workspace/ui/components/ai/conversation'
import {
  AIMessage,
  AIMessageContent,
} from '@workspace/ui/components/ai/message'
import { AIResponse } from '@workspace/ui/components/ai/response'
import { useThreadMessages, toUIMessages } from '@convex-dev/agent/react'
import {
  conversationIdAtom,
  contactSessionIdAtomFamily,
  organizationIdAtom,
  screenAtom,
} from '@/modules/widget/atoms/widget-atoms'
import { Form, FormField } from '@workspace/ui/components/form'
import {
  AIInput,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from '@workspace/ui/components/ai/input'

const formSchema = z.object({
  message: z.string().min(1, 'Message is required'),
})

export const WidgetChatScreen = () => {
  const setScreen = useSetAtom(screenAtom)
  const setConversationId = useSetAtom(conversationIdAtom)

  const conversationId = useAtomValue(conversationIdAtom)
  const organizationId = useAtomValue(organizationIdAtom)
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || '')
  )

  const onBack = () => {
    setConversationId(null)
    setScreen('selection')
  }

  const conversation = useQuery(
    api.public.conversations.getOne,
    conversationId && contactSessionId
      ? {
          conversationId,
          contactSessionId,
        }
      : 'skip'
  )

  const messages = useThreadMessages(
    api.public.messages.getMany,
    conversation?.threadId && contactSessionId
      ? {
          threadId: conversation.threadId,
          contactSessionId,
        }
      : 'skip',
    {
      initialNumItems: 10,
    }
  )

  const { canLoadMore, isLoadingMore, topElementRef, handleLoadMore } =
    useInfiniteScroll({
      status: messages.status,
      loadMore: messages.loadMore,
      loadSize: 10,
    })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  })

  const createMessage = useAction(api.public.messages.create)
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!conversation || !contactSessionId) {
      return
    }

    form.reset()

    await createMessage({
      threadId: conversation.threadId,
      prompt: values.message,
      contactSessionId,
    })
  }

  return (
    <>
      <WidgetHeader className='flex items-center justify-between'>
        <div className='flex items-center gap-x-2'>
          <Button size='icon' variant='ghost' onClick={onBack}>
            <ArrowLeftIcon />
          </Button>
          <p>Chat</p>
        </div>
        <Button size='icon' variant='ghost'>
          <MenuIcon />
        </Button>
      </WidgetHeader>
      <AIConversation>
        <InfiniteScrollTrigger
          canLoadMore={canLoadMore}
          isLoadingMore={isLoadingMore}
          onLoadMode={handleLoadMore}
          ref={topElementRef}
        />
        <AIConversationContent>
          {toUIMessages(messages.results ?? []).map((message) => (
            <AIMessage
              from={message.role === 'user' ? 'user' : 'assistant'}
              key={message.id}
            >
              <AIMessageContent>
                <AIResponse>{message.content}</AIResponse>
              </AIMessageContent>
              {message.role === 'assistant' && (
                <DicebearAvatar
                  imageUrl='/logo.svg'
                  seed='assistant'
                  size={32}
                />
              )}
            </AIMessage>
          ))}
        </AIConversationContent>
      </AIConversation>
      {/* TODO: Add suggestions */}
      <Form {...form}>
        <AIInput
          className='roudned-none border-x-0 border-b-0'
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            disabled={conversation?.status === 'resolved'}
            name='message'
            render={({ field }) => (
              <AIInputTextarea
                {...field}
                disabled={conversation?.status === 'resolved'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    form.handleSubmit(onSubmit)()
                  }
                }}
                placeholder={
                  conversation?.status === 'resolved'
                    ? 'This conversation has been resolved'
                    : 'Type your message...'
                }
              ></AIInputTextarea>
            )}
          />
          <AIInputToolbar>
            <AIInputTools />
            <AIInputSubmit
              disabled={
                conversation?.status === 'resolved' || !form.formState.isValid
              }
              status='ready'
              type='submit'
            />
          </AIInputToolbar>
        </AIInput>
      </Form>
    </>
  )
}
