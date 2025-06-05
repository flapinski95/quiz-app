import keycloak from "@/lib/keycloak";

export default async function uploadAvatar(file) {
    const res = await fetch('/api/users/avatar-signature', {
      headers: { Authorization: `Bearer ${keycloak.token}` }
    });
    const { timestamp, signature, apiKey, cloudName } = await res.json();
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
  
    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });
  
    const data = await uploadRes.json();
    return data.secure_url; 
  }