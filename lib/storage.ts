export const updateProfilePhoto = async (uid: string): Promise<string | null> => {
  // Mock para desenvolvimento: aguarda 1 seg e retorna um avatar aleatório
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`https://i.pravatar.cc/150?u=${uid}`);
    }, 1000);
  });
};
