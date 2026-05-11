import { Badge } from "@/components/ui/badge";

export function ContentStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      className={
        status === "published"
          ? "h-7 rounded-[8px] bg-[#1c6f70] px-3 text-white"
          : "h-7 rounded-[8px] bg-[#ffcf6b] px-3 text-[#191109]"
      }
    >
      {status}
    </Badge>
  );
}
