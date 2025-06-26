import os from 'os';

const getLocalIpAddress = (): string[] => {
  const interfaces = os.networkInterfaces();
  const ipAddresses: string[] = [];

  for (const key in interfaces) {
    const ifaceList = interfaces[key];
    if (!ifaceList) continue;

    for (const iface of ifaceList) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ipAddresses.push(iface.address);
        break;
      }
    }
  }

  return ipAddresses;
};

export default getLocalIpAddress;
