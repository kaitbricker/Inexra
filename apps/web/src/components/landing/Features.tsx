import { motion as Motion } from 'framer-motion';
import { BarChart3, Tag, Heart, Map } from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description:
      'Track engagement metrics and conversation patterns in real-time with intuitive dashboards.',
  },
  {
    icon: Tag,
    title: 'Automated Message Tagging',
    description:
      'Automatically categorize and organize messages for efficient management and quick access.',
  },
  {
    icon: Heart,
    title: 'Sentiment Analysis',
    description: 'Understand the emotional tone of conversations with advanced sentiment analysis.',
  },
  {
    icon: Map,
    title: 'Conversation Heatmaps',
    description:
      'Visualize conversation patterns and identify engagement hotspots across your channels.',
  },
];

export function Features() {
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
          <h2 className="text-4xl font-bold mb-4">Core Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powerful tools to help you understand and optimize your digital conversations
          </p>
        </Motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative p-6 rounded-2xl bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="mb-4 inline-flex p-3 rounded-xl bg-primary/10 text-primary">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
