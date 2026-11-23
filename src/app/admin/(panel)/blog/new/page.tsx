import BlogEditor from "@/components/admin/BlogEditor";
export default function NewPost() {
  return <div className="space-y-5"><h1 className="h-serif text-3xl">New post</h1><BlogEditor initial={{ title: "", slug: "", excerpt: "", content: "", cover: "", tags: "", author: "", status: "draft", seo_title: "", seo_desc: "", faq: [] }} /></div>;
}
