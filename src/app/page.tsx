import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Redirect based on user role
  switch (session.user.role) {
    case 'ADMIN':
    case 'MANAGER':
      redirect('/manager')
    case 'DEPARTMENT':
      redirect('/department')
    case 'FIELD':
      redirect('/field')
    default:
      redirect('/login')
  }
}
