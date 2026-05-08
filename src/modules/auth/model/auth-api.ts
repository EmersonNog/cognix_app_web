export async function syncUser(token: string): Promise<void> {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/sync`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    });
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.warn("[syncUser]", err);
  }
}
