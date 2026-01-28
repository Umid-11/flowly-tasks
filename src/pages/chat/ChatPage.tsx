import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockChatRooms, mockChatMessages, mockUsers } from '@/data/mockData';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Hash,
  Users,
  FolderKanban,
  Send,
  Plus,
  Search,
  MoreVertical,
  Paperclip,
  Smile,
} from 'lucide-react';
import { formatDistanceToNow, format, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { ChatRoom, ChatMessage } from '@/types';

export default function ChatPage() {
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(mockChatRooms[0]);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const roomMessages = mockChatMessages.filter(m => m.roomId === selectedRoom?.id);

  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'team': return Users;
      case 'project': return FolderKanban;
      default: return Hash;
    }
  };

  const handleSendMessage = () => {
    if (message.trim() && selectedRoom) {
      // In production, this would send to API
      setMessage('');
    }
  };

  const formatMessageTime = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'h:mm a');
    }
    return format(date, 'MMM d, h:mm a');
  };

  const filteredRooms = mockChatRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-lg border bg-card">
        {/* Sidebar - Room List */}
        <div className="hidden w-72 flex-col border-r md:flex">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold">Messages</h2>
            <Button variant="ghost" size="icon-sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search conversations"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Room List */}
          <ScrollArea className="flex-1">
            <div className="space-y-1 p-2">
              {filteredRooms.map(room => {
                const Icon = getRoomIcon(room.type);
                const isSelected = selectedRoom?.id === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors',
                      isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    )}
                  >
                    <div className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      isSelected ? 'bg-primary-foreground/20' : 'bg-muted'
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-medium">{room.name}</p>
                      <p className={cn(
                        'truncate text-xs',
                        isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      )}>
                        {room.participants.length} members
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        {selectedRoom ? (
          <div className="flex flex-1 flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  {(() => {
                    const Icon = getRoomIcon(selectedRoom.type);
                    return <Icon className="h-5 w-5" />;
                  })()}
                </div>
                <div>
                  <h2 className="font-semibold">{selectedRoom.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedRoom.participants.length} members
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Users className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {roomMessages.map((msg, index) => {
                  const isOwn = msg.senderId === user?.id || msg.senderId === '3';
                  const showAvatar = index === 0 || roomMessages[index - 1].senderId !== msg.senderId;

                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex gap-3',
                        isOwn ? 'flex-row-reverse' : 'flex-row'
                      )}
                    >
                      {showAvatar ? (
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={msg.sender?.avatar} />
                          <AvatarFallback>{msg.sender?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-8" />
                      )}
                      <div className={cn(
                        'flex max-w-[70%] flex-col gap-1',
                        isOwn ? 'items-end' : 'items-start'
                      )}>
                        {showAvatar && (
                          <div className={cn(
                            'flex items-center gap-2 text-xs',
                            isOwn ? 'flex-row-reverse' : 'flex-row'
                          )}>
                            <span className="font-medium">{msg.sender?.name}</span>
                            <span className="text-muted-foreground">
                              {formatMessageTime(msg.createdAt)}
                            </span>
                          </div>
                        )}
                        <div className={cn(
                          'rounded-2xl px-4 py-2',
                          isOwn
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-muted rounded-bl-sm'
                        )}>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button variant="ghost" size="icon">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button onClick={handleSendMessage} disabled={!message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Select a conversation</h2>
              <p className="text-muted-foreground">Choose a chat room from the sidebar</p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
