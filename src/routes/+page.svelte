<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { useChat } from '@ai-sdk/svelte';
  import Header from '#lib/components/Header.svelte';
  import WelcomeScreen from '#lib/components/WelcomeScreen.svelte';
  import ChatArea from '#lib/components/ChatArea.svelte';
  import ChatInput from '#lib/components/ChatInput.svelte';
  import SettingsModal from '#lib/components/SettingsModal.svelte';
  import HistorySidebar from '#lib/components/HistorySidebar.svelte';
  import type { ServerProfile, ChatSession } from '#lib/schemas/chat';
  import {
    getServerProfile,
    getChatSessions,
    getActiveSessionId,
    saveActiveSessionId,
    createChatSession,
    updateChatSession,
    deleteChatSession,
    clearAllChatSessions
  } from '#lib/utils/storage';

  // AI Configuration State
  let model = $state('gemini-3.5-flash');
  let temperature = $state(0.3);
  let topP = $state(0.85);
  let maxTokens = $state(2048);
  let serverProfile = $state<ServerProfile>({
    os: '',
    techStack: '',
    specs: '',
    notes: ''
  });

  let isSettingsOpen = $state(false);
  let isHistoryOpen = $state(false);

  // Multi-session State
  let sessions = $state<ChatSession[]>([]);
  let currentSessionId = $state<string | null>(null);
  let isInitialized = $state(false);

  // useChat from @ai-sdk/svelte
  const { messages, input, handleSubmit, isLoading, stop, setMessages } = useChat({
    api: '/api/chat',
    body: {
      get model() {
        return model;
      },
      get temperature() {
        return temperature;
      },
      get topP() {
        return topP;
      },
      get maxTokens() {
        return maxTokens;
      },
      get serverProfile() {
        return serverProfile;
      }
    }
  });

  onMount(() => {
    serverProfile = getServerProfile();
    const storedSessions = getChatSessions();
    sessions = storedSessions;
    const activeId = getActiveSessionId();

    if (activeId) {
      const activeSession = storedSessions.find((s) => s.id === activeId);
      if (activeSession && activeSession.messages.length > 0) {
        currentSessionId = activeSession.id;
        setMessages(activeSession.messages);
      }
    }
    isInitialized = true;
  });

  // Persist messages to active session in localStorage
  $effect(() => {
    const currentMsgs = $messages;
    if (!isInitialized) return;

    if (currentMsgs.length > 0) {
      if (!currentSessionId) {
        const firstUser = currentMsgs.find((m) => m.role === 'user')?.content || 'Obrolan Baru';
        const newSession = createChatSession(firstUser, currentMsgs);
        currentSessionId = newSession.id;
        sessions = getChatSessions();
      } else {
        updateChatSession(currentSessionId, currentMsgs);
        sessions = getChatSessions();
      }
    }
  });

  function handlePromptSelect(selectedPrompt: string) {
    $input = selectedPrompt;
  }

  async function handleSelectSuggestion(suggestion: string) {
    $input = suggestion;
    await tick();
    handleSubmit();
  }

  function handleNewChat() {
    currentSessionId = null;
    saveActiveSessionId(null);
    setMessages([]);
    $input = '';
    isHistoryOpen = false;
  }

  function handleSelectSession(session: ChatSession) {
    currentSessionId = session.id;
    saveActiveSessionId(session.id);
    setMessages(session.messages);
    $input = '';
    isHistoryOpen = false;
  }

  function handleDeleteSession(id: string) {
    deleteChatSession(id);
    sessions = getChatSessions();
    if (currentSessionId === id) {
      if (sessions.length > 0) {
        handleSelectSession(sessions[0]);
      } else {
        handleNewChat();
      }
    }
  }

  function handleClearAll() {
    clearAllChatSessions();
    sessions = [];
    handleNewChat();
  }
</script>

<div class="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
  <Header
    activeModel={model}
    showNewChat={$messages.length > 0}
    sessionCount={sessions.length}
    onNewChat={handleNewChat}
    onOpenSettings={() => (isSettingsOpen = true)}
    onToggleHistory={() => (isHistoryOpen = !isHistoryOpen)}
  />

  <main class="flex-1 flex flex-col overflow-hidden relative">
    {#if $messages.length === 0}
      <div class="flex-1 overflow-y-auto flex items-center justify-center">
        <WelcomeScreen onSelectPrompt={handlePromptSelect} />
      </div>
    {:else}
      <ChatArea
        messages={$messages}
        isLoading={$isLoading}
        onSelectSuggestion={handleSelectSuggestion}
      />
    {/if}

    <ChatInput
      bind:input={$input}
      isLoading={$isLoading}
      onSubmit={(image) => handleSubmit(undefined, { image: image || undefined })}
      onStop={stop}
    />
  </main>

  <HistorySidebar
    bind:isOpen={isHistoryOpen}
    {sessions}
    activeSessionId={currentSessionId}
    onSelectSession={handleSelectSession}
    onNewChat={handleNewChat}
    onDeleteSession={handleDeleteSession}
    onClearAll={handleClearAll}
  />

  <SettingsModal
    bind:isOpen={isSettingsOpen}
    bind:model
    bind:temperature
    bind:topP
    bind:maxTokens
    bind:serverProfile
  />
</div>
