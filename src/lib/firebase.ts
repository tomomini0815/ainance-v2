// Firebaseの設定を一時的に無効化しました
// 必要に応じてFirebaseプロジェクトの設定を追加してください

// Initialize Firebase (ダミーの初期化)
const app = {
  name: '[DEFAULT]',
  options: {}
};

// Firebase Authenticationのダミー
export const auth = {
  currentUser: null,
  onAuthStateChanged: () => {},
  signOut: () => Promise.resolve()
};

// Google Auth Providerのダミー
export const googleProvider = {};

export default app;