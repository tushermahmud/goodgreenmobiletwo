export interface AgentAffiliations {
    agent: Agent
    affiliations: Affiliation[]
  }
  
  export interface Agent {
    id: string
    key: string
    platformAccountId: number
    loginOtp: any
    resetOtp: any
    validateOtp: string
    isActive: boolean
    createdAt: string
    updatedAt: string
  }
  
  export interface Affiliation {
    id: string
    name: string
    key: string
    logoUrl: any
    status: string
    accountType: string
    accountPriority: string
    founderId: string
    website: string
    address: string
    city: string
    state: string
    country: string
    zipcode: string
    email: string
    phoneNumber: string
    licenseNumber: string
    getStartedStatus: string
    getStartedStep: string
    approvalNotes: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    slug: string
  }
  