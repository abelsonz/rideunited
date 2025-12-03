import { useState, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface Message {
  id: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
}

interface RideChatProps {
  rideId: string;
  onLoginClick?: () => void;
}

export function RideChat({ rideId, onLoginClick }: RideChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Initialize Supabase client
  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  );

  useEffect(() => {
    // Check user session
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      // Check if admin (basic check for UI, server verifies token)
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        setIsAdmin(true);
      } else if (session?.user?.email === 'zabel3211@gmail.com') {
         // Try to login automatically as admin if not already logged in
         try {
            const response = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-8e620cdb/admin/login`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${publicAnonKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ access_token: session.access_token }),
              }
            );
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('adminToken', data.token);
                setIsAdmin(true);
            }
         } catch (e) {
             console.error("Auto-admin login failed in chat", e);
         }
      }
    };
    
    checkUser();
    fetchMessages();
    
    // Set up polling every 10 seconds
    const interval = setInterval(fetchMessages, 10000);
    
    return () => clearInterval(interval);
  }, [rideId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8e620cdb/chat/${rideId}`,
        {
            headers: {
                Authorization: `Bearer ${publicAnonKey}`
            }
        }
      );
      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8e620cdb/chat/${rideId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            message: newMessage,
            userToken: session.access_token
          })
        }
      );
      
      const data = await response.json();
      if (data.success) {
        setNewMessage('');
        fetchMessages();
      } else {
          toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    const adminToken = localStorage.getItem('adminToken');
    const { data: { session } } = await supabase.auth.getSession();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };

    if (adminToken) {
        headers['X-Admin-Token'] = adminToken;
        headers['Authorization'] = `Bearer ${publicAnonKey}`;
    } else if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
    } else {
        toast.error("You must be logged in to delete messages.");
        return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8e620cdb/chat/${rideId}/${messageId}`,
        {
          method: 'DELETE',
          headers
        }
      );
      
      const data = await response.json();
      if (data.success) {
        toast.success('Message deleted');
        fetchMessages();
      } else {
        toast.error('Failed to delete: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Error deleting message');
    }
  };

  return (
    <div className="mt-8 border-t pt-6">
      <h4 className="text-[#1E293B] font-semibold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        Ride Chat
      </h4>
      
      <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto mb-4 space-y-3 border border-gray-200">
        {messages.length === 0 ? (
            <p className="text-sm text-gray-500 text-center italic py-4">No messages yet. Be the first to say hi!</p>
        ) : (
            messages.map((msg) => (
            <div key={msg.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 relative group">
                <div className="flex justify-between items-start">
                    <span className="font-medium text-sm text-[#1E293B]">{msg.userName}</span>
                    <span className="text-[10px] text-gray-400">{new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{msg.message}</p>
                {(isAdmin || (user && user.id === msg.userId)) && (
                    <button 
                        onClick={() => handleDelete(msg.id)}
                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1"
                        title="Delete message"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
            ))
        )}
      </div>
      
      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !newMessage.trim()}
            className="bg-[#10B981] text-white px-4 py-2 rounded-md hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      ) : (
        <div className="text-center py-3 text-sm text-gray-500 bg-gray-100 rounded-lg border border-gray-200">
          Please <button onClick={() => onLoginClick?.()} className="text-[#10B981] hover:underline font-medium">log in</button> to join the conversation.
        </div>
      )}
    </div>
  );
}
