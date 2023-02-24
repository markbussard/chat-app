import { AppLayout } from '@client/components';
import { AuthProvider } from '@client/contexts/auth';
import { AppProps as NextAppProps } from 'next/app';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import 'public/global-styles.css';

export default function App({ Component, pageProps }: NextAppProps) {
  return (
    <>
      <Head>
        <title>Welcome to client!</title>
      </Head>
      <Toaster position="top-center" reverseOrder toastOptions={{ duration: 5000 }} />
      <AuthProvider>
        <AppLayout>
          <Component {...pageProps} />
        </AppLayout>
      </AuthProvider>
    </>
  );
}
