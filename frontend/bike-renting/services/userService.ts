import { api } from "@/api/client"
import { z } from "zod"

const UserInfoDtoSchema = z.object({
  username: z.string(),
  balance: z.number(),
  debt: z.number(),
})

export type UserResponse = z.infer<typeof UserInfoDtoSchema>

/**
 * Получить информацию о текущем пользователе.
 * Возвращает null, если:
 * - запрос упал (401/500/сеть)
 * - или ответ не соответствует ожидаемой схеме
 */
export const fetchUserInfo = async (): Promise<UserResponse | null> => {
  try {
    const res = await api.get("/auth/info")
    const parsed = UserInfoDtoSchema.safeParse(res.data)
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}
