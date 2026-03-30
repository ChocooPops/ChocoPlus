export interface StaffModel {
    id: number,
    fullName: string,
    fullNameCharacter ?: string,
    job: 'ACTOR' | 'DIRECTOR'
}