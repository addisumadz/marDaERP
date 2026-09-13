/**
 * The URL of your Spring Boot backend.
 * It's recommended to use environment variables for this in a real application.
 */
const API_BASE_URL = "/backend"; // Use Next.js rewrite proxy to route to the backend

/**
 * Uploads a CSV file to the Spring Boot backend.
 * @param {File} file The CSV file to upload.
 * @returns {Promise<string>} A promise that resolves with the success message from the backend.
 * @throws Will throw an error if the upload fails.
 */
export const uploadCsvFile = async (file) => {
  // Create a FormData object to send the file
  const formData = new FormData();

  // The key 'file' MUST match the @RequestParam("file") in your Spring controller
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/card_managenment/upload`, {
    method: "POST",
    body: formData,
    // IMPORTANT: Do NOT set the 'Content-Type' header yourself.
    // The browser will automatically set it to 'multipart/form-data'
    // with the correct boundary when you use FormData.
  });

  // The backend returns a plain text response, so we use .text()
  const responseBody = await response.text();

  if (!response.ok) {
    // If the server response is not OK, throw an error with the response body
    throw new Error(responseBody || "File upload failed");
  }

  return responseBody;
};
