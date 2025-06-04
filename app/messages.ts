export type Message = {
  id: number;
  sender: string;
  tag: string;
  tagColor: string;
  preview: string;
  time: string;
  content: string;
  aiContext: string;
  aiConfidence: number;
  aiSuggestions: string[];
};

export const messages: Message[] = [
  {
    id: 1,
    sender: "JD",
    tag: "Leads",
    tagColor: "bg-blue-100 text-blue-800",
    preview: "Interested in enterprise pricing...",
    time: "2m ago",
    content: "Hi, I'm interested in learning more about your enterprise pricing options. Could you send me more details?",
    aiContext: "This message was classified as a Lead and contains high buyer intent.",
    aiConfidence: 91,
    aiSuggestions: [
      "Thanks for your interest! I'd be happy to share more about enterprise pricing.",
      "Can you tell me more about your use case?",
      "I'll connect you with our sales team for a custom quote."
    ]
  },
  {
    id: 2,
    sender: "MS",
    tag: "Complaints",
    tagColor: "bg-red-100 text-red-800",
    preview: "Service disruption reported...",
    time: "15m ago",
    content: "We're experiencing a service disruption. Please advise on the expected resolution time.",
    aiContext: "This message was flagged as a Complaint with 89% confidence.",
    aiConfidence: 89,
    aiSuggestions: [
      "We're sorry for the disruption. Our team is working to resolve it as quickly as possible.",
      "Can you provide more details about the issue?",
      "We'll update you as soon as the service is restored."
    ]
  },
  {
    id: 3,
    sender: "RK",
    tag: "Collab",
    tagColor: "bg-purple-100 text-purple-800",
    preview: "Partnership opportunity...",
    time: "1h ago",
    content: "We'd like to discuss a potential partnership. Are you available for a call this week?",
    aiContext: "This message was classified as a Collaboration opportunity.",
    aiConfidence: 85,
    aiSuggestions: [
      "We'd love to discuss a partnership! When are you available for a call?",
      "Can you share more about your proposal?",
      "I'll connect you with our partnerships team."
    ]
  },
  {
    id: 4,
    sender: "TL",
    tag: "Positive",
    tagColor: "bg-green-100 text-green-800",
    preview: "Great experience with support...",
    time: "2h ago",
    content: "Your support team was fantastic! Thanks for the quick help.",
    aiContext: "This message was classified as Positive feedback.",
    aiConfidence: 97,
    aiSuggestions: [
      "Thank you for your kind words! We're glad we could help.",
      "I'll share your feedback with our support team.",
      "Let us know if you need anything else!"
    ]
  },
  {
    id: 5,
    sender: "AB",
    tag: "Technical",
    tagColor: "bg-yellow-100 text-yellow-800",
    preview: "API integration question...",
    time: "3h ago",
    content: "I have a question about your API integration. Can you provide documentation?",
    aiContext: "This message was classified as a Technical inquiry.",
    aiConfidence: 88,
    aiSuggestions: [
      "Here's a link to our API documentation.",
      "Can you specify which integration you're interested in?",
      "Our technical team can assist you further."
    ]
  }
]; 