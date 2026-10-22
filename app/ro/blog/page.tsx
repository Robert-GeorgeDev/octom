import { BlogIndex, blogIndexMetadata } from "@/components/article-page";

export const metadata = blogIndexMetadata();

export default function Page() {
  return <BlogIndex />;
}
