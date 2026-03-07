import { Link } from "react-router-dom";
import type { Puja } from "@/lib/types";

export function PujaCard({ puja }: { puja: Puja }) {
  return (
    <article className="content-card">
      <div className="eyebrow">{puja.type}</div>
      <h3>{puja.name.en}</h3>
      <p>{puja.description?.short || puja.description?.nriNote || "Sacred offering at the temple."}</p>
      <div className="card-meta">
        <span>{puja.duration || 0} min</span>
        <span>
          {puja.displayPrice?.currency} {puja.displayPrice?.amount}
        </span>
      </div>
      <Link className="text-link" to={`/pujas/${puja._id}`}>
        View puja
      </Link>
    </article>
  );
}
