import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  products: defineTable({
    title: v.string(),
    imageId: v.string(),
    price: v.number(),
  }),
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),
  games: defineTable({
    playerName: v.string(),
    adventureType: v.union(
      v.literal('tour'),
      v.literal('foodie'),
      v.literal('race'),
    ),
    avatarDataUrl: v.optional(v.string()),
    createdAt: v.number(),
    welcomePrompt: v.optional(v.string()),
    lastPromptAt: v.optional(v.number()),
  }),
})
