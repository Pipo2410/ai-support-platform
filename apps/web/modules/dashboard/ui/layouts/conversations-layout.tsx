import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@workspace/ui/components/resizable'
import { ConversationsPanel } from '@/modules/dashboard/ui/components/conversations-panel'
import { ContactPanel } from '@/modules/dashboard/ui/components/contact-panel'

export const ConversationsLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <ResizablePanelGroup className='h-full flex-1' direction='horizontal'>
      <ResizablePanel defaultSize={30} maxSize={30} minSize={20}>
        <ConversationsPanel />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel className='h-full' defaultSize={70}>
        <div className='flex h-full flex-1 flex-col'>{children}</div>
      </ResizablePanel>
      <ResizableHandle className='hidden lg:block' />
      <ResizablePanel
        className='hidden lg:block'
        defaultSize={40}
        maxSize={40}
        minSize={20}
      >
        <ContactPanel />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
