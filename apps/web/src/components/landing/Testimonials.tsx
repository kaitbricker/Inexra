import { motion } from '@/lib/motion';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Content Creator',
    avatar: '/testimonials/avatar1.jpg',
    rating: 5,
    content: "Inexra has transformed how I manage my social media presence. The analytics are incredibly detailed and the automation features save me hours every week.",
  },
  {
    name: 'Michael Chen',
    role: 'Marketing Director',
    avatar: '/testimonials/avatar2.jpg',
    rating: 5,
    content: "The platform's ability to analyze engagement patterns and suggest optimal posting times has significantly improved our social media performance.",
  },
  {
    name: 'Emma Rodriguez',
    role: 'Social Media Manager',
    avatar: '/testimonials/avatar3.jpg',
    rating: 5,
    content: "The customer support team is exceptional, and the platform's features are exactly what we needed to scale our social media operations.",
  },
];

const logos = [
  { src: '/logos/company1.svg', alt: 'Company 1' },
  { src: '/logos/company2.svg', alt: 'Company 2' },
  { src: '/logos/company3.svg', alt: 'Company 3' },
  { src: '/logos/company4.svg', alt: 'Company 4' },
  { src: '/logos/company5.svg', alt: 'Company 5' },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Trusted by Industry Leaders
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            See what our customers have to say about their experience with Inexra
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative rounded-lg bg-white/5 p-6 backdrop-blur-sm"
            >
              <div className="mb-4 flex items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{testimonial.name}</h4>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
              <div className="mb-4 flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < testimonial.rating ? 'text-yellow-400' : 'text-gray-600'
                    }`}
                    fill={i < testimonial.rating ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <p className="text-gray-300">{testimonial.content}</p>
            </motion.div>
          ))}
        </div>

        {/* Logo Cloud */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-wrap justify-center items-center gap-8 md:gap-16"
        >
          {logos.map(logo => (
            <div
              key={logo.alt}
              className="relative h-8 w-32 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all"
            >
              <Image src={logo.src} alt={logo.alt} fill className="object-contain" />
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Button size="lg" className="bg-primary text-white hover:bg-primary/90">
            Join Our Success Stories
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

