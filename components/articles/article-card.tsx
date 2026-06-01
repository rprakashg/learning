import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";
import type { SanityArticleListItem } from "@/lib/sanity-queries";

interface ArticleCardProps {
  article: SanityArticleListItem;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const authorName = article.author
    ? `${article.author.firstName} ${article.author.lastName}`.trim()
    : null;

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <Link href={`/articles/${article.slug.current}`} className="group block">
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative h-44 w-full bg-gradient-to-br from-indigo-400 to-purple-500">
          {article.coverImageUrl ? (
            <Image
              src={article.coverImageUrl}
              alt={article.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <svg
                className="h-14 w-14 text-white/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          )}
          {article.tags && article.tags.length > 0 && (
            <div className="absolute left-3 top-3">
              <Badge variant="secondary" className="bg-white/90 text-gray-700">
                {article.tags[0]}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900 group-hover:text-indigo-600">
            {article.title}
          </h3>
          <p className="mb-4 line-clamp-3 flex-1 text-sm text-gray-500">
            {article.summary}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-3">
              {authorName && (
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {authorName}
                </span>
              )}
              {article.readingTimeMinutes && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {article.readingTimeMinutes} min read
                </span>
              )}
            </div>
            {formattedDate && <span>{formattedDate}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
