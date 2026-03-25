import Image from "next/image";

interface OfficialAvatarProps {
  name: string;
  photoUrl: string | null;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
};

const imageSizes = {
  sm: 32,
  md: 40,
  lg: 64,
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

export function OfficialAvatar({ name, photoUrl, size = "md" }: OfficialAvatarProps) {
  const cls = sizeClasses[size];
  const px = imageSizes[size];

  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={name}
        width={px}
        height={px}
        className={`${cls} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${cls} flex shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600`}
    >
      {initials(name)}
    </div>
  );
}
