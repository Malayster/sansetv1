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
  partyFlag: string
  photo: string
  role: 'penyandang' | 'pencabar'
  lastElection?: {
    year: number
    votes: number
    majority: number
    percentage: number
    totalVoters: number
    turnout: number
  }
}

export interface SentimentData {
  score: number
  label: string
  source: string
  summary: string
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
  comments: SocialCommentsData | null
  demographics: {
    malay: number
    chinese: number
    indian: number
    others: number
  }
}
