export default function authHeader(accessToken) {
  //console.log('authHeader called with token:', accessToken ? 'Token present (length: ' + accessToken.length + ')' : 'No token');
  
  if (accessToken) {
    return { Authorization: "Bearer " + accessToken }; // for Spring Boot back-end
  } else {
    //console.warn('No access token provided - request will be sent without Authorization header');
    return {};
  }
}