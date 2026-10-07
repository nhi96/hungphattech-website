import { HomePageContent } from "@/components/home/home-page-content";
import { getPublishedSiteContent } from "@/lib/content/content-loader";

export default async function HomePage() {
  const content = await getPublishedSiteContent();
  return <HomePageContent content={content} />;
}
