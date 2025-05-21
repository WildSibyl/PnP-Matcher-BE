import ErrorResponse from "../utils/ErrorResponse.js";

export const getCoordinates = async (address) => {
  const { houseNumber, street, postalCode, city } = address;

  if (!houseNumber || !street || !postalCode || !city) {
    throw new ErrorResponse("Enter all fields in address", 400);
  }

  const query = encodeURIComponent(
    `${houseNumber} ${street} ${postalCode} ${city}`
  );

  const url = `https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${process.env.OPENCAGE_API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  const coordinates = data.results[0]?.geometry || { lat: 0, lng: 0 };
  return coordinates;
};
