/**
 * Script to clean duplicate entries in .env.local file
 * This will keep only the last occurrence of each key
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');

console.log('🧹 Cleaning .env.local file...\n');

try {
    // Read the file
    const content = fs.readFileSync(envPath, 'utf-8');
    const lines = content.split('\n');

    const envMap = new Map();
    const comments = [];

    // Parse lines
    for (const line of lines) {
        const trimmedLine = line.trim();

        // Preserve empty lines and comments
        if (!trimmedLine || trimmedLine.startsWith('#')) {
            comments.push(line);
            continue;
        }

        // Parse key=value
        const equalIndex = trimmedLine.indexOf('=');
        if (equalIndex > 0) {
            const key = trimmedLine.substring(0, equalIndex).trim();
            const value = trimmedLine.substring(equalIndex + 1);

            if (envMap.has(key)) {
                console.log(`⚠️  Found duplicate: ${key}`);
                console.log(`   Old value: ${envMap.get(key)}`);
                console.log(`   New value: ${value}`);
                console.log(`   → Keeping the new value\n`);
            }

            envMap.set(key, value);
        }
    }

    // Build clean content
    const cleanLines = [];

    // Add comments first
    if (comments.length > 0) {
        cleanLines.push(...comments.filter(c => c.trim()));
        if (cleanLines.length > 0 && cleanLines[cleanLines.length - 1] !== '') {
            cleanLines.push('');
        }
    }

    // Add unique key-value pairs
    for (const [key, value] of envMap.entries()) {
        cleanLines.push(`${key}=${value}`);
    }

    // Write back to file
    const cleanContent = cleanLines.join('\n') + '\n';
    fs.writeFileSync(envPath, cleanContent, 'utf-8');

    console.log('✅ Successfully cleaned .env.local!');
    console.log(`📊 Total unique keys: ${envMap.size}`);
    console.log('\n📝 Final content:');
    console.log('─'.repeat(50));
    console.log(cleanContent);
    console.log('─'.repeat(50));

} catch (error) {
    if (error.code === 'ENOENT') {
        console.error('❌ Error: .env.local file not found!');
    } else {
        console.error('❌ Error cleaning .env.local:', error.message);
    }
    process.exit(1);
}
