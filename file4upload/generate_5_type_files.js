// this script will generate 5 files with different sizes, 1KB, 10KB, 100KB, 1MB, 10MB
const fs = require('fs');

const sizes = [1, 10, 100, 1024, 10240]; // KB sizes
const buffer = Buffer.alloc(1024, 'A'); // 1KB buffer filled with 'A'

sizes.forEach((size, index) => {
  const fileName = `file${index + 1}.txt`;

  // Create or overwrite the file
  fs.writeFileSync(fileName, '');

  // Append 1KB buffer 'size' times
  for (let i = 0; i < size; i++) {
    fs.appendFileSync(fileName, buffer);
  }

  console.log(`File ${fileName} created with size ${size}KB`);
});
