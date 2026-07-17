import { ValueTransformer } from 'typeorm'

export const numericTransformer: ValueTransformer = {
  to: (value: number | null | undefined) => value,

  from: (value: string | null | undefined): number | null => {
    if (value === null || value === undefined) {
      return null
    }

    return Number(value)
  },
}