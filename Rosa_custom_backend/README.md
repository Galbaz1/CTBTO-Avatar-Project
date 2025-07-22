# Tavus Conversational Video Interface (CVI) UI • React Quick Start 🚀

A **step‑by‑step** guide to embedding Tavus CVI UI components in your React app.

## 🎮 Try it Live

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/Tavus-Engineering/tavus-examples/tree/main/examples/cvi-ui-conversation?file=src%2FApp.tsx)

## 📚 **Full documentation:**

[Component Library Overview](https://docs.tavus.io/sections/conversational-video-interface/component-library/overview)

---

## Prerequisites 🔑

1. **Tavus Account** – Sign up at [https://platform.tavus.io](https://platform.tavus.io).
2. **API Key** – Create one in the [Tavus Dashboard → *API Keys*](https://platform.tavus.io/api-keys).

---

## Environment Setup 🔧

1. **Copy the environment template**:
   ```bash
   cp .env.local.template .env.local
   ```

2. **Add your API keys** to `.env.local`:
   ```bash
   VITE_TAVUS_API_KEY=your_actual_tavus_api_key
   NEXT_TAVUS_API_KEY=your_actual_tavus_api_key
   ROSA_API_KEY=your_rosa_backend_key
   OPENAI_API_KEY=your_openai_api_key
   ```

   **⚠️ Important**: Never commit your actual API keys to version control. The `.env.local` file is already in `.gitignore`.

---

## 1. Install Dependencies ⚙️

Add the CVI UI components and helper hook to your project:

```bash
npx @tavus/cvi-ui@latest add conversation-01 use-request-permissions
```

---

## 2. Wrap Your App with `<CVIProvider>` 🏗️

In **`main.tsx`** (or **`index.tsx`**):

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { CVIProvider } from './components/cvi/components/cvi-provider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CVIProvider>
      <App />
    </CVIProvider>
  </StrictMode>
);
```

---

## 3. Request Camera & Microphone Permissions 🎤📷

Call the built‑in `useRequestPermissions` hook **before** creating a conversation.

```tsx
import { createConversation } from './api';
import { useRequestPermissions } from './components/cvi/hooks/use-request-permissions';

// …component setup

const handleJoin = async (token: string) => {
  try {
    setLoading(true);

    // 1️⃣ Ask the browser for permissions
    await requestPermissions();

    // 2️⃣ Create a conversation on your backend
    const conversation = await createConversation(token);
    setConversation(conversation);
    setScreen('call');
  } catch (error) {
    alert('Something went wrong.');
  } finally {
    setLoading(false);
  }
};
```

---

## 4. Render the Conversation UI 💬 <a id="render-the-conversation-ui"></a>

Once you have a `conversation` object, render the CVI UI component in **`App.tsx`**:

```tsx
import { Conversation } from './components/cvi/components/conversation';

// …inside the component
return (
  <main>
    {screen === 'welcome' && (
      <WelcomeScreen onStart={handleJoin} loading={loading} />
    )}

    {screen === 'call' && conversation && (
      <Conversation
        conversationUrl={conversation.conversation_url}
        onLeave={handleEnd}
      />
    )}
  </main>
);
```

---

Made with ❤️ by the Tavus Engineering team.
