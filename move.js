import fs from 'fs';
import path from 'path';

function copyDirStructure(srcDir, destDir) {
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    const unhidden = fs.readdirSync(srcDir);
    // including hidden files
    const allFiles = fs.readdirSync(srcDir, { withFileTypes: true });

    for (const ent of allFiles) {
        const srcPath = path.join(srcDir, ent.name);
        const destPath = path.join(destDir, ent.name);

        if (ent.name === '.git' || ent.name === 'node_modules') continue;

        if (ent.isDirectory()) {
            copyDirStructure(srcPath, destPath);
        } else {
            console.log(`Copying ${srcPath} -> ${destPath}`);
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

copyDirStructure('./tmp_repo', './');
