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

export interface CandidateData {
  name: string
  party: string
  partyLogo: string
  role: 'penyandang' | 'pencabar'
  profile?: string
  wikipediaUrl?: string
  newsSource?: string
  newsUrl?: string
  lastElection?: {
    year: number
    votes: number
    majority: number
    percentage: number
    totalVoters: number
    turnout: number
  }
}

export interface HistoricalElectionResult {
  year: number
  electionName: string
  candidates: {
    name: string
    party: string
    votes: number
    percentage: number
    result: string
  }[]
  winner: string
  winnerParty: string
  majority: number
  totalVoters?: number
  turnout?: number
}

export interface HistoricalDemographics {
  year: number
  malay: number
  chinese: number
  indian: number
  others: number
  totalElectors: number
  maleElectors?: number
  femaleElectors?: number
  medianIncome?: number
  gini?: number
  poverty?: number
}

export interface SeatHistory {
  code: string
  name: string
  state: string
  elections: HistoricalElectionResult[]
  demographics: HistoricalDemographics[]
}

export interface SentimentData {
  score: number
  label: string
  source: string
  summary: string
  topIssue?: string
  partySentiment?: Record<string, number>
  updatedAt: string
}

export interface SocialComment {
  platform: 'tiktok' | 'twitter' | 'facebook'
  username: string
  comment: string
  sentiment: 'positif' | 'neutral' | 'negatif'
  likes: number
  timestamp: string
}

export interface SocialCommentsData {
  items: SocialComment[]
  totalComments: number
  sentimentSummary: {
    positif: number
    neutral: number
    negatif: number
  }
  updatedAt: string
}

export interface RegionWithData extends ElectionRegion {
  candidates: CandidateData[]
  sentiment: SentimentData | null
  comments?: SocialCommentsData | null
  demographics: {
    malay: number
    chinese: number
    indian: number
    others: number
    orang_asli?: number
    medianIncome?: number
    meanIncome?: number
    gini?: number
    poverty?: number
    totalElectors?: number
    maleElectors?: number
    femaleElectors?: number
    ethnicity?: string
    age_18_29?: number
    age_30_39?: number
    age_40_49?: number
    age_50_59?: number
    age_60_plus?: number
  }
  history?: SeatHistory
}
