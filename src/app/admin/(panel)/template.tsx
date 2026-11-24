/** Re-mounts on every admin navigation so pages animate in. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="adm-page space-y-6">{children}</div>;
}
