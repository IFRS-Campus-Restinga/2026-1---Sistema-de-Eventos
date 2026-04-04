export async function getDashboard() {
  const response = await fetch("http://localhost:8000/api/dashboard/");
  return response.json();
}