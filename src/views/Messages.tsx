import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Image as ImageIcon, 
  Mic, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  User, 
  Calendar,
  MoreVertical,
  Check,
  CheckCheck,
  Search,
  Star,
  Archive,
  Flag,
  MessageSquare as MessageSquareIcon,
  MessageSquareDiff,
  Download,
  Paperclip,
  FileText,
  StopCircle,
  Play,
  Pause,
  Trash2,
  X,
  UserPlus,
  Users as GroupsIcon,
  XCircle,
  Clock
} from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth, getAuthToken } from '../api';
import { useClient } from '../context/ClientContext';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  attachment_url?: string;
  attachment_type?: 'image' | 'file' | 'audio' | 'check_in';
  attachment_name?: string;
  created_at: string;
  unreadCount?: number;
}

interface MessagesProps {
  onNavigate?: (view: string, data?: any) => void;
}

export default function Messages({ onNavigate }: MessagesProps) {
  const { user } = useAuth();
  const { clients } = useClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [latestMessages, setLatestMessages] = useState<Record<string, Message>>({});
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  
  // Multimedia states
  const [selectedFile, setSelectedFile] = useState<{file: File, type: 'image' | 'file'} | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // New Message Workspace states
  const [isComposing, setIsComposing] = useState(false);
  const [composingContent, setComposingContent] = useState('');
  const [recipientSearch, setRecipientSearch] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<any[]>([]);
  const [showRecipientResults, setShowRecipientResults] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'needs_reply'>('all');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('chatFavorites') || '[]'); } catch { return []; }
  });

  const toggleFavorite = (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    const isFav = favorites.includes(clientId);
    const updated = isFav ? favorites.filter(id => id !== clientId) : [...favorites, clientId];
    setFavorites(updated);
    localStorage.setItem('chatFavorites', JSON.stringify(updated));
  };
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  // For Manager: we might need to know which client they are talking to.
  // For Client: they always talk to their manager.
  // In this simplified version, if Manager, we pick the first client or let them select.
  // If Client, we need to find their manager.
  
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [activeRecipient, setActiveRecipient] = useState<any>(null);

  useEffect(() => {
    if (user?.role === 'MANAGER') {
      if (selectedClientId) {
        const client = clients.find(c => c.id === selectedClientId);
        if (client) {
          setActiveRecipient({
            id: client.id,
            name: client.name,
            avatar: client.avatar,
            role: 'CLIENT'
          });
        }
      } else {
        setActiveRecipient(null);
      }
    } else if (user?.role === 'CLIENT' && !activeRecipient) {
      // Clients talk to "Dr. Smith" (the manager)
      setActiveRecipient({
         id: user.manager_id || 'manager-id',
         name: 'Dr. Smith',
         avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQBDNBbswmATmE2r_-gt71uWBTuLrTIArtoJ_1v6CiveQXTQptNKbdaU5h_h-SgJwHbQZFGVB1Py0fDRW8xkKDvoXSyp70zlpmG83dZIjSXtb5K8O77LJaIESdN9x5QRK6RGatr2Tz1KoCrHph7TKWXjLNp87eTjNRBcl0dKKj3uBaW0N8c0AsMibzJV5J50zY6wsT5RTjnNypeYfZoBBeNCcHvuZDiL7BiKBln8U2X_do4wuk8OpIHTA-QANHy3Y3QtDUDgjv4MG7',
         role: 'MANAGER'
      });
    }
  }, [user, clients, selectedClientId]);

  const loadMessages = async () => {
    if (!activeRecipient) return;
    try {
      const data = await fetchWithAuth(`/messages/${activeRecipient.id}`);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const loadLatestMessages = async () => {
    if (user?.role !== 'MANAGER') return;
    try {
      const data = await fetchWithAuth('/messages/recent');
      const latestMap: Record<string, Message> = {};
      data.forEach((msg: Message) => {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        latestMap[partnerId] = msg;
      });
      setLatestMessages(latestMap);
    } catch (err) {
      console.error('Failed to load latest messages:', err);
    }
  };

  useEffect(() => {
    if (user?.role === 'MANAGER' && !selectedClientId) {
      loadLatestMessages();
      const interval = setInterval(loadLatestMessages, 10000);
      return () => clearInterval(interval);
    }
  }, [user, selectedClientId]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // Polling for simplicity
    return () => clearInterval(interval);
  }, [activeRecipient]);

  // Mark as read when entering a chat
  useEffect(() => {
    if (activeRecipient?.id && user?.role === 'MANAGER') {
      const latest = latestMessages[activeRecipient.id];
      if (latest && latest.unreadCount && latest.unreadCount > 0) {
        // 1. Mark as read on server
        fetchWithAuth(`/messages/${activeRecipient.id}/read`, { method: 'POST' })
          .then(() => {
             // 2. Tell Sidebar to refresh its total count
             window.dispatchEvent(new CustomEvent('updateUnreadCount'));
             // 3. Briefly refresh the local list to be sure
             setTimeout(loadLatestMessages, 500); 
          })
          .catch(console.error);

        // 4. Update UI immediately for snappiness
        setLatestMessages(prev => ({
          ...prev,
          [activeRecipient.id]: { ...prev[activeRecipient.id], unreadCount: 0 }
        }));
      }
    }
  }, [activeRecipient, user, latestMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    let interval: number;
    if (isRecording) {
      interval = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile({ file, type });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const uploadToStorage = async (file: File | Blob, path: string): Promise<string> => {
    const token = getAuthToken();
    console.log('Upload process started. User ID:', user?.id, 'Has Token:', !!token);
    
    if (token) {
      await supabase.auth.setSession({ access_token: token, refresh_token: '' });
    }

    const uploadPath = `${user?.id || 'anonymous'}/${Date.now()}-${path}`;
    console.log('Target upload path:', uploadPath);

    const { data, error } = await supabase.storage
      .from('messages-media')
      .upload(uploadPath, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('messages-media')
      .getPublicUrl(data.path);
      
    return publicUrl;
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!newMessage.trim() && !selectedFile && !audioBlob) || !activeRecipient || isSending) {
      console.log('Send blocked:', { newMessage, selectedFile, audioBlob, activeRecipient, isSending });
      return;
    }

    setIsSending(true);
    setErrorStatus(null);
    let attachment_url = '';
    let attachment_type: Message['attachment_type'] = undefined;
    let attachment_name = '';

    try {
      if (selectedFile) {
        setUploading(true);
        console.log('Uploading file...', selectedFile.file.name);
        attachment_url = await uploadToStorage(selectedFile.file, selectedFile.file.name);
        attachment_type = selectedFile.type;
        attachment_name = selectedFile.file.name;
        console.log('File uploaded:', attachment_url);
      } else if (audioBlob) {
        setUploading(true);
        console.log('Uploading audio...');
        attachment_url = await uploadToStorage(audioBlob, 'voice-message.webm');
        attachment_type = 'audio';
        attachment_name = 'Voice Message';
        console.log('Audio uploaded:', attachment_url);
      }

      // Small delay to ensure storage consistency and schema cache availability
      if (attachment_url) {
        console.log('Waiting 1s for consistency...');
        await new Promise(r => setTimeout(r, 1000));
      }

      console.log('Sending message payload...', { 
        receiver_id: activeRecipient.id, 
        content: newMessage, 
        attachment_url, 
        attachment_type 
      });

      const sent = await fetchWithAuth('/messages', {
        method: 'POST',
        body: JSON.stringify({
          receiver_id: activeRecipient.id,
          content: newMessage,
          attachment_url,
          attachment_type,
          attachment_name
        })
      });
      console.log('Message sent successfully:', sent);
      setMessages(prev => [...prev, sent]);
      setNewMessage('');
      setSelectedFile(null);
      setAudioBlob(null);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setErrorStatus(err.message || 'Error al enviar el mensaje');
    } finally {
      setIsSending(false);
      setUploading(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!composingContent.trim() && !selectedFile && !audioBlob) return;
    if (selectedRecipients.length === 0 || isSending) return;

    setIsSending(true);
    let attachment_url = '';
    let attachment_type: Message['attachment_type'] = undefined;
    let attachment_name = '';

    try {
      if (selectedFile) {
        setUploading(true);
        attachment_url = await uploadToStorage(selectedFile.file, selectedFile.file.name);
        attachment_type = selectedFile.type;
        attachment_name = selectedFile.file.name;
      }

      const promises = selectedRecipients.map(recipient => 
        fetchWithAuth('/messages', {
          method: 'POST',
          body: JSON.stringify({
            receiver_id: recipient.id,
            content: composingContent,
            attachment_url,
            attachment_type,
            attachment_name
          })
        })
      );

      await Promise.all(promises);
      
      // Reset state and close workspace
      setIsComposing(false);
      setComposingContent('');
      setSelectedRecipients([]);
      setSelectedFile(null);
      loadLatestMessages();
      alert(`Mensaje enviado a ${selectedRecipients.length} destinatarios.`);
    } catch (err: any) {
      console.error('Failed to send broadcast:', err);
      alert('Error al enviar mensajes masivos');
    } finally {
      setIsSending(false);
      setUploading(false);
    }
  };

  const handleClearChat = async () => {
    if (!activeRecipient) return;
    if (!window.confirm(`¿Estás seguro de que quieres vaciar la conversación con ${activeRecipient.name}?`)) return;

    try {
      await fetchWithAuth(`/messages/${activeRecipient.id}`, {
        method: 'DELETE'
      });
      setMessages([]);
      loadLatestMessages();
    } catch (err) {
      console.error('Failed to clear chat:', err);
      alert('Error al vaciar el chat');
    }
  };

  if (user?.role === 'MANAGER' && !selectedClientId && !isComposing) {
    const sortedClients = [...clients].sort((a, b) => {
      const isAFav = favorites.includes(a.id);
      const isBFav = favorites.includes(b.id);
      if (isAFav && !isBFav) return -1;
      if (!isAFav && isBFav) return 1;

      const timeA = new Date(latestMessages[a.id]?.created_at || 0).getTime();
      const timeB = new Date(latestMessages[b.id]?.created_at || 0).getTime();
      return timeB - timeA;
    });

    const unreadChatsCount = sortedClients.filter(c => {
      const latest = latestMessages[c.id];
      return latest && latest.unreadCount && latest.unreadCount > 0;
    }).length;

    const filteredClients = sortedClients.filter(client => {
      const latest = latestMessages[client.id];
      if (filterType === 'all') return true;
      if (filterType === 'unread') return latest && latest.unreadCount && latest.unreadCount > 0;
      if (filterType === 'needs_reply') return latest && latest.sender_id !== user?.id; // last message sent by client
      return true;
    });

    return (
      <div className="flex-1 h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden p-6 md:p-8 lg:p-10">
        <main className="w-full h-full bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden font-['Manrope',_sans-serif] flex flex-col">
          <div className="p-6 border-b border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Messages</h2>
                <p className="text-sm text-slate-500">Manage client communications</p>
              </div>
              <button 
                onClick={() => setIsComposing(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 font-semibold"
              >
                <MessageSquareDiff className="w-5 h-5" />
                New Message
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pt-2">
              <div className="relative w-full sm:w-96">
                <Search className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
                <input 
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-none bg-slate-50 shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-700 placeholder-slate-400 transition-all" 
                  placeholder="Search clients or messages..." 
                  type="text"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar w-full sm:w-auto">
                <button 
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-2xl text-sm font-medium transition-colors whitespace-nowrap ${
                    filterType === 'all' 
                      ? 'bg-slate-800 text-white' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Chats
                </button>
                <button 
                  onClick={() => setFilterType('unread')}
                  className={`px-4 py-2 rounded-2xl text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                    filterType === 'unread'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 ring-2 ring-emerald-100'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Unread 
                  {unreadChatsCount > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      filterType === 'unread' ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {unreadChatsCount}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => setFilterType('needs_reply')}
                  className={`px-4 py-2 rounded-2xl text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                    filterType === 'needs_reply'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200 ring-2 ring-amber-100'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${filterType === 'needs_reply' ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`}></span>
                  Needs Reply
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredClients.map((client) => {
              const latest = latestMessages[client.id];
              return (
                <div 
                  key={client.id}
                  onClick={() => {
                    setSelectedClientId(client.id);
                    setIsComposing(false);
                  }}
                  className="group p-5 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors relative"
                >
                  {(latest?.unreadCount || 0) > 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-full"></div>}
                  <div className="flex gap-4 items-start">
                    <div className="relative flex-shrink-0">
                      <div 
                        className="w-14 h-14 rounded-2xl bg-cover bg-center shadow-sm" 
                        style={{ backgroundImage: `url(${client.avatar})` }}
                      ></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-slate-900">{client.name}</h3>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-500 uppercase tracking-wide">
                            {latest ? 'Plan Review' : 'Active'}
                          </span>
                        </div>
                        {latest && (
                          <span className="text-xs font-semibold text-emerald-500 whitespace-nowrap bg-emerald-500/5 px-2 py-1 rounded-lg">
                            {new Date(latest.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-end gap-4">
                        <p className="text-sm text-slate-600 font-medium truncate pr-4 leading-relaxed">
                          {latest ? (
                            <>
                              <span className="font-bold">{latest.sender_id === user.id ? 'Tú' : client.name.split(' ')[0]}:</span> {latest.content}
                            </>
                          ) : (
                            <span className="text-slate-400 italic">No hay mensajes todavía</span>
                          )}
                        </p>
                        <div className="flex-shrink-0 flex items-center gap-3">
                          <button onClick={(e) => toggleFavorite(e, client.id)} className="focus:outline-none">
                            <Star className={`w-5 h-5 transition-colors ${favorites.includes(client.id) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 group-hover:text-emerald-500'}`} />
                          </button>
                          {(latest?.unreadCount || 0) > 0 && (
                            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-md shadow-emerald-500/30">
                              {latest.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    );
  }


  return (
    <div className="flex-1 h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden p-6 md:p-8 lg:p-10">
      <main className="w-full h-full flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {isComposing ? (
          /* New Message Workspace */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
             {/* Composition Area */}
             <div className="flex-1 flex flex-col border-r border-slate-100 overflow-hidden">
                <header className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-900">New Message</h2>
                  <button 
                    onClick={() => {
                      setIsComposing(false);
                      setSelectedRecipients([]);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                  >
                    <Plus className="w-6 h-6 rotate-45" />
                  </button>
                </header>

                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
                  <label className="text-sm font-bold text-slate-500 min-w-8">To:</label>
                  <div className="flex-1 flex flex-wrap items-center gap-2">
                    {selectedRecipients.map(r => (
                      <div key={r.id} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full pl-1 pr-2 py-0.5 shadow-sm">
                        <img src={r.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                        <span className="text-sm font-semibold text-slate-700">{r.name}</span>
                        <button 
                          onClick={() => setSelectedRecipients(prev => prev.filter(p => p.id !== r.id))}
                          className="hover:text-red-500 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <div className="relative flex-1 min-w-[150px]">
                      <input 
                        className="w-full bg-transparent border-none focus:ring-0 text-sm py-1 placeholder-slate-400 outline-none focus:outline-none ring-0 shadow-none" 
                        placeholder="Type a name..." 
                        value={recipientSearch}
                        onChange={(e) => {
                          setRecipientSearch(e.target.value);
                          setShowRecipientResults(true);
                        }}
                        onFocus={() => setShowRecipientResults(true)}
                      />
                      {showRecipientResults && recipientSearch && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                          {clients
                            .filter(c => c.name.toLowerCase().includes(recipientSearch.toLowerCase()) && !selectedRecipients.find(sr => sr.id === c.id))
                            .map(client => (
                              <button
                                key={client.id}
                                onClick={() => {
                                  setSelectedRecipients(prev => [...prev, client]);
                                  setRecipientSearch('');
                                  setShowRecipientResults(false);
                                }}
                                className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 border-b border-slate-100 last:border-0"
                              >
                                <img src={client.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                                <div className="text-left">
                                  <p className="text-sm font-bold text-slate-900">{client.name}</p>
                                  <p className="text-xs text-slate-500">{client.plan}</p>
                                </div>
                              </button>
                            ))
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col p-6 bg-white relative">
                  <textarea 
                    className="w-full h-full resize-none border-none focus:ring-0 p-0 text-lg text-slate-700 placeholder-slate-300 leading-relaxed font-['Manrope']" 
                    placeholder="Write your first message here..."
                    value={composingContent}
                    onChange={(e) => setComposingContent(e.target.value)}
                  />
                  
                  {/* Multi-send files preview */}
                  {(selectedFile || audioBlob) && (
                    <div className="mb-4 flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl w-fit">
                      <Paperclip className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold">{selectedFile?.file.name || 'Audio Recording'}</span>
                      <button onClick={() => { setSelectedFile(null); setAudioBlob(null); }} className="text-slate-400 hover:text-red-500">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <footer className="mt-4 flex justify-between items-end pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <button onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button onClick={() => imageInputRef.current?.click()} className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all">
                        <ImageIcon className="w-5 h-5" />
                      </button>
                      <button className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all">
                        <Star className="w-5 h-5" />
                      </button>
                      <div className="h-4 w-px bg-slate-200 mx-2"></div>
                      <button className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all">
                        <Calendar className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Press Enter to send</span>
                      <button 
                        onClick={handleSendBroadcast}
                        disabled={(!composingContent.trim() && !selectedFile && !audioBlob) || selectedRecipients.length === 0 || isSending}
                        className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSending ? 'Sending...' : 'Send Message'}
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </footer>
                </div>
             </div>

             {/* Sidebar: Suggested Groups & Clients */}
             <div className="hidden md:flex w-80 lg:w-96 bg-slate-50/50 flex-col h-full border-l border-slate-100 overflow-y-auto custom-scrollbar">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900">Suggested Clients</h3>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">Recently active or assigned to you</p>
                </div>
                <div className="flex-1 p-4 space-y-3">
                  {clients.slice(0, 8).map(client => (
                    <div key={client.id} className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 border border-transparent hover:border-slate-100 transition-all cursor-pointer">
                      <div className="relative">
                        <img src={client.avatar} alt="" className="w-11 h-11 rounded-full object-cover shadow-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{client.name}</h4>
                        <p className="text-xs text-slate-500 font-medium truncate">{client.plan} • Online</p>
                      </div>
                      <button 
                        onClick={() => {
                          if (!selectedRecipients.find(sr => sr.id === client.id)) {
                            setSelectedRecipients(prev => [...prev, client]);
                          }
                        }}
                        className={`p-1.5 rounded-xl border transition-all ${
                          selectedRecipients.find(sr => sr.id === client.id)
                            ? 'bg-blue-50 text-blue-500 border-blue-100'
                            : 'bg-white text-slate-400 group-hover:text-emerald-500 border-slate-200 opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <div className="pt-6 pb-2">
                    <h4 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[2px]">Quick Groups</h4>
                  </div>
                  <div className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 border border-transparent hover:border-slate-100 transition-all cursor-pointer">
                    <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                      <GroupsIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900">All Active Clients</h4>
                      <p className="text-xs text-slate-500 font-medium">{clients.length} Members</p>
                    </div>
                    <button 
                      onClick={() => setSelectedRecipients(clients)}
                      className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-400 group-hover:bg-[#17cf54]/10 group-hover:text-[#17cf54] group-hover:border-[#17cf54]/20 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 border border-transparent hover:border-slate-100 transition-all cursor-pointer">
                    <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-inner">
                      <GroupsIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900">Nutrition Plans</h4>
                      <p className="text-xs text-slate-500 font-medium">8 Members</p>
                    </div>
                    <button className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-400 group-hover:text-[#17cf54] opacity-0 group-hover:opacity-100 transition-all">
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
             </div>
          </div>
        ) : activeRecipient ? (
          /* Chat View */
          <>
            {/* Header */}
            <header className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {user?.role === 'MANAGER' && (
            <button 
              onClick={() => {
                setSelectedClientId(null);
                setIsComposing(false);
              }}
              className="p-2 mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <Plus className="w-5 h-5 rotate-45" />
            </button>
          )}
          <div className="relative">
            <img 
              alt="Avatar" 
              className="w-12 h-12 rounded-full object-cover" 
              src={activeRecipient?.avatar} 
            />
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <h2 className="font-bold text-slate-900">{activeRecipient?.name || 'Loading...'}</h2>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
           {user?.role === 'CLIENT' ? (
             <>
               <button className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center space-x-2">
                 <User className="w-4 h-4" />
                 <span>View Coach Profile</span>
               </button>
               <button className="px-4 py-2 bg-[#F0FDF4] text-[#22C55E] rounded-xl text-sm font-bold hover:bg-[#DCFCE7] transition-colors flex items-center space-x-2">
                 <Calendar className="w-4 h-4" />
                 <span>Book Check-in</span>
               </button>
             </>
           ) : (
             <button className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center space-x-2">
               <User className="w-4 h-4" />
               <span>Client Details</span>
             </button>
           )}
           <button 
             onClick={handleClearChat}
             className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
             title="Vaciar Chat"
           >
             <Trash2 className="w-5 h-5" />
           </button>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        <div className="flex justify-center">
          <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[11px] font-bold uppercase rounded-full tracking-wider">Today</span>
        </div>

        {messages.map((msg) => {
          const isOwn = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex items-start space-x-3 ${isOwn ? 'justify-end' : 'max-w-2xl'}`}>
              {!isOwn && (
                <img 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full object-cover mt-1" 
                  src={activeRecipient?.avatar} 
                />
              )}
              <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} gap-1 max-w-[85%]`}>
                <div className={`p-4 rounded-2xl shadow-sm border overflow-hidden ${
                  isOwn 
                    ? 'bg-emerald-100 text-emerald-800 rounded-tr-none border-emerald-200' 
                    : 'bg-slate-50 text-slate-700 rounded-tl-none border-slate-200'
                }`}>
                  {/* Media Content */}
                  {msg.attachment_url && (
                    <div className="mb-3 rounded-xl overflow-hidden">
                      {msg.attachment_type === 'image' && (
                        <div className="relative group">
                          <img 
                            src={msg.attachment_url} 
                            alt="Attachment" 
                            className="max-w-full max-h-[300px] object-cover cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() => window.open(msg.attachment_url, '_blank')}
                          />
                          <a 
                            href={msg.attachment_url} 
                            download 
                            className="absolute bottom-2 right-2 p-1.5 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                      {msg.attachment_type === 'file' && (
                        <a 
                          href={msg.attachment_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                            isOwn 
                              ? 'bg-white/40 border-green-200 hover:bg-white/60' 
                              : 'bg-white/50 border-slate-200 hover:bg-white/80'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${isOwn ? 'bg-green-100' : 'bg-slate-100'}`}>
                            <FileText className={`w-5 h-5 ${isOwn ? 'text-green-600' : 'text-slate-500'}`} />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className={`text-sm font-bold truncate ${isOwn ? 'text-green-800' : 'text-slate-900'}`}>{msg.attachment_name || 'Document'}</p>
                            <p className={`text-[10px] ${isOwn ? 'text-green-600/70' : 'text-slate-500'}`}>Click to view</p>
                          </div>
                          <Download className={`w-4 h-4 ${isOwn ? 'text-green-600/70' : 'text-slate-400'}`} />
                        </a>
                      )}
                      {msg.attachment_type === 'audio' && (
                        <div className={`flex items-center gap-2 p-2 rounded-xl ${isOwn ? 'bg-green-50/50' : 'bg-slate-200/50'}`}>
                          <audio controls className="h-10 w-full max-w-[240px] mix-blend-multiply opacity-80">
                            <source src={msg.attachment_url} type="audio/webm" />
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      )}
                      {msg.attachment_type === 'check_in' && (
                        <div className={`flex flex-col gap-3 p-4 rounded-xl border transition-all ${
                          isOwn 
                            ? 'bg-white/40 border-green-200 shadow-sm' 
                            : 'bg-white/50 border-slate-200 shadow-sm'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOwn ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className={`text-sm font-bold truncate ${isOwn ? 'text-emerald-900' : 'text-slate-900'}`}>Weekly Check-in Assessment</p>
                               <p className="text-[11px] text-slate-500 font-medium">Review your progress and feedback</p>
                            </div>
                          </div>
                          
                          {msg.content && (
                            <div className={`text-xs p-3 rounded-lg border italic ${isOwn ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' : 'bg-slate-100/50 border-slate-100 text-slate-600 line-clamp-2'}`}>
                               "{msg.content}"
                            </div>
                          )}

                          <button 
                            onClick={() => onNavigate?.('check-ins', { checkInId: msg.attachment_url, clientId: isOwn ? msg.receiver_id : msg.sender_id })}
                            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                              isOwn 
                                ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                            View Check-in Details
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {msg.content && msg.attachment_type !== 'check_in' && (
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                <div className={`flex items-center space-x-1 mt-1 ${isOwn ? 'pr-1' : 'pl-1'}`}>
                   <p className="text-[10px] font-medium text-slate-400">
                     {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </p>
                   {isOwn && <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
              </div>
              {isOwn && (
                <img 
                  alt="Me" 
                  className="w-8 h-8 rounded-full object-cover mt-1" 
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.email}&background=random`} 
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-2 flex space-x-2 overflow-x-auto no-scrollbar">
        <button className="whitespace-nowrap flex items-center space-x-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-xs font-semibold hover:bg-yellow-100 transition-colors">
          <span>👋 Weekly Check-in</span>
        </button>
        <button className="whitespace-nowrap flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold hover:bg-blue-100 transition-colors">
          <span>🥗 Ask About Meal</span>
        </button>
        <button className="whitespace-nowrap flex items-center space-x-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-semibold hover:bg-purple-100 transition-colors">
          <span>📋 Request Plan Change</span>
        </button>
      </div>

      {/* Multimedia Preview Area */}
      {errorStatus && (
        <div className="px-6 py-2 bg-red-50 border-t border-red-100 flex items-center justify-between">
          <p className="text-xs text-red-600 font-bold flex items-center gap-2">
            <Flag className="w-4 h-4" />
            {errorStatus}
          </p>
          <button onClick={() => setErrorStatus(null)} className="text-red-400 hover:text-red-600">
            <Plus className="w-4 h-4 rotate-45" />
          </button>
        </div>
      )}
      {(selectedFile || audioBlob || isRecording) && (
        <div className="px-6 py-2 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3">
            {selectedFile && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">
                {selectedFile.type === 'image' ? (
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                ) : (
                  <FileText className="w-4 h-4 text-blue-500" />
                )}
                <span className="text-xs font-semibold text-slate-700 truncate max-w-[150px]">{selectedFile.file.name}</span>
                <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                  <Plus className="w-3.5 h-3.5 rotate-45 text-slate-400" />
                </button>
              </div>
            )}
            {isRecording && (
              <div className="flex items-center gap-3 px-3 py-1.5 bg-red-50 border border-red-100 rounded-xl text-red-600 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="text-xs font-bold font-mono">
                  {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Recording Audio...</span>
              </div>
            )}
            {audioBlob && !isRecording && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">
                <Mic className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-semibold text-slate-700">Audio Recording</span>
                <button onClick={() => setAudioBlob(null)} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                  <Plus className="w-3.5 h-3.5 rotate-45 text-slate-400" />
                </button>
              </div>
            )}
          </div>
          {isRecording && (
            <button 
              onClick={stopRecording}
              className="px-4 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
            >
              Stop & Save
            </button>
          )}
        </div>
      )}

      {/* Input Area */}
      <footer className="p-4 pb-6 pt-2">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={(e) => handleFileSelect(e, 'file')}
        />
        <input 
          type="file" 
          ref={imageInputRef} 
          accept="image/*" 
          className="hidden" 
          onChange={(e) => handleFileSelect(e, 'image')}
        />
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3 p-2 bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
          <div className="flex items-center space-x-1 px-2 border-r border-slate-200">
            <button 
              type="button" 
              disabled={isRecording || uploading}
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/5 rounded-lg transition-all disabled:opacity-50"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button 
              type="button" 
              disabled={isRecording || uploading}
              onClick={() => imageInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/5 rounded-lg transition-all disabled:opacity-50"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button 
              type="button" 
              disabled={uploading}
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-2 rounded-lg transition-all ${isRecording ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/5'}`}
            >
              {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>
          <input 
            value={newMessage}
            disabled={isRecording || uploading}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-sm py-2 text-slate-700 placeholder-slate-400 disabled:opacity-50" 
            placeholder={isRecording ? 'Recording audio...' : `Type your message...`}
            type="text"
          />
          <button 
            type="submit"
            disabled={(!newMessage.trim() && !selectedFile && !audioBlob) || isSending || isRecording || uploading}
            className="bg-emerald-500 text-white p-2.5 rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {uploading ? (
               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
               <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            )}
          </button>
        </form>
      </footer>
          </>
        ) : null}
      </main>
    </div>
  );
}
