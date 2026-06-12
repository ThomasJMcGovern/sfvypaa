import { Badge } from "@/components/ui/badge";

/* Exactly two statuses everywhere: green Published, amber Draft. */
export function ContentStatusBadge({ status }: { status: string }) {
  return status === "published" ? (
    <Badge variant="go">Published</Badge>
  ) : (
    <Badge className="border-warn bg-warn text-paper">Draft</Badge>
  );
}
