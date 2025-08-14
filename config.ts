// eslint-disable-next-line prefer-const
export let config = {
  password: '12345', // Изначальный пароль
};

export const updateConfigPassword = (newPassword: string) => {
  config.password = newPassword;
  return config;
};
