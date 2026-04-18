import * as LocalAuthentication from 'expo-local-authentication';
import * as Keychain from 'react-native-keychain';

export const saveToken = async (token: string) => {
  await Keychain.setGenericPassword('auth', token);
};

export const getToken = async () => {
  try {
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      return credentials.password;
    }
    return null;
  } catch (err) {
    console.log('Keychain could not be accessed!', err);
    return null;
  }
};

export const clearToken = async () => {
  await Keychain.resetGenericPassword();
};

export const authenticateBiometric = async (): Promise<boolean> => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (!hasHardware || !isEnrolled) return false;

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Autenticação FinHub',
    fallbackLabel: 'Use senha',
  });

  return result.success;
};
