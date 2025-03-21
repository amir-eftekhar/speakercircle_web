import { PrismaClient } from '@prisma/client'

declare global {
  namespace PrismaJson {
    type PrismaClientOptions = any
  }
}

declare module '@prisma/client' {
  interface PrismaClient {
    assignmentSubmission: any
    classAnnouncement: any
    classCurriculumItem: any
    classMessage: any
    notification: any
    parentChild: any
    payment: any
    eventRegistration: any
    event: any
    curriculumItem: any
    enrollment: any
    class: any
    mentorProfile: any
    socialMedia: any
    stripeProduct: any
    testimonial: any
    newsletter: any
    announcement: any
    user: any
  }
}
