import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { courseSchema, categorySchema, authorSchema, articleSchema } from './sanity/schemas'

export default defineConfig({
  name: 'default',
  title: 'Exceller learning platform',
  basePath: "/studio",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  plugins: [structureTool()],
  schema: {
    types: [courseSchema, categorySchema, authorSchema, articleSchema],
  },
})
