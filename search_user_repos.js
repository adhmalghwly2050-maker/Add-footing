import fs from 'fs';
import https from 'https';

const USER = "adhmalghwly2050-maker";
const REPOS = [
  "Analysis-and-design-ribbed-slab",
  "Add-ribbed-slab",
  "Add-ribbed-slab-column-hight",
  "after-correct-mid-mom-in-beams-and-plans-of-stories-",
  "after-fix-pos-and-neg-moment-in-column-and-beams-and-fix-selenderness",
  "All-ok",
  "backup-bridge-pro",
  "beam-balance-fixer"
];

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: { 'User-Agent': 'NodeJS-SearchScript' }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
        } else {
          resolve(null); // Return null on non-existing or empty repo trees
        }
      });
    }).on('error', () => resolve(null));
  });
}

function downloadFile(rawUrl, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(rawUrl, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function search() {
  const targetFile = "symmetryValidation.ts";
  console.log(`Searching for ${targetFile} across user repositories...`);
  
  for (const repo of REPOS) {
    const treeUrl = `https://api.github.com/repos/${USER}/${repo}/git/trees/main?recursive=true`;
    console.log(`Checking tree of ${repo}...`);
    const repoInfo = await fetchJSON(treeUrl);
    
    if (repoInfo && repoInfo.tree) {
      const match = repoInfo.tree.find(item => item.path.endsWith(targetFile));
      if (match) {
        console.log(`FOUND ${targetFile} inside ${repo} at path ${match.path}!`);
        const rawUrl = `https://raw.githubusercontent.com/${USER}/${repo}/main/${match.path}`;
        const localPath = `./src/slabFEMEngine/symmetryValidation.ts`;
        await downloadFile(rawUrl, localPath);
        console.log(`Successfully downloaded ${targetFile} to ${localPath}`);
        return;
      }
    }
  }
  console.log(`Could not find ${targetFile} in any known repo.`);
}

search();
