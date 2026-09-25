import { Steps } from '../components/Steps';
import { Step } from '../components/Step';
import { Showcase } from '../components/Showcase';
import { Timeline } from '../components/Timeline';
import { Release } from '../components/Release';
import { Figure } from '../components/Figure';
import { ChatAppearanceDemo } from '../components/ChatAppearanceDemo';
import { AnnotatedImage } from '../components/AnnotatedImage';

export const steps = {
  render: Steps,
};

export const step = {
  render: Step,
  attributes: {
    title: { type: String, required: true },
    href: { type: String, required: true },
  },
};

export const showcase = {
  render: Showcase,
  attributes: {
    title: { type: String, required: true },
    image: { type: String },
    alt: { type: String },
    href: { type: String },
    cta: { type: String },
  },
};

export const image = {
  render: Figure,
  attributes: {
    src: { type: String, required: true },
    alt: { type: String },
    width: { type: Number },
    caption: { type: String },
  },
};

export const chatdemo = {
  render: ChatAppearanceDemo,
};

export const annotatedimage = {
  render: AnnotatedImage,
  attributes: {
    src: { type: String, required: true },
    alt: { type: String },
    width: { type: Number },
    caption: { type: String },
    points: { type: String },
  },
};

export const timeline = {
  render: Timeline,
};

export const release = {
  render: Release,
  attributes: {
    version: { type: String, required: true },
    date: { type: String },
    href: { type: String },
  },
};
