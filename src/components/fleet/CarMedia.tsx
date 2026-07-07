import Image from "next/image";
import type { FleetCar } from "@/lib/fleet/types";

/**
 * Car photo, or a branded dark placeholder when no photo exists yet. The image
 * bleeds to the container edges (no frame) per the design direction.
 */
export function CarMedia({
  car,
  sizes,
  priority,
}: {
  car: Pick<FleetCar, "images" | "brand" | "model">;
  sizes: string;
  priority?: boolean;
}) {
  const src = car.images[0];

  if (src) {
    return (
      <Image
        src={src}
        alt={`${car.brand} ${car.model}`}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(120%_120%_at_50%_0%,#181818,#000)]">
      <span className="font-heading text-3xl font-bold uppercase tracking-[0.12em] text-white/10">
        {car.brand}
      </span>
    </div>
  );
}
