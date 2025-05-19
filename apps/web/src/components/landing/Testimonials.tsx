import { motion as Motion } from 'framer-motion';
import { Star } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
  {
    content:
      'Inexra has transformed how we handle customer conversations. The insights are invaluable!',
    author: 'Sarah Johnson',
    role: 'Marketing Director',
    company: 'TechCorp',
    avatar: '/avatars/sarah.jpg',
  },
  {
    content: 'The automated tagging and sentiment analysis save us hours every week. Game changer!',
    author: 'Michael Chen',
    role: 'Customer Success Lead',
    company: 'GrowthLabs',
    avatar: '/avatars/michael.jpg',
  },
  {
    content:
      'Finally, a tool that helps us understand our audience better. The heatmaps are incredible.',
    author: 'Emma Rodriguez',
    role: 'Social Media Manager',
    company: 'BrandBoost',
    avatar: '/avatars/emma.jpg',
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
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Trusted by Creators & Teams</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See what our users have to say about their experience with Inexra
          </p>
        </Motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <Motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-lg"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-lg mb-6">{testimonial.content}</p>
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 rounded-full overflow-hidden">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">{testimonial.author}</h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>
            </Motion.div>
          ))}
        </div>

        {/* Logo Cloud */}
        <Motion.div
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
        </Motion.div>
      </div>
    </section>
  );
}
