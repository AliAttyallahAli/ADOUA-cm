import { AuthProvider } from '../hooks/useAuth';
import "../app/globals.css"

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;