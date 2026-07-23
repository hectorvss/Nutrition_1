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
  Clock,
  CreditCard
} from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth, getAuthToken } from '../api';
import { unwrapList } from '../api/unwrap';
import { useClient } from '../context/ClientContext';
import { useLanguage } from '../context/LanguageContext';
import CoachProfileModal from './client/CoachProfileModal';
import { Skeleton, SkeletonCircle } from '../components/ui/Skeleton';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  attachment_url?: string;
  attachment_type?: 'image' | 'file' | 'audio' | 'check_in' | 'payment';
  attachment_name?: string;
  payload?: any;
  created_at: string;
  unreadCount?: number;
}

interface MessagesProps {
  onNavigate?: (view: string, data?: any) => void;
  initialClientId?: string;
}

export default function Messages({ onNavigate, initialClientId }: MessagesProps) {
  const { user } = useAuth();
  const { clients, isLoading: clientsLoading } = useClient();
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  // Primera carga del hilo abierto. Sólo se pone a true al cambiar de chat y a
  // false cuando llega la primera página; el polling (cada 5s) nunca lo re-activa,
  // así los skeletons no parpadean en cada refresco.
  const [threadLoading, setThreadLoading] = useState(false);
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
  const [chatSearch, setChatSearch] = useState('');
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
  const messageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  // For Manager: we might need to know which client they are talking to.
  // For Client: they always talk to their manager.
  // In this simplified version, if Manager, we pick the first client or let them select.
  // If Client, we need to find their manager.
  
  const [selectedClientId, setSelectedClientId] = useState<string | null>(initialClientId || null);
  const [activeRecipient, setActiveRecipient] = useState<any>(null);
  // Toggles the "Ver perfil del coach" modal shown to clients.
  const [coachProfileOpen, setCoachProfileOpen] = useState(false);
  const locale = language === 'es' ? 'es-ES' : 'en-US';

  // When opened from another screen (e.g. the "Message" button on a client
  // profile), preselect that client's conversation.
  useEffect(() => {
    if (initialClientId) setSelectedClientId(initialClientId);
  }, [initialClientId]);

  // Focus the message input when a conversation becomes active (e.g. opened
  // from the "Enviar mensaje" button on a client/progress card, or when a
  // MANAGER selects a chat). Skipped while composing a broadcast.
  useEffect(() => {
    if (activeRecipient && !isComposing) {
      // Defer to next tick so the input is mounted before focusing.
      const id = window.setTimeout(() => messageInputRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
  }, [activeRecipient, isComposing]);

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
    } else if (user?.role === 'CLIENT' && !activeRecipient && user.manager_id) {
      // Clients talk to their assigned manager.
      setActiveRecipient({
         id: user.manager_id,
         name: t('your_coach'),
         avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQBDNBbswmATmE2r_-gt71uWBTuLrTIArtoJ_1v6CiveQXTQptNKbdaU5h_h-SgJwHbQZFGVB1Py0fDRW8xkKDvoXSyp70zlpmG83dZIjSXtb5K8O77LJaIESdN9x5QRK6RGatr2Tz1KoCrHph7TKWXjLNp87eTjNRBcl0dKKj3uBaW0N8c0AsMibzJV5J50zY6wsT5RTjnNypeYfZoBBeNCcHvuZDiL7BiKBln8U2X_do4wuk8OpIHTA-QANHy3Y3QtDUDgjv4MG7',
         role: 'MANAGER'
      });
    }
  }, [user, clients, selectedClientId, t]);

  // Cursor para "cargar mensajes anteriores" (paginacion hacia atras).
  // Los mensajes NUEVOS llegan por polling/envio y se anaden al final.
  // Los VIEJOS se cargan bajo demanda con olderCursor y se prependen.
  const [olderCursor, setOlderCursor] = useState<string | null>(null);
  const [hasOlder, setHasOlder] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);

  // Flag: el usuario ha cargado al menos una pagina hacia atras manualmente.
  // Mientras sea false, `loadMessages()` (polling/envio) puede sobreescribir
  // libremente. En cuanto sea true, debe MERGEAR para no perder lo cargado.
  const userLoadedOlderRef = useRef(false);

  const loadMessages = async () => {
    if (!activeRecipient) return;
    try {
      // Sin cursor = primera pagina (los mas recientes). Backend devuelve
      // DESC; invertimos a orden cronologico para mostrar.
      const resp = await fetchWithAuth(`/messages/${activeRecipient.id}?limit=50`);
      const arr = Array.isArray(resp) ? resp : (resp?.data || []);
      const recent = [...arr].reverse();

      if (!userLoadedOlderRef.current) {
        // Caso normal (primera carga o polling sin paginas hacia atras):
        // sobreescritura completa con la pagina mas reciente.
        setMessages(recent);
        setOlderCursor(resp?.nextCursor || null);
        setHasOlder(Boolean(resp?.hasMore));
      } else {
        // El usuario ha cargado paginas anteriores: NO podemos sobreescribir
        // (perderiamos esos mensajes viejos). Mergeamos por id:
        // - Mantenemos los mensajes del state que NO esten en `recent`
        //   (son los viejos cargados por loadOlder).
        // - Reemplazamos el bloque comun con la version fresca (para reflejar
        //   cambios: is_read, deletes, mensajes recien enviados, etc.).
        const recentIds = new Set(recent.map((m: any) => m.id));
        setMessages((prev) => {
          const olderTail = prev.filter((m: any) => !recentIds.has(m.id));
          // Como prev esta ordenado viejo->nuevo, los mensajes NO contenidos
          // en `recent` que vengan ANTES (created_at menor) son los viejos
          // de loadOlder; los que vengan DESPUES son inconsistencias (no
          // deberian existir). Filtramos por timestamp para ser seguros.
          const firstRecentTs = (recent[0] as any)?.created_at;
          const validTail = firstRecentTs
            ? olderTail.filter((m: any) => m.created_at < firstRecentTs)
            : olderTail;
          return [...validTail, ...recent];
        });
        // NO tocamos olderCursor ni hasOlder aqui: los maneja loadOlder.
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      // Primera página resuelta (con éxito o error): quita el skeleton.
      setThreadLoading(false);
    }
  };

  const loadOlderMessages = async () => {
    if (!olderCursor || !activeRecipient || isLoadingOlder) return;
    setIsLoadingOlder(true);
    try {
      const resp = await fetchWithAuth(
        `/messages/${activeRecipient.id}?limit=50&cursor=${encodeURIComponent(olderCursor)}`
      );
      const arr = (resp?.data || []).reverse();
      // Marca que el usuario ya cargo paginas hacia atras — a partir de
      // ahora, el polling debe mergear en lugar de sobreescribir.
      userLoadedOlderRef.current = true;
      // Dedupe por id por si algun mensaje aparece en ambos rangos.
      setMessages(prev => {
        const prevIds = new Set(prev.map((m: any) => m.id));
        const nuevosViejos = arr.filter((m: any) => !prevIds.has(m.id));
        return [...nuevosViejos, ...prev];
      });
      setOlderCursor(resp?.nextCursor || null);
      setHasOlder(Boolean(resp?.hasMore));
    } catch (err) {
      console.error('Failed to load older messages:', err);
    } finally {
      setIsLoadingOlder(false);
    }
  };

  const loadLatestMessages = async () => {
    if (user?.role !== 'MANAGER') return;
    try {
      const data = unwrapList(await fetchWithAuth('/messages/recent?limit=100'));
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
      // Pausa polling cuando la pestana esta oculta: el navegador permite
      // setInterval en background pero gastamos red/CPU sin que el usuario lo vea.
      const tick = () => { if (!document.hidden) loadLatestMessages(); };
      const interval = setInterval(tick, 10000);
      const onVisible = () => { if (!document.hidden) loadLatestMessages(); };
      document.addEventListener('visibilitychange', onVisible);
      return () => {
        clearInterval(interval);
        document.removeEventListener('visibilitychange', onVisible);
      };
    }
  }, [user, selectedClientId]);

  // Keep a stable ref to loadMessages so the polling interval never has a stale closure.
  const loadMessagesRef = useRef(loadMessages);
  useEffect(() => { loadMessagesRef.current = loadMessages; });

  useEffect(() => {
    // Cambio de chat: reset del cursor + flag de "user has loaded older".
    setOlderCursor(null);
    setHasOlder(false);
    userLoadedOlderRef.current = false;
    // Muestra skeleton del hilo mientras llega la primera página del nuevo chat.
    if (activeRecipient) { setMessages([]); setThreadLoading(true); }
    loadMessagesRef.current();
    // Polling agresivo (5s) solo cuando la pestana esta activa.
    // Usamos la ref para que el tick siempre llame a la version mas reciente
    // de loadMessages (evita stale closure cuando cambia activeRecipient).
    const tick = () => { if (!document.hidden) loadMessagesRef.current(); };
    const interval = setInterval(tick, 5000);
    const onVisible = () => { if (!document.hidden) loadMessagesRef.current(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [activeRecipient]);

  // Mark as read when entering a chat — applies to both MANAGER and CLIENT
  useEffect(() => {
    if (!activeRecipient?.id) return;

    if (user?.role === 'MANAGER') {
      const latest = latestMessages[activeRecipient.id];
      if (latest && latest.unreadCount && latest.unreadCount > 0) {
        fetchWithAuth(`/messages/${activeRecipient.id}/read`, { method: 'POST' })
          .then(() => {
            window.dispatchEvent(new CustomEvent('updateUnreadCount'));
            setTimeout(loadLatestMessages, 500);
          })
          .catch(console.error);

        setLatestMessages(prev => ({
          ...prev,
          [activeRecipient.id]: { ...prev[activeRecipient.id], unreadCount: 0 }
        }));
      }
    } else if (user?.role === 'CLIENT') {
      // Clients mark their manager's messages as read on entering the chat
      fetchWithAuth(`/messages/${activeRecipient.id}/read`, { method: 'POST' })
        .then(() => window.dispatchEvent(new CustomEvent('updateUnreadCount')))
        .catch(console.error);
    }
  }, [activeRecipient, user]);

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

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile({ file, type });
    }
    // Reset so selecting the same file again still fires onChange.
    e.target.value = '';
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
    // Do NOT call setSession here — passing an empty refresh_token invalidates the
    // Supabase session, causing a silent logout seconds after the upload.
    // The storage bucket is configured with a permissive policy for authenticated users,
    // so the Supabase client's own persisted session (auto-refreshed) is sufficient.
    const uploadPath = `${user?.id || 'anonymous'}/${Date.now()}-${path}`;

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
        attachment_url = await uploadToStorage(selectedFile.file, selectedFile.file.name);
        attachment_type = selectedFile.type;
        attachment_name = selectedFile.file.name;
      } else if (audioBlob) {
        const ALLOWED_AUDIO_TYPES = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav'];
        if (!ALLOWED_AUDIO_TYPES.includes(audioBlob.type)) {
          console.error('Invalid audio MIME type:', audioBlob.type);
          setErrorStatus(t('send_message_error'));
          setIsSending(false);
          setUploading(false);
          return;
        }
        setUploading(true);
        attachment_url = await uploadToStorage(audioBlob, 'voice-message.webm');
        attachment_type = 'audio';
        attachment_name = t('voice_message');
      }

      // Small delay to ensure storage consistency and schema cache availability
      if (attachment_url) {
        await new Promise(r => setTimeout(r, 1000));
      }

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
      setMessages(prev => [...prev, sent]);
      setNewMessage('');
      setSelectedFile(null);
      setAudioBlob(null);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setErrorStatus(err.message || t('send_message_error'));
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
      alert(t('broadcast_sent', { count: selectedRecipients.length }));
    } catch (err: any) {
      console.error('Failed to send broadcast:', err);
      alert(t('bulk_send_error'));
    } finally {
      setIsSending(false);
      setUploading(false);
    }
  };

  // Quick-action buttons prefill the message input with a ready-to-edit template.
  const insertQuickMessage = (template: string) => {
    setNewMessage(prev => (prev.trim() ? `${prev.trim()} ${template}` : template));
  };

  const handleClearChat = async () => {
    if (!activeRecipient) return;
    if (!window.confirm(t('confirm_clear_chat', { name: activeRecipient.name }))) return;

    try {
      await fetchWithAuth(`/messages/${activeRecipient.id}`, {
        method: 'DELETE'
      });
      setMessages([]);
      loadLatestMessages();
    } catch (err) {
      console.error('Failed to clear chat:', err);
      alert(t('clear_chat_error'));
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
      // Text search by client name
      if (chatSearch.trim() && !client.name.toLowerCase().includes(chatSearch.trim().toLowerCase())) {
        return false;
      }
      if (filterType === 'all') return true;
      if (filterType === 'unread') return latest && latest.unreadCount && latest.unreadCount > 0;
      if (filterType === 'needs_reply') return latest && latest.sender_id !== user?.id; // last message sent by client
      return true;
    });

    return (
      <div className="flex-1 h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden p-6 md:p-8 lg:p-10">
        <main className="w-full h-full bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden font-['Manrope',_sans-serif] flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('messages_title')}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('messages_subtitle')}</p>
              </div>
              <button 
                onClick={() => setIsComposing(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 font-semibold"
              >
                <MessageSquareDiff className="w-5 h-5" />
                {t('new_message')}
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pt-2">
              <div className="relative w-full sm:w-96">
                <Search className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
                <input
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-none bg-slate-50 dark:bg-slate-800 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                  placeholder={t('search_clients_messages')}
                  type="text"
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar w-full sm:w-auto">
                <button 
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-2xl text-sm font-medium transition-colors whitespace-nowrap ${
                    filterType === 'all'
                      ? 'bg-[var(--brand-primary)] text-white'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {t('all_chats')}
                </button>
                <button 
                  onClick={() => setFilterType('unread')}
                  className={`px-4 py-2 rounded-2xl text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                    filterType === 'unread'
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 ring-2 ring-emerald-100 dark:ring-emerald-900/30'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {t('unread_label')} 
                  {unreadChatsCount > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      filterType === 'unread' ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {unreadChatsCount}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => setFilterType('needs_reply')}
                  className={`px-4 py-2 rounded-2xl text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                    filterType === 'needs_reply'
                      ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 ring-2 ring-amber-100 dark:ring-amber-900/30'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${filterType === 'needs_reply' ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`}></span>
                  {t('needs_reply')}
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Carga inicial de la lista: filas skeleton que imitan cada
                conversación (avatar redondeado + nombre + preview). */}
            {clientsLoading && clients.length === 0 && (
              <div aria-hidden="true">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <SkeletonCircle size={56} className="rounded-2xl" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-2.5 w-10" />
                      </div>
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {filteredClients.map((client) => {
              const latest = latestMessages[client.id];
              return (
                <div 
                  key={client.id}
                  onClick={() => {
                    setSelectedClientId(client.id);
                    setIsComposing(false);
                  }}
                  className="group p-5 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors relative"
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
                          <h3 className="font-bold text-base text-slate-900 dark:text-white">{client.name}</h3>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-500 uppercase tracking-wide">
                            {latest ? t('plan_review') : t('active')}
                          </span>
                        </div>
                        {latest && (
                          <span className="text-xs font-semibold text-emerald-500 whitespace-nowrap bg-emerald-500/5 px-2 py-1 rounded-lg">
                            {new Date(latest.created_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-end gap-4">
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium truncate pr-4 leading-relaxed">
                          {latest ? (
                            <>
                              <span className="font-bold">{latest.sender_id === user.id ? t('you_label') : client.name.split(' ')[0]}:</span> {latest.content}
                            </>
                          ) : (
                            <span className="text-slate-400 italic">{t('no_messages_yet')}</span>
                          )}
                        </p>
                        <div className="flex-shrink-0 flex items-center gap-3">
                          <button onClick={(e) => toggleFavorite(e, client.id)} className="focus:outline-none">
                            <Star className={`w-5 h-5 transition-colors ${favorites.includes(client.id) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600 group-hover:text-emerald-500'}`} />
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
      <CoachProfileModal open={coachProfileOpen} onClose={() => setCoachProfileOpen(false)} />
      <main className="w-full h-full flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Hidden file pickers — mounted unconditionally so the buttons work in
            both the conversation view and the new-message composer. */}
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
        {isComposing ? (
          /* New Message Workspace */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
             {/* Composition Area */}
             <div className="flex-1 flex flex-col border-r border-slate-100 dark:border-slate-800 overflow-hidden">
                <header className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('new_message')}</h2>
                  <button
                    onClick={() => {
                      setIsComposing(false);
                      setSelectedRecipients([]);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                  >
                    <Plus className="w-6 h-6 rotate-45" />
                  </button>
                </header>

                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/30 dark:bg-slate-800/20">
                  <label className="text-sm font-bold text-slate-500 dark:text-slate-400 min-w-8">{t('to_label')}</label>
                  <div className="flex-1 flex flex-wrap items-center gap-2">
                    {selectedRecipients.map(r => (
                      <div key={r.id} className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pl-1 pr-2 py-0.5 shadow-sm">
                        <img src={r.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{r.name}</span>
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
                        className="w-full bg-transparent border-none focus:ring-0 text-sm py-1 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:outline-none ring-0 shadow-none"
                        placeholder={t('type_name_placeholder')} 
                        value={recipientSearch}
                        onChange={(e) => {
                          setRecipientSearch(e.target.value);
                          setShowRecipientResults(true);
                        }}
                        onFocus={() => setShowRecipientResults(true)}
                      />
                      {showRecipientResults && recipientSearch && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-20 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
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
                                className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0"
                              >
                                <img src={client.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                                <div className="text-left">
                                  <p className="text-sm font-bold text-slate-900 dark:text-white">{client.name}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">{client.plan}</p>
                                </div>
                              </button>
                            ))
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col p-6 bg-white dark:bg-slate-900 relative">
                  <textarea
                    className="w-full h-full resize-none border-none focus:ring-0 p-0 text-lg text-slate-700 dark:text-slate-200 bg-transparent placeholder-slate-300 dark:placeholder-slate-600 leading-relaxed font-['Manrope']"
                    placeholder={t('write_first_message')}
                    value={composingContent}
                    onChange={(e) => setComposingContent(e.target.value)}
                    onKeyDown={(e) => {
                      // Enter sends; Shift+Enter inserts a newline.
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendBroadcast();
                      }
                    }}
                  />
                  
                  {/* Multi-send files preview */}
                  {(selectedFile || audioBlob) && (
                    <div className="mb-4 flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-fit">
                      <Paperclip className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold">{selectedFile?.file.name || t('audio_recording')}</span>
                      <button onClick={() => { setSelectedFile(null); setAudioBlob(null); }} className="text-slate-400 hover:text-red-500">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <footer className="mt-4 flex justify-between items-end pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1">
                      <button onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button onClick={() => imageInputRef.current?.click()} className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all">
                        <ImageIcon className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        title={t('mark_as_favorite')}
                        onClick={() => {
                          if (selectedRecipients.length === 0) return;
                          const ids = selectedRecipients.map(r => r.id);
                          const allFav = ids.every(id => favorites.includes(id));
                          const updated = allFav
                            ? favorites.filter(id => !ids.includes(id))
                            : Array.from(new Set([...favorites, ...ids]));
                          setFavorites(updated);
                          localStorage.setItem('chatFavorites', JSON.stringify(updated));
                        }}
                        className={`p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all ${
                          selectedRecipients.length > 0 && selectedRecipients.every(r => favorites.includes(r.id))
                            ? 'text-amber-400'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                      >
                        <Star className={`w-5 h-5 ${
                          selectedRecipients.length > 0 && selectedRecipients.every(r => favorites.includes(r.id)) ? 'fill-amber-400' : ''
                        }`} />
                      </button>
                      <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                      <button
                        type="button"
                        title={t('open_calendar')}
                        onClick={() => onNavigate?.('calendar')}
                        className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
                      >
                        <Calendar className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden sm:block">{t('press_enter_send')}</span>
                      <button 
                        onClick={handleSendBroadcast}
                        disabled={(!composingContent.trim() && !selectedFile && !audioBlob) || selectedRecipients.length === 0 || isSending}
                        className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSending ? t('sending') : t('send_message')}
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </footer>
                </div>
             </div>

             {/* Sidebar: Suggested Groups & Clients */}
             <div className="hidden md:flex w-80 lg:w-96 bg-slate-50/50 dark:bg-slate-900/50 flex-col h-full border-l border-slate-100 dark:border-slate-800 overflow-y-auto custom-scrollbar">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-slate-900 dark:text-white">{t('suggested_clients')}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">{t('recently_active_assigned')}</p>
                </div>
                <div className="flex-1 p-4 space-y-3">
                  {clients.slice(0, 8).map(client => (
                    <div key={client.id} className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all cursor-pointer">
                      <div className="relative">
                        <img src={client.avatar} alt="" className="w-11 h-11 rounded-full object-cover shadow-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{client.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{client.plan} • {t('online_status')}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (!selectedRecipients.find(sr => sr.id === client.id)) {
                            setSelectedRecipients(prev => [...prev, client]);
                          }
                        }}
                        className={`p-1.5 rounded-xl border transition-all ${
                          selectedRecipients.find(sr => sr.id === client.id)
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 border-blue-100 dark:border-blue-800'
                            : 'bg-white dark:bg-slate-900 text-slate-400 group-hover:text-emerald-500 border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <div className="pt-6 pb-2">
                    <h4 className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[2px]">{t('quick_groups')}</h4>
                  </div>
                  <div className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all cursor-pointer">
                    <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
                      <GroupsIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t('all_active_clients')}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('members_count', { count: clients.length })}</p>
                    </div>
                    <button
                      onClick={() => setSelectedRecipients(clients)}
                      className="p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 group-hover:bg-[#17cf54]/10 group-hover:text-[#17cf54] group-hover:border-[#17cf54]/20 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                  <div
                    onClick={() => setSelectedRecipients(clients.filter(c => c.nutritionPlanAssigned))}
                    className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all cursor-pointer">
                    <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-inner">
                      <GroupsIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t('nutrition_plans_group')}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('members_count', { count: clients.filter(c => c.nutritionPlanAssigned).length })}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRecipients(clients.filter(c => c.nutritionPlanAssigned));
                      }}
                      className="p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 group-hover:text-[#17cf54] opacity-0 group-hover:opacity-100 transition-all">
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
            <header className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {user?.role === 'MANAGER' && (
            <button
              onClick={() => {
                setSelectedClientId(null);
                setIsComposing(false);
              }}
              className="p-2 mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
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
              <h2 className="font-bold text-slate-900 dark:text-white">{activeRecipient?.name || t('loading')}</h2>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
           {user?.role === 'CLIENT' ? (
             <>
               <button
                 onClick={() => setCoachProfileOpen(true)}
                 className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center space-x-2">
                 <User className="w-4 h-4" />
                 <span>{t('view_coach_profile')}</span>
               </button>
               {/* "Reservar check-in" removed — the action lives in the
                   client portal's Check-ins tab and the FAB. */}
             </>
           ) : (
             <button
               onClick={() => {
                 if (activeRecipient?.id) onNavigate?.('clients', { clientId: activeRecipient.id });
                 else onNavigate?.('clients');
               }}
               className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center space-x-2">
               <User className="w-4 h-4" />
               <span>{t('client_details')}</span>
             </button>
           )}
           <button 
             onClick={handleClearChat}
             className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
             title={t('clear_chat')}
           >
             <Trash2 className="w-5 h-5" />
           </button>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Primera carga del hilo: burbujas skeleton alternando lado (entrante
            con avatar / saliente a la derecha) mientras llega la página. */}
        {threadLoading && messages.length === 0 && (
          <div className="space-y-8" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => {
              const own = i % 2 === 1;
              return (
                <div key={i} className={`flex items-start space-x-3 ${own ? 'justify-end' : ''}`}>
                  {!own && <SkeletonCircle size={32} />}
                  <div className={own ? 'flex flex-col items-end' : ''}>
                    <Skeleton
                      className="rounded-2xl"
                      style={{ width: i % 3 === 0 ? 220 : i % 3 === 1 ? 150 : 260, height: i % 4 === 0 ? 56 : 40 }}
                    />
                    <Skeleton className="h-2 w-12 mt-1.5" />
                  </div>
                  {own && <SkeletonCircle size={32} />}
                </div>
              );
            })}
          </div>
        )}
        {/* Boton para cargar mensajes anteriores. Aparece arriba (los viejos
            estan al principio de la lista). Cuando se pulsa, el scroll se
            queda igual visualmente porque solo se anaden filas arriba. */}
        {hasOlder && (
          <div className="flex justify-center -mt-2">
            <button
              onClick={loadOlderMessages}
              disabled={isLoadingOlder}
              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 px-4 py-2 rounded-full transition-all flex items-center gap-2 disabled:opacity-60"
            >
              {isLoadingOlder ? (
                <>
                  <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                  {t('loading') || 'Cargando…'}
                </>
              ) : (
                t('load_older_messages') || 'Cargar mensajes anteriores'
              )}
            </button>
          </div>
        )}
        {messages.map((msg, idx) => {
          const isOwn = msg.sender_id === user?.id;
          const msgDate = new Date(msg.created_at);
          const prevDate = idx > 0 ? new Date(messages[idx - 1].created_at) : null;
          const isNewDay = !prevDate || msgDate.toDateString() !== prevDate.toDateString();
          const today = new Date();
          const yesterday = new Date();
          yesterday.setDate(today.getDate() - 1);
          const dateLabel =
            msgDate.toDateString() === today.toDateString()
              ? t('today')
              : msgDate.toDateString() === yesterday.toDateString()
                ? t('yesterday')
                : msgDate.toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' });
          return (
            <React.Fragment key={msg.id}>
            {isNewDay && (
              <div className="flex justify-center">
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase rounded-full tracking-wider">{dateLabel}</span>
              </div>
            )}
            <div className={`flex items-start space-x-3 ${isOwn ? 'justify-end' : 'max-w-2xl'}`}>
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
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 rounded-tr-none border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border-slate-200 dark:border-slate-700'
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
                              ? 'bg-white/40 dark:bg-emerald-900/20 border-green-200 dark:border-green-800 hover:bg-white/60 dark:hover:bg-emerald-900/30'
                              : 'bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:bg-white/80 dark:hover:bg-slate-700/70'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${isOwn ? 'bg-green-100 dark:bg-green-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
                            <FileText className={`w-5 h-5 ${isOwn ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-300'}`} />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className={`text-sm font-bold truncate ${isOwn ? 'text-green-800 dark:text-green-200' : 'text-slate-900 dark:text-white'}`}>{msg.attachment_name || t('document_label')}</p>
                            <p className={`text-[10px] ${isOwn ? 'text-green-600/70 dark:text-green-400/70' : 'text-slate-500 dark:text-slate-400'}`}>{t('click_to_view')}</p>
                          </div>
                          <Download className={`w-4 h-4 ${isOwn ? 'text-green-600/70' : 'text-slate-400'}`} />
                        </a>
                      )}
                      {msg.attachment_type === 'audio' && (
                        <div className={`flex items-center gap-2 p-2 rounded-xl ${isOwn ? 'bg-green-50/50 dark:bg-green-900/20' : 'bg-slate-200/50 dark:bg-slate-700/50'}`}>
                          <audio controls className="h-10 w-full max-w-[240px] mix-blend-multiply opacity-80">
                            <source src={msg.attachment_url} type="audio/webm" />
                            {t('audio_not_supported')}
                          </audio>
                        </div>
                      )}
                      {msg.attachment_type === 'check_in' && (
                        <div className={`flex flex-col gap-3 p-4 rounded-xl border transition-all ${
                          isOwn
                            ? 'bg-white/40 dark:bg-emerald-900/20 border-green-200 dark:border-green-800 shadow-sm'
                            : 'bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 shadow-sm'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOwn ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'}`}>
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className={`text-sm font-bold truncate ${isOwn ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-900 dark:text-white'}`}>{t('weekly_checkin_assessment')}</p>
                               <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t('review_progress_feedback')}</p>
                            </div>
                          </div>

                          {msg.content && (
                            <div className={`text-xs p-3 rounded-lg border italic ${isOwn ? 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100/50 dark:bg-slate-700/50 border-slate-100 dark:border-slate-600 text-slate-600 dark:text-slate-300 line-clamp-2'}`}>
                               "{msg.content}"
                            </div>
                          )}

                          <button
                            onClick={() => onNavigate?.('check-ins', { checkInId: msg.attachment_url, clientId: isOwn ? msg.receiver_id : msg.sender_id })}
                            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                              isOwn
                                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                : 'bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600'
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                            {t('view_checkin_details')}
                          </button>
                        </div>
                      )}
                      {msg.attachment_type === 'payment' && (() => {
                        const p: any = (msg as any).payload || {};
                        const cur = (p.currency || 'eur').toUpperCase();
                        const amount = typeof p.amount_cents === 'number'
                          ? (p.amount_cents / 100).toLocaleString(locale, { style: 'currency', currency: cur })
                          : null;
                        const per = p.kind === 'recurring'
                          ? `/${p.interval === 'year' ? (locale.startsWith('es') ? 'año' : 'yr') : (locale.startsWith('es') ? 'mes' : 'mo')}`
                          : '';
                        const isEs = locale.startsWith('es');
                        const title = p.description || (p.kind === 'recurring' ? (isEs ? 'Suscripción de coaching' : 'Coaching subscription') : (isEs ? 'Pago' : 'Payment'));
                        // Mismo layout EXACTO que la tarjeta de check-in (los
                        // emerald-* se remapean al color de marca vía CSS var).
                        return (
                          <div className={`flex flex-col gap-3 p-4 rounded-xl border transition-all ${
                            isOwn
                              ? 'bg-white/40 dark:bg-emerald-900/20 border-green-200 dark:border-green-800 shadow-sm'
                              : 'bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 shadow-sm'
                          }`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOwn ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'}`}>
                                <CreditCard className="w-6 h-6" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold truncate ${isOwn ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-900 dark:text-white'}`}>{title}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                  {amount ? <>{amount}{per} · {isEs ? 'Pago seguro con Stripe' : 'Secure payment via Stripe'}</> : (isEs ? 'Pago seguro con Stripe' : 'Secure payment via Stripe')}
                                </p>
                              </div>
                            </div>

                            {msg.content && (
                              <div className={`text-xs p-3 rounded-lg border italic ${isOwn ? 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100/50 dark:bg-slate-700/50 border-slate-100 dark:border-slate-600 text-slate-600 dark:text-slate-300 line-clamp-2'}`}>
                                "{msg.content}"
                              </div>
                            )}

                            {msg.attachment_url && (
                              <a
                                href={msg.attachment_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                  isOwn
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                    : 'bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600'
                                }`}
                              >
                                <CreditCard className="w-4 h-4" />
                                {isOwn ? (isEs ? 'Ver enlace de pago' : 'View payment link') : (isEs ? 'Pagar ahora' : 'Pay now')}
                              </a>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  {msg.content && msg.attachment_type !== 'check_in' && msg.attachment_type !== 'payment' && (
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                <div className={`flex items-center space-x-1 mt-1 ${isOwn ? 'pr-1' : 'pl-1'}`}>
                   <p className="text-[10px] font-medium text-slate-400">
                     {new Date(msg.created_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
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
            </React.Fragment>
          );
        })}
      </div>

      {/* Quick Actions — chip set switches by role. The existing chips were
          written as MANAGER → client messages (e.g. "I've reviewed your
          progress…"). Showing them to clients was confusing because the
          labels read as a client request but the body was the coach's reply.
          Clients now get chips that compose a CLIENT → coach message. */}
      <div className="px-6 py-2 flex space-x-2 overflow-x-auto no-scrollbar">
        {user?.role === 'CLIENT' ? (
          <>
            <button
              type="button"
              onClick={() => insertQuickMessage(t('quick_client_book_checkin_msg'))}
              className="whitespace-nowrap flex items-center space-x-1.5 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 rounded-full text-xs font-semibold hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
              <span>{t('quick_client_book_checkin')}</span>
            </button>
            <button
              type="button"
              onClick={() => insertQuickMessage(t('quick_client_ask_meal_msg'))}
              className="whitespace-nowrap flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-full text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <span>{t('quick_client_ask_meal')}</span>
            </button>
            <button
              type="button"
              onClick={() => insertQuickMessage(t('quick_client_request_change_msg'))}
              className="whitespace-nowrap flex items-center space-x-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 rounded-full text-xs font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <span>{t('quick_client_request_change')}</span>
            </button>
            <button
              type="button"
              onClick={() => insertQuickMessage(t('quick_client_share_progress_msg'))}
              className="whitespace-nowrap flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
              <span>{t('quick_client_share_progress')}</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => insertQuickMessage(t('quick_weekly_checkin_msg'))}
              className="whitespace-nowrap flex items-center space-x-1.5 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 rounded-full text-xs font-semibold hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
              <span>{t('quick_weekly_checkin')}</span>
            </button>
            <button
              type="button"
              onClick={() => insertQuickMessage(t('quick_ask_meal_msg'))}
              className="whitespace-nowrap flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-full text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <span>{t('quick_ask_meal')}</span>
            </button>
            <button
              type="button"
              onClick={() => insertQuickMessage(t('quick_request_plan_change_msg'))}
              className="whitespace-nowrap flex items-center space-x-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 rounded-full text-xs font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <span>{t('quick_request_plan_change')}</span>
            </button>
          </>
        )}
      </div>

      {/* Multimedia Preview Area */}
      {errorStatus && (
        <div className="px-6 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-900 flex items-center justify-between">
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
        <div className="px-6 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3">
            {selectedFile && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                {selectedFile.type === 'image' ? (
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                ) : (
                  <FileText className="w-4 h-4 text-blue-500" />
                )}
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[150px]">{selectedFile.file.name}</span>
                <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
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
                <span className="text-[10px] font-bold uppercase tracking-wider">{t('recording_audio')}</span>
              </div>
            )}
            {audioBlob && !isRecording && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                <Mic className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{t('audio_recording')}</span>
                <button onClick={() => setAudioBlob(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
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
              {t('stop_and_save')}
            </button>
          )}
        </div>
      )}

      {/* Input Area */}
      <footer className="p-4 pb-6 pt-2">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
          <div className="flex items-center space-x-1 px-2 border-r border-slate-200 dark:border-slate-700">
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
            ref={messageInputRef}
            value={newMessage}
            disabled={isRecording || uploading}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-sm py-2 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-50"
          placeholder={isRecording ? t('recording_audio_input') : t('type_your_message')}
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

