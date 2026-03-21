import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AccountSettings } from "@/components/AccountSettings";

export const metadata = {
  title: "Account Settings - AskThem",
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      state: true,
      isProfilePublic: true,
      emailConsent: true,
      isAddressVerified: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  // Fetch district/official info from UserDistrict (Cicero lookup results)
  const userDistricts = await prisma.userDistrict.findMany({
    where: { userId: user.id },
    include: {
      official: {
        select: {
          id: true,
          name: true,
          title: true,
          party: true,
          state: true,
          district: true,
          chamber: true,
          photoUrl: true,
        },
      },
    },
  });

  const districts = userDistricts.map((ud: (typeof userDistricts)[number]) => ({
    officialId: ud.official.id,
    name: ud.official.name,
    title: ud.official.title,
    party: ud.official.party,
    state: ud.official.state,
    district: ud.official.district,
    chamber: ud.official.chamber,
    photoUrl: ud.official.photoUrl,
  }));

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage your account preferences and data.
      </p>

      <AccountSettings
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          state: user.state,
          isProfilePublic: user.isProfilePublic,
          emailConsent: user.emailConsent,
          isAddressVerified: user.isAddressVerified,
          createdAt: user.createdAt.toISOString(),
        }}
        districts={districts}
      />
    </main>
  );
}
