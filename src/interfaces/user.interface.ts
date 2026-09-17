export interface UserState {
    _id: string
    firebaseUUID: String,
    name: string,
    email: string,
    picture: string,
    planId: string
    "credits":number,
    "totalCredits": number,
    "planExpiresAt":Date|null,
    isFreeEnd:boolean
}