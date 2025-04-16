export interface AgentInvitations {
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
    key: string
    name: string
    status: string
    priority: string
    getStarted: string
    getStartedStep: string
    approvalNotes: string
    type: string
    logoUrl: any
    website: string
    address: string
    city: string
    state: string
    country: string
    zipcode: string
    email: string
    phoneNumber: string
    licenseNumber: string
    invitedBy: string
    createdAt: string
    updatedAt: string
    isControlVisible?: boolean // for UI purpose, need to add in BE aswell
  }
  