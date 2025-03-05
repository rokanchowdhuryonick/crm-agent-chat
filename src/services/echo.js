'use client';

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echoInstance = null;

// Create a function to initialize Echo with the auth token
export const initEcho = (token) => {
  // Only run in browser environment
  if (typeof window === 'undefined') {
    console.warn('Echo initialization skipped on server');
    return null;
  }
  
  // Make Pusher available globally (only in browser)
  window.Pusher = Pusher;
  
  echoInstance = new Echo({
    broadcaster: 'pusher',
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
    cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || 'mt1',
    forceTLS: true,
    authorizer: (channel) => {
      return {
        authorize: (socketId, callback) => {
          const options = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
            body: JSON.stringify({
              socket_id: socketId,
              channel_name: channel.name,
            }),
          };
          
          fetch(`${process.env.NEXT_PUBLIC_API_HOST_URL}/broadcasting/auth`, options)
            .then(response => response.json())
            .then(data => {
              callback(null, data);
            })
            .catch(error => {
              callback(error);
            });
        },
      };
    },
  });
  
  return echoInstance;
};

export const getEcho = () => {
  // Only access echoInstance in browser environment
  if (typeof window === 'undefined') {
    return null;
  }
  return echoInstance;
};