// Hardcoded data - exact same pattern as examples/cvi-frontend-backend-tools/hack-cvi-shop/src/store/products.json
export const SIMPLE_SPEAKERS = [
  {
    id: 'dr-chen',
    name: 'Dr. Sarah Chen',
    title: 'Lead Nuclear Verification Scientist',
    photo: '/api/placeholder/150/150', // Placeholder for now
    session: { room: 'main-auditorium', time: '09:30' }
  },
  {
    id: 'prof-martinez', 
    name: 'Prof. Elena Martinez',
    title: 'Radionuclide Monitoring Director',
    photo: '/api/placeholder/150/150',
    session: { room: 'conference-room-a', time: '11:00' }
  },
  {
    id: 'dr-wilson',
    name: 'Dr. James Wilson',
    title: 'Seismic Data Analysis Expert',
    photo: '/api/placeholder/150/150',
    session: { room: 'conference-room-b', time: '14:30' }
  }
  // Just 3 speakers initially
];

export const SIMPLE_VENUES = [
  {
    id: 'main-auditorium',
    name: 'Main Auditorium',
    mapImage: '/src/assets/hofburg-plan.jpg', // Use existing asset
    walkingTime: '2 minutes'
  },
  {
    id: 'conference-room-a', 
    name: 'Conference Room A',
    mapImage: '/src/assets/hofburg-plan.jpg', // Same image for now
    walkingTime: '3 minutes'
  },
  {
    id: 'conference-room-b',
    name: 'Conference Room B', 
    mapImage: '/src/assets/hofburg-plan.jpg', // Same image for now
    walkingTime: '4 minutes'
  }
  // Just 3 venues initially
]; 