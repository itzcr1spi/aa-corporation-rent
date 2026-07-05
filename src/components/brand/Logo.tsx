import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/config/site";
import { cn } from "@/lib/utils";

/**
 * Brand logo (brand book §05–§09). Rules honored:
 *  - primary silver/red-on-black lockup on dark surfaces
 *  - never recolor / distort / rotate / add effects
 *  - protective clear space around the mark (the wrapping padding)
 *  - min 80px on screens — the header render comfortably exceeds this
 */
export function Logo({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} — ${siteConfig.tagline}`}
      className={cn("inline-flex items-center p-1", className)}
    >
      <Image
        src="/brand/aa-logo-dark.png"
        alt={siteConfig.name}
        width={340}
        height={187}
        priority={priority}
        className="h-11 w-auto md:h-12"
      />
    </Link>
  );
}
