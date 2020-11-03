const { spawn } = require('child_process');
const child = spawn('../generator/ecgsyn -c configs/config');

child.stdout.on('data', (data) => {
  console.log(`child stdout:\n${data}`);
});