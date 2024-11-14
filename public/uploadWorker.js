const { parentPort } = require("worker_threads");

function aHeavyTask() {
  let sum = 0;
  for (let i = 1; i <= 10000000000; i++) {
    sum += i;
  }
  return sum;
}

const result = aHeavyTask();
parentPort.postMessage(result);     