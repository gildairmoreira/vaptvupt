import { ProviderData } from './database';

// Esta função simularia o povoamento do banco com prestadores próximos
export const seedMockProviders = async (lat: number, lng: number): Promise<boolean> => {
  console.log(`Seeding providers around ${lat}, ${lng}...`);
  // Em um cenário real, faríamos inserts no Supabase
  // Aqui apenas simulamos o delay para o UX
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1500);
  });
};
