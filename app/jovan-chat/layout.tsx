export default function JovanChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">{children}</div>;
}