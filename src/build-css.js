const fs = require('fs');
const path = require('path');

const rootDirectory = path.join(__dirname, '..');
const sourceDirectory = path.join(rootDirectory, 'src', 'page-styles');
const outputFile = path.join(rootDirectory, 'public', 'styles.css');
const pages = ['index', 'form-selection', 'form-player', 'settings'];
const globalStyles = fs.readFileSync(outputFile, 'utf8');
const pageStyles = pages.map(page =>
  fs.readFileSync(path.join(sourceDirectory, `${page}.css`), 'utf8')
);

fs.writeFileSync(outputFile, `${globalStyles}\n${pageStyles.join('\n')}`);
