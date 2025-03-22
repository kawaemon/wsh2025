import fs from 'fs/promises';
import zlib from 'zlib';
import path from 'path';
import { pipeline } from 'stream/promises';
import { fileURLToPath } from 'url';

// 圧縮対象ディレクトリ
const TARGET_DIR = './dist';

// ファイルパス変換（ESM用）
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const targets = ['.js', '.css'];

// 圧縮関数
const compressFile = async (filePath: string) => {
  // .brファイル生成
  const brotli = zlib.createBrotliCompress({
    params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 },
  });
  const brFile = `${filePath}.br`;
  const br = pipeline(
    await fs.open(filePath, 'r').then((f) => f.createReadStream()),
    brotli,
    // @ts-expect-error ....................
    await fs.open(brFile, 'w').then((f) => f.createWriteStream()),
  );

  // .gzファイル生成
  const gzip = zlib.createGzip({ level: 9 });
  const gzFile = `${filePath}.gz`;
  const gz = pipeline(
    await fs.open(filePath, 'r').then((f) => f.createReadStream()),
    gzip,
    // @ts-expect-error ....................
    await fs.open(gzFile, 'w').then((f) => f.createWriteStream()),
  );

  await Promise.all([br, gz]);

  console.log(`Compressed: ${filePath}`);
};

// 再帰的にファイルを処理
const processFiles = async (dir: string) => {
  const files = await fs.readdir(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      await processFiles(fullPath);
    } else if (targets.some((x) => file.endsWith(x))) {
      await compressFile(fullPath);
    }
  }
};

// 実行
const main = async () => {
  const targetPath = path.join(__dirname, TARGET_DIR);
  await processFiles(targetPath);
};

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
