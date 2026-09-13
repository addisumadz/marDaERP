// Assuming this function is used to return the authorization headers
export default function authHeader(token) {
  return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' // Add this line
  };
}
 