React Component Library
Overview
Learn how our Tavus Conversational Video Interface (CVI) Component Library can help you go live in minutes.

### Overview
The Tavus Conversational Video Interface (CVI) React component library provides a complete set of pre-built components and hooks for integrating AI-powered video conversations into your React applications. This library simplifies setting up Tavus in your codebase, allowing you to focus on your application’s core features.
Key features include:

*   Pre-built video chat components
*   Device management (camera, microphone, screen sharing)
*   Real-time audio/video processing
*   Customizable styling and theming
*   TypeScript support with full type definitions

### Quick Start

#### Prerequisites
Before getting started, ensure you have a React project set up.
Alternatively, you can start from our example project: CVI UI Haircheck Conversation Example - this example already has the HairCheck and Conversation blocks set up.

#### 1. Initialize CVI in Your Project

```bash
npx @tavus/cvi-ui@latest init
```

*   Creates a `cvi-components.json` config file
*   Prompts for TypeScript preference
*   Installs npm dependencies (`@daily-co/daily-react`, `@daily-co/daily-js`, `jotai`)

#### 2. Add CVI Components

```bash
npx @tavus/cvi-ui@latest add conversation
```

#### 3. Wrap Your App with the CVI Provider
In your root directory (main.tsx or index.tsx):

```typescript
import { CVIProvider } from './components/cvi/components/cvi-provider';

function App () {
  return <CVIProvider >{ /* Your app content */ }</CVIProvider >;
}
```

#### 4. Add a Conversation Component
Learn how to create a conversation URL at https://docs.tavus.io/api-reference/conversations/create-conversation
Note: The Conversation component requires a parent container with defined dimensions to display properly.

Ensure your body element has full dimensions (`width: 100%` and `height: 100%`) in your CSS for proper component display.

```typescript
import { Conversation } from './components/cvi/components/conversation';

function CVI () {
  const handleLeave = () => {
    // handle leave
  };
  return (
    <div style={{
      width: '100%',
      height: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
    }}}
    >
      <Conversation
        conversationUrl = 'YOUR_TAVUS_MEETING_URL'
        onLeave = { handleLeave }
      />
    </div>
  );
}
```

### Documentation Sections

*   Blocks – High-level component compositions and layouts
*   Components – Individual UI components
*   Hooks – Custom React hooks for managing video call state and interactions 