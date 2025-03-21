'use client';

import { useState } from 'react';
import { Calendar, Clock, DollarSign, Users, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Mock data for classes
const classes = [
  {
    id: 1,
    name: 'Public Speaking Basics',
    description: 'Master the fundamentals of public speaking with confidence.',
    instructor: 'Sarah Johnson',
    price: 149.99,
    capacity: 12,
    enrolled: 8,
    schedule: {
      day: 'Monday',
      time: '9:00 AM',
      duration: '60 min'
    },
    level: 'Beginner',
    prerequisites: 'None',
  },
  {
    id: 2,
    name: 'Debate Club',
    description: 'Develop critical thinking and argumentation skills.',
    instructor: 'Michael Chen',
    price: 199.99,
    capacity: 10,
    enrolled: 7,
    schedule: {
      day: 'Tuesday',
      time: '9:00 AM',
      duration: '90 min'
    },
    level: 'Intermediate',
    prerequisites: 'Public Speaking Basics or equivalent experience',
  },
  {
    id: 3,
    name: 'Voice Training',
    description: 'Learn proper breathing techniques and voice projection.',
    instructor: 'Emma Davis',
    price: 169.99,
    capacity: 8,
    enrolled: 5,
    schedule: {
      day: 'Wednesday',
      time: '9:00 AM',
      duration: '60 min'
    },
    level: 'All Levels',
    prerequisites: 'None',
  },
];

export default function SchedulePage() {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  return (
    <div className="container py-12">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-4">Class Schedule</h1>
          <p className="text-muted-foreground">
            Browse our available classes and register for the ones that interest you.
          </p>
        </div>

        {/* Class Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((classItem) => (
            <div
              key={classItem.id}
              className="rounded-lg border bg-card hover-card-shadow overflow-hidden"
            >
              <div className="p-6 space-y-4">
                {/* Class Header */}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{classItem.name}</h3>
                  <p className="text-sm text-muted-foreground">{classItem.description}</p>
                </div>

                {/* Class Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{classItem.schedule.day}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{classItem.schedule.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>{classItem.enrolled}/{classItem.capacity} enrolled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span>${classItem.price}</span>
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="font-medium">Instructor:</span> {classItem.instructor}
                  </div>

                  <div className="text-sm">
                    <span className="font-medium">Level:</span> {classItem.level}
                  </div>
                </div>

                {/* Registration Button */}
                <button
                  onClick={() => {
                    setSelectedClass(classItem.id);
                    setShowRegistrationModal(true);
                  }}
                  className="button-pop w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Register Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Schedule Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Weekly Schedule</h2>
          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="grid grid-cols-8 gap-px bg-muted">
              <div className="bg-background p-4 font-medium">Time</div>
              <div className="bg-background p-4 font-medium">Monday</div>
              <div className="bg-background p-4 font-medium">Tuesday</div>
              <div className="bg-background p-4 font-medium">Wednesday</div>
              <div className="bg-background p-4 font-medium">Thursday</div>
              <div className="bg-background p-4 font-medium">Friday</div>
              <div className="bg-background p-4 font-medium">Saturday</div>
              <div className="bg-background p-4 font-medium">Sunday</div>

              {/* Schedule Rows */}
              {['9:00 AM', '10:30 AM', '1:00 PM', '2:30 PM', '4:00 PM'].map((time) => (
                <div key={time} className="contents">
                  <div className="bg-background p-4 text-sm">{time}</div>
                  {Array(7).fill(null).map((_, index) => (
                    <div key={`${time}-${index}`} className="bg-background p-4 text-sm">
                      {index === 0 && time === '9:00 AM' && (
                        <div className="text-primary">Public Speaking Basics</div>
                      )}
                      {index === 1 && time === '9:00 AM' && (
                        <div className="text-primary">Debate Club</div>
                      )}
                      {index === 2 && time === '9:00 AM' && (
                        <div className="text-primary">Voice Training</div>
                      )}
                      {index === 3 && time === '10:30 AM' && (
                        <div className="text-primary">Presentation Skills</div>
                      )}
                      {index === 4 && time === '1:00 PM' && (
                        <div className="text-primary">Speech Writing</div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Important Information</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <h3 className="text-lg font-medium">Class Policies</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-1 text-primary" />
                  <span>All classes are limited capacity to ensure quality instruction</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-1 text-primary" />
                  <span>Please arrive 10 minutes before class starts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-1 text-primary" />
                  <span>Make-up classes available with 24-hour notice</span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg border bg-card p-6 space-y-4">
              <h3 className="text-lg font-medium">Payment & Cancellation</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-1 text-primary" />
                  <span>Full payment required at registration</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-1 text-primary" />
                  <span>72-hour cancellation policy for full refund</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-1 text-primary" />
                  <span>Monthly payment plans available for multiple classes</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && selectedClass && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-lg">
            <div className="rounded-lg border bg-card p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">
                Register for {classes.find(c => c.id === selectedClass)?.name}
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Payment Method</label>
                  <select className="w-full rounded-md border bg-background px-3 py-2">
                    <option value="credit">Credit Card</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Promo Code (Optional)</label>
                  <input
                    type="text"
                    className="w-full rounded-md border bg-background px-3 py-2"
                    placeholder="Enter promo code"
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Class Fee</span>
                    <span>${classes.find(c => c.id === selectedClass)?.price}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${classes.find(c => c.id === selectedClass)?.price}</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowRegistrationModal(false)}
                    className="flex-1 rounded-md border px-4 py-2 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement payment processing
                      alert('Registration successful! (Demo only)');
                      setShowRegistrationModal(false);
                    }}
                    className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Complete Registration
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
