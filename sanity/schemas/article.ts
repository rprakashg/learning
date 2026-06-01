import { defineField, defineType } from 'sanity'

export const articleSchema = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required().min(5),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', type: 'string', title: 'Alt text' }),
            defineField({ name: 'caption', type: 'string', title: 'Caption' }),
          ],
        },
        {
          type: 'object',
          name: 'codeBlock',
          title: 'Code block',
          fields: [
            defineField({ name: 'language', type: 'string', initialValue: 'bash' }),
            defineField({ name: 'code', type: 'text', rows: 10 }),
            defineField({ name: 'filename', type: 'string' }),
          ],
          preview: {
            select: { title: 'filename', subtitle: 'language' },
            prepare({ title, subtitle }) {
              return { title: title ?? 'Code block', subtitle }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'author',
      type: 'reference',
      to: [{ type: 'author' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'readingTimeMinutes',
      title: 'Reading time (minutes)',
      type: 'number',
      initialValue: 5,
    }),
    defineField({
      name: 'isPublished',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isFeatured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    }),
  ],
  orderings: [
    {
      title: 'Published date, newest first',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      authorFirst: 'author.firstName',
      authorLast: 'author.lastName',
      media: 'coverImage',
    },
    prepare({ title, authorFirst, authorLast, media }) {
      return {
        title,
        subtitle: `${authorFirst ?? ''} ${authorLast ?? ''}`.trim(),
        media,
      }
    },
  },
})
