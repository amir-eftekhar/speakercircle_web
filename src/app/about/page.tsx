import { COMPANY_INFO } from '@/lib/constants';
import FallbackImage from '@/components/fallback-image';

export default function AboutPage() {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">About SpeakersCircle</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg mb-6">
          SpeakersCircle is dedicated to equipping youth with essential communication skills and leadership abilities.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 my-12 p-6 bg-primary/5 rounded-lg">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-primary">Our Mission</h2>
            <p>
              {COMPANY_INFO.mission}
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-primary">Our Vision</h2>
            <p>
              {COMPANY_INFO.vision} SpeakersCircle provides the opportunities to learn and practice communication and leadership skills. Beyond communication, SpeakersCircle is a community where you make lifelong friends, build a strong network, and gain invaluable guidance from mentors.
            </p>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold mt-16 mb-8 text-center">Our Leaders</h2>
        
        <div className="bg-secondary/5 p-8 rounded-lg mb-12">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/3">
              <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-primary">
                <FallbackImage 
                  src="/shalini.png" 
                  alt="Shalini Suravarjjala" 
                  width={256} 
                  height={256} 
                  className="object-cover"
                  fallbackText="Shalini S."
                />
              </div>
              <h3 className="text-2xl font-bold text-center mt-4">Shalini Suravarjjala</h3>
              <p className="text-center text-primary font-medium">Director and Founder</p>
            </div>
            
            <div className="md:w-2/3">
              <blockquote className="italic text-lg mb-6 border-l-4 border-primary pl-4">
                "Empowering youth with the confidence to speak, the clarity to lead, and the courage to inspire—because your voice is your superpower"
              </blockquote>
              
              <p className="mb-4">
                I am a software engineer by profession. I teach youth to communicate confidently and effectively in speech, conversations, emails, phone calls, and social media. Helping them lead in their clubs, schools, job searches, interviews, and beyond.
              </p>
              
              <p className="mb-4">
                I am a positive inspiration to both my own children and the youth students. My ability to teach through relatable analogies and examples. I work with patience and adaptability in teaching communication, leadership, and technology. I encourage students to express their opinions and feelings confidently with clarity, support them to embrace their unique voices, and pay it forward by mentoring others. I am deeply committed to making a difference in the lives of youth.
              </p>
              
              <p className="mb-4">
                My success lies in seeing students improve and become better versions of themselves, embracing confidence, and using their voices to create a positive impact. Success is also seeing my lessons inspire future generations and witnessing students pass on what they've learned by mentoring others.
              </p>
              
              <h4 className="text-xl font-semibold mt-8 mb-4">Power of Mentorship</h4>
              <p className="mb-4">
                The most important lesson is that every individual has the power to make a positive impact if they embrace their voice, believe in themselves, and focus on lifting others. Small acts of mentorship and encouragement can create a ripple effect of growth and transformation.
              </p>
              
              <p>
                At SpeakersCircle, I believe every student has unique strengths and challenges. My expertise lies in identifying their strengths and using them to guide them to overcome obstacles and challenges. With the right guidance, even a single step in the right direction can set them on the path to achieving their goals. I believe a mentor can listen, guide and help a student carve their specific vision. You make lifelong friends, build a network, and gain from your mentor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
