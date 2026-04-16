import { DealCard } from "./DealCard";
import type { DealListItem } from "@/lib/sanity/types";

export function DealCardLocked({ deal }: { deal: DealListItem }) {
  return <DealCard deal={deal} locked />;
}
