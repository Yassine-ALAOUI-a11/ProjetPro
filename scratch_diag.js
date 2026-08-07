const url = 'https://anlchyfemtgpptuzetpe.supabase.co/rest/v1/contributions?select=type,nature&limit=20';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFubGNoeWZlbXRncHB0dXpldHBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjcwMTksImV4cCI6MjA5MzUwMzAxOX0.1HzF-K8x02etCMIQEGl12mdJ48BVWLMJWXNGwffUrzc';

fetch(url, {
  headers: {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`
  }
})
.then(res => res.json())
.then(data => {
  console.log('Resulting contribution records:');
  console.log(JSON.stringify(data, null, 2));
})
.catch(err => console.error('Error fetching contributions:', err));
