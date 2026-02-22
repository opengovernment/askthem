import { getAllUsersForDirectory, getUserCongressionalDistricts } from "@/lib/queries";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Users - AskThem Moderator",
};

function abbreviateEmail(email: string, maxLength = 10): string {
  const localPart = email.split("@")[0];
  if (localPart.length <= maxLength) return email;
  return localPart.slice(0, maxLength) + "...";
}

export default async function AllUsersPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "moderator" && session.user.role !== "admin")) {
    redirect("/");
  }

  const users = await getAllUsersForDirectory();
  const districtMap = await getUserCongressionalDistricts(users.map((u) => u.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8">
          <Link
            href="/moderate"
            className="mb-4 inline-block text-sm text-indigo-600 hover:text-indigo-800"
          >
            &larr; Back to moderation
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">All Users</h1>
          <p className="mt-1 text-gray-500">
            {users.length.toLocaleString()} registered {users.length === 1 ? "user" : "users"}, sorted by registration date.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Email
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Registered
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    District
                  </th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                    Asked
                  </th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                    Signed
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Profile
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900" title={user.email}>
                      <div className="flex items-center gap-2">
                        <span>{abbreviateEmail(user.email)}</span>
                        {user.role !== "user" && (
                          <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {user.role}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                      {districtMap[user.id] ?? (
                        <span className="text-gray-400">&mdash;</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-sm font-medium text-gray-900">
                      {user._count.questions}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-sm font-medium text-gray-900">
                      {user._count.upvotes}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.status === "active"
                          ? "bg-green-100 text-green-700"
                          : user.status === "banned"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                      {user.isProfilePublic ? (
                        <Link
                          href={`/profile/${user.id}`}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          View
                        </Link>
                      ) : (
                        <span className="text-gray-400">Private</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
