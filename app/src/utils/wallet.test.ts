import { stacksPrivateKeyToAddress } from '@stacks/transactions';

export function generateWallet() {
  // Generar clave privada aleatoria para pruebas
  const privateKey = '00'.repeat(32); // Placeholder
  const address = stacksPrivateKeyToAddress(privateKey);
  return { privateKey, address };
}

export function formatAddress(address: string): string {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export function isValidAddress(address: string): boolean {
  return address.startsWith('SP') || address.startsWith('ST');
}
