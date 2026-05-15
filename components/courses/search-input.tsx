"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useTransition } from "react";

export function SearchInput({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("search", value);
    else params.delete("search");

    startTransition(() => {
      router.push(`/courses?${params.toString()}`);
    });
  };

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
      <input
        type="search"
        defaultValue={defaultValue}
        placeholder="Search courses..."
        className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
        onChange={(e) => handleSearch(e.target.value)}
      />
      {isPending && (
        <div className="absolute right-3 top-3 h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      )}
    </div>
  );
}
