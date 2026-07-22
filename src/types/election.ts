export interface ElectionInfo {
  _id: string
  electionName: string
  electionDate: string
  electionType: 'pru' | 'prn'
  regionType: 'parlimen' | 'dun'
  geoJsonFile?: string
  apiEndpoint?: string
  isActive: boolean
  summary?: string
  states?: StateResult[]
}

export interface StateResult {
  name: string
  party: string
  seats: number
  result: string
}

export interface ElectionRegion {
  code: string
  name: string
  state: string
  lat: number
  lng: number
}

export interface SentimentData {
  score: number
  label: string
  summary: string
  updatedAt: string
}

export interface PredictionData {
  candidateName: string
  party: string
  winRate: number
  factors: string
  generatedAt: string
}

export interface RegionWithData extends ElectionRegion {
  sentiment: SentimentData | null
  predictions: PredictionData[] | null
}
