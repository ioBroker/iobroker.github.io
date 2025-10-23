const fs = require('node:fs').promises;
const path = require('node:path');

async function copyDir(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            await copyDir(srcPath, destPath);
        } else if (entry.isSymbolicLink()) {
            const target = await fs.readlink(srcPath);
            try {
                await fs.symlink(target, destPath);
            } catch {
                // If symlink
                await fs.copyFile(srcPath, destPath);
            }
        } else {
            await fs.copyFile(srcPath, destPath);
        }
    }
}

(async () => {
    const src = path.resolve(__dirname, 'type-detector/build'); // `./build`
    const dest = path.resolve(__dirname, '..', 'type-detector'); // `../../type-detector`

    try {
        // Clear the directory
        await fs.rm(dest, { recursive: true, force: true });
        // Copy
        await copyDir(src, dest);
        console.log(`Copied \`${src}\` → \`${dest}\``);
    } catch (err) {
        console.error('Fehler beim Kopieren:', err);
        process.exitCode = 1;
    }
})();
