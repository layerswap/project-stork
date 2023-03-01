import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { GetClients } from "../lib/twitterClient";
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] })

function getTwitterOauthUrl() {
  let { authClient } = GetClients();
  let state = crypto.randomUUID();
  const authUrl = authClient.generateAuthURL({
    state: state,
    code_challenge_method: "plain",
    code_challenge: state
  });

  window.localStorage.setItem('OAUTH_STATE', state);

  return authUrl;
}

export default function Home() {
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.description}>
          <p>
            Get started by editing&nbsp;
            <code className={styles.code}>pages/index.tsx</code>
          </p>
          <div>
            <Link
              href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              By{' '}
              <Image
                src="/vercel.svg"
                alt="Vercel Logo"
                className={styles.vercelLogo}
                width={100}
                height={24}
                priority
              />
            </Link>
          </div>
        </div>

        <div className={styles.center}>
          <Image
            className={styles.logo}
            src="/next.svg"
            alt="Next.js Logo"
            width={180}
            height={37}
            priority
          />
          <div className={styles.thirteen}>
            <Image
              src="/thirteen.svg"
              alt="13"
              width={40}
              height={31}
              priority
            />
          </div>
        </div>

        <div className={styles.grid}>
          <Link
            className={styles.card}
            href={getTwitterOauthUrl() ?? ''}
          >
            <h2 className={inter.className}>
              Claim <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Connect twitter account to claim assets
            </p>
          </Link>

          <Link
            href="/send"
            className={styles.card}
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Send <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Send assets to someone
            </p>
          </Link>
        </div>
      </main>
    </>
  )
}
