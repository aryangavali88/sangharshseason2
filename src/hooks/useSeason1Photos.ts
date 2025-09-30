import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Season1Photo {
  id: string;
  name: string;
  url: string;
  caption: string;
  category: string;
}

export const useSeason1Photos = () => {
  const [photos, setPhotos] = useState<Season1Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🎯 Fetching photos from season 1 photos bucket...');

        // Fetch ALL files from the season 1 photos bucket (no limit)
        let allFiles: any[] = [];
        let offset = 0;
        const pageSize = 100; // Fetch in batches of 100
        
        while (true) {
          const { data: files, error: listError } = await supabase.storage
            .from('season 1 photos')
            .list('', {
              limit: pageSize,
              offset: offset,
              sortBy: { column: 'name', order: 'asc' }
            });

          console.log(`📁 Storage list result (page ${Math.floor(offset/pageSize) + 1}):`, { files, listError });

          if (listError) {
            console.error('❌ List error:', listError);
            throw listError;
          }

          if (!files || files.length === 0) {
            break; // No more files to fetch
          }

          allFiles = [...allFiles, ...files];
          
          if (files.length < pageSize) {
            break; // Last page
          }
          
          offset += pageSize;
        }

        console.log(`📸 Total files found: ${allFiles.length}`);

        if (allFiles.length === 0) {
          console.log('📭 No files found in bucket, using local fallback images');
          
          // Use local fallback images when bucket is empty (excluding specified photos)
          const fallbackPhotos = [
            {
              id: 'tournament-1',
              name: 'trophy-presentation.jpg',
              url: '/lovable-uploads/a518e56d-0ede-4e56-b67c-07e06d47e680.png',
              caption: 'Trophy Presentation Ceremony',
              category: 'Victory'
            },
            {
              id: 'tournament-2',
              name: 'opening-ceremony.jpg',
              url: '/lovable-uploads/1324e894-4dde-4333-9caf-ed6370880029.png',
              caption: 'Tournament Opening Ceremony',
              category: 'Ceremony'
            },
            {
              id: 'tournament-3',
              name: 'officials-ground.jpg',
              url: '/lovable-uploads/4a609e7a-ac8b-4da8-b4ee-3fcd5659b317.png',
              caption: 'Officials at Cricket Ground',
              category: 'Ceremony'
            },
            {
              id: 'tournament-4',
              name: 'teams-group-photo.jpg',
              url: '/lovable-uploads/4a96bf87-de52-431c-a666-68054f100913.png',
              caption: 'Teams Group Photo',
              category: 'Team Spirit'
            },
            {
              id: 'tournament-5',
              name: 'pitch-ceremony.jpg',
              url: '/lovable-uploads/cc91b73b-f293-40b6-8ac3-6371f83d889b.png',
              caption: 'Pitch Opening Ceremony',
              category: 'Ceremony'
            },
            {
              id: 'tournament-6',
              name: 'indoor-meeting.jpg',
              url: '/lovable-uploads/9bca93af-e5e6-445f-aaaa-9354c8eb1b7b.png',
              caption: 'Tournament Planning Meeting',
              category: 'General'
            },
            {
              id: 'tournament-7',
              name: 'victory-celebration.jpg',
              url: '/lovable-uploads/bfb4ef1f-addf-44ef-8a50-c2036b81a192.png',
              caption: 'Victory Celebration',
              category: 'Victory'
            },
            {
              id: 'tournament-8',
              name: 'conference-hall.jpg',
              url: '/lovable-uploads/7d15af6e-1190-47b6-a7b6-dc004052f652.png',
              caption: 'Conference Hall Gathering',
              category: 'General'
            },
            {
              id: 'tournament-9',
              name: 'tournament-opening.jpg',
              url: '/lovable-uploads/4891e1a5-4252-49da-9f54-08b48dfb74be.png',
              caption: 'Tournament Opening Event',
              category: 'Ceremony'
            },
            {
              id: 'tournament-10',
              name: 'ground-ceremony.jpg',
              url: '/lovable-uploads/d0bca9b5-71aa-46e2-8fb4-91376a3205a0.png',
              caption: 'Ground Opening Ceremony',
              category: 'Ceremony'
            }
          ];
          
          setPhotos(fallbackPhotos);
          return;
        }

        console.log(`📸 Processing ${allFiles.length} files:`, allFiles.map(f => f.name));

        // Filter out folders and get only image files, excluding specific photos
        const excludedPhotos = new Set([
          'cricket-player-action.jpg',
          'cricket-stadium-hero.jpg', 
          'cricket-team-celebration.jpg',
          'cricket-trophy.jpg'
        ]);

        const imageFiles = allFiles.filter(file => 
          file.name && 
          !file.name.includes('/') && 
          !excludedPhotos.has(file.name.toLowerCase()) &&
          (file.name.toLowerCase().endsWith('.jpg') || 
           file.name.toLowerCase().endsWith('.jpeg') || 
           file.name.toLowerCase().endsWith('.png') || 
           file.name.toLowerCase().endsWith('.webp'))
        );

        console.log(`🖼️ Filtered image files (${imageFiles.length}):`, imageFiles.map(f => f.name));

        // Generate photo objects with public URLs
        const photoPromises = imageFiles.map(async (file, index) => {
          const { data: urlData } = supabase.storage
            .from('season 1 photos')
            .getPublicUrl(file.name);

          console.log(`🔗 Generated URL for ${file.name}:`, urlData.publicUrl);

          // Generate caption and category from filename
          const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
          const formattedName = nameWithoutExt
            .replace(/[-_]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          // Categorize based on keywords in filename
          let category = 'General';
          const filename = file.name.toLowerCase();
          if (filename.includes('trophy') || filename.includes('award') || filename.includes('win')) {
            category = 'Victory';
          } else if (filename.includes('bowl') || filename.includes('bat') || filename.includes('action')) {
            category = 'Performance';
          } else if (filename.includes('team') || filename.includes('group')) {
            category = 'Team Spirit';
          } else if (filename.includes('crowd') || filename.includes('stadium') || filename.includes('audience')) {
            category = 'Fans';
          } else if (filename.includes('ceremony') || filename.includes('presentation')) {
            category = 'Ceremony';
          }

          return {
            id: file.id || `photo-${index}`,
            name: file.name,
            url: urlData.publicUrl,
            caption: formattedName || `Season 1 Photo ${index + 1}`,
            category
          };
        });

        const photosData = await Promise.all(photoPromises);
        console.log(`✅ Final photos data (${photosData.length} photos):`, photosData);
        setPhotos(photosData);
      } catch (err) {
        console.error('Error fetching season 1 photos:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch photos');
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  return { photos, loading, error };
};