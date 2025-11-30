import { ValidationDomain, ConnectionType, SignatureDimension, InterviewQuestion } from './types';

export const DOMAIN_CRITERIA = {
  [ValidationDomain.IDENTITY]: {
    name: "Identity Verification",
    weight: 0.15,
    description: "Establishing they are who they claim to be"
  },
  [ValidationDomain.INTENT]: {
    name: "Intent Assessment",
    weight: 0.20,
    description: "Understanding what they actually want"
  },
  [ValidationDomain.HISTORY]: {
    name: "History Analysis",
    weight: 0.15,
    description: "What their track record shows"
  },
  [ValidationDomain.ALIGNMENT]: {
    name: "Value Alignment",
    weight: 0.10,
    description: "Do values align with stewardship?"
  },
  [ValidationDomain.CAPACITY]: {
    name: "Capacity to Receive",
    weight: 0.10,
    description: "Can they use what is offered?"
  },
  [ValidationDomain.REPUTATION]: {
    name: "Reputation Assessment",
    weight: 0.10,
    description: "What do trusted others say?"
  },
  [ValidationDomain.HUMANITY]: {
    name: "Humanity & Interiority",
    weight: 0.20,
    description: "Statistical match to human behavioral clusters (shadow-signature)."
  }
};

export const SIGNAL_SOURCES = [
  { id: "academic", label: "Academic / Research" },
  { id: "open_source", label: "Open Source / GitHub" },
  { id: "professional", label: "Professional / LinkedIn" },
  { id: "community", label: "Community / Forums" },
  { id: "creative", label: "Creative Portfolio" },
  { id: "vouching", label: "Direct Vouching" }
];

export const RED_FLAGS = [
  "monetize", "viral", "platform", "scale", "growth hack",
  "audience", "followers", "engagement", "brand", "influence",
  "exclusive", "proprietary", "ownership", "rights",
  "investment", "equity", "stake", "valuation"
];

export const GREEN_FLAGS = [
  "open source", "commons", "gift", "share", "community",
  "stewardship", "regenerative", "collaborative", "mutual",
  "academic", "research", "learning", "wisdom"
];

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: "hunger_1",
    text: "What's something you keep looking for but haven't found yet?",
    dimension: SignatureDimension.HUNGER,
    whatItReveals: "Core unsatisfied need",
    followUpTriggers: { 
      "connection": "What would that connection feel like if you found it?",
      "understanding": "What would change if you understood it?" 
    }
  },
  {
    id: "gift_1",
    text: "What do people come to you for, even when you haven't offered?",
    dimension: SignatureDimension.GIFT,
    whatItReveals: "Natural gift"
  },
  {
    id: "movement_1",
    text: "When you're stuck on something hard, what do you do?",
    dimension: SignatureDimension.MOVEMENT,
    whatItReveals: "Problem-solving pattern",
    followUpTriggers: {
        "walk": "What happens during the walk?",
        "wait": "What are you waiting for?"
    }
  },
  {
    id: "environment_1",
    text: "Describe a time you felt completely in your element.",
    dimension: SignatureDimension.ENVIRONMENT,
    whatItReveals: "Activation context"
  },
  {
    id: "affinity_1",
    text: "What kinds of problems feel like they were made for you?",
    dimension: SignatureDimension.AFFINITY,
    whatItReveals: "Problem affinity"
  },
  {
    id: "edge_1",
    text: "What are you trying to get better at right now?",
    dimension: SignatureDimension.EDGE,
    whatItReveals: "Growth edge"
  },
  {
    id: "wound_1",
    text: "What hard experience taught you something you couldn't have learned any other way?",
    dimension: SignatureDimension.WOUND,
    whatItReveals: "Integrated wound"
  },
  {
    id: "vision_1",
    text: "If you could contribute to solving one problem for the world, what would it be?",
    dimension: SignatureDimension.VISION,
    whatItReveals: "World-vision"
  }
];