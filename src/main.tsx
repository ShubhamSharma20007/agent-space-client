
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { store } from './redux/store.ts'
import { Provider } from 'react-redux'
import { Toaster } from './components/ui/toast.tsx'
createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <Provider store={store}>
      <App />
      <Toaster  ></Toaster>
    </Provider>
  </ThemeProvider>,
)
