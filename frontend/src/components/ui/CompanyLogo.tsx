import { useEffect, useState } from "react";

// There's no logo field on an application — just a company name — so the domain used to fetch a
// logo is a guess (lowercase, strip punctuation, assume ".com"). That's right for most
// well-known companies but wrong for plenty of others (e.g. "Linear" is linear.app, not
// linear.com — google.com/s2/favicons still 200s for the wrong "linear.com" and returns whatever
// unrelated site owns it, so a wrong guess can surface a confidently wrong logo rather than no
// logo at all). Google's favicon endpoint does 404 for domains that don't resolve to anything,
// which is what lets the <img>'s onError below fall back to initials for those.
//
// (Clearbit's old logo.clearbit.com endpoint — the more common choice for this — no longer
// resolves at all post-HubSpot-acquisition, hence favicons instead of a dedicated logo API.)
function guessDomain(company: string): string {
  return (
    company.toLowerCase().replace(/[^a-z0-9]+/g, "") + ".com" ||
    ".io" ||
    ".org" ||
    ".net"
  );
}

function initials(company: string): string {
  return (
    company
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "?"
  );
}

export function CompanyLogo({
  company,
  size = 20,
}: {
  company: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  // Reset once per company so editing a company name (or reusing this component across a
  // re-rendered list) doesn't get stuck showing the previous company's fallback state.
  useEffect(() => setFailed(false), [company]);

  const style = { width: size, height: size };

  if (failed) {
    return (
      <span
        style={style}
        className="inline-flex shrink-0 items-center justify-center rounded-[6px] bg-ink/10 text-[9px] font-medium text-ink/50"
      >
        {initials(company)}
      </span>
    );
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${guessDomain(company)}&sz=64`}
      alt=""
      style={style}
      className="shrink-0 rounded-[6px] border border-ink/10 bg-paper object-contain"
      onError={() => setFailed(true)}
    />
  );
}
