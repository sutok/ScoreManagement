#!/usr/bin/env node

/**
 * アフィリエイトリンクをbase64エンコードするツール
 *
 * 使い方:
 * node scripts/encodeAffiliateLinks.js
 *
 * 既存のaffiliateLinks.jsonを読み込み、
 * 各エントリのcontentをbase64エンコードしてコンソールに出力します。
 */

const fs = require('fs');
const path = require('path');

// affiliateLinks.jsonのパス
const jsonPath = path.join(__dirname, '../src/config/affiliateLinks.json');

// JSONファイルを読み込む
const affiliateLinks = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// 各エントリをbase64エンコード
const encodedLinks = affiliateLinks.map((link) => {
  if (link.type === 'html' && link.content) {
    // contentをbase64エンコード
    const base64Content = Buffer.from(link.content, 'utf-8').toString('base64');

    return {
      ...link,
      encoding: 'base64',
      content: base64Content,
    };
  }
  return link;
});

// 結果を出力
console.log(JSON.stringify(encodedLinks, null, 2));

// ファイルに保存するか確認
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('\naffiliateLinks.jsonを上書きしますか？ (y/N): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    fs.writeFileSync(jsonPath, JSON.stringify(encodedLinks, null, 2), 'utf-8');
    console.log('✅ affiliateLinks.jsonを更新しました。');
  } else {
    console.log('❌ 更新をキャンセルしました。');
  }
  rl.close();
});
