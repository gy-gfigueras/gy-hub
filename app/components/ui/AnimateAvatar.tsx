/* eslint-disable @next/next/no-img-element */
"use client";
import {
  AvatarGroup,
  AvatarGroupTooltip,
} from "@/components/animate-ui/components/animate/avatar-group";

export function AnimateAvatar({
  src,
  tooltip,
}: {
  src: string;
  tooltip: string;
}) {
  return (
    <AvatarGroup>
      <div className="size-14 rounded-full border-4 border-background overflow-hidden">
        <img src={src} alt={tooltip} className="object-cover w-full h-full" />
      </div>
      <AvatarGroupTooltip>{tooltip}</AvatarGroupTooltip>
    </AvatarGroup>
  );
}
