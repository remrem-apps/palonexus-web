import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
	landing: defineCollection({
		loader: glob({ pattern: '*.md', base: './src/content/landing' }),
		schema: z.discriminatedUnion('section', [
			z.object({
				section: z.literal('hero'),
				eyebrow: z.string(),
				heading: z.string(),
				lede: z.string(),
				distinction: z.array(z.object({ label: z.string(), text: z.string() })).length(3),
				primaryCta: z.object({ label: z.string(), href: z.string() }),
				secondaryCta: z.object({ label: z.string(), href: z.string() }),
			}),
			z.object({
				section: z.literal('solutions'),
				eyebrow: z.string().optional(),
				heading: z.string(),
				cards: z
					.array(
						z.object({
							kicker: z.string(),
							title: z.string(),
							description: z.string(),
							items: z.array(z.string()).min(1),
						}),
					)
					.min(1),
			}),
			z.object({ section: z.literal('why-now'), eyebrow: z.string(), heading: z.string() }),
			z.object({
				section: z.literal('platform'),
				eyebrow: z.string(),
				heading: z.string(),
				columns: z.array(z.object({ title: z.string(), description: z.string() })).min(1),
				footer: z.string().optional(),
			}),
			z.object({
				section: z.literal('command-center'),
				eyebrow: z.string(),
				heading: z.string(),
				lede: z.string(),
				points: z.array(z.object({ title: z.string(), text: z.string() })).min(1),
				comingNext: z.string().optional(),
			}),
			z.object({
				section: z.literal('works-with'),
				eyebrow: z.string(),
				heading: z.string(),
				working: z.array(z.string()).min(1),
				planned: z.array(z.string()).min(1),
			}),
			z.object({
				section: z.literal('use-cases'),
				eyebrow: z.string(),
				heading: z.string(),
				items: z.array(z.string()).min(1),
			}),
			z.object({
				section: z.literal('governance'),
				eyebrow: z.string(),
				heading: z.string(),
				items: z.array(z.string()).min(1),
			}),
			z.object({
				section: z.literal('closing'),
				eyebrow: z.string(),
				heading: z.string(),
				cta: z.object({ label: z.string(), href: z.string() }),
				secondaryCta: z.object({ label: z.string(), href: z.string() }).optional(),
			}),
		]),
	}),
};

export type HeroData = {
	section: 'hero';
	eyebrow: string;
	heading: string;
	lede: string;
	distinction: { label: string; text: string }[];
	primaryCta: { label: string; href: string };
	secondaryCta: { label: string; href: string };
};
export type SolutionsData = {
	section: 'solutions';
	eyebrow?: string;
	heading: string;
	cards: { kicker: string; title: string; description: string; items: string[] }[];
};
export type WhyNowData = { section: 'why-now'; eyebrow: string; heading: string };
export type PlatformData = {
	section: 'platform';
	eyebrow: string;
	heading: string;
	columns: { title: string; description: string }[];
	footer?: string;
};
export type CommandCenterData = {
	section: 'command-center';
	eyebrow: string;
	heading: string;
	lede: string;
	points: { title: string; text: string }[];
	comingNext?: string;
};
export type WorksWithData = {
	section: 'works-with';
	eyebrow: string;
	heading: string;
	working: string[];
	planned: string[];
};
export type UseCasesData = {
	section: 'use-cases';
	eyebrow: string;
	heading: string;
	items: string[];
};
export type GovernanceData = {
	section: 'governance';
	eyebrow: string;
	heading: string;
	items: string[];
};
export type ClosingData = {
	section: 'closing';
	eyebrow: string;
	heading: string;
	cta: { label: string; href: string };
	secondaryCta?: { label: string; href: string };
};
