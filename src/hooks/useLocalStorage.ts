import { useState, useEffect } from 'react'

// ローカルストレージを使用して状態を永続化するカスタムフック
export const useLocalStorage = <T>(key: string, initialValue: T): [T, (value: T) => void] => {
  // ローカルストレージから値を取得する関数
  const getStoredValue = (): T => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`ローカルストレージから${key}の値を取得できませんでした:`, error)
      return initialValue
    }
  }

  // 状態を初期化
  const [storedValue, setStoredValue] = useState<T>(getStoredValue)

  // 状態が変更されたときにローカルストレージを更新
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.error(`ローカルストレージに${key}の値を保存できませんでした:`, error)
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue]
}