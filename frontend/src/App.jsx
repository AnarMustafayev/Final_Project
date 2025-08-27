import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChatProvider } from './contexts/ChatContext';
import Dashboard from './components/Dashboard';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={{ colorScheme: 'light' }} withGlobalStyles withNormalizeCSS>
        <Notifications position="top-right" />
        <ChatProvider>
          <Dashboard />
        </ChatProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;