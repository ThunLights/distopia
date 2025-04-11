# Contribution Guide

## 依存関係のインストール

```console
bun install
```

## .envの作成

.env.exampleをコピーして.envを作成してください。

その際に必要な情報(Bot Tokenなど)を入力してください。

## Setup

```console
npm run setup
```

上記のコマンドでDBのマイグレーションとビルドを同時に行う事が出来ます。

## Pull Requests

プルリクエスト前に以下のコマンドを実行してエラーが出ないかどうか確認をしてください

```console
npm run ci
npm run lint
npm run check
```

## ツール

#### Formatter

```console
npm run format
```
