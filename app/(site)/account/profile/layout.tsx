import meta from '@/lib/meta'
import { logo, siteName } from '@/lib/setting'

export const metadata = meta({
  title: 'Profile',
  description: `Profile at ${siteName}.`,
  openGraphImage: logo,
})

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div>{children}</div>
}
