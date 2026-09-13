export default function getToken() {

    let session = 'eeeee';
    if (typeof window !== "undefined") {

         session = JSON.parse(localStorage.getItem('user_token'));

 
    }
    return session;
}