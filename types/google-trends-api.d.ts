declare module 'google-trends-api' {
  export function interestOverTime(options: {
    keyword: string
    startTime?: Date
    endTime?: Date
    geo?: string
    hl?: string
    timezone?: number
    category?: number
  }): Promise<string>

  export function interestByRegion(options: {
    keyword: string
    startTime?: Date
    endTime?: Date
    geo?: string
    hl?: string
    timezone?: number
    resolution?: string
  }): Promise<string>

  export function relatedQueries(options: {
    keyword: string
    startTime?: Date
    endTime?: Date
    geo?: string
    hl?: string
    timezone?: number
  }): Promise<string>
}
