import axios from "axios";

export const getUnsplashImage = async (query: string) => {
  const apiKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!apiKey) {
    throw new Error("UNSPLASH_API_KEY is not set in environment variables.");
  }

  try {
    const { data } = await axios.get("https://api.unsplash.com/search/photos", {
      params: {
        query,
        per_page: 1,
        client_id: apiKey,
      },
    });

    return data.results?.[0]?.urls?.small_s3 || null;
  } catch (err) {
    console.error("Error fetching Unsplash image:", err);
    return null;
  }
};
