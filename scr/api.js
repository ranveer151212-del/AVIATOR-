import { parseMultipliers } from "./analysis";
export async function fetchHistory() {
  const url = process.env.EXPO_PUBLIC_HISTORY_API_URL;
  if (!url) throw new Error("EXPO_PUBLIC_HISTORY_API_URL is not configured.");
  const response = await fetch(url, {headers:{Accept:"application/json"}});
  if (!response.ok) throw new Error(`History API HTTP ${response.status}`);
  const values = parseMultipliers(await response.json());
  if (!values.length) throw new Error("No valid historical multipliers in API response.");
  return values;
}
