const openBrowserBasedOnOS = (url : string) => {
  const { platform } = process;
  const { exec } = require('child_process');

  let command;

  switch (platform) {
    case 'win32':
      command = `start ${url}`;
      break;
    case 'darwin':
      command = `open ${url}`;
      break;
    case 'linux':
      command = `xdg-open ${url}`;
      break;
    default:
      console.log(`Unsupported platform: ${platform}`);
      return;
  }

  exec(command, (error: any) => {
    if (error) {
      console.error(`Error opening browser: ${error}`);
    }
  });
}

export default openBrowserBasedOnOS;
