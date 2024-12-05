'use client'

import dynamic from 'next/dynamic'

const ChatPage = dynamic(
  () => import('@/pages/ChatPage').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => <div>Loading...</div>
  }
)

export default function Home() {
  return <ChatPage />
}
