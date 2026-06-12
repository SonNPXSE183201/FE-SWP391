const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectDir = 'c:\\Users\\Admin\\Downloads\\FEMangaka391';
const lucideDir = path.join(projectDir, 'node_modules', 'lucide-react');
const lockFile = path.join(projectDir, 'package-lock.json');

console.log('Step 1: Removing lucide-react folder...');
try {
  if (fs.existsSync(lucideDir)) {
    fs.rmSync(lucideDir, { recursive: true, force: true });
    console.log('✓ lucide-react folder removed');
  } else {
    console.log('✓ lucide-react folder does not exist');
  }
} catch (e) {
  console.error('Error removing folder:', e.message);
}

console.log('\nStep 2: Removing package-lock.json...');
try {
  if (fs.existsSync(lockFile)) {
    fs.unlinkSync(lockFile);
    console.log('✓ package-lock.json removed');
  }
} catch (e) {
  console.error('Error removing lock file:', e.message);
}

console.log('\nStep 3: Running npm install...');
try {
  process.chdir(projectDir);
  execSync('npm install', { stdio: 'inherit', shell: true });
  console.log('✓ npm install completed');
} catch (e) {
  console.error('Error installing packages:', e.message);
}

console.log('\nDone!');
