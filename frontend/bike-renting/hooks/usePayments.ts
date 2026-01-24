import { useCallback, useEffect, useState } from "react"
import { fetchUserInfo } from "@/services/userService"
import { addBalance as addBalanceApi } from "@/services/paymentService"

export const usePayments = () => {
  const [balance, setBalance] = useState<number>(0)
  const [debt, setDebt] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const info = await fetchUserInfo()
      if (!info) throw new Error("Не удалось загрузить данные пользователя")
      setBalance(info.balance)
      setDebt(info.debt)
    } catch (e: any) {
      setError(e?.message ?? "Не удалось загрузить баланс")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const addBalance = useCallback(
    async (amount: number) => {
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Введите корректную сумму")
      }

      setIsLoading(true)
      setError(null)

      try {
        await addBalanceApi(amount)
        await reload() // синхронизация после операции
      } catch (e: any) {
        setError(e?.message ?? "Не удалось пополнить баланс")
        throw e
      } finally {
        setIsLoading(false)
      }
    },
    [reload],
  )

  return { balance, debt, isLoading, error, reload, addBalance }
}
