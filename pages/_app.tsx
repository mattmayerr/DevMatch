import type { AppProps } from 'next/app'
import Layout from '../components/Layout'
import '../styles/globals.css'
import { useRouter } from 'next/router'

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const noLayoutRoutes = ['/', '/login']

  const isNoLayout = noLayoutRoutes.includes(router.pathname)

  return isNoLayout ? (
    <Component {...pageProps} />
  ) : (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}