## リポジトリをプライベートリポジトリでフォークする方法

GitHub で公開されているリポジトリをフォークしてリポジトリを作成すると、プライベートリポジトリにすることができません。
以下の手順でプライベートリポジトリとしてフォークすることができます。

1. 新しい空のプライベートリポジトリを作成します
2. 作ったプライベートリポジトリの URL をコピーします
3. ローカルにリポジトリをクローンします
   ```bash
   git clone https://github.com/CyberAgentHack/web-speed-hackathon-2025.git
   ```
4. リポジトリのリモートリポジトリをプライベートリポジトリに変更します
   ```bash
   git remote set-url origin [コピーしたプライベートリポジトリの URL]
   ```
5. リモートリポジトリをプライベートリポジトリに変更したことを確認します
   ```bash
   git remote -v
   ```
6. プライベートリポジトリにプッシュします
   ```bash
   git push origin main
   ```

## 大会中にオリジナルリポジトリ (CyberAgentHack/web-speed-hackathon-2025) 側へ変更が入った時

大会中にオリジナルリポジトリ (CyberAgentHack/web-speed-hackathon-2025) 側へ変更が入った場合、プライベートリポジトリに変更を取り込む方法を説明します。
この操作は**必ず`git status`でコミットしていない変更がないことを確認**してから行ってください。

1. ローカルリポジトリで変更を取り込むために、リモートリポジトリを追加します
   ```bash
   git remote add upstream https://github.com/CyberAgentHack/web-speed-hackathon-2025.git
   ```
2. リモートリポジトリが追加されたことを確認します
   ```bash
   git remote -v
   ```
3. 変更を取り込みたいブランチへ移動します
   ```bash
    git checkout [ブランチ名]
   ```
4. リモートリポジトリから最新の変更を取得します
   ```bash
    git fetch upstream
   ```
5. ローカルリポジトリのメインブランチを最新の変更に更新します
   ```bash
    git merge upstream/main
   ```
6. プライベートリポジトリに変更が反映されたことを確認します
   ```bash
    git log
   ```
