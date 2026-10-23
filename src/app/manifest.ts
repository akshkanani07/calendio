import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Calendio - Smart Scheduling',
    short_name: 'Calendio',
    description: '100% Free Appointment Scheduling & Meeting Management Platform',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#0069FF',
    orientation: 'portrait-primary',
    scope: '/',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'New Event Type',
        url: '/event-types?new=true',
        description: 'Create a new meeting link',
      },
      {
        name: 'Scheduled Events',
        url: '/bookings',
        description: 'View upcoming appointments',
      },
      {
        name: 'Availability Hours',
        url: '/availability',
        description: 'Manage working schedule',
      },
    ],
  };
}