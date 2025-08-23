'use client'

import { useAtomValue } from 'jotai'
import { WidgetAuthScreen } from '@/modules/widget/ui/screens/widget-auth-screen'
import { screenAtom } from '@/modules/widget/atoms/widget-atoms'

interface Props {
  organizationId: string
}

export const WidgetView = ({ organizationId }: Props) => {
  const screen = useAtomValue(screenAtom)
  const screenComponents = {
    error: <p>Todo: Error</p>,
    loading: <p>Todo: Loading</p>,
    auth: <WidgetAuthScreen />,
    voice: <p>Todo: Voice</p>,
    inbox: <p>Todo: Inbox</p>,
    selection: <p>Todo: Selection</p>,
    chat: <p>Todo: chat</p>,
    contact: <p>Todo: contact</p>,
  }
  return (
    <main className='min-h-screen min-w-screen flex h-full w-full flex-col overflow-hidden rounded-xl border bg-muted'>
      {screenComponents[screen]}
    </main>
  )
}
