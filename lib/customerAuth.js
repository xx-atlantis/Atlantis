export async function getCustomerToken() {
  const res = await fetch("/api/customer-token", {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  const data = await res.json();
  return data?.success ? data.token : null;
}

export async function customerAuthHeaders() {
  const token = await getCustomerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
