import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@workspace/ui/components/resizable'

export const ConversationIdLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <ResizablePanelGroup className='h-full flex-1' direction='horizontal'>
      <ResizablePanel className='h-full' defaultSize={60}>
        {children}
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
