import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar, Users, Award, Phone, Mail, MapPin } from 'lucide-react';
import { CONTACT_INFO, COMPANY_INFO, STRIPE_LINKS } from '@/lib/constants';

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative py-20 md:py-24 lg:py-32 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
              {COMPANY_INFO.tagline}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {COMPANY_INFO.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-11 px-8 font-medium"
              >
                Join Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background h-11 px-8 font-medium"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Regular Events</h3>
              <p className="text-muted-foreground">
                Weekly speaking opportunities and workshops to help you grow.
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Expert Mentorship</h3>
              <p className="text-muted-foreground">
                Learn from experienced speakers and communication experts.
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Skill Development</h3>
              <p className="text-muted-foreground">
                Structured programs to develop your public speaking abilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Get in Touch
            </h2>
            <p className="mt-4 text-muted-foreground">
              Have questions? We're here to help you on your journey.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center space-y-4 p-6 rounded-lg border">
              <Phone className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">Phone</h3>
              <a href={`tel:${CONTACT_INFO.phone}`} className="text-muted-foreground hover:text-primary">
                {CONTACT_INFO.phone}
              </a>
            </div>
            <div className="flex flex-col items-center space-y-4 p-6 rounded-lg border">
              <Mail className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">Email</h3>
              <a href={`mailto:${CONTACT_INFO.email}`} className="text-muted-foreground hover:text-primary">
                {CONTACT_INFO.email}
              </a>
            </div>
            <div className="flex flex-col items-center space-y-4 p-6 rounded-lg border">
              <MapPin className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">Address</h3>
              <p className="text-muted-foreground text-center">
                San Francisco Bay Area
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            Ready to Start Your Journey?
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Join our community today and take the first step towards becoming a confident public speaker.
          </p>
          <div className="mt-8">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-11 px-8 font-medium"
            >
              Join Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Banner Section */}
      <section className="w-full py-8">
        <div className="w-full relative h-[200px] md:h-[300px] lg:h-[400px]">
          <Image 
            src="/banner.png" 
            alt="SpeakersCircle Banner" 
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>
    </main>
  );
}
