import { motion as Motion } from 'framer-motion';
import { Link2, Activity, Lightbulb } from 'lucide-react';

const steps = [
  {
    icon: Link2,
    title: 'Connect Accounts',
    description:
      'Seamlessly integrate with Instagram, LinkedIn, Twitter, and more to centralize your conversations.',
  },
  {
    icon: Activity,
    title: 'Analyze Conversations',
    description:
      'Get real-time insights into your message patterns, engagement rates, and audience sentiment.',
  },
  {
    icon: Lightbulb,
    title: 'Optimize Engagement',
    description:
      'Leverage AI-powered insights to improve response times and enhance customer interactions.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to transform your digital conversations
          </p>
        </Motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border hidden lg:block" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <Motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative"
              >
                <div className="relative z-10 bg-background rounded-2xl p-8 shadow-lg">
                  <div className="mb-6 inline-flex p-4 rounded-full bg-primary/10 text-primary">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>

                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {index + 1}
                </div>
              </Motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
