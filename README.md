# feedback around

# 初期セットアップ

## 環境構築

- Node.js の V12 系が構築されている前提です。

```
# 作業したいディレクトリに移動
cd 作業ディレクトリ

# クローン
git clone https://github.com/ready-code/pj-omeroid-1th

# パッケージインストール
yarn install
    or
npm i
```

## ローカル実行

いつものコマンドです

```
yarn dev
    or
npm run dev
```

**Chromeのdeveloper modeの画面サイズは HiDPIスクリーンでくずれないようにしましょう。1440×900 サイズ**

## .env の設定

- ルートディレクトリに`env/.env.dev`ファイルを作成し、環境変数を制御する
- env ファイルの中身は別途共有します。

# 開発手順

1. issue発行
- GitHubでissueを作成します。テンプレが用意してあるのでその記載内容に従います。

2. ブランチつくる
- feature/#issue番号_動詞_作業内容　の規則でブランチを local で作成します。例: feature/#20_fix_readme
- ブランチ名の動詞参考。https://qiita.com/shikichee/items/a5f922a3ef3aa58a1839#%E9%A0%BB%E5%87%BA%E5%8B%95%E8%A9%9Etop20

3. 開発
- local で開発を行います。
- commit して GitHub に Push します。
- コミットは何を作業したのか簡潔にわかりやすく書きましょう。日本語でOK

4. PR 作成
- マージ対象の develop ブランチとコンフリクトしている場合は、作業ブランチを develop に rebase して local でコンフリクトを解消し、GitHub 上でマージできるようにしてください
- PR のレビュワーを小川の設定してください。**自分ではマージしないように**
- PRには最低限以下の項目を記載しましょう
```
## やったこと
- プレゼンテーション一覧画面の実装

## 動作確認（キャプチャがあるとなおよい）
- 画面表示されたときに一覧が表示されること
- レイアウトが崩れていないこと

## 懸念点
- 通信部分の処理の書き方が正しいかわからない
- データ量が多かったときの対応

## その他
```

5. マージしてもらう
6. 完了
