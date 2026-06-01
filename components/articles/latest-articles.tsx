import Link from "next/link";
import { sanityClient } from "@/lib/sanity";
import { latestArticlesQuery, type SanityArticleListItem } from "@/lib/sanity-queries";
import { ArticleCard } from "./article-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";

async function getLatestArticles(): Promise<SanityArticleListItem[]> {
  return sanityClient.fetch(latestArticlesQuery);
}

export async function LatestArticles() {
  const articles = await getLatestArticles();

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Latest articles</h2>
            <p className="mt-2 text-gray-500">Technical deep-dives written by our authors</p>
          </div>
          <Link href="/articles">
            <Button variant="outline" size="sm">
              View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {articles.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No articles published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
