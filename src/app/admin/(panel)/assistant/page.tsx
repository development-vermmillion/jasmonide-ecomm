import { all, one } from "@/lib/db";
import AssistantAdmin from "@/components/admin/AssistantAdmin";

export default async function Assistant({ searchParams }: { searchParams: { tab?: string; filter?: string } }) {
  const tab = searchParams.tab === "taught" ? "taught" : "chats";
  const filter = ["todo", "unanswered", "down", "all"].includes(searchParams.filter || "") ? searchParams.filter! : "todo";
  const where = { todo: "handled = 0", unanswered: "answered = 0", down: "rating = -1", all: "1=1" }[filter];
  const [chats, taught, st] = await Promise.all([
    all(`select * from assistant_chats where ${where} order by id desc limit 200`),
    all("select * from assistant_taught order by id desc"),
    one("select count(*) total, sum(answered = 0) unanswered, sum(rating = 1) up, sum(rating = -1) down from assistant_chats"),
  ]);
  return (
    <div className="space-y-5">
      <div><h1 className="h-serif text-3xl">AI assistant</h1><p className="text-sm text-neutral-500">Runs on your own server — free, no API. Review what visitors ask, then teach better answers. Taught answers are used first.</p></div>
      <AssistantAdmin tab={tab} filter={filter} chats={chats} taught={taught} stats={{ total: st?.total || 0, unanswered: st?.unanswered || 0, up: st?.up || 0, down: st?.down || 0 }} />
    </div>
  );
}
